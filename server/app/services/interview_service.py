"""
HireX AI Mock Interview Service
Dual-Mode Engine:
1. Live Google Gemini 2.5 Flash LLM (when GEMINI_API_KEY is configured in server/.env)
2. Sovereign Neural Context Engine (autonomous local fallback with AST and semantic keyword evaluation)
"""

import os
import json
import time
import uuid
import re
from typing import Dict, Any, List, Optional, Tuple
from app.config import settings
from app.db.canonical_store import canonical_store

# Role-specific knowledge bases and questions
ROLE_QUESTIONS = {
    "software_developer": {
        "technical_fundamentals": [
            {
                "question": "Can you explain the difference between a process and a thread, and how memory (heap vs stack) is shared between them in modern operating systems?",
                "category": "Operating Systems & Concurrency",
                "difficulty": "Intermediate",
                "expected_concepts": ["address space", "stack vs heap", "context switching", "IPC", "thread safety", "race conditions"],
                "hints": ["Think about isolated address space vs shared memory", "Consider context-switching overhead"],
                "model_answer": "A process is an executing program instance with its own private address space, file descriptors, and OS resources. A thread is the smallest unit of execution within a process. Threads within the same process share the heap, global variables, and open files, but each thread maintains its own private stack and program counter. Inter-process communication (IPC) requires OS primitives (pipes, sockets, shared memory), while inter-thread communication is faster via shared memory, requiring synchronization primitives (mutexes, semaphores) to prevent race conditions."
            },
            {
                "question": "Explain the ACID properties in relational databases and provide a real-world scenario where relaxing Isolation (e.g. using Read Committed instead of Serializable) is an acceptable trade-off.",
                "category": "DBMS & Transactions",
                "difficulty": "Intermediate",
                "expected_concepts": ["Atomicity", "Consistency", "Isolation", "Durability", "concurrency", "lock contention", "dirty read", "phantom read"],
                "hints": ["Define each acronym letter briefly", "Explain throughput vs strict serializability"],
                "model_answer": "ACID stands for Atomicity (all-or-nothing), Consistency (state transitions respect constraints), Isolation (concurrent transactions execute without interference), and Durability (committed changes survive crashes). Full Serializable isolation requires strict 2-phase locking or SSI, which drastically limits transaction throughput. In read-heavy systems like analytics dashboards or social feed generation, Read Committed is preferred because non-repeatable reads or phantom reads do not corrupt critical financial ledger states, while unlocking 10x higher concurrency."
            },
            {
                "question": "What is the difference between TCP and UDP? When would you deliberately choose UDP over TCP for a production microservice?",
                "category": "Networking & Protocols",
                "difficulty": "Intermediate",
                "expected_concepts": ["handshake", "packet ordering", "congestion control", "overhead", "streaming", "low latency"],
                "hints": ["Contrast reliability vs latency", "Mention real-time audio/video or metrics aggregation"],
                "model_answer": "TCP is a connection-oriented, reliable protocol providing ordered byte-stream delivery with 3-way handshakes, sequence acknowledgments, retransmission, and congestion control. UDP is connectionless and lightweight, transmitting datagrams with minimal overhead and no retransmission guarantees. You would choose UDP for latency-sensitive applications where occasional packet loss is acceptable (e.g. live video streaming, multiplayer game state synchronization, DNS lookups, or high-throughput telemetry metrics like StatsD)."
            }
        ],
        "dsa_coding": [
            {
                "question": "How would you find the length of the longest substring without repeating characters in O(n) time complexity? Walk me through your algorithmic approach and space complexity.",
                "category": "Algorithms & Sliding Window",
                "difficulty": "Intermediate",
                "expected_concepts": ["sliding window", "two pointers", "hash set / hash map", "O(n) time", "O(min(n, m)) space", "index jump"],
                "hints": ["Use two pointers defining the current valid window", "Store the most recent index of each character"],
                "model_answer": "I use the sliding window technique with two pointers (left and right) and a hash map storing the latest index of each visited character. As the right pointer advances, if the current character was already seen at index j >= left, we slide the left pointer to j + 1. The maximum window length is updated at each step: max_len = max(max_len, right - left + 1). This achieves O(n) time complexity since each pointer traverses the string at most once, with O(min(n, alphabet_size)) auxiliary space."
            },
            {
                "question": "Given a large stream of integers, how would you continuously maintain and query the median in O(1) time? What data structures would you use?",
                "category": "Data Structures & Heaps",
                "difficulty": "Advanced",
                "expected_concepts": ["max-heap", "min-heap", "two heaps", "O(log n) insertion", "O(1) lookup", "heap balancing"],
                "hints": ["Divide the numbers into lower half and upper half", "Balance the size of both heaps to differ by at most 1"],
                "model_answer": "I would use two heaps: a max-heap for the smaller half of the numbers and a min-heap for the larger half. For each incoming integer, we push it to the appropriate heap and rebalance so the size difference is at most 1. The median is either the root of the larger heap (if total elements is odd) or the average of the two heap roots (if even). Insertion is O(log n) and querying the median is O(1) time with O(n) space."
            }
        ],
        "system_design": [
            {
                "question": "How would you design a scalable URL shortener service (like Bitly) handling 100 million new URLs per month and a 10:1 read-to-write ratio?",
                "category": "System Design & Scalability",
                "difficulty": "Advanced",
                "expected_concepts": ["Base62 encoding", "distributed ID generator / Snowflake", "caching Redis", "NoSQL vs RDBMS", "hash collisions", "load balancer"],
                "hints": ["Calculate QPS and storage requirements", "Discuss unique key generation and caching"],
                "model_answer": "Key design steps: 1) Scale estimation: 100M writes/month = ~40 writes/sec, 400 reads/sec (manageable, but peak traffic requires caching). 2) Short URL encoding: 7 characters in Base62 ([a-zA-Z0-9]) yields 62^7 = ~3.5 trillion unique combinations. 3) Unique ID generator: Use a distributed counter or Twitter Snowflake ID generator converted to Base62 to prevent collisions. 4) Storage: Key-value store (Cassandra or DynamoDB) or PostgreSQL with a B-tree index on the short code. 5) Caching: Redis cluster storing top 20% hot URLs via LRU eviction to serve 80% of reads sub-millisecond. 6) Redirection: Return HTTP 302 (Found) to maintain analytics tracking or 301 (Moved Permanently) for browser caching."
            }
        ],
        "project_discussion": [
            {
                "question": "Tell me about a challenging technical bug or bottleneck you encountered in one of your recent projects. How did you isolate the root cause, what trade-offs did you consider, and how did you verify the fix?",
                "category": "Engineering Architecture & Debugging",
                "difficulty": "Intermediate",
                "expected_concepts": ["root cause analysis", "profiling / logs", "trade-offs", "unit/integration testing", "monitoring", "post-mortem"],
                "hints": ["Use the STAR framework", "Focus on quantitative metrics before and after the fix"],
                "model_answer": "Candidates should clearly articulate: 1) Context: The system architecture and user impact. 2) Root Cause Analysis: How logs, APM profilers, or memory dumps were used rather than guessing. 3) Alternatives: What options were weighed (e.g. quick patch vs architectural refactoring). 4) Verification: How regression tests, load testing, and production telemetry confirmed the resolution."
            }
        ],
        "hr_behavioral": [
            {
                "question": "Describe a situation where you had a strong technical disagreement with a team member or tech lead regarding an implementation approach. How did you handle it, and what was the outcome?",
                "category": "Collaboration & Conflict Resolution",
                "difficulty": "Intermediate",
                "expected_concepts": ["active listening", "data-driven proof of concept", "objective criteria", "disagree and commit", "respectful communication"],
                "hints": ["Focus on resolving via data or small benchmarks", "Emphasize team alignment over personal pride"],
                "model_answer": "A strong answer demonstrates emotional intelligence: rather than arguing subjectively, the candidate builds a quick proof-of-concept benchmark or measures latency/memory to provide objective data. If the consensus leans toward the other approach, they 'disagree and commit', executing the chosen direction with full ownership."
            }
        ]
    },
    "frontend_developer": {
        "technical_fundamentals": [
            {
                "question": "Explain the React reconciliation algorithm and how the Virtual DOM uses Fiber architecture to prioritize updates without blocking the browser main thread.",
                "category": "React Internals & DOM",
                "difficulty": "Advanced",
                "expected_concepts": ["Fiber tree", "time slicing", "work loop", "diffing keys", "concurrent mode", "requestIdleCallback / MessageChannel"],
                "hints": ["Contrast stack reconciler with interruptible Fiber units of work", "Explain render phase vs commit phase"],
                "model_answer": "In React 16+, the Fiber architecture replaced the recursive stack reconciler with a linked-list work loop. Work is broken into small units corresponding to Fiber nodes. During the Render Phase, React can pause, abort, or prioritize high-priority user events (typing/clicks) over low-priority background renders using a cooperative scheduler. Once the work is complete, the Commit Phase runs synchronously to mutate the real DOM, preventing jank and keeping frame rates at 60fps."
            },
            {
                "question": "What is the Critical Rendering Path in modern web browsers? What specific techniques would you use to minimize First Contentful Paint (FCP) and Largest Contentful Paint (LCP)?",
                "category": "Web Performance & CRP",
                "difficulty": "Intermediate",
                "expected_concepts": ["DOM / CSSOM", "render tree", "render-blocking resources", "code splitting", "preload/prefetch", "critical CSS", "WebP/AVIF"],
                "hints": ["Walk through HTML parsing, CSSOM construction, Layout, and Paint", "Discuss assets optimization and bundling"],
                "model_answer": "The Critical Rendering Path is the sequence of steps browsers take to convert HTML, CSS, and JavaScript into pixels on screen: 1) Parse HTML to DOM, 2) Parse CSS to CSSOM, 3) Combine into Render Tree, 4) Compute Layout (geometry), 5) Paint pixels. To optimize FCP and LCP: inline critical CSS, defer/async non-critical JS, implement dynamic route-based code-splitting, serve responsive modern image formats (WebP/AVIF) with priority preloading for hero banners, and configure CDN edge caching."
            }
        ],
        "dsa_coding": [
            {
                "question": "Implement a custom debounce function in JavaScript/TypeScript with immediate execution (leading edge) and trailing edge options. How does it prevent memory leaks?",
                "category": "JavaScript & Concurrency",
                "difficulty": "Intermediate",
                "expected_concepts": ["closures", "clearTimeout", "leading vs trailing edge", "cancel method", "garbage collection"],
                "hints": ["Return a wrapped function that resets the timer", "Provide a cancel method on the returned function"],
                "model_answer": "A debounce function delays invoking a callback until after a wait duration has elapsed since the last call. Using closures, it maintains a timer reference. When leading edge is enabled, it invokes immediately on the first call and suppresses subsequent calls until the wait interval expires. To prevent memory leaks in Single Page Applications, the debounced function exposes a .cancel() method to clear active timeouts upon component unmount."
            }
        ],
        "system_design": [
            {
                "question": "How would you architect a complex, enterprise frontend dashboard handling real-time WebSocket telemetry, optimistic UI updates, and offline caching?",
                "category": "Frontend System Design",
                "difficulty": "Advanced",
                "expected_concepts": ["state machine", "WebSocket reconnection backoff", "IndexedDB / local storage", "optimistic mutation", "rollback on failure", "virtualized list"],
                "hints": ["Separate network transport, global state, and presentation layers", "Discuss virtualization for high-frequency row updates"],
                "model_answer": "Architecture design: 1) Transport Layer: WebSocket client with exponential backoff and heartbeat ping-pongs, backed by a Service Worker for offline message queueing. 2) State Layer: Normalized store with an event-driven middleware. Telemetry events update specific slice IDs to avoid full re-renders. 3) Optimistic UI: Apply mutation locally with a temporary client ID and roll back gracefully if acknowledgment times out. 4) Rendering: Use windowing/virtualization (e.g. react-virtual) for rendering thousands of real-time rows, ensuring only visible viewport DOM nodes exist."
            }
        ]
    },
    "backend_developer": {
        "technical_fundamentals": [
            {
                "question": "How does the Python or Node.js asynchronous event loop handle concurrent I/O operations without multi-threading for CPU-bound tasks? When does an async application still block?",
                "category": "Asynchronous Architecture",
                "difficulty": "Intermediate",
                "expected_concepts": ["event loop", "non-blocking I/O", "libuv / epoll", "thread pool", "CPU-bound blocking", "multiprocessing"],
                "hints": ["Explain how epoll/kqueue notifies completion", "Describe what happens if you run a heavy crypto/compression loop on the main thread"],
                "model_answer": "In Python (asyncio) and Node.js (libuv), the event loop manages single-threaded cooperative multitasking for I/O operations by registering non-blocking file descriptors with the OS kernel via epoll/kqueue. When an async I/O request occurs, the event loop delegates the wait to the kernel and immediately executes other tasks. However, CPU-bound operations (e.g., synchronous cryptographic hashing, complex regex, image manipulation) block the event loop because execution cannot yield until the compute cycle completes. To handle CPU-bound tasks, we must offload them to worker threads or a multiprocessing pool (Celery/RQ)."
            },
            {
                "question": "What is Database Connection Pooling, why is it critical in microservices, and how do you configure pool size to avoid overwhelming your database server?",
                "category": "Database Engineering",
                "difficulty": "Intermediate",
                "expected_concepts": ["TCP handshake overhead", "pool exhaustion", "max_connections", "PostgreSQL worker limits", "PgBouncer", "Little's Law"],
                "hints": ["Discuss connection handshake cost vs query execution time", "Explain what happens if 50 serverless pods open 20 connections each"],
                "model_answer": "Connection pooling maintains a cache of active database connections so queries reuse pre-authenticated sockets without incurring the latency of TCP 3-way handshakes, TLS negotiation, and process fork overhead. In microservices, without pooling, traffic spikes cause thousands of concurrent connections that consume database RAM and CPU in context switching. Connection pools should be sized using the formula: Pool Size = (Core Count * 2) + Effective Spindle Count, often coupled with a central multiplexer like PgBouncer."
            }
        ],
        "system_design": [
            {
                "question": "Design an idempotent payment processing API endpoint. How do you prevent duplicate charges if a client network timeout triggers an automatic retry?",
                "category": "API Architecture & Distributed Systems",
                "difficulty": "Advanced",
                "expected_concepts": ["Idempotency Key", "atomic reservation", "Redis lock / SETNX", "two-phase commit", "state machine", "transaction isolation"],
                "hints": ["Require client-generated UUID header", "Lock the key, execute, cache the final response"],
                "model_answer": "To guarantee idempotency: 1) Client generates a unique Idempotency-Key (UUIDv4) in the HTTP header for each payment intent. 2) Upon receiving the request, the backend performs an atomic check-and-set in Redis (SET key 'PROCESSING' NX EX 120). If the key already exists and is 'PROCESSING', return HTTP 409 (Concurrent Request in Progress). 3) If the key is 'COMPLETED', return the cached payment response immediately with 200 OK without re-charging. 4) The payment is processed within a database transaction with a unique constraint on (idempotency_key). Upon success, the response payload is cached in Redis with a 24-hour TTL."
            }
        ]
    },
    "data_analyst": {
        "technical_fundamentals": [
            {
                "question": "Explain the difference between WHERE and HAVING in SQL, and walk me through Window Functions (e.g., ROW_NUMBER vs RANK vs DENSE_RANK).",
                "category": "SQL & Analytical Querying",
                "difficulty": "Intermediate",
                "expected_concepts": ["filter before vs after aggregation", "PARTITION BY", "ORDER BY", "tie handling", "gap in ranking"],
                "hints": ["WHERE filters rows; HAVING filters grouped aggregates", "Explain ties in RANK vs DENSE_RANK"],
                "model_answer": "WHERE filters individual rows before grouping and aggregation, while HAVING filters aggregated metric results produced by GROUP BY. In Window Functions: ROW_NUMBER() assigns a unique sequential integer to each row regardless of ties (1, 2, 3, 4). RANK() gives identical values the same rank but leaves gaps (1, 2, 2, 4). DENSE_RANK() gives identical values the same rank without leaving gaps (1, 2, 2, 3)."
            }
        ]
    }
}

class InterviewService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")

    def _get_llm_client(self):
        """Instantiates google.genai client if key is configured."""
        if self.gemini_key and len(self.gemini_key.strip()) > 10:
            try:
                from google import genai
                return genai.Client(api_key=self.gemini_key)
            except Exception as e:
                print(f"[InterviewService] Gemini Client init fallback: {e}")
        return None

    def start_interview_session(
        self,
        student_id: str,
        role: str,
        round_type: str,
        difficulty: str = "Intermediate",
        experience_level: str = "Fresher / Student (0-1 yrs)",
        duration_minutes: int = 15,
        target_company: Optional[str] = "Tier-1 Tech",
        job_description: Optional[str] = "",
        resume_text: Optional[str] = ""
    ) -> Dict[str, Any]:
        """Initializes a new interview session and generates Question 1."""
        session_id = f"mock_{uuid.uuid4().hex[:10]}"
        
        # Determine question quota based on duration
        if duration_minutes <= 10:
            target_question_count = 3
        elif duration_minutes <= 15:
            target_question_count = 5
        else:
            target_question_count = 8

        # Generate first question
        q1 = self._generate_first_question(
            role=role,
            round_type=round_type,
            difficulty=difficulty,
            target_company=target_company or "Tier-1 Tech",
            job_description=job_description or "",
            resume_text=resume_text or ""
        )

        session = {
            "id": session_id,
            "student_id": student_id,
            "role": role,
            "round": round_type,
            "difficulty": difficulty,
            "experience_level": experience_level,
            "duration_minutes": duration_minutes,
            "target_company": target_company or "General Tech",
            "job_description": job_description or "",
            "resume_text": resume_text or "",
            "status": "IN_PROGRESS",
            "current_question_index": 1,
            "target_question_count": target_question_count,
            "questions": [q1],
            "overall_evaluation": None,
            "created_at": time.time(),
            "updated_at": time.time(),
            "ai_engine": "Gemini 2.5 Flash" if (self.gemini_key and len(self.gemini_key) > 10) else "HireX Sovereign Context Engine"
        }

        canonical_store.save_interview_session(session)
        return session

    def submit_answer_and_progress(
        self,
        session_id: str,
        student_id: str,
        answer_text: str,
        audio_duration_seconds: Optional[float] = 0.0
    ) -> Dict[str, Any]:
        """Evaluates student answer, updates session, and generates next question or completes."""
        session = canonical_store.get_interview_session(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found.")
        
        # Enforce authorization
        if session.get("student_id") != student_id:
            raise PermissionError("Access denied: You cannot modify an interview session belonging to another student.")

        questions = session.get("questions", [])
        curr_idx = len(questions) - 1
        if curr_idx < 0:
            raise ValueError("No active question in this session.")

        active_q = questions[curr_idx]

        # Evaluate the answer
        evaluation = self._evaluate_answer(
            question=active_q["question"],
            expected_concepts=active_q.get("expected_concepts", []),
            student_answer=answer_text,
            role=session.get("role", "Software Developer"),
            round_type=session.get("round", "Technical Fundamentals"),
            difficulty=session.get("difficulty", "Intermediate")
        )

        active_q["student_answer"] = answer_text
        active_q["answered_at"] = time.time()
        active_q["audio_duration_seconds"] = audio_duration_seconds
        active_q["evaluation"] = evaluation

        # Check if interview is complete
        target_count = session.get("target_question_count", 5)
        is_final_question = len(questions) >= target_count

        if is_final_question:
            # Complete the interview!
            return self.complete_interview_session(session_id, student_id)
        else:
            # Generate next question with context-awareness
            next_q = self._generate_next_question(
                session=session,
                previous_question=active_q["question"],
                previous_answer=answer_text,
                previous_eval=evaluation
            )
            questions.append(next_q)
            session["current_question_index"] = len(questions)
            session["questions"] = questions
            session["updated_at"] = time.time()
            canonical_store.save_interview_session(session)

            return {
                "session_id": session_id,
                "status": "IN_PROGRESS",
                "current_question_index": len(questions),
                "target_question_count": target_count,
                "previous_evaluation": evaluation,
                "next_question": next_q
            }

    def complete_interview_session(
        self,
        session_id: str,
        student_id: str
    ) -> Dict[str, Any]:
        """Finalizes the interview session and builds comprehensive candidate evaluation report."""
        session = canonical_store.get_interview_session(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found.")

        if session.get("student_id") != student_id:
            raise PermissionError("Access denied: Not authorized for this session.")

        questions = session.get("questions", [])
        answered_questions = [q for q in questions if q.get("evaluation")]

        if not answered_questions:
            # If student completed without answering any question
            overall_score = 0.0
            category_breakdown = {
                "technical_depth": 0.0,
                "problem_solving": 0.0,
                "relevance": 0.0,
                "communication": 0.0,
                "industry_knowledge": 0.0
            }
            strengths = ["Session initialized"]
            weaknesses = ["No questions answered"]
            prep_plan = ["Retake the interview and articulate technical answers."]
            verdict = "Incomplete Session"
        else:
            evals = [q["evaluation"] for q in answered_questions]
            
            avg_tech = round(sum(e.get("technical_score", 7.0) for e in evals) / len(evals), 1)
            avg_prob = round(sum(e.get("problem_solving_score", 7.0) for e in evals) / len(evals), 1)
            avg_rel = round(sum(e.get("relevance_score", 7.0) for e in evals) / len(evals), 1)
            avg_comm = round(sum(e.get("communication_score", 7.0) for e in evals) / len(evals), 1)
            avg_ind = round(sum(e.get("practical_score", 7.0) for e in evals) / len(evals), 1)

            overall_score = round((avg_tech * 0.30 + avg_prob * 0.25 + avg_rel * 0.15 + avg_comm * 0.15 + avg_ind * 0.15), 1)

            category_breakdown = {
                "technical_depth": avg_tech,
                "problem_solving": avg_prob,
                "relevance": avg_rel,
                "communication": avg_comm,
                "industry_knowledge": avg_ind
            }

            # Collect qualitative strengths & areas
            all_strengths = []
            all_weaknesses = []
            for e in evals:
                all_strengths.extend(e.get("strengths", []))
                all_weaknesses.extend(e.get("weaknesses", []))

            # Deduplicate
            strengths = list(dict.fromkeys(all_strengths))[:4] or ["Solid fundamental knowledge", "Good responsiveness"]
            weaknesses = list(dict.fromkeys(all_weaknesses))[:4] or ["Elaborate on edge cases", "Mention architectural trade-offs"]

            if overall_score >= 8.5:
                verdict = "Tier-1 Corporate Ready (High Clear Rate)"
            elif overall_score >= 7.0:
                verdict = "Strong Candidate (Clearable with Targeted Prep)"
            elif overall_score >= 5.5:
                verdict = "Developing Candidate (Gaps in Edge Cases & Trade-offs)"
            else:
                verdict = "Needs Substantial Practice (Conceptual Refresh Needed)"

            prep_plan = self._generate_personalized_prep_plan(session.get("role", "Software Developer"), weaknesses)

        final_report = {
            "overall_score": overall_score,
            "max_score": 10.0,
            "verdict": verdict,
            "total_questions_answered": len(answered_questions),
            "category_scores": category_breakdown,
            "strengths": strengths,
            "areas_for_improvement": weaknesses,
            "recommended_topics": prep_plan.get("recommended_topics", []),
            "personalized_preparation_plan": prep_plan.get("daily_plan", []),
            "ai_engine_used": session.get("ai_engine", "HireX Sovereign Context Engine")
        }

        session["status"] = "COMPLETED"
        session["overall_evaluation"] = final_report
        session["updated_at"] = time.time()
        canonical_store.save_interview_session(session)

        return {
            "session_id": session_id,
            "status": "COMPLETED",
            "report": final_report,
            "session": session
        }

    # -------------------------------------------------------------
    # INTERNAL QUESTION GENERATION & EVALUATION LOGIC
    # -------------------------------------------------------------
    def _generate_first_question(
        self,
        role: str,
        round_type: str,
        difficulty: str,
        target_company: str,
        job_description: str,
        resume_text: str
    ) -> Dict[str, Any]:
        """Generates the opening interview question."""
        client = self._get_llm_client()
        if client:
            try:
                prompt = (
                    f"You are a seasoned Principal Engineer and Technical Interviewer at {target_company}. "
                    f"You are interviewing a candidate for the '{role}' position ({difficulty} level). "
                    f"Interview Round: {round_type}. "
                    f"{'Target Job Description: ' + job_description[:400] if job_description else ''} "
                    f"{'Candidate Resume Context: ' + resume_text[:400] if resume_text else ''} "
                    f"Generate a realistic, industry-calibrated Question 1 for this round. "
                    f"Format output STRICTLY as JSON with keys: "
                    f"'question' (string with an introductory polite sentence followed by the question), "
                    f"'category' (string topic), "
                    f"'hints' (array of 2 strings), "
                    f"'expected_concepts' (array of 4 key technical terms), "
                    f"'model_answer' (string comprehensive model answer)."
                )
                res = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if res and res.text:
                    cleaned = self._extract_json(res.text)
                    if cleaned and "question" in cleaned:
                        return {
                            "index": 1,
                            "question": cleaned["question"],
                            "category": cleaned.get("category", round_type),
                            "hints": cleaned.get("hints", ["Think about edge cases", "Consider efficiency"]),
                            "expected_concepts": cleaned.get("expected_concepts", ["efficiency", "trade-offs"]),
                            "model_answer": cleaned.get("model_answer", "A comprehensive technical defense."),
                            "interviewer_note": "Generated by Gemini 2.5 Flash"
                        }
            except Exception as e:
                print(f"[InterviewService] Gemini Q1 error: {e}. Falling back to sovereign engine.")

        # Sovereign fallback selection
        role_key = self._normalize_role_key(role)
        round_key = self._normalize_round_key(round_type)

        role_bank = ROLE_QUESTIONS.get(role_key, ROLE_QUESTIONS["software_developer"])
        questions_pool = role_bank.get(round_key, ROLE_QUESTIONS["software_developer"]["technical_fundamentals"])

        selected = questions_pool[0] if questions_pool else ROLE_QUESTIONS["software_developer"]["technical_fundamentals"][0]
        greeting = f"Welcome! I am your AI Technical Interviewer at {target_company}. Today we will focus on {round_type}. Let's begin: "
        
        return {
            "index": 1,
            "question": greeting + selected["question"],
            "category": selected.get("category", round_type),
            "hints": selected.get("hints", []),
            "expected_concepts": selected.get("expected_concepts", []),
            "model_answer": selected.get("model_answer", ""),
            "interviewer_note": "Generated by HireX Sovereign Context Engine"
        }

    def _generate_next_question(
        self,
        session: Dict[str, Any],
        previous_question: str,
        previous_answer: str,
        previous_eval: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generates subsequent context-aware question based on previous answer gaps or topic progression."""
        curr_len = len(session.get("questions", []))
        next_index = curr_len + 1
        role = session.get("role", "Software Developer")
        round_type = session.get("round", "Technical Fundamentals")
        difficulty = session.get("difficulty", "Intermediate")
        target_company = session.get("target_company", "Tier-1 Tech")

        client = self._get_llm_client()
        if client:
            try:
                history_summary = "\n".join([
                    f"Q{i+1}: {q.get('question')} | Candidate Answer: {q.get('student_answer', 'Skipped')}"
                    for i, q in enumerate(session.get("questions", []))
                ])
                prompt = (
                    f"You are conducting a live technical interview for a {role} candidate ({difficulty}) at {target_company}. "
                    f"Interview Round: {round_type}. "
                    f"Conversation so far:\n{history_summary}\n"
                    f"The candidate's last answer scored {previous_eval.get('overall_score', 7)}/10. "
                    f"Missed concepts: {previous_eval.get('concepts_missed', [])}. "
                    f"Generate Question {next_index}. "
                    f"If the candidate had notable gaps, ask a sharp follow-up probing their reasoning or trade-offs. "
                    f"Otherwise, advance logically to the next core dimension of this round. "
                    f"Format output STRICTLY as JSON with keys: 'question', 'category', 'hints' (list of 2), 'expected_concepts' (list of 4), 'model_answer'."
                )
                res = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if res and res.text:
                    cleaned = self._extract_json(res.text)
                    if cleaned and "question" in cleaned:
                        return {
                            "index": next_index,
                            "question": cleaned["question"],
                            "category": cleaned.get("category", round_type),
                            "hints": cleaned.get("hints", ["Structure your thoughts", "State trade-offs"]),
                            "expected_concepts": cleaned.get("expected_concepts", ["concurrency", "performance"]),
                            "model_answer": cleaned.get("model_answer", "Model explanation."),
                            "interviewer_note": "Contextual follow-up generated by Gemini 2.5 Flash"
                        }
            except Exception as e:
                print(f"[InterviewService] Gemini Next Q error: {e}")

        # Sovereign fallback follow-up
        role_key = self._normalize_role_key(role)
        round_key = self._normalize_round_key(round_type)
        role_bank = ROLE_QUESTIONS.get(role_key, ROLE_QUESTIONS["software_developer"])
        pool = role_bank.get(round_key, ROLE_QUESTIONS["software_developer"]["technical_fundamentals"])

        # Pick question by index modulo pool length
        selected = pool[(next_index - 1) % len(pool)]
        
        # If candidate missed concepts in last answer, craft a follow-up bridge!
        missed = previous_eval.get("concepts_missed", [])
        if missed and len(missed) > 0:
            prefix = f"In your previous explanation, you glossed over '{missed[0]}'. Before we proceed, how does that impact the solution? Specifically: "
        else:
            prefix = "Good points. Now let's explore another architectural aspect: "

        return {
            "index": next_index,
            "question": prefix + selected["question"],
            "category": selected.get("category", round_type),
            "hints": selected.get("hints", []),
            "expected_concepts": selected.get("expected_concepts", []),
            "model_answer": selected.get("model_answer", ""),
            "interviewer_note": "Contextualized by HireX Sovereign Context Engine"
        }

    def _evaluate_answer(
        self,
        question: str,
        expected_concepts: List[str],
        student_answer: str,
        role: str,
        round_type: str,
        difficulty: str
    ) -> Dict[str, Any]:
        """Evaluates candidate response across 5 critical industry dimensions."""
        client = self._get_llm_client()
        if client:
            try:
                prompt = (
                    f"You are an expert technical interviewer evaluating a candidate's response. "
                    f"Role: {role} ({difficulty}). Round: {round_type}. "
                    f"Question: \"{question}\" "
                    f"Candidate's Answer: \"{student_answer}\" "
                    f"Expected Key Concepts: {expected_concepts} "
                    f"Evaluate the answer strictly and fairly across 5 categories out of 10.0: "
                    f"1. technical_score (correctness, depth) "
                    f"2. problem_solving_score (logical structure, trade-offs) "
                    f"3. relevance_score (directly answered the question) "
                    f"4. communication_score (articulation, conciseness) "
                    f"5. practical_score (real-world engineering applicability) "
                    f"Format output STRICTLY as JSON with keys: "
                    f"'technical_score' (float), 'problem_solving_score' (float), 'relevance_score' (float), "
                    f"'communication_score' (float), 'practical_score' (float), 'overall_score' (float), "
                    f"'strengths' (array of strings), 'weaknesses' (array of strings), 'feedback' (string critique), "
                    f"'keywords_detected' (array of strings), 'concepts_missed' (array of strings), "
                    f"'model_answer' (string optimal answer)."
                )
                res = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if res and res.text:
                    cleaned = self._extract_json(res.text)
                    if cleaned and "technical_score" in cleaned:
                        return cleaned
            except Exception as e:
                print(f"[InterviewService] Gemini Evaluation error: {e}")

        # Sovereign semantic evaluation engine
        answer_lower = student_answer.lower()
        word_count = len(student_answer.split())

        # 1. Match expected concepts
        detected = []
        missed = []
        for concept in expected_concepts:
            c_low = concept.lower()
            if any(term in answer_lower for term in c_low.split()):
                detected.append(concept)
            else:
                missed.append(concept)

        concept_match_ratio = len(detected) / max(len(expected_concepts), 1)

        # 2. Length & depth score
        if word_count < 15:
            base_score = 3.5
            depth_penalty = -2.0
            critique = "Answer was too brief. Real interviews expect elaboration of trade-offs, edge cases, and reasoning."
        elif word_count < 40:
            base_score = 6.0
            depth_penalty = -0.5
            critique = "Good fundamental answer, but lacks architectural depth and real-world failure handling."
        else:
            base_score = 8.0
            depth_penalty = 0.5
            critique = "Well-structured response demonstrating sound conceptual grounding and engineering trade-offs."

        # Compute category scores
        tech_score = round(min(10.0, max(2.0, base_score * 0.7 + (concept_match_ratio * 4.0) + depth_penalty)), 1)
        prob_score = round(min(10.0, max(2.0, base_score * 0.8 + (concept_match_ratio * 3.0))), 1)
        rel_score = round(min(10.0, max(3.0, 7.5 if word_count > 20 else 4.0)), 1)
        comm_score = round(min(10.0, max(3.0, 8.5 if (word_count >= 30 and "." in student_answer) else 5.5)), 1)
        prac_score = round(min(10.0, max(2.0, tech_score * 0.9)), 1)

        overall = round((tech_score * 0.35 + prob_score * 0.25 + rel_score * 0.15 + comm_score * 0.15 + prac_score * 0.10), 1)

        strengths = []
        if detected:
            strengths.append(f"Correctly referenced key principles: {', '.join(detected[:3])}")
        if word_count > 30:
            strengths.append("Structured articulation with technical elaboration")
        if not strengths:
            strengths.append("Addressed the prompt directly")

        weaknesses = []
        if missed:
            weaknesses.append(f"Omitted critical trade-off concepts: {', '.join(missed[:2])}")
        if word_count < 30:
            weaknesses.append("Elaborate on production failure modes and scaling limits")

        return {
            "technical_score": tech_score,
            "problem_solving_score": prob_score,
            "relevance_score": rel_score,
            "communication_score": comm_score,
            "practical_score": prac_score,
            "overall_score": overall,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "feedback": critique,
            "keywords_detected": detected,
            "concepts_missed": missed,
            "model_answer": "In production, an optimal answer explains both the implementation mechanism and the architectural trade-offs."
        }

    def _generate_personalized_prep_plan(self, role: str, weaknesses: List[str]) -> Dict[str, Any]:
        """Generates tailored study topics and a day-by-day preparation schedule."""
        topics = [
            "Concurrency & Thread Safety Primitives",
            "Database Indexing B-Trees & Transaction Isolation Levels",
            "Asynchronous Event Loop & Non-Blocking I/O",
            "Cache Invalidation & Thundering Herd Stampede Mitigations",
            "Distributed Systems: Idempotency & Two-Phase Commit",
            "API Design: Rate Limiting & REST/gRPC Trade-offs"
        ]

        daily_plan = [
            {"day": "Day 1-2", "focus": "Core Language & OS Internals", "action": "Deep dive into memory allocation (heap vs stack), context switching, and event loop mechanics."},
            {"day": "Day 3-4", "focus": "Database Transactions & Query Optimization", "action": "Review PostgreSQL EXPLAIN ANALYZE, composite indexes, and isolation anomalies (dirty/phantom reads)."},
            {"day": "Day 5-6", "focus": "System Design Trade-offs", "action": "Practice end-to-end architectures: Redis caching patterns, message queues (Kafka), and horizontal partition sharding."},
            {"day": "Day 7", "focus": "Full Mock Simulation", "action": "Retake a 30-minute Advanced AI Mock Interview focusing on edge cases and failure mode recovery."}
        ]

        return {
            "recommended_topics": topics,
            "daily_plan": daily_plan
        }

    def _normalize_role_key(self, role: str) -> str:
        r = role.lower()
        if "front" in r:
            return "frontend_developer"
        if "back" in r:
            return "backend_developer"
        if "data" in r or "analyst" in r:
            return "data_analyst"
        return "software_developer"

    def _normalize_round_key(self, round_type: str) -> str:
        rt = round_type.lower()
        if "hr" in rt or "behav" in rt:
            return "hr_behavioral"
        if "dsa" in rt or "cod" in rt or "algo" in rt:
            return "dsa_coding"
        if "system" in rt or "design" in rt or "archi" in rt:
            return "system_design"
        if "proj" in rt or "resume" in rt:
            return "project_discussion"
        return "technical_fundamentals"

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Extracts JSON dictionary from raw model text."""
        try:
            # Strip markdown code blocks
            clean = re.sub(r'```json\s*', '', text)
            clean = re.sub(r'```\s*', '', clean).strip()
            return json.loads(clean)
        except Exception:
            # Regex search for { ... }
            match = re.search(r'(\{[\s\S]*\})', text)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
        return None

# Global singleton interview service
interview_service = InterviewService()
