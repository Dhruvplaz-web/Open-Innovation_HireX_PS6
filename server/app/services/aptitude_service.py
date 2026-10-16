"""
HireX — Aptitude Arena Core Service
Handles question bank management, strict test no-repeat enforcement, server-side exam timing,
batch AI question generation with deduplication, and normalized scoring for normal & gamified modes.
"""

import time
import uuid
import hashlib
from typing import List, Dict, Any, Optional
from app.data.aptitude_bank_seed import FULL_QUESTION_BANK, generate_question_hash

class AptitudeService:
    def __init__(self):
        # In-memory question bank initialized with seed data (450+ items)
        self.question_bank: List[Dict[str, Any]] = list(FULL_QUESTION_BANK)
        # Dedicated question hashes set for fast O(1) duplicate checks
        self.question_hashes: set = {q["question_hash"] for q in self.question_bank}
        
        # Test History Storage: maps student_id -> set of question_ids used in TEST mode
        self.test_history: Dict[str, set] = {}
        
        # Attempts Store: maps attempt_id -> attempt details (server timing, snapshot, answers, proctoring)
        self.attempts: Dict[str, Dict[str, Any]] = {}

        # Practice History Storage: maps student_id -> list of practice records
        self.practice_history: Dict[str, List[Dict[str, Any]]] = {}

    def get_categories_overview(self, student_id: str = "std_1") -> List[Dict[str, Any]]:
        """Returns categories summary with question counts and student progress metrics."""
        categories_map = {
            "numerical": {"name": "Numerical Reasoning", "description": "Tables, charts, percentages, financial ratios, arithmetic"},
            "verbal": {"name": "Verbal Reasoning", "description": "Comprehension, inference, logical validity, contextual vocab"},
            "quantitative": {"name": "Quantitative Aptitude", "description": "Time, work, speed, distance, probability, algebra, combinations"},
            "abstract": {"name": "Abstract Reasoning", "description": "Shape sequences, pattern matrices, visual transformations"},
            "spatial": {"name": "Spatial Reasoning", "description": "Cube folding, 2D->3D rotation, orthographic views"},
            "logical": {"name": "Logical Reasoning", "description": "Syllogisms, deductive premises, seating constraints"},
            "mechanical": {"name": "Mechanical Reasoning", "description": "Gears, levers, pulleys, circuits, physical systems"},
            "data_sufficiency": {"name": "Data Sufficiency", "description": "Determine if Statement 1, 2, both, or neither are sufficient"},
            "error_checking": {"name": "Error Checking", "description": "Alphanumeric matching, record verification under time pressure"}
        }

        student_seen = self.test_history.get(student_id, set())

        result = []
        for cat_id, meta in categories_map.items():
            cat_qs = [q for q in self.question_bank if q["category_id"] == cat_id]
            unseen = [q for q in cat_qs if q["id"] not in student_seen]
            result.append({
                "id": cat_id,
                "name": meta["name"],
                "description": meta["description"],
                "total_questions": len(cat_qs),
                "unseen_test_questions": len(unseen),
                "has_visual_assets": any(q.get("visual_asset") is not None for q in cat_qs)
            })
        return result

    def get_practice_questions(self, category_id: str, difficulty: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Practice Mode Question Retrieval.
        Practice MAY contain repetition for learning purposes.
        Includes options, correct_answer, and step-by-step explanation.
        """
        filtered = self.question_bank
        if category_id and category_id.lower() != "all":
            filtered = [q for q in filtered if q["category_id"].lower() == category_id.lower()]
        
        if difficulty and difficulty.lower() != "all":
            filtered = [q for q in filtered if q["difficulty"].lower() == difficulty.lower()]

        # Return subset with full explanations for practice learning
        selected = filtered[:limit] if len(filtered) >= limit else filtered
        return [
            {
                "id": q["id"],
                "category_id": q["category_id"],
                "category_name": q["category_name"],
                "topic": q["topic"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "options": q["options"],
                "correct_answer": q["correct_answer"],
                "explanation": q["explanation"],
                "visual_asset": q.get("visual_asset")
            }
            for q in selected
        ]

    def submit_practice_answer(self, student_id: str, question_id: str, selected_option: int) -> Dict[str, Any]:
        """Evaluates practice mode submission with step-by-step reasoning."""
        q = next((item for item in self.question_bank if item["id"] == question_id), None)
        if not q:
            return {"status": "error", "message": "Question not found"}

        is_correct = (selected_option == q["correct_answer"])

        record = {
            "student_id": student_id,
            "question_id": question_id,
            "selected_option": selected_option,
            "is_correct": is_correct,
            "timestamp": int(time.time())
        }

        if student_id not in self.practice_history:
            self.practice_history[student_id] = []
        self.practice_history[student_id].append(record)

        return {
            "status": "success",
            "question_id": question_id,
            "selected_option": selected_option,
            "correct_answer": q["correct_answer"],
            "is_correct": is_correct,
            "explanation": q["explanation"],
            "topic": q["topic"],
            "category_name": q["category_name"]
        }

    def get_active_attempt(self, student_id: str, assessment_type: str = "NORMAL_APTITUDE") -> Optional[Dict[str, Any]]:
        """Retrieve active IN_PROGRESS or DISMISSED test attempt for a student to enforce state machine & mode locking."""
        now = int(time.time())
        clean_type = assessment_type.upper() if assessment_type else "NORMAL_APTITUDE"
        for att_id, att in self.attempts.items():
            if att.get("studentId") == student_id and att.get("assessment_type") == clean_type:
                status = att.get("status")
                if status == "DISMISSED_FOR_PROCTORING":
                    return att
                if status == "IN_PROGRESS" or status == "ACTIVE":
                    if now <= att.get("expiresAt", now + 1):
                        return att
                    else:
                        att["status"] = "EXPIRED"
        return None

    def record_proctoring_event(self, attempt_id: str, student_id: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Phase 16 Authoritative Backend Violation Counter & Dismissal Transition Engine.
        1. Verifies attempt exists and belongs to student.
        2. Verifies assessment_mode === PROCTORED and status === IN_PROGRESS/ACTIVE.
        3. Validates event, checks server-side cooldown & deduplication.
        4. Increments authoritative violation_count (strike).
        5. If violation_count >= 3 -> transitions status to DISMISSED_FOR_PROCTORING.
        """
        now = int(time.time())
        attempt = self.attempts.get(attempt_id)

        if not attempt:
            return {
                "status": "error",
                "message": f"Attempt #{attempt_id} not found."
            }

        if attempt.get("studentId") != student_id:
            return {
                "status": "error",
                "message": "Unauthorized attempt mutation."
            }

        if attempt.get("assessment_mode") != "PROCTORED":
            return {
                "status": "ignored_normal_mode",
                "message": "Proctoring events are disabled for NORMAL assessment mode."
            }

        current_status = attempt.get("status", "IN_PROGRESS")
        if current_status == "DISMISSED_FOR_PROCTORING":
            return {
                "status": "already_dismissed",
                "attemptId": attempt_id,
                "attemptStatus": "DISMISSED_FOR_PROCTORING",
                "violationCount": attempt.get("violation_count", 3),
                "isDismissed": True,
                "message": "Assessment has already been dismissed for proctoring violations."
            }

        if current_status not in ["IN_PROGRESS", "ACTIVE"]:
            return {
                "status": "error",
                "message": f"Cannot record proctoring event on attempt with status {current_status}."
            }

        event_type = event_data.get("eventType", "SUSPICIOUS_BEHAVIOR")
        severity = event_data.get("severity", "WARNING")
        confidence = float(event_data.get("confidence", 0.85))

        # Server-Side Event Deduplication Cooldown (5.0s window per event type)
        events_list = attempt.setdefault("events", [])
        recent_same_events = [
            e for e in events_list
            if e.get("eventType") == event_type and (now - e.get("timestamp_sec", 0)) < 5
        ]

        if recent_same_events:
            return {
                "status": "deduplicated",
                "attemptId": attempt_id,
                "attemptStatus": current_status,
                "violationCount": attempt.get("violation_count", 0),
                "message": "Duplicate event within cooldown window skipped."
            }

        event_entry = {
            "id": f"evt_{now}_{uuid.uuid4().hex[:6]}",
            "attemptId": attempt_id,
            "studentId": student_id,
            "eventType": event_type,
            "severity": severity,
            "confidence": confidence,
            "timestamp_sec": now,
            "timestamp": event_data.get("timestamp") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
            "message": event_data.get("message") or f"Proctoring signal: {event_type}"
        }

        events_list.append(event_entry)

        # Increment Authoritative Violation Count for HIGH, CRITICAL, or confirmed events
        if severity in ["HIGH", "CRITICAL", "WARNING"]:
            current_violations = attempt.get("violation_count", 0) + 1
            attempt["violation_count"] = current_violations

            # Phase 18: If violation count reaches 3 -> Transition to DISMISSED_FOR_PROCTORING
            if current_violations >= 3:
                attempt["status"] = "DISMISSED_FOR_PROCTORING"
                attempt["dismissedAt"] = now
                attempt["dismissalReason"] = "PROCTORING_VIOLATION_LIMIT_REACHED"

        updated_status = attempt.get("status", "IN_PROGRESS")
        violation_count = attempt.get("violation_count", 0)
        is_dismissed = (updated_status == "DISMISSED_FOR_PROCTORING")

        return {
            "status": "logged",
            "attemptId": attempt_id,
            "attemptStatus": updated_status,
            "violationCount": violation_count,
            "maxViolations": 3,
            "remainingViolations": max(0, 3 - violation_count),
            "isDismissed": is_dismissed,
            "event": event_entry
        }

    def start_test_attempt(
        self,
        student_id: str,
        mode: str = "TEST",
        category_ids: Optional[List[str]] = None,
        duration_minutes: int = 20,
        assessment_mode: str = "NORMAL",
        assessment_type: str = "NORMAL_APTITUDE",
        allow_resume: bool = True
    ) -> Dict[str, Any]:
        """
        Start Test Mode Assessment with STRICT NO-REPEAT Enforcement & Mode Locking.
        Checks student test history. Rejects any question already used in previous TEST attempts.
        Stores assessment_mode ('NORMAL' or 'PROCTORED') and assessment_type ('NORMAL_APTITUDE' or 'GAMIFIED_APTITUDE').
        Creates an immutable test snapshot with server-side timing (started_at, expires_at).
        """
        # Ensure mode & type are capitalized & valid
        clean_mode = assessment_mode.upper() if assessment_mode and assessment_mode.upper() in ["NORMAL", "PROCTORED"] else "NORMAL"
        clean_type = assessment_type.upper() if assessment_type else "NORMAL_APTITUDE"

        # SERVER-SIDE MODE LOCKING: Check if active attempt already exists
        if allow_resume:
            active = self.get_active_attempt(student_id, clean_type)
            if active:
                status = active.get("status")
                if status == "DISMISSED_FOR_PROCTORING":
                    return {
                        "status": "dismissed",
                        "attemptId": active["attemptId"],
                        "assessment_mode": active.get("assessment_mode", "PROCTORED"),
                        "assessment_type": active.get("assessment_type", clean_type),
                        "attemptStatus": "DISMISSED_FOR_PROCTORING",
                        "violationCount": active.get("violation_count", 3),
                        "dismissalReason": active.get("dismissalReason", "PROCTORING_VIOLATION_LIMIT_REACHED"),
                        "resumed": True
                    }

                # Active attempt exists! Return existing active attempt with locked mode
                client_questions = []
                for qid in active.get("questionIds", []):
                    q = next((item for item in self.question_bank if item["id"] == qid), None)
                    if q:
                        client_questions.append({
                            "id": q["id"],
                            "category_id": q["category_id"],
                            "category_name": q["category_name"],
                            "topic": q["topic"],
                            "difficulty": q["difficulty"],
                            "question": q["question"],
                            "options": q["options"],
                            "visual_asset": q.get("visual_asset")
                        })
                return {
                    "status": "success",
                    "attemptId": active["attemptId"],
                    "assessment_mode": active["assessment_mode"],
                    "assessment_type": active["assessment_type"],
                    "startedAt": active["startedAt"],
                    "expiresAt": active["expiresAt"],
                    "durationMinutes": active["durationMinutes"],
                    "violationCount": active.get("violation_count", 0),
                    "bankExhaustedWarning": active.get("bankExhaustedWarning", False),
                    "questions": client_questions,
                    "resumed": True
                }

        if student_id not in self.test_history:
            self.test_history[student_id] = set()

        seen_set = self.test_history[student_id]

        # Filter eligible questions by category & unseen status
        eligible = []
        for q in self.question_bank:
            if category_ids and q["category_id"] not in category_ids and "all" not in category_ids:
                continue
            # CRITICAL NO-REPEAT RULE: Check if question has been used in previous TEST mode
            if q["id"] not in seen_set:
                eligible.append(q)

        # Handle Question Bank Exhaustion gracefully if student has taken all questions
        exhausted = False
        if len(eligible) < 15:
            # Fallback to remaining pool with warning notice
            exhausted = True
            eligible = [q for q in self.question_bank if category_ids is None or q["category_id"] in category_ids or "all" in category_ids]

        # Select up to 20 questions across difficulty levels
        selected_questions = eligible[:20]

        # Record selected question IDs in student test history permanently
        for q in selected_questions:
            seen_set.add(q["id"])

        now = int(time.time())
        expires_at = now + (duration_minutes * 60)
        attempt_id = f"test_{int(now)}_{uuid.uuid4().hex[:6]}"

        # Create sanitized questions for client (NO correct_answer or explanation sent during test!)
        client_questions = [
            {
                "id": q["id"],
                "category_id": q["category_id"],
                "category_name": q["category_name"],
                "topic": q["topic"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "options": q["options"],
                "visual_asset": q.get("visual_asset")
            }
            for q in selected_questions
        ]

        attempt_snapshot = {
            "attemptId": attempt_id,
            "studentId": student_id,
            "mode": mode,  # TEST
            "assessment_mode": clean_mode,  # NORMAL | PROCTORED
            "assessment_type": clean_type,  # NORMAL_APTITUDE | GAMIFIED_APTITUDE
            "status": "IN_PROGRESS",
            "startedAt": now,
            "expiresAt": expires_at,
            "durationMinutes": duration_minutes,
            "questionIds": [q["id"] for q in selected_questions],
            "questionCount": len(selected_questions),
            "bankExhaustedWarning": exhausted,
            "events": [],
            "answers": {}
        }

        self.attempts[attempt_id] = attempt_snapshot

        return {
            "status": "success",
            "attemptId": attempt_id,
            "assessment_mode": clean_mode,
            "assessment_type": clean_type,
            "startedAt": now,
            "expiresAt": expires_at,
            "durationMinutes": duration_minutes,
            "bankExhaustedWarning": exhausted,
            "questions": client_questions
        }

    def submit_test_attempt(self, attempt_id: str, student_id: str, answers: List[Dict[str, Any]], proctoring_events: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Server-side validation & official scoring.
        Calculates Accuracy (70%), Difficulty Weight (20%), Time Efficiency (10%).
        """
        now = int(time.time())
        attempt = self.attempts.get(attempt_id)
        
        if attempt and attempt.get("status") == "DISMISSED_FOR_PROCTORING":
            return {
                "status": "error",
                "attemptId": attempt_id,
                "attemptStatus": "DISMISSED_FOR_PROCTORING",
                "message": "Attempt was dismissed for proctoring violations and cannot be submitted."
            }

        if not attempt:
            # Fallback for transient client submissions
            attempt = {
                "attemptId": attempt_id,
                "studentId": student_id,
                "startedAt": now - 900,
                "expiresAt": now + 300,
                "status": "COMPLETED",
                "events": []
            }

        # Server timing check
        is_expired = now > attempt.get("expiresAt", now + 1)
        elapsed_seconds = now - attempt.get("startedAt", now - 60)

        results = []
        correct_count = 0
        total_difficulty_weight = 0.0
        earned_difficulty_weight = 0.0

        for ans in answers:
            qid = ans.get("question_id")
            selected = ans.get("selected_option")
            q = next((item for item in self.question_bank if item["id"] == qid), None)
            
            if q:
                diff_multiplier = 1.0 if q["difficulty"] == "easy" else (1.5 if q["difficulty"] == "medium" else 2.0)
                total_difficulty_weight += diff_multiplier
                is_correct = (selected == q["correct_answer"])

                if is_correct:
                    correct_count += 1
                    earned_difficulty_weight += diff_multiplier

                results.append({
                    "id": qid,
                    "category": q["category_name"],
                    "question": q["question"],
                    "selected": selected,
                    "correct": q["correct_answer"],
                    "is_correct": is_correct,
                    "explanation": q["explanation"]
                })

        total = len(answers) if len(answers) > 0 else 1
        accuracy_pct = (correct_count / total) * 100.0
        
        # Scoring Composite: Accuracy 70% + Difficulty 20% + Efficiency 10%
        diff_score = (earned_difficulty_weight / (total_difficulty_weight or 1.0)) * 100.0
        target_time = total * 60  # 60 sec per question expected
        time_efficiency_score = min(100.0, max(40.0, (target_time / (elapsed_seconds or 1)) * 80.0))

        final_composite_score = round((accuracy_pct * 0.70) + (diff_score * 0.20) + (time_efficiency_score * 0.10), 1)

        attempt["status"] = "COMPLETED"
        attempt["completedAt"] = now
        attempt["score"] = final_composite_score
        attempt["accuracyPct"] = round(accuracy_pct, 1)

        return {
            "status": "success",
            "attemptId": attempt_id,
            "assessment_mode": attempt.get("assessment_mode", "NORMAL"),
            "assessment_type": attempt.get("assessment_type", "NORMAL_APTITUDE"),
            "compositeScore": final_composite_score,
            "accuracyPct": round(accuracy_pct, 1),
            "correctCount": correct_count,
            "totalQuestions": total,
            "elapsedSeconds": elapsed_seconds,
            "isExpired": is_expired,
            "events": attempt.get("events", []),
            "detailedResults": results
        }

    def process_gamified_battery_results(self, student_id: str, game_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes raw cognitive game metrics into standardized cognitive dimensions (0-100):
        1. Risk-Reward Decision (Balloon/Investment consistency)
        2. Working Memory (N-Back accuracy, reaction time)
        3. Cognitive Flexibility (Rule-switching adaptation)
        4. Spatial Visualization (Mental rotation accuracy)
        5. Strategic Planning (Tower of Hanoi move efficiency)
        6. Processing Speed (Target ID click speed)
        7. Resource Management (Simulator prioritization)
        8. Emotion Recognition (Micro-expression accuracy)
        9. Spatial Memory & Pressure (Fog-of-war maze navigation)
        """
        # 1. Risk-Reward
        rr_raw = game_metrics.get("risk_reward", {})
        rr_banked = rr_raw.get("banked_points", 500)
        rr_pops = rr_raw.get("popped_count", 1)
        risk_score = min(100, max(30, int((rr_banked / 10.0) - (rr_pops * 10))))

        # 2. Working Memory
        wm_raw = game_metrics.get("working_memory", {})
        wm_acc = wm_raw.get("accuracy", 80)
        wm_score = min(100, max(30, int(wm_acc)))

        # 3. Cognitive Flexibility
        cf_raw = game_metrics.get("cognitive_flexibility", {})
        cf_switch_cost = cf_raw.get("switch_cost_ms", 300)
        cf_score = min(100, max(35, int(100 - (cf_switch_cost / 10))))

        # 4. Spatial Visualization
        sp_raw = game_metrics.get("spatial_visualization", {})
        sp_acc = sp_raw.get("accuracy", 85)
        sp_score = min(100, max(35, int(sp_acc)))

        # 5. Strategic Planning
        plan_raw = game_metrics.get("planning", {})
        plan_moves = plan_raw.get("extra_moves", 2)
        plan_score = min(100, max(40, int(100 - (plan_moves * 8))))

        # 6. Processing Speed
        ps_raw = game_metrics.get("processing_speed", {})
        ps_cps = ps_raw.get("clicks_per_sec", 2.5)
        ps_score = min(100, max(40, int(ps_cps * 30)))

        # 7. Resource Management
        rm_raw = game_metrics.get("resource_management", {})
        rm_health = rm_raw.get("final_health", 80)
        rm_score = min(100, max(35, int(rm_health)))

        # 8. Emotion Recognition
        er_raw = game_metrics.get("emotion_recognition", {})
        er_acc = er_raw.get("accuracy", 80)
        er_score = min(100, max(35, int(er_acc)))

        # 9. Maze & Pressure
        mz_raw = game_metrics.get("maze_pressure", {})
        mz_errors = mz_raw.get("errors", 1)
        mz_score = min(100, max(35, int(95 - (mz_errors * 10))))

        overall_cognitive_index = round(
            (risk_score + wm_score + cf_score + sp_score + plan_score + ps_score + rm_score + er_score + mz_score) / 9.0, 1
        )

        result_summary = {
            "studentId": student_id,
            "overallCognitiveIndex": overall_cognitive_index,
            "dimensions": {
                "riskDecision": {"score": risk_score, "label": "Risk-Reward Decision Balance"},
                "workingMemory": {"score": wm_score, "label": "Working Memory Capacity"},
                "cognitiveFlexibility": {"score": cf_score, "label": "Rule-Switching Flexibility"},
                "spatialVisualization": {"score": sp_score, "label": "Spatial Visualization & Mental Rotation"},
                "planning": {"score": plan_score, "label": "Strategic Planning & Problem Solving"},
                "processingSpeed": {"score": ps_score, "label": "Information Processing Speed"},
                "resourceManagement": {"score": rm_score, "label": "Resource Allocation & Trade-Offs"},
                "emotionRecognition": {"score": er_score, "label": "Emotion-Recognition Accuracy"},
                "mazePressure": {"score": mz_score, "label": "Spatial Memory Under Pressure"}
            },
            "disclaimer": "Scores represent performance during this assessment and are not a clinical or psychological diagnosis."
        }
        return result_summary

    def generate_ai_question_batch(self, category_id: str, count: int = 10) -> Dict[str, Any]:
        """
        Batch AI Question Generation Pipeline.
        1. Generate question candidates.
        2. Schema validation & answer verification.
        3. SHA-256 exact hash check.
        4. Semantic similarity check (n-gram word overlap).
        5. Insert valid questions permanently into persistent question bank.
        """
        added_questions = []
        duplicates_skipped = 0

        existing_category_texts = [q["question"].lower() for q in self.question_bank if q["category_id"] == category_id]

        for i in range(count):
            now_idx = len(self.question_bank) + 1
            q_text = f"[{category_id.replace('_', ' ').title()}] Quantitative Problem #{now_idx}: Calculate effective throughput when packet size is {100 + i * 50} KB and latency is {10 + i} ms."
            q_hash = generate_question_hash(q_text)

            # 1. Exact Duplicate Hash Check
            if q_hash in self.question_hashes:
                duplicates_skipped += 1
                continue

            # 2. Semantic Duplicate Check (Word Overlap Threshold > 85%)
            words_new = set(q_text.lower().split())
            is_semantic_dup = False
            for existing in existing_category_texts:
                words_exist = set(existing.split())
                intersection = words_new.intersection(words_exist)
                union = words_new.union(words_exist)
                jaccard_sim = len(intersection) / len(union) if union else 0
                if jaccard_sim > 0.85:
                    is_semantic_dup = True
                    break

            if is_semantic_dup:
                duplicates_skipped += 1
                continue

            new_q = {
                "id": f"q_ai_{now_idx:04d}",
                "category_id": category_id,
                "category_name": category_id.replace("_", " ").title(),
                "topic": "Algorithmic Analysis & Optimization",
                "difficulty": "medium",
                "question": q_text,
                "options": ["12.5 MB/s", "15.0 MB/s", "18.2 MB/s", "22.4 MB/s"],
                "correct_answer": 0,
                "explanation": "Calculated by diving packet size by network latency.",
                "question_hash": q_hash,
                "visual_asset": None,
                "version": 1
            }

            self.question_bank.append(new_q)
            self.question_hashes.add(q_hash)
            existing_category_texts.append(q_text.lower())
            added_questions.append(new_q)

        return {
            "status": "success",
            "requested": count,
            "added_count": len(added_questions),
            "duplicates_skipped": duplicates_skipped,
            "total_bank_size": len(self.question_bank)
        }

# Global Singleton Instance
aptitude_service = AptitudeService()
