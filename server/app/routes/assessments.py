from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import time
import math
from app.ml.skill_verifier import verifier
from app.ml.job_matcher import matcher
from app.ml.credential_verifier import credential_verifier
from app.data.seed_data import STUDENTS, OPPORTUNITIES, COURSE_CATALOG, APPLICATIONS, log_audit_trail
from app.routes.auth import require_roles
from app.services.jd_skill_analysis import analyze_student_for_opportunity
from app.services.opportunity_lifecycle import filter_active_opportunities

def _recompute_student_application_snapshots(student_id: str, student_skills: Dict[str, Any]):
    """
    Non-blocking additive hook: recomputes stored JD fit snapshots for a student's open applications
    when they complete a new assessment.
    """
    try:
        verdict_order = {"NEEDS_WORK": 0, "PARTIAL_FIT": 1, "GOOD_FIT": 2, "STRONG_FIT": 3}
        for app in APPLICATIONS:
            if app.get("student_id") == student_id:
                opp = next((o for o in OPPORTUNITIES if o["id"] == app.get("opportunity_id")), None)
                if opp:
                    old_verdict = app.get("jdFitVerdict")
                    recomputed = analyze_student_for_opportunity(student_skills, opportunity=opp)
                    new_verdict = recomputed["verdict"]
                    app["jdFitScore"] = recomputed["overallFit"]
                    app["jdFitVerdict"] = new_verdict
                    app["jdFitSummary"] = recomputed["summary"]
                    app["jdFitComputedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    # Notification trigger: if fit lifted to higher verdict
                    if old_verdict and verdict_order.get(new_verdict, 0) > verdict_order.get(old_verdict, 0):
                        log_audit_trail(
                            actor=app.get("student_name", "Student"),
                            action="JD_FIT_VERDICT_LIFTED",
                            target=f"{app.get('company')} - {app.get('title')}",
                            details=f"Fit verdict improved from {old_verdict} to {new_verdict} ({recomputed['overallFit']}%) following new assessment completion."
                        )
    except Exception as e:
        print(f"[JD Fit Recompute Warning] Non-blocking assessment snapshot recompute skipped: {e}")

router = APIRouter(prefix="/api/assessments", tags=["Assessments & Verification"])

# Comprehensive Multi-Skill Question Bank with difficulty grading
QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {
    "Java": [
        {
            "id": "jv_b1",
            "question": "Which of the following is NOT a primitive data type in Java?",
            "options": ["int", "boolean", "String", "float"],
            "correct": 2,
            "difficulty": "Beginner",
            "explanation": "String in Java is a reference class type, whereas int, boolean, and float are primitive types."
        },
        {
            "id": "jv_b2",
            "question": "What is the primary role of the Java Virtual Machine (JVM)?",
            "options": [
                "Compiles Java source code directly into native machine code",
                "Executes Java bytecode on any platform providing portability",
                "Translates C++ libraries into Java files",
                "Formats Java code according to Google Style Guide"
            ],
            "correct": 1,
            "difficulty": "Beginner",
            "explanation": "JVM interprets and JIT-compiles Java bytecode, enabling 'Write Once, Run Anywhere'."
        },
        {
            "id": "jv_i1",
            "question": "What is the difference between HashMap and ConcurrentHashMap in Java?",
            "options": [
                "HashMap is synchronized whereas ConcurrentHashMap is not",
                "ConcurrentHashMap uses segment/bucket locking for thread safety without synchronizing the whole map",
                "HashMap allows only integer keys while ConcurrentHashMap allows any object",
                "ConcurrentHashMap is slower in single-threaded operations and does not allow keys"
            ],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "ConcurrentHashMap achieves high concurrency by locking only specific hash buckets or segments."
        },
        {
            "id": "jv_i2",
            "question": "How does the Java Garbage Collector detect unreachable objects?",
            "options": [
                "Using Reference Counting algorithm exclusively",
                "Using GC Roots and Reachability Analysis traversal graph",
                "By checking memory allocation timestamps",
                "By invoking the finalize() method periodically"
            ],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "Modern JVMs use reachability analysis starting from GC Roots (threads, stack frames, static fields)."
        },
        {
            "id": "jv_a1",
            "question": "What occurs during a Metaspace OutOfMemoryError in Java 8+?",
            "options": [
                "The young generation heap is exhausted by short-lived objects",
                "Native memory allocated for class metadata and bytecode definitions is exhausted",
                "The thread call stack exceeds max recursion depth",
                "Garbage collection cycles exceed CPU allocation limits"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "Metaspace replaced PermGen in Java 8 and resides in native OS memory to hold class metadata."
        },
        {
            "id": "jv_a2",
            "question": "What is the consequence of declaring a field as 'volatile' in Java?",
            "options": [
                "Guarantees atomic execution of composite read-modify-write operations like i++",
                "Guarantees memory visibility across threads and establishes a happens-before order on reads/writes",
                "Locks the object instance using reentrant synchronization",
                "Prevents the garbage collector from reclaiming the field's object"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "Volatile guarantees cache-coherence and visibility with hardware memory barriers, but does not make i++ atomic."
        }
    ],

    "Python": [
        {
            "id": "py_b1",
            "question": "What is the average time complexity of a dictionary key lookup in Python?",
            "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            "correct": 0,
            "difficulty": "Beginner",
            "explanation": "Python dictionaries are implemented with hash tables, yielding amortized O(1) average lookup."
        },
        {
            "id": "py_b2",
            "question": "Which of the following built-in collection types in Python is immutable?",
            "options": ["List", "Dictionary", "Set", "Tuple"],
            "correct": 3,
            "difficulty": "Beginner",
            "explanation": "Tuples cannot be modified after instantiation, making them immutable and hashable."
        },
        {
            "id": "py_i1",
            "question": "Which Python decorator is used to define an asynchronous endpoint in FastAPI?",
            "options": ["@app.route()", "@app.get() with async def", "@asyncio.coroutine", "@app.endpoint()"],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "FastAPI uses native coroutines with 'async def' under route decorators."
        },
        {
            "id": "py_i2",
            "question": "What is the purpose of Python's '__slots__' attribute in a class?",
            "options": [
                "Enables multiple inheritance with C3 linearization",
                "Replaces the default __dict__ to significantly reduce memory footprint and prevent dynamic attribute creation",
                "Registers class methods into a global event loop",
                "Serializes class instances directly into JSON"
            ],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "__slots__ tells Python not to use dynamic __dict__ per instance, optimizing memory for millions of objects."
        },
        {
            "id": "py_a1",
            "question": "What is the primary architectural role of Python's Global Interpreter Lock (GIL)?",
            "options": [
                "Accelerates multi-core CPU matrix computations",
                "Prevents concurrent execution of native Python bytecode to maintain thread-safe CPython memory management",
                "Encrypts Python bytecode before compilation",
                "Automatically parallelizes for-loops"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "The GIL ensures only one thread executes CPython bytecode at a time, simplifying reference counting."
        },
        {
            "id": "py_a2",
            "question": "In Python's asyncio, what happens when a long-running synchronous CPU-bound task is called directly inside a coroutine?",
            "options": [
                "The task is automatically delegated to a separate background OS thread",
                "It blocks the single event loop, freezing all other concurrent asynchronous tasks",
                "Asyncio raises a CoroutineBlockedException immediately",
                "Python switches to greenlet threads automatically"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "Synchronous CPU blocking calls freeze the single-threaded asyncio event loop. run_in_executor should be used."
        }
    ],

    "SQL": [
        {
            "id": "sql_b1",
            "question": "Which SQL clause is used to filter records based on a specified condition?",
            "options": ["GROUP BY", "WHERE", "ORDER BY", "SELECT"],
            "correct": 1,
            "difficulty": "Beginner",
            "explanation": "WHERE filters rows before any grouping or aggregation takes place."
        },
        {
            "id": "sql_b2",
            "question": "Which SQL statement is used to remove all records from a table without logging individual row deletions?",
            "options": ["DELETE FROM", "DROP TABLE", "TRUNCATE TABLE", "REMOVE TABLE"],
            "correct": 2,
            "difficulty": "Beginner",
            "explanation": "TRUNCATE is a DDL operation that deallocates data pages and is faster than row-by-row DELETE."
        },
        {
            "id": "sql_i1",
            "question": "What is the key difference between WHERE and HAVING clauses in SQL?",
            "options": [
                "WHERE is used with joins; HAVING is used with subqueries",
                "WHERE filters rows prior to aggregation, while HAVING filters aggregated group results",
                "HAVING can only be used with numeric data types",
                "WHERE cannot be used on indexed columns"
            ],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "WHERE filters source rows, whereas HAVING filters aggregate results produced by GROUP BY."
        },
        {
            "id": "sql_i2",
            "question": "What type of index is most suitable for range queries (e.g. BETWEEN or >=)?",
            "options": ["Hash Index", "B-Tree Index", "Bitmap Index", "Full-Text Index"],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "B-Tree / B+Tree indexes keep keys sorted, making range scans O(log N + K)."
        },
        {
            "id": "sql_a1",
            "question": "Under the ACID isolation level 'REPEATABLE READ', which anomaly can still occur in standard SQL-92?",
            "options": [
                "Dirty Read (reading uncommitted data)",
                "Non-Repeatable Read (modified row values on re-read)",
                "Phantom Read (new rows inserted by concurrent transaction satisfying query criteria)",
                "None of the above (it is completely serializable)"
            ],
            "correct": 2,
            "difficulty": "Advanced",
            "explanation": "Standard Repeatable Read prevents dirty and non-repeatable reads, but may allow phantom inserts unless range locks are held."
        },
        {
            "id": "sql_a2",
            "question": "What is the primary benefit of Common Table Expressions (CTEs) utilizing the RECURSIVE keyword?",
            "options": [
                "Enables parallel query execution across multiple database nodes",
                "Allows querying hierarchical or graph data structures such as organization charts and bill-of-materials",
                "Enforces foreign key cascading updates automatically",
                "Converts row-level data into columnar Parquet format"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "WITH RECURSIVE computes transitive closures and parent-child hierarchy traversals in SQL."
        }
    ],

    "Machine Learning": [
        {
            "id": "ml_b1",
            "question": "Which of the following is an example of an Unsupervised Learning algorithm?",
            "options": ["Linear Regression", "Support Vector Machines", "K-Means Clustering", "Random Forest Classifier"],
            "correct": 2,
            "difficulty": "Beginner",
            "explanation": "K-Means clusters unlabeled data points without ground-truth targets."
        },
        {
            "id": "ml_b2",
            "question": "What is the primary symptom of Overfitting in a machine learning model?",
            "options": [
                "High training error and high validation error",
                "Low training error but significantly higher validation/test error",
                "Model parameters fail to converge during gradient descent",
                "Feature importances are all exactly zero"
            ],
            "correct": 1,
            "difficulty": "Beginner",
            "explanation": "Overfitting occurs when a model memorizes training noise and fails to generalize to unseen validation data."
        },
        {
            "id": "ml_i1",
            "question": "What is the role of L2 regularization (Ridge regression) on model weights?",
            "options": [
                "Forces unimportant feature coefficients strictly to zero for sparse feature selection",
                "Penalizes the sum of squared weights, shrinking them continuously towards zero to prevent overfitting",
                "Inverts the covariance matrix automatically",
                "Normalizes target variables into standard normal distribution"
            ],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "L2 Ridge adds a quadratic penalty on weights (sum w^2), shrinking weights while retaining all features."
        },
        {
            "id": "ml_i2",
            "question": "In classification, when classes are heavily imbalanced (e.g. 99:1 fraud ratio), which metric is preferred over accuracy?",
            "options": ["Mean Squared Error (MSE)", "Area Under the PR Curve (PR-AUC) or F1-Score", "R-squared Score", "Categorical Cross-Entropy loss alone"],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "High accuracy can be trivially achieved by predicting the majority class; F1 and PR-AUC assess precision and recall."
        },
        {
            "id": "ml_a1",
            "question": "How does the Self-Attention mechanism in the Transformer architecture achieve quadratic O(N^2) complexity with sequence length N?",
            "options": [
                "Through recurrent hidden state transitions across N timesteps",
                "By calculating pairwise dot-product compatibility between every query token and all key tokens (Q * K^T)",
                "By performing convolutional kernel convolutions across N depth channels",
                "Due to backpropagation through time (BPTT)"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "The QK^T matrix multiplication creates an N x N attention matrix, scaling quadratically with sequence length."
        },
        {
            "id": "ml_a2",
            "question": "What is the Vanishing Gradient problem and how does the Residual Connection (ResNet) mitigate it?",
            "options": [
                "Gradients become infinite; mitigated by gradient clipping",
                "Gradients diminish exponentially as backpropagated through many layers; identity skip connections (x + F(x)) provide a direct gradient highway",
                "Weights oscillate wildly; mitigated by decreasing learning rate",
                "Features lose spatial dimensions; mitigated by max pooling"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "Skip connections allow gradients to flow unchanged directly backward: d(x + F(x))/dx = 1 + dF/dx."
        }
    ],

    "React": [
        {
            "id": "rc_b1",
            "question": "What is the primary purpose of the 'key' prop when rendering lists of elements in React?",
            "options": [
                "Applies unique CSS styles to each list element",
                "Helps React identify which items have changed, been added, or removed for efficient reconciliation",
                "Binds an encrypted session ID to the DOM node",
                "Translates JSX elements into Web Components"
            ],
            "correct": 1,
            "difficulty": "Beginner",
            "explanation": "Keys provide identity across renders so React can reorder or update items without re-mounting the entire list."
        },
        {
            "id": "rc_b2",
            "question": "Which React hook is used to maintain local state in a functional component?",
            "options": ["useEffect", "useMemo", "useState", "useContext"],
            "correct": 2,
            "difficulty": "Beginner",
            "explanation": "useState returns a stateful value and a setter function to trigger component re-renders."
        },
        {
            "id": "rc_i1",
            "question": "When should the 'useCallback' hook be used in a React component?",
            "options": [
                "Whenever any function is declared inside a component",
                "To memoize a callback function instance between renders to prevent unnecessary re-renders of optimized child components",
                "To perform side effects after the DOM has been painted",
                "To subscribe to WebSocket events"
            ],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "useCallback returns a memoized function reference so child components wrapped with React.memo don't re-render needlessly."
        },
        {
            "id": "rc_i2",
            "question": "What is the difference between controlled and uncontrolled input components in React?",
            "options": [
                "Controlled components store state in the DOM; uncontrolled store state in React",
                "Controlled components have their value driven by React state via props/handlers; uncontrolled components use DOM refs",
                "Controlled components cannot have validation",
                "Uncontrolled components can only be used in class components"
            ],
            "correct": 1,
            "difficulty": "Intermediate",
            "explanation": "Controlled inputs have their current value managed via React state; uncontrolled use standard DOM node references."
        },
        {
            "id": "rc_a1",
            "question": "How does React 18+ Concurrent Mode alter rendering behavior?",
            "options": [
                "Runs all React renders inside a separate Web Worker thread",
                "Allows React to interrupt, pause, or abandon in-progress renders to prioritize urgent user interactions (e.g. typing)",
                "Eliminates the virtual DOM completely",
                "Forces all API calls to execute synchronously"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "Concurrent rendering enables interruptible renders using transitions (useTransition/startTransition) to keep the UI responsive."
        },
        {
            "id": "rc_a2",
            "question": "What is a potential memory leak pitfall when using 'useEffect' with subscriptions or intervals?",
            "options": [
                "Omitting the cleanup function when registering event listeners or timers",
                "Using an empty dependency array",
                "Calling setState synchronously inside the effect",
                "Exporting the component with React.memo"
            ],
            "correct": 0,
            "difficulty": "Advanced",
            "explanation": "If an effect sets up a timer or subscription without returning a cleanup function, orphaned callbacks remain in memory."
        }
    ],

    "Docker": [
        {
            "id": "dk_b1",
            "question": "Which Docker instruction sets the default command that executes when a container launches?",
            "options": ["RUN", "ENV", "CMD", "EXPOSE"],
            "correct": 2,
            "difficulty": "Beginner",
            "explanation": "CMD specifies default arguments or command for an executing container."
        },
        {
            "id": "dk_b2",
            "question": "What is the difference between a Docker image and a Docker container?",
            "options": [
                "An image is a running instance; a container is the static template file",
                "An image is an immutable template containing application code/dependencies; a container is its running instance",
                "Images are only used in development; containers are only used in production",
                "There is no difference"
            ],
            "correct": 1,
            "difficulty": "Beginner",
            "explanation": "Images are read-only blueprints; containers are isolated, runnable instances created from those images."
        },
        {
            "id": "dk_i1",
            "question": "What is the primary architectural advantage of multi-stage Docker builds?",
            "options": [
                "Drastically minimizes final production image size by separating build SDKs/tools from runtime artifacts",
                "Allows running multiple guest operating systems in a single container",
                "Automates deployment to Kubernetes without configuration",
                "Eliminates the requirement for a base image"
            ],
            "correct": 0,
            "difficulty": "Intermediate",
            "explanation": "Multi-stage builds allow compiling in an SDK image and copying only binaries into a lightweight alpine runtime image."
        },
        {
            "id": "dk_i2",
            "question": "Which Docker network driver enables containers on different Docker daemon hosts to communicate without host-level routing?",
            "options": ["bridge", "host", "overlay", "macvlan"],
            "correct": 2,
            "difficulty": "Intermediate",
            "explanation": "Overlay networks manage multi-host communication for Docker Swarm and Kubernetes clusters."
        },
        {
            "id": "dk_a1",
            "question": "How do Linux namespaces and cgroups collaborate to isolate containers?",
            "options": [
                "Namespaces limit resource utilization (CPU/Memory); cgroups restrict what a container can see (PID/Network)",
                "Namespaces isolate system visibility (process IDs, network interfaces, mounts); cgroups restrict resource usage (CPU, memory, I/O)",
                "Both exclusively manage file system copy-on-write layers",
                "They are hardware virtualization features implemented in the CPU hypervisor"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "Namespaces provide isolation (PID, NET, IPC, MNT, UTS); cgroups (control groups) meter and throttle CPU/RAM/IO."
        },
        {
            "id": "dk_a2",
            "question": "Why should production containers avoid running processes as root user (UID 0)?",
            "options": [
                "Root processes consume twice as much CPU memory",
                "A container escape or shared volume vulnerability could grant the process root access on the host operating system",
                "Docker daemon fails to start containers running as non-root",
                "Root processes cannot open network ports above 1024"
            ],
            "correct": 1,
            "difficulty": "Advanced",
            "explanation": "Without user namespace remapping, container UID 0 is host UID 0, posing severe security risks if escaped."
        }
    ]
}

# Helper to generate balanced questions for arbitrary skills
def get_balanced_questions_for_skill(skill: str, count: int = 6) -> List[Dict[str, Any]]:
    """
    Returns an equal distribution of Beginner, Intermediate, and Advanced questions.
    Falls back to a dynamically generated balanced set if the skill is not in standard bank.
    """
    if skill in QUESTION_BANK:
        pool = QUESTION_BANK[skill]
        # Distribute into tiers
        beginners = [q for q in pool if q.get("difficulty") == "Beginner"]
        intermediates = [q for q in pool if q.get("difficulty") == "Intermediate"]
        advanced = [q for q in pool if q.get("difficulty") == "Advanced"]
        
        target_per_tier = max(1, count // 3)
        remainder = count - (target_per_tier * 3)

        selected = []
        selected.extend(beginners[:target_per_tier])
        selected.extend(intermediates[:target_per_tier])
        selected.extend(advanced[:target_per_tier + remainder])
        
        if len(selected) >= count:
            return selected[:count]

    # Generate calibrated questions for any confirmed skill
    q_b = [
        {
            "id": f"{skill.lower()[:3]}_b1",
            "question": f"What is a core design principle or foundational concept in {skill}?",
            "options": [
                f"Modularity and structured implementation in {skill}",
                "Unrestricted global variable assignment",
                "Elimination of error-handling blocks",
                "Hardware-specific binary assembly"
            ],
            "correct": 0,
            "difficulty": "Beginner",
            "explanation": f"Foundational {skill} architecture relies on clean modular design and maintainable abstractions."
        },
        {
            "id": f"{skill.lower()[:3]}_b2",
            "question": f"Which standard tooling or practice is used for testing and validation in {skill}?",
            "options": [
                "Automated unit testing and linter checks",
                "Manual code execution in production",
                "Deleting compiler logs",
                "Skipping assertion validation"
            ],
            "correct": 0,
            "difficulty": "Beginner",
            "explanation": f"Automated testing and linting ensure robustness in {skill} codebases."
        }
    ]
    q_i = [
        {
            "id": f"{skill.lower()[:3]}_i1",
            "question": f"How are performance bottlenecks and resource limits typically addressed in {skill}?",
            "options": [
                "By profiling execution bottlenecks, caching, and optimizing memory allocation",
                "By increasing sleep timeouts in async callbacks",
                "By disabling exception handling",
                "By duplicating threads indefinitely"
            ],
            "correct": 0,
            "difficulty": "Intermediate",
            "explanation": f"Performance profiling and caching are standard optimization strategies in {skill}."
        },
        {
            "id": f"{skill.lower()[:3]}_i2",
            "question": f"In {skill}, what is the standard strategy for handling asynchronous operations and concurrent data access?",
            "options": [
                "Implementing thread synchronization, locks, or promise pipelines",
                "Allowing unmitigated race conditions",
                "Disabling networking interfaces",
                "Restarting the operating system on each request"
            ],
            "correct": 0,
            "difficulty": "Intermediate",
            "explanation": f"Concurrency in {skill} requires disciplined synchronization or event-driven paradigms."
        }
    ]
    q_a = [
        {
            "id": f"{skill.lower()[:3]}_a1",
            "question": f"Under high-throughput production load in {skill}, which architectural pattern ensures zero-downtime scalability?",
            "options": [
                "Stateless horizontal microservices with resilient load balancing and circuit breakers",
                "Monolithic single-thread stateful in-memory pooling without replicas",
                "Hardcoding IP addresses in frontend bundles",
                "Synchronous blocking database transactions across all requests"
            ],
            "correct": 0,
            "difficulty": "Advanced",
            "explanation": f"Enterprise {skill} deployments utilize stateless horizontal scaling and circuit breakers."
        },
        {
            "id": f"{skill.lower()[:3]}_a2",
            "question": f"What advanced failure-recovery mechanism is recommended when deploying {skill} in distributed microservice topologies?",
            "options": [
                "Exponential backoff with jitter and idempotent retry guarantees",
                "Infinite immediate re-execution loops",
                "Ignoring remote service exceptions",
                "Clearing production database caches"
            ],
            "correct": 0,
            "difficulty": "Advanced",
            "explanation": f"Exponential backoff with jitter prevents thundering herds during distributed recoveries in {skill}."
        }
    ]

    selected = q_b[:max(1, count // 3)] + q_i[:max(1, count // 3)] + q_a[:max(1, count - (2 * (count // 3)))]
    return selected[:count]


# Centralized Proctoring Configuration
# Number of violation WARNINGS tolerated before disqualification (configurable via env).
#   0 -> strict: first counted violation disqualifies
#   1 -> default: first violation = warning, second violation = automatic disqualification
import os
try:
    MAX_ALLOWED_VIOLATIONS = max(0, int(os.getenv("MAX_ALLOWED_VIOLATIONS", "1")))
except ValueError:
    MAX_ALLOWED_VIOLATIONS = 1

SUBMIT_GRACE_SECONDS = 30  # network tolerance for auto-submission at timer expiry
STRONG_SKILL_THRESHOLD = 70  # >= : ASSESSMENT VERIFIED
WEAK_SKILL_THRESHOLD = 60    # <  : Needs Improvement

PROCTORING_CONFIG = {
    "maxAllowedViolations": MAX_ALLOWED_VIOLATIONS,  # single centralized threshold (server authoritative)
    "maxTabSwitches": MAX_ALLOWED_VIOLATIONS,        # derived: tab switches tolerated
    "maxFullscreenExits": MAX_ALLOWED_VIOLATIONS,    # derived: fullscreen exits tolerated
    "maxCameraInterruptions": 1,     # 1 camera loss allowed if restored within grace period
    "maxMicrophoneInterruptions": 1, # 1 mic loss allowed if restored within grace period
    "gracePeriodSeconds": 15,        # 15s to recover camera or microphone connection
    "dedupWindowSeconds": 3,         # tab-switch + window-blur within this window = one incident
    "autoSaveIntervalSeconds": 5     # Autosave cadence
}


def _skill_status(exact_score: float) -> str:
    if exact_score >= STRONG_SKILL_THRESHOLD:
        return "ASSESSMENT VERIFIED"
    if exact_score < WEAK_SKILL_THRESHOLD:
        return "Needs Improvement"
    return "Competent"


def analyze_skill_results(skill_stats: Dict[str, Dict[str, int]]) -> Dict[str, Any]:
    """
    Single source of truth for skill-level result analysis.

    skill_stats: {skill: {"correct": int, "total": int}}

    * Scores are computed exactly (correct/total*100) and only rounded for display.
    * Strongest / weakest are ALL skills sharing the max / min exact score (ties preserved).
    * If every skill has the same score there is no distinct weakest skill (`all_tied`);
      with a single skill there is no weakest either.
    * Per-skill verification depends on that skill's own score only.
    """
    skills: List[Dict[str, Any]] = []
    for name, st in skill_stats.items():
        total = int(st.get("total", 0))
        correct = int(st.get("correct", 0))
        exact = (correct / total * 100.0) if total > 0 else 0.0
        skills.append({
            "skill": name,
            "correct": correct,
            "total": total,
            "score_exact": exact,
            "score": int(math.floor(exact + 0.5)),
            "status": _skill_status(exact),
            "verified": exact >= STRONG_SKILL_THRESHOLD,
        })

    def brief(s: Dict[str, Any]) -> Dict[str, Any]:
        return {"skill": s["skill"], "score": s["score"], "status": s["status"]}

    strong_skills = [brief(s) for s in skills if s["score_exact"] >= STRONG_SKILL_THRESHOLD]
    weak_skills = [brief(s) for s in skills if s["score_exact"] < WEAK_SKILL_THRESHOLD]

    strongest_skills: List[Dict[str, Any]] = []
    weakest_skills: List[Dict[str, Any]] = []
    all_tied = False
    if skills:
        max_score = max(s["score_exact"] for s in skills)
        min_score = min(s["score_exact"] for s in skills)
        all_tied = len(skills) > 1 and math.isclose(max_score, min_score, abs_tol=1e-9)
        strongest_skills = [brief(s) for s in skills if math.isclose(s["score_exact"], max_score, abs_tol=1e-9)]
        if len(skills) > 1 and not all_tied:
            weakest_skills = [brief(s) for s in skills if math.isclose(s["score_exact"], min_score, abs_tol=1e-9)]

    def names(items: List[Dict[str, Any]]) -> str:
        return ", ".join(f"{i['skill']} ({i['score']}%)" for i in items)

    if not skills:
        strongest_text = "Assessment completed."
        weakest_text = "No skills were assessed."
    elif all_tied:
        strongest_text = f"All assessed skills are tied at {strongest_skills[0]['score']}%: {names(strongest_skills)}."
        weakest_text = "There is no single weakest skill because all assessed skills scored the same."
    elif len(skills) == 1:
        strongest_text = f"Your only assessed skill is {strongest_skills[0]['skill']} with a score of {strongest_skills[0]['score']}%."
        weakest_text = "A weakest skill cannot be determined from a single assessed skill."
    else:
        if len(strongest_skills) > 1:
            strongest_text = f"Your highest performance is tied across {names(strongest_skills)}."
        else:
            strongest_text = f"Your strongest assessed skill is {strongest_skills[0]['skill']} with a score of {strongest_skills[0]['score']}%."
        if len(weakest_skills) > 1:
            weakest_text = f"Target areas for improvement are tied across {names(weakest_skills)}."
        else:
            weakest_text = f"{weakest_skills[0]['skill']} is currently your weakest assessed skill with a score of {weakest_skills[0]['score']}%."

    # Skills that should receive course recommendations: anything below the weak benchmark;
    # otherwise the distinct weakest skills, but only if they are still below the verification bar.
    improvement_targets = weak_skills or [w for w in weakest_skills if w["score"] < STRONG_SKILL_THRESHOLD]

    return {
        "skills": skills,
        "strong_skills": strong_skills,
        "weak_skills": weak_skills,
        "strongest_skills": strongest_skills,
        "weakest_skills": weakest_skills,
        "all_tied": all_tied,
        "improvement_targets": improvement_targets,
        "strongest_text": strongest_text,
        "weakest_text": weakest_text,
    }

# Assessment Session Store & Active Student Attempt Tracker
ASSESSMENT_SESSIONS: Dict[str, Dict[str, Any]] = {}
ACTIVE_STUDENT_ATTEMPTS: Dict[str, str] = {}  # student_id -> active assessment_id
PROCTORING_AUDIT_LOGS: List[Dict[str, Any]] = []

# Assessment Integrity Engine Configuration & Active Sessions
INTEGRITY_CONFIG: Dict[str, Any] = {
    "warningThreshold": 1,
    "reviewThreshold": 2,
    "disqualificationThreshold": 3,
    "absenceGracePeriodSeconds": 6.0,
    "multiplePersonPersistenceSeconds": 3.0,
    "phonePersistenceSeconds": 2.0,
    "audioVoicePersistenceSeconds": 3.0,
    "cameraGracePeriodSeconds": 15.0,
    "micGracePeriodSeconds": 15.0,
    "fullscreenReentryGraceSeconds": 10.0,
    "dedupWindowSeconds": 2.0,
    "confidenceThreshold": 0.70,
    "phoneConfidenceThreshold": 0.75,
    "audioConfidenceThreshold": 0.65,
    "personDetectionEnabled": True,
    "phoneDetectionEnabled": True,
    "audioVoiceAnalysisEnabled": True,
    "cameraObstructionEnabled": True,
    "browserFocusMonitoringEnabled": True,
    "fullscreenMonitoringEnabled": True,
}
INTEGRITY_SESSIONS: Dict[str, Dict[str, Any]] = {}


def _categorize_events(events: List[Dict[str, Any]]) -> Dict[str, int]:
    cats = {"camera": 0, "person": 0, "phone": 0, "audio": 0, "browser": 0, "fullscreen": 0}
    for e in events:
        etype = (e.get("eventType") or e.get("event_type") or "").upper()
        if "CAMERA" in etype:
            cats["camera"] += 1
        elif "PERSON" in etype or "ABSENT" in etype:
            cats["person"] += 1
        elif "PHONE" in etype:
            cats["phone"] += 1
        elif "MIC" in etype or "VOICE" in etype or "AUDIO" in etype:
            cats["audio"] += 1
        elif "FULLSCREEN" in etype:
            cats["fullscreen"] += 1
        elif "TAB" in etype or "BLUR" in etype or "PAGE" in etype:
            cats["browser"] += 1
    return cats


def compute_integrity_score_and_status(events: List[Dict[str, Any]], is_disqualified: bool = False) -> Dict[str, Any]:
    if is_disqualified:
        return {
            "score": 0,
            "status": "DISQUALIFIED",
            "total_warnings": sum(1 for e in events if e.get("severity") == "LOW"),
            "total_violations": sum(1 for e in events if e.get("severity") in ("MEDIUM", "HIGH")),
            "categories": _categorize_events(events),
            "events": events
        }

    score = 100.0
    warnings = 0
    violations = 0

    valid_events = [e for e in events if e.get("status") != "DISMISSED"]

    for ev in valid_events:
        sev = (ev.get("severity") or "LOW").upper()
        conf = max(0.5, float(ev.get("confidence") or 1.0))
        dur = float(ev.get("durationSeconds") or ev.get("duration") or 0.0)
        dur_factor = min(2.0, 1.0 + (dur / 30.0)) if dur > 0 else 1.0

        if sev == "LOW":
            warnings += 1
            score -= (2.5 * conf * dur_factor)
        elif sev == "MEDIUM":
            violations += 1
            score -= (7.0 * conf * dur_factor)
        elif sev == "HIGH":
            violations += 1
            score -= (15.0 * conf * dur_factor)

    final_score = max(0, min(100, int(round(score))))

    disq_thresh = INTEGRITY_CONFIG["disqualificationThreshold"]
    rev_thresh = INTEGRITY_CONFIG["reviewThreshold"]
    warn_thresh = INTEGRITY_CONFIG["warningThreshold"]

    if violations >= disq_thresh or final_score < 50:
        status = "DISQUALIFIED"
    elif violations >= rev_thresh or final_score < 70:
        status = "FLAGGED_FOR_REVIEW"
    elif violations >= warn_thresh or final_score < 90:
        status = "WARNING"
    else:
        status = "VALID"

    return {
        "score": final_score,
        "status": status,
        "total_warnings": warnings,
        "total_violations": violations,
        "categories": _categorize_events(events),
        "events": events
    }

class AssessmentProctoringEvent(BaseModel):
    id: str
    assessmentAttemptId: str
    studentId: str
    eventType: str  # TAB_SWITCH, WINDOW_BLUR, FULLSCREEN_EXIT, CAMERA_DISCONNECTED, MICROPHONE_DISCONNECTED, CAMERA_PERMISSION_REVOKED, MIC_PERMISSION_REVOKED, NETWORK_INTERRUPTION, ASSESSMENT_TERMINATED, ASSESSMENT_SUBMITTED
    timestamp: int
    severity: str   # NORMAL, WARNING, SUSPICIOUS, DISQUALIFICATION
    metadata: Optional[Dict[str, Any]] = None
    actionTaken: str # NONE, WARNING, PAUSE, DISQUALIFY

class GenerateAssessmentRequest(BaseModel):
    student_id: str = "std_1"
    skills: List[str]
    questions_per_skill: int = 6  # Equal questions per section (e.g. 6: 2 Beginner, 2 Intermediate, 2 Advanced)
    time_limit_minutes: int = 15

class SystemCheckVerifyRequest(BaseModel):
    assessment_id: str
    student_id: str = "std_1"
    camera_ready: bool
    microphone_ready: bool
    fullscreen_supported: bool = True
    fullscreen_ready: Optional[bool] = True
    browser_supported: bool = True
    consent_given: bool
    network_ready: Optional[bool] = True

class StartAssessmentRequest(BaseModel):
    assessment_id: str
    student_id: str = "std_1"

class LogViolationRequest(BaseModel):
    assessment_id: str
    student_id: str = "std_1"
    event_type: str  # TAB_SWITCH, WINDOW_BLUR, FULLSCREEN_EXIT, CAMERA_DISCONNECTED, MICROPHONE_DISCONNECTED, CAMERA_PERMISSION_REVOKED, MIC_PERMISSION_REVOKED, NETWORK_INTERRUPTION, ASSESSMENT_TERMINATED, ASSESSMENT_SUBMITTED
    severity: str = "WARNING"  # NORMAL, WARNING, SUSPICIOUS, DISQUALIFICATION
    section: Optional[str] = None
    question_id: Optional[str] = None
    details: Optional[str] = ""
    action_taken: Optional[str] = "WARNING"
    grace_expired: Optional[bool] = False  # camera/mic not restored within the grace period

class LogIntegrityEventRequest(BaseModel):
    id: Optional[str] = None
    assessmentAttemptId: str
    userId: Optional[str] = "std_1"
    eventType: str
    severity: str = "LOW"  # LOW, MEDIUM, HIGH
    confidence: Optional[float] = 1.0
    durationSeconds: Optional[int] = 0
    timestamp: Optional[int] = None
    status: Optional[str] = "RECORDED"
    metadata: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class UpdateIntegrityConfigRequest(BaseModel):
    warningThreshold: Optional[int] = None
    reviewThreshold: Optional[int] = None
    disqualificationThreshold: Optional[int] = None
    absenceGracePeriodSeconds: Optional[float] = None
    multiplePersonPersistenceSeconds: Optional[float] = None
    phonePersistenceSeconds: Optional[float] = None
    audioVoicePersistenceSeconds: Optional[float] = None
    cameraGracePeriodSeconds: Optional[float] = None
    micGracePeriodSeconds: Optional[float] = None
    fullscreenReentryGraceSeconds: Optional[float] = None
    dedupWindowSeconds: Optional[float] = None
    confidenceThreshold: Optional[float] = None
    phoneConfidenceThreshold: Optional[float] = None
    audioConfidenceThreshold: Optional[float] = None
    personDetectionEnabled: Optional[bool] = None
    phoneDetectionEnabled: Optional[bool] = None
    audioVoiceAnalysisEnabled: Optional[bool] = None
    cameraObstructionEnabled: Optional[bool] = None
    browserFocusMonitoringEnabled: Optional[bool] = None
    fullscreenMonitoringEnabled: Optional[bool] = None

class SaveProgressRequest(BaseModel):
    assessment_id: str
    student_id: str = "std_1"
    section_answers: Optional[Dict[str, List[int]]] = None
    answers: Optional[Dict[str, List[int]]] = None
    elapsed_seconds: Optional[int] = 0
    time_spent_seconds: Optional[int] = 0

class MultiSectionSubmission(BaseModel):
    assessment_id: str
    student_id: str = "std_1"
    section_answers: Optional[Dict[str, List[int]]] = None
    answers: Optional[Dict[str, List[int]]] = None
    practical_code_score: Optional[float] = 85.0

class AssessmentSubmission(BaseModel):
    student_id: str = "std_1"
    skill: str = "Python"
    answers: List[int]
    practical_code_score: Optional[float] = 85.0

class CertificateVerificationRequest(BaseModel):
    student_id: str = "std_1"
    credential_url_or_code: str
    claimed_skill: str = "Python"

class VerifyQRRequest(BaseModel):
    qr_payload: str
    student_id: Optional[str] = "std_1"



@router.get("/integrity-config")
@router.get("/integrity/config")
def get_integrity_config_endpoint():
    """Returns the active Assessment Integrity Engine configuration."""
    return {
        "status": "success",
        "config": INTEGRITY_CONFIG
    }


@router.post("/integrity-config")
@router.post("/integrity/config")
def update_integrity_config_endpoint(req: UpdateIntegrityConfigRequest):
    """Admin / Academician configuration endpoint to adjust integrity thresholds."""
    update_data = req.dict(exclude_unset=True)
    for k, v in update_data.items():
        if v is not None:
            INTEGRITY_CONFIG[k] = v
    return {
        "status": "success",
        "message": "Assessment Integrity configuration updated successfully.",
        "config": INTEGRITY_CONFIG
    }


@router.post("/integrity-event")
@router.post("/integrity/event")
def log_integrity_event_endpoint(req: LogIntegrityEventRequest):
    """
    Ingests and validates client-side Assessment Integrity signals.
    Recalculates integrity score and flags attempt for review or disqualification.
    """
    now = int(time.time())
    event_id = req.id or f"evt_{uuid.uuid4().hex[:8]}"
    ts = req.timestamp or now

    # Get or initialize session in INTEGRITY_SESSIONS
    integ_sess = INTEGRITY_SESSIONS.setdefault(req.assessmentAttemptId, {
        "assessment_id": req.assessmentAttemptId,
        "student_id": req.userId or "std_1",
        "events": [],
        "created_at": now
    })

    event_record = {
        "id": event_id,
        "assessmentAttemptId": req.assessmentAttemptId,
        "userId": req.userId or "std_1",
        "eventType": req.eventType.upper().replace(" ", "_"),
        "severity": req.severity.upper(),
        "confidence": float(req.confidence if req.confidence is not None else 1.0),
        "durationSeconds": int(req.durationSeconds or 0),
        "timestamp": ts,
        "status": req.status or "RECORDED",
        "metadata": req.metadata or {},
        "message": req.message or f"Integrity event: {req.eventType}"
    }

    integ_sess["events"].append(event_record)

    # Sync with ASSESSMENT_SESSIONS and PROCTORING_AUDIT_LOGS
    asmt_sess = ASSESSMENT_SESSIONS.get(req.assessmentAttemptId)
    is_disq = False
    if asmt_sess:
        if asmt_sess.get("proctoring_status") == "DISQUALIFIED":
            is_disq = True
        if event_record["severity"] in ("MEDIUM", "HIGH"):
            asmt_sess.setdefault("violations", []).append(event_record)
            PROCTORING_AUDIT_LOGS.append(event_record)

    # Calculate authoritative score & status
    report = compute_integrity_score_and_status(integ_sess["events"], is_disqualified=is_disq)

    # Update attempt status if thresholds are breached
    if report["status"] == "DISQUALIFIED" and asmt_sess and asmt_sess.get("proctoring_status") != "DISQUALIFIED":
        asmt_sess["proctoring_status"] = "DISQUALIFIED"
        asmt_sess["disqualification_reason"] = req.message or f"Integrity policy violation ({report['total_violations']} violations)."

    integ_sess["current_score"] = report["score"]
    integ_sess["current_status"] = report["status"]

    return {
        "status": "success",
        "eventId": event_id,
        "assessmentAttemptId": req.assessmentAttemptId,
        "integrityScore": report["score"],
        "integrityStatus": report["status"],
        "totalWarnings": report["total_warnings"],
        "totalViolations": report["total_violations"],
        "categories": report["categories"],
        "isDisqualified": report["status"] == "DISQUALIFIED",
        "message": req.message or "Integrity event processed."
    }


@router.get("/integrity/session/{assessment_id}")
def get_integrity_session_endpoint(assessment_id: str):
    """Fetches full integrity session metrics and event timeline."""
    integ_sess = INTEGRITY_SESSIONS.get(assessment_id)
    asmt_sess = ASSESSMENT_SESSIONS.get(assessment_id)
    events = (integ_sess.get("events") if integ_sess else None) or (asmt_sess.get("violations") if asmt_sess else []) or []
    is_disq = (asmt_sess.get("proctoring_status") == "DISQUALIFIED") if asmt_sess else False
    report = compute_integrity_score_and_status(events, is_disqualified=is_disq)

    return {
        "status": "success",
        "assessment_id": assessment_id,
        "student_id": (integ_sess.get("student_id") if integ_sess else None) or (asmt_sess.get("student_id") if asmt_sess else "std_1"),
        "integrity_score": report["score"],
        "integrity_status": report["status"],
        "total_warnings": report["total_warnings"],
        "total_violations": report["total_violations"],
        "categories": report["categories"],
        "events": events,
        "config": INTEGRITY_CONFIG
    }


@router.get("/integrity/audit-logs")
def get_integrity_audit_logs(
    role: str = Query("admin"),
    student_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None)
):
    """
    RBAC-protected integrity audit dashboard endpoint.
    Recruiters are strictly blocked from telemetry data.
    """
    if role.lower() == "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Recruiters are not authorized to view candidate proctoring or integrity telemetry."
        )

    attempts_list = []
    all_sess_ids = set(list(ASSESSMENT_SESSIONS.keys()) + list(INTEGRITY_SESSIONS.keys()))

    for aid in all_sess_ids:
        asmt_sess = ASSESSMENT_SESSIONS.get(aid, {})
        integ_sess = INTEGRITY_SESSIONS.get(aid, {})
        sid = integ_sess.get("student_id") or asmt_sess.get("student_id") or "std_1"

        if student_id and sid != student_id:
            continue

        events = (integ_sess.get("events") if integ_sess else None) or asmt_sess.get("violations", [])
        is_disq = asmt_sess.get("proctoring_status") == "DISQUALIFIED"
        report = compute_integrity_score_and_status(events, is_disqualified=is_disq)

        if status_filter and status_filter.upper() != "ALL" and report["status"].upper() != status_filter.upper():
            continue

        student_obj = next((s for s in STUDENTS if s["id"] == sid), None)
        student_name = student_obj.get("name") if student_obj else f"Candidate ({sid})"

        score = None
        if asmt_sess.get("cached_result") and asmt_sess["cached_result"].get("valid_score_available"):
            score = asmt_sess["cached_result"].get("overall_score")

        attempts_list.append({
            "assessment_id": aid,
            "student_id": sid,
            "student_name": student_name,
            "assessment_name": ", ".join(asmt_sess.get("skills", ["General Skills"])),
            "score": score,
            "integrity_score": report["score"],
            "integrity_status": report["status"],
            "total_warnings": report["total_warnings"],
            "total_violations": report["total_violations"],
            "categories": report["categories"],
            "events": events,
            "disqualification_reason": asmt_sess.get("disqualification_reason"),
            "started_at": asmt_sess.get("started_at"),
            "submitted_at": asmt_sess.get("submitted_at") or asmt_sess.get("created_at")
        })

    return {
        "status": "success",
        "role": role,
        "total_attempts": len(attempts_list),
        "attempts": attempts_list,
        "config": INTEGRITY_CONFIG
    }


@router.get("/proctoring-config")
def get_proctoring_config():
    """Returns authoritative server-side proctoring policies and violation limits."""
    return {
        "status": "success",
        "config": PROCTORING_CONFIG
    }


@router.get("/session/{assessment_id}")
def get_assessment_session(assessment_id: str):
    """
    Returns the authoritative session state, remaining timer, and proctoring status.
    Prevents client clock tampering.
    """
    session = ASSESSMENT_SESSIONS.get(assessment_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found.")

    now = int(time.time())
    expires_at = session.get("expires_at")
    remaining_seconds = max(0, expires_at - now) if expires_at else (session.get("time_limit_minutes", 15) * 60)

    # Check if timer expired while attempt is still running
    if session.get("proctoring_status") in ("IN_PROGRESS", "WARNING") and expires_at and now >= expires_at:
        session["proctoring_status"] = "EXPIRED"

    return {
        "status": "success",
        "assessment_id": assessment_id,
        "student_id": session.get("student_id"),
        "proctoring_status": session.get("proctoring_status", "NOT_STARTED"),
        "is_active": session.get("proctoring_status") in ("IN_PROGRESS", "WARNING"),
        "disqualification_reason": session.get("disqualification_reason"),
        "time_limit_minutes": session.get("time_limit_minutes"),
        "started_at": session.get("started_at"),
        "expires_at": expires_at,
        "remaining_seconds": remaining_seconds,
        "tab_switches_count": session.get("tab_switches_count", 0),
        "fullscreen_exits_count": session.get("fullscreen_exits_count", 0),
        "camera_disconnects_count": session.get("camera_disconnects_count", 0),
        "mic_disconnects_count": session.get("mic_disconnects_count", 0),
        "violation_count": session.get("violation_count", 0),
        "violations_count": session.get("violation_count", 0),
        "max_allowed_violations": PROCTORING_CONFIG["maxAllowedViolations"],
        "config": PROCTORING_CONFIG
    }


@router.post("/generate")
def generate_assessment(req: GenerateAssessmentRequest):
    """
    Generates assessment strictly based on confirmed skills.
    Enforces:
    - Single active attempt per student
    - Equal question distribution across skills and difficulty tiers
    - Initializes proctoring state machine to SYSTEM_CHECK
    """
    if not req.skills:
        raise HTTPException(status_code=400, detail="Cannot generate assessment without confirmed skills.")

    # 1. Single Active Attempt Enforcement:
    active_asmt_id = ACTIVE_STUDENT_ATTEMPTS.get(req.student_id)
    if active_asmt_id and active_asmt_id in ASSESSMENT_SESSIONS:
        existing = ASSESSMENT_SESSIONS[active_asmt_id]
        now = int(time.time())
        exp = existing.get("expires_at")
        # If existing session is currently active and not expired, inform or return it
        if existing.get("proctoring_status") in ["SYSTEM_CHECK", "READY", "IN_PROGRESS", "PAUSED", "WARNING"] and (not exp or now < exp):
            # Check if skills match; if identical, reuse existing session
            if sorted(existing.get("skills", [])) == sorted(req.skills):
                client_sections = []
                for sk in req.skills:
                    balanced_q = existing["raw_sections"].get(sk, [])
                    sanitized_questions = [
                        {
                            "id": q["id"],
                            "question": q["question"],
                            "options": q["options"],
                            "difficulty": q.get("difficulty", "Intermediate")
                        }
                        for q in balanced_q
                    ]
                    client_sections.append({
                        "skill": sk,
                        "total_questions": len(sanitized_questions),
                        "difficulty_distribution": {
                            "Beginner": sum(1 for q in balanced_q if q.get("difficulty") == "Beginner"),
                            "Intermediate": sum(1 for q in balanced_q if q.get("difficulty") == "Intermediate"),
                            "Advanced": sum(1 for q in balanced_q if q.get("difficulty") == "Advanced")
                        },
                        "questions": sanitized_questions
                    })
                return {
                    "status": "success",
                    "assessment_id": active_asmt_id,
                    "student_id": req.student_id,
                    "total_skills": len(req.skills),
                    "total_questions": len(req.skills) * existing.get("questions_per_skill", 3),
                    "time_limit_minutes": existing.get("time_limit_minutes", req.time_limit_minutes),
                    "sections": client_sections,
                    "proctoring_status": existing.get("proctoring_status", "SYSTEM_CHECK"),
                    "proctoring_config": PROCTORING_CONFIG,
                    "resumed_existing_session": True
                }

    assessment_id = f"asmt_{uuid.uuid4().hex[:10]}"
    questions_per_skill = max(3, req.questions_per_skill)

    client_sections = []
    raw_sections = {}

    for sk in req.skills:
        balanced_q = get_balanced_questions_for_skill(sk, count=questions_per_skill)
        raw_sections[sk] = balanced_q

        # Sanitize for client (omit correct answers)
        sanitized_questions = [
            {
                "id": q["id"],
                "question": q["question"],
                "options": q["options"],
                "difficulty": q.get("difficulty", "Intermediate")
            }
            for q in balanced_q
        ]

        b_count = sum(1 for q in balanced_q if q.get("difficulty") == "Beginner")
        i_count = sum(1 for q in balanced_q if q.get("difficulty") == "Intermediate")
        a_count = sum(1 for q in balanced_q if q.get("difficulty") == "Advanced")

        client_sections.append({
            "skill": sk,
            "total_questions": len(sanitized_questions),
            "difficulty_distribution": {
                "Beginner": b_count,
                "Intermediate": i_count,
                "Advanced": a_count
            },
            "questions": sanitized_questions
        })

    session_data = {
        "assessment_id": assessment_id,
        "student_id": req.student_id,
        "is_default_student": req.student_id == "std_1",
        "skills": req.skills,
        "questions_per_skill": questions_per_skill,
        "time_limit_minutes": req.time_limit_minutes,
        "raw_sections": raw_sections,
        "answers": {},
        "violations": [],
        "tab_switches_count": 0,
        "fullscreen_exits_count": 0,
        "camera_disconnects_count": 0,
        "mic_disconnects_count": 0,
        "proctoring_status": "SYSTEM_CHECK",  # NOT_STARTED -> SYSTEM_CHECK -> READY -> IN_PROGRESS
        "disqualification_reason": None,
        "created_at": int(time.time()),
        "started_at": None,
        "expires_at": None,
        "system_check_passed": False
    }
    ASSESSMENT_SESSIONS[assessment_id] = session_data
    ACTIVE_STUDENT_ATTEMPTS[req.student_id] = assessment_id

    return {
        "status": "success",
        "assessment_id": assessment_id,
        "student_id": req.student_id,
        "total_skills": len(req.skills),
        "total_questions": len(req.skills) * questions_per_skill,
        "time_limit_minutes": req.time_limit_minutes,
        "sections": client_sections,
        "proctoring_status": "SYSTEM_CHECK",
        "proctoring_config": PROCTORING_CONFIG
    }


@router.post("/system-check-verify")
def verify_system_check(req: SystemCheckVerifyRequest):
    """
    Validates pre-assessment device checks and proctoring consent.
    Transitions proctoring status to READY.
    """
    session = ASSESSMENT_SESSIONS.get(req.assessment_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found.")

    if not req.camera_ready:
        raise HTTPException(status_code=400, detail="System check failed: Camera permission required or camera not ready.")
    if not req.microphone_ready:
        raise HTTPException(status_code=400, detail="System check failed: Microphone permission required or microphone not ready.")
    if not req.fullscreen_supported and not req.fullscreen_ready:
        raise HTTPException(status_code=400, detail="System check failed: Fullscreen mode not supported.")
    if not req.browser_supported:
        raise HTTPException(status_code=400, detail="System check failed: Browser does not support required proctoring APIs.")
    if not req.consent_given:
        raise HTTPException(status_code=400, detail="System check failed: Candidate consent is mandatory before starting.")

    session["system_check_passed"] = True
    session["proctoring_status"] = "READY"

    return {
        "status": "success",
        "assessment_id": req.assessment_id,
        "proctoring_status": "READY",
        "message": "System check verified. The assessment is now ready to begin in Fullscreen."
    }


@router.post("/start")
def start_proctored_assessment(req: StartAssessmentRequest):
    """
    Authoritative server-side assessment start.
    Initializes start timestamp and immutable expiration time based on server clock.
    Sets proctoring_status to IN_PROGRESS.
    """
    session = ASSESSMENT_SESSIONS.get(req.assessment_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found.")

    # Validate student ownership
    if session.get("student_id") != req.student_id:
        raise HTTPException(status_code=403, detail="Unauthorized: student does not own this assessment session.")

    if session.get("proctoring_status") == "DISQUALIFIED":
        raise HTTPException(status_code=403, detail="Cannot start: assessment attempt has been disqualified.")

    now = int(time.time())
    if not session.get("started_at"):
        session["started_at"] = now
        session["expires_at"] = now + (session.get("time_limit_minutes", 15) * 60)

    session["proctoring_status"] = "IN_PROGRESS"

    remaining = max(0, session["expires_at"] - now)

    return {
        "status": "success",
        "assessment_id": req.assessment_id,
        "proctoring_status": "IN_PROGRESS",
        "started_at": session["started_at"],
        "expires_at": session["expires_at"],
        "remaining_seconds": remaining,
        "server_time": now
    }


@router.post("/log-violation")
def log_violation(req: LogViolationRequest):
    """
    Authoritative proctoring event pipeline.

    Every client event is classified here and either:
      * COUNTED  -> increments the single centralized `violation_count`
      * TELEMETRY -> recorded in the audit trail but NOT counted
        (duplicate of an already-counted incident, interruption restored inside the grace period, restore events)

    Disqualification (server decides, the client only displays it):
      * violation_count > MAX_ALLOWED_VIOLATIONS (default 1: first = warning, second = disqualified)
      * camera/microphone interruption that was not restored within the grace period
      * per-category limits derived from the same configurable threshold
    """
    session = ASSESSMENT_SESSIONS.get(req.assessment_id)
    now = int(time.time())

    # If session not found, initialize default session so validation and history persist
    if not session:
        session = {
            "assessment_id": req.assessment_id,
            "student_id": req.student_id,
            "skills": ["General"],
            "raw_sections": {},
            "answers": {},
            "violations": [],
            "violation_count": 0,
            "tab_switches_count": 0,
            "fullscreen_exits_count": 0,
            "camera_disconnects_count": 0,
            "mic_disconnects_count": 0,
            "proctoring_status": "IN_PROGRESS",
            "disqualification_reason": None,
            "created_at": now,
            "started_at": now,
            "expires_at": now + 900
        }
        ASSESSMENT_SESSIONS[req.assessment_id] = session

    session.setdefault("violations", [])
    session.setdefault("violation_count", 0)
    max_allowed = PROCTORING_CONFIG["maxAllowedViolations"]

    def _summary(extra: Dict[str, Any]) -> Dict[str, Any]:
        base = {
            "violation_count": session.get("violation_count", 0),
            "events_logged": len(session.get("violations", [])),
            "max_allowed_violations": max_allowed,
            "proctoring_status": session.get("proctoring_status"),
            "tab_switches_count": session.get("tab_switches_count", 0),
            "fullscreen_exits_count": session.get("fullscreen_exits_count", 0),
            "camera_disconnects_count": session.get("camera_disconnects_count", 0),
            "mic_disconnects_count": session.get("mic_disconnects_count", 0),
        }
        base.update(extra)
        return base

    # Already finished attempts: never mutate state.
    if session.get("proctoring_status") == "DISQUALIFIED":
        return _summary({
            "status": "disqualified",
            "current_severity": "DISQUALIFICATION",
            "is_disqualified": True,
            "counted": False,
            "disqualification_reason": session.get("disqualification_reason"),
            "message": "Assessment is already disqualified."
        })
    if session.get("proctoring_status") in ("COMPLETED", "EXPIRED", "ABANDONED"):
        return _summary({
            "status": "ignored",
            "current_severity": "NORMAL",
            "is_disqualified": False,
            "counted": False,
            "message": f"Assessment is {session.get('proctoring_status')}; event ignored."
        })

    event_id = f"evt_{uuid.uuid4().hex[:8]}"
    event_type_upper = req.event_type.upper().replace(" ", "_")
    details_lower = (req.details or "").lower()
    grace_expired = bool(req.grace_expired) or "grace_expired" in details_lower

    # Canonical category for the event
    if event_type_upper in ("TAB_SWITCH", "TAB_HIDDEN"):
        category = "TAB"
    elif event_type_upper in ("WINDOW_BLUR", "WINDOW_FOCUS_LOST"):
        category = "BLUR"
    elif "FULLSCREEN" in event_type_upper:
        category = "FULLSCREEN"
    elif "CAMERA" in event_type_upper:
        category = "CAMERA"
    elif "MIC" in event_type_upper:
        category = "MIC"
    else:
        category = "OTHER"

    is_restore = any(tok in event_type_upper for tok in ("RESTORED", "RETURNED", "REENTERED", "RE_ENTERED"))

    counted = False
    telemetry_reason: Optional[str] = None
    force_disqualify = False
    disqualify_reason: Optional[str] = None

    if event_type_upper in ("ASSESSMENT_TERMINATED", "ASSESSMENT_SUBMITTED") or category == "OTHER" or is_restore:
        # Client may never decide disqualification by itself; restore/other events are telemetry only.
        telemetry_reason = "informational_event"
    elif category in ("TAB", "BLUR"):
        # TAB_SWITCH + WINDOW_BLUR (+ blur on the way back) are ONE incident when close in time.
        last_focus = session.get("last_focus_incident_at")
        if (
            last_focus is not None
            and session.get("last_focus_incident_category") != category
            and (now - last_focus) <= PROCTORING_CONFIG["dedupWindowSeconds"]
        ):
            telemetry_reason = "duplicate_of_recent_focus_incident"
        else:
            counted = True
            session["last_focus_incident_at"] = now
            session["last_focus_incident_category"] = category
            session["tab_switches_count"] = session.get("tab_switches_count", 0) + 1
    elif category == "FULLSCREEN":
        counted = True
        session["fullscreen_exits_count"] = session.get("fullscreen_exits_count", 0) + 1
    elif category in ("CAMERA", "MIC"):
        counter_key = "camera_disconnects_count" if category == "CAMERA" else "mic_disconnects_count"
        limit_key = "maxCameraInterruptions" if category == "CAMERA" else "maxMicrophoneInterruptions"
        label = "Camera" if category == "CAMERA" else "Microphone"
        revoked = "PERMISSION" in event_type_upper
        if grace_expired:
            counted = True
            force_disqualify = True
            disqualify_reason = f"{label} connection was interrupted and not restored within the grace period."
        elif revoked:
            counted = True
            session[counter_key] = session.get(counter_key, 0) + 1
        else:
            # Interruption START: the first one is tolerated while the grace timer runs;
            # repeating interruptions beyond the configured allowance are counted violations.
            session[counter_key] = session.get(counter_key, 0) + 1
            if session[counter_key] > PROCTORING_CONFIG[limit_key]:
                counted = True
            else:
                telemetry_reason = "interruption_within_grace_period"

    if counted:
        session["violation_count"] = session.get("violation_count", 0) + 1

    violation_count = session["violation_count"]

    # Disqualification decision (authoritative)
    is_disqualified = False
    action_taken = "NONE"
    if counted:
        action_taken = "WARNING"
        if force_disqualify:
            is_disqualified = True
        elif violation_count > max_allowed:
            is_disqualified = True
            disqualify_reason = (
                "Maximum allowed proctoring violations were exceeded "
                f"({violation_count} recorded, {max_allowed} warning(s) allowed)."
            )
            if category in ("TAB", "BLUR"):
                disqualify_reason = "Maximum allowed tab-switch violations were exceeded."
            elif category == "FULLSCREEN":
                disqualify_reason = "Maximum allowed fullscreen exit violations were exceeded."
        elif session.get("tab_switches_count", 0) > PROCTORING_CONFIG["maxTabSwitches"]:
            is_disqualified = True
            disqualify_reason = "Maximum allowed tab-switch violations were exceeded."
        elif session.get("fullscreen_exits_count", 0) > PROCTORING_CONFIG["maxFullscreenExits"]:
            is_disqualified = True
            disqualify_reason = "Maximum allowed fullscreen exit violations were exceeded."
        if is_disqualified:
            action_taken = "DISQUALIFY"

    if is_disqualified:
        session["proctoring_status"] = "DISQUALIFIED"
        session["disqualification_reason"] = disqualify_reason
        severity = "DISQUALIFICATION"
    elif counted:
        session["proctoring_status"] = "WARNING"
        severity = "WARNING"
    else:
        severity = "NORMAL"

    event_record = {
        "id": event_id,
        "assessmentAttemptId": req.assessment_id,
        "studentId": req.student_id,
        "eventType": event_type_upper,
        "timestamp": now,
        "severity": severity,
        "counted": counted,
        "metadata": {
            "details": req.details or f"Malpractice event: {req.event_type}",
            "section": req.section,
            "question_id": req.question_id,
            "category": category,
            "telemetry_reason": telemetry_reason,
            "violation_count_after": violation_count,
            "tab_switches": session.get("tab_switches_count", 0),
            "fullscreen_exits": session.get("fullscreen_exits_count", 0)
        },
        "actionTaken": action_taken
    }
    session["violations"].append(event_record)
    PROCTORING_AUDIT_LOGS.append(event_record)

    if is_disqualified:
        message = disqualify_reason
    elif counted:
        message = f"Violation {violation_count} of {max_allowed + 1} recorded. Another violation will disqualify this attempt." if violation_count == max_allowed else "Violation recorded in proctoring audit log."
    else:
        message = "Event recorded as telemetry (not counted as a violation)."

    return _summary({
        "status": "disqualified" if is_disqualified else "logged",
        "counted": counted,
        "telemetry_reason": telemetry_reason,
        "current_severity": severity,
        "action_taken": action_taken,
        "is_disqualified": is_disqualified,
        "disqualification_reason": disqualify_reason,
        "message": message
    })


@router.post("/save-progress")
def save_progress(req: SaveProgressRequest):
    """
    Saves in-progress answers safely in case of browser refresh or network interruption.
    Disallows answer submission if attempt is disqualified or timer has expired.
    """
    session = ASSESSMENT_SESSIONS.get(req.assessment_id)
    if not session:
        return {"status": "ok", "message": "State noted."}

    if session.get("proctoring_status") in ("COMPLETED", "EXPIRED", "ABANDONED"):
        raise HTTPException(status_code=409, detail=f"Assessment is {session.get('proctoring_status')}; progress cannot be saved.")

    # Block disqualified attempts from continuing to submit answers
    if session.get("proctoring_status") == "DISQUALIFIED":
        raise HTTPException(
            status_code=403,
            detail="Assessment attempt was disqualified. Progress cannot be saved."
        )

    # Check expiration
    now = int(time.time())
    if session.get("expires_at") and now > session["expires_at"]:
        session["proctoring_status"] = "EXPIRED"
        raise HTTPException(
            status_code=400,
            detail="Assessment timer has expired. Attempt will be automatically graded."
        )

    answers_dict = req.section_answers if req.section_answers is not None else (req.answers or {})
    elapsed = req.elapsed_seconds if req.elapsed_seconds else (req.time_spent_seconds or 0)
    session["answers"] = answers_dict
    session["elapsed_seconds"] = elapsed

    return {
        "status": "success",
        "message": "Assessment state saved.",
        "proctoring_status": session.get("proctoring_status", "IN_PROGRESS"),
        "remaining_seconds": max(0, session["expires_at"] - now) if session.get("expires_at") else 600
    }


@router.post("/submit-multisection")
def submit_multisection_assessment(sub: MultiSectionSubmission):
    """
    Backend grades the multi-section assessment with authoritative proctoring validation.
    
    1. If attempt is DISQUALIFIED:
       - Strictly rejects verified score calculation.
       - Returns a clear disqualified result payload with reason.
       - Does NOT update student's verified skills.
       
    2. If attempt is VALID:
       - Grades answers, calculates skill-wise and overall scores.
       - Identifies all tied strongest and weakest skills.
       - Verifies skills with Model 1 (Ridge Regression).
       - Updates shared student record in memory.
       - Recalculates job opportunities and course recommendations.
    """
    session = ASSESSMENT_SESSIONS.get(sub.assessment_id)
    now = int(time.time())

    if session and session.get("student_id") and session.get("student_id") != sub.student_id:
        if session.get("student_id") == "std_1" or session.get("is_default_student"):
            session["student_id"] = sub.student_id
        else:
            raise HTTPException(status_code=403, detail="Unauthorized: student does not own this assessment session.")

    # 1. Authoritative Disqualification Check:
    if session and session.get("proctoring_status") == "DISQUALIFIED":
        # Free active attempt so student is not permanently locked
        if sub.student_id in ACTIVE_STUDENT_ATTEMPTS:
            del ACTIVE_STUDENT_ATTEMPTS[sub.student_id]

        disqualify_result = {
            "status": "disqualified",
            "assessment_id": sub.assessment_id,
            "student_id": sub.student_id,
            "proctoring_status": "DISQUALIFIED",
            "assessment_status": "DISQUALIFIED",
            "disqualification_reason": session.get("disqualification_reason", "Maximum allowed proctoring violations were exceeded."),
            "overall_score": None,
            "valid_score_available": False,
            "integrity_score": 0,
            "integrity_status": "DISQUALIFIED",
            "integrity_warnings": len(session.get("violations", [])),
            "integrity_violations": session.get("violation_count", 0),
            "integrity_categories": _categorize_events(session.get("violations", [])),
            "integrity_timeline": session.get("violations", []),
            "message": "Result unavailable because this assessment attempt was disqualified.",
            "violations": session.get("violations", []),
            "skill_scores": {},
            "strong_skills": [],
            "weak_skills": [],
            "strongest_skills": [],
            "weakest_skills": [],
            "recommended_opportunities": [],
            "recommended_courses": []
        }
        session["cached_result"] = disqualify_result
        return disqualify_result

    # 2. Prevent Double Submissions:
    if session and session.get("proctoring_status") == "COMPLETED" and "cached_result" in session:
        return session["cached_result"]

    # 3. Timer authority: reject submissions well past the server-side expiry (small network grace).
    if session and session.get("expires_at") and now > session["expires_at"] + SUBMIT_GRACE_SECONDS:
        session["proctoring_status"] = "EXPIRED"
        if sub.student_id in ACTIVE_STUDENT_ATTEMPTS:
            del ACTIVE_STUDENT_ATTEMPTS[sub.student_id]
        return {
            "status": "expired",
            "assessment_id": sub.assessment_id,
            "student_id": sub.student_id,
            "proctoring_status": "EXPIRED",
            "assessment_status": "EXPIRED",
            "overall_score": None,
            "valid_score_available": False,
            "message": "Result unavailable because the assessment time limit had already expired.",
            "violations": session.get("violations", []),
            "skill_scores": {}, "skills": [], "strong_skills": [], "weak_skills": [],
            "strongest_skills": [], "weakest_skills": [],
            "recommended_opportunities": [], "recommended_courses": []
        }

    # 4. A proctored attempt must have been started (system check passed) before it can be graded.
    if session and session.get("is_default_student") and session.get("proctoring_status") in ("SYSTEM_CHECK", "READY", "NOT_STARTED"):
        session["proctoring_status"] = "IN_PROGRESS"
        if not session.get("started_at"):
            session["started_at"] = now
            session["expires_at"] = now + (session.get("time_limit_minutes", 15) * 60)

    if session and session.get("proctoring_status") in ("SYSTEM_CHECK", "READY", "NOT_STARTED"):
        raise HTTPException(status_code=409, detail="Assessment has not been started; it cannot be submitted.")

    raw_sections = session.get("raw_sections") if session else None
    submitted_answers = sub.section_answers if sub.section_answers is not None else (sub.answers or {})

    # Fallback if session expired or direct submit
    if not raw_sections:
        raw_sections = {}
        for skill in submitted_answers.keys():
            ans_count = len(submitted_answers[skill])
            raw_sections[skill] = get_balanced_questions_for_skill(skill, count=max(3, ans_count))

    section_breakdowns = []
    skill_stats: Dict[str, Dict[str, int]] = {}
    diff_stats_by_skill: Dict[str, Dict[str, Dict[str, int]]] = {}
    total_correct = 0
    total_questions = 0

    for skill, questions in raw_sections.items():
        user_answers = submitted_answers.get(skill, [])
        sec_correct = 0
        sec_total = len(questions)

        # Difficulty breakdown
        diff_stats = {
            "Beginner": {"correct": 0, "total": 0},
            "Intermediate": {"correct": 0, "total": 0},
            "Advanced": {"correct": 0, "total": 0}
        }

        for idx, q in enumerate(questions):
            diff = q.get("difficulty", "Intermediate")
            bucket = diff_stats.setdefault(diff, {"correct": 0, "total": 0})
            bucket["total"] += 1
            if idx < len(user_answers) and user_answers[idx] == q["correct"]:
                sec_correct += 1
                bucket["correct"] += 1

        skill_stats[skill] = {"correct": sec_correct, "total": sec_total}
        diff_stats_by_skill[skill] = diff_stats
        total_correct += sec_correct
        total_questions += sec_total

    # Single normalized analysis: exact scores, ties preserved, rounding for display only.
    analysis = analyze_skill_results(skill_stats)
    skill_scores = {s["skill"]: s["score"] for s in analysis["skills"]}

    for s in analysis["skills"]:
        section_breakdowns.append({
            "skill": s["skill"],
            "score_pct": s["score"],
            "score_exact": s["score_exact"],
            "correct_count": s["correct"],
            "total_questions": s["total"],
            "difficulty_breakdown": diff_stats_by_skill[s["skill"]]
        })

    # Mathematically accurate aggregate calculated from raw counts (never from rounded skill scores)
    overall_pct = round((total_correct / total_questions) * 100.0) if total_questions > 0 else 0

    strong_skills = analysis["strong_skills"]
    weak_skills = analysis["weak_skills"]
    strongest_skills = analysis["strongest_skills"]
    weakest_skills = analysis["weakest_skills"]
    strongest_text = analysis["strongest_text"]
    weakest_text = analysis["weakest_text"]

    # Fetch targeted course/bootcamp recommendations only for skills that actually need work
    weak_skill_names = [w["skill"] for w in analysis["improvement_targets"]]
    recommended_courses = []
    for ws in weak_skill_names:
        courses = COURSE_CATALOG.get(ws, [])
        if not courses:
            courses = [
                {
                    "id": f"crs_{ws.lower()[:3]}_gen",
                    "title": f"Mastering {ws}: Fundamentals & Practical Projects",
                    "skill": ws,
                    "provider": "Coursera / NPTEL",
                    "level": "Intermediate",
                    "duration": "6 Weeks",
                    "rating": 4.8,
                    "link": "https://www.coursera.org"
                }
            ]
        recommended_courses.extend(courses)

    # Update Student Profile in memory with newly verified skills (only mutate matching student)
    target_student = next((s for s in STUDENTS if s["id"] == sub.student_id), None)
    student_record = target_student if target_student is not None else dict(STUDENTS[0])
    updated_student_skills = dict(student_record.get("skills", {}))

    practical_score = min(100.0, max(0.0, float(sub.practical_code_score if sub.practical_code_score is not None else 85.0)))
    for s in analysis["skills"]:
        sk = s["skill"]
        ml_eval = verifier.verify_skill(
            skill_name=sk,
            assessment_score=s["score_exact"],
            code_complexity_score=practical_score
        )
        # Verification is decided per skill from that skill's own score (never the aggregate).
        updated_student_skills[sk] = {
            "score": s["score"],
            "level": ml_eval["proficiency"],
            "verified": s["verified"],
            "verification_state": "ASSESSMENT VERIFIED" if s["verified"] else "NEEDS_IMPROVEMENT"
        }

    if target_student is not None:
        target_student["skills"] = updated_student_skills
        target_student["verified_score"] = overall_pct
        target_student["assessments_completed"] = target_student.get("assessments_completed", 10) + 1
        student_for_matching = target_student
    else:
        student_record["skills"] = updated_student_skills
        student_record["verified_score"] = overall_pct
        student_for_matching = student_record

    # Recalculate AI opportunity matches using existing job matcher
    ranked_opps = matcher.rank_opportunities_for_student(student_for_matching, OPPORTUNITIES)

    # Step 4.E Additive Snapshot Recompute Hook (Non-blocking)
    _recompute_student_application_snapshots(sub.student_id, student_for_matching.get("skills", {}))

    # Format result for UI donut chart and text displays
    chart_palette = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"]
    donut_chart_data = []
    for idx, (sk, score_val) in enumerate(skill_scores.items()):
        donut_chart_data.append({
            "name": sk,
            "value": score_val,
            "color": chart_palette[idx % len(chart_palette)]
        })

    result_payload = {
        "status": "success",
        "assessment_id": sub.assessment_id,
        "student_id": sub.student_id,
        "overall_score": overall_pct,
        "valid_score_available": True,
        "total_questions": total_questions,
        "total_correct": total_correct,
        "skill_scores": skill_scores,
        "section_breakdowns": section_breakdowns,
        "donut_chart_data": donut_chart_data,
        "strong_skills": strong_skills,
        "weak_skills": weak_skills,
        "strongest_skills": strongest_skills,
        "weakest_skills": weakest_skills,
        "proctoring_status": "COMPLETED",
        "assessment_status": "COMPLETED",
        "aggregate_score": overall_pct,
        "skills": analysis["skills"],
        "all_tied": analysis["all_tied"],
        "violation_count": session.get("violation_count", 0) if session else 0,
        "max_allowed_violations": PROCTORING_CONFIG["maxAllowedViolations"],
        "violations": session.get("violations", []) if session else [],
        "textual_explanation": {
            "strongest": strongest_text,
            "weakest": weakest_text,
            "summary": f"Assessment complete! Scored {overall_pct}% across {len(skill_scores)} skills. Strong skills have been marked 'ASSESSMENT VERIFIED' and fed into the AI opportunity matcher."
        },
        "recommended_opportunities": ranked_opps[:3],
        "recommended_courses": recommended_courses
    }

    # Authoritative Assessment Integrity Calculation
    integ_sess = INTEGRITY_SESSIONS.get(sub.assessment_id)
    raw_events = (integ_sess.get("events", []) if integ_sess else []) or (session.get("violations", []) if session else [])
    integrity_report = compute_integrity_score_and_status(raw_events, is_disqualified=False)

    result_payload["integrity_score"] = integrity_report["score"]
    result_payload["integrity_status"] = integrity_report["status"]
    result_payload["integrity_warnings"] = integrity_report["total_warnings"]
    result_payload["integrity_violations"] = integrity_report["total_violations"]
    result_payload["integrity_categories"] = integrity_report["categories"]
    result_payload["integrity_timeline"] = integrity_report.get("events", [])

    if session:
        session["status"] = "COMPLETED"
        session["proctoring_status"] = "COMPLETED"
        session["cached_result"] = result_payload

    # Free active attempt
    if sub.student_id in ACTIVE_STUDENT_ATTEMPTS:
        del ACTIVE_STUDENT_ATTEMPTS[sub.student_id]

    return result_payload


@router.get("/audit-logs")
def get_proctoring_audit_logs(student_id: Optional[str] = Query(None)):
    """
    Returns proctoring audit logs for Academician and Admin monitoring.
    Includes violation records, proctoring status, and disqualification reasons.
    """
    if student_id:
        logs = [log for log in PROCTORING_AUDIT_LOGS if log.get("studentId") == student_id]
        active_sess_id = ACTIVE_STUDENT_ATTEMPTS.get(student_id)
        sess = ASSESSMENT_SESSIONS.get(active_sess_id) if active_sess_id else None
        return {
            "status": "success",
            "student_id": student_id,
            "active_session": {
                "assessment_id": active_sess_id,
                "proctoring_status": sess.get("proctoring_status") if sess else "NONE",
                "violations_count": sess.get("violation_count", 0) if sess else 0,
                "disqualification_reason": sess.get("disqualification_reason") if sess else None
            },
            "events_count": len(logs),
            "events": logs
        }

    attempts_summary = []
    for sess in list(ASSESSMENT_SESSIONS.values()):
        score = None
        if sess.get("cached_result") and sess["cached_result"].get("valid_score_available"):
            score = sess["cached_result"].get("overall_score")
        
        attempts_summary.append({
            "assessment_id": sess.get("assessment_id"),
            "student_id": sess.get("student_id"),
            "assessment_name": ", ".join(sess.get("skills", ["General Skills"])),
            "assessment_status": "COMPLETED" if sess.get("cached_result") else ("IN_PROGRESS" if sess.get("proctoring_status") == "IN_PROGRESS" else sess.get("proctoring_status", "ACTIVE")),
            "proctoring_status": sess.get("proctoring_status", "NOT_STARTED"),
            "score": score,
            "violations_count": sess.get("violation_count", 0),
            "events_logged": len(sess.get("violations", [])),
            "disqualification_reason": sess.get("disqualification_reason"),
            "started_at": sess.get("started_at"),
            "submitted_at": sess.get("submitted_at")
        })

    return {
        "status": "success",
        "total_events": len(PROCTORING_AUDIT_LOGS),
        "active_attempts_count": len(ACTIVE_STUDENT_ATTEMPTS),
        "attempts": attempts_summary,
        "events": PROCTORING_AUDIT_LOGS[-50:]
    }

# Existing legacy routes for backward compatibility
@router.get("/questions")
def get_questions(skill: str = "Python"):
    questions = QUESTION_BANK.get(skill, QUESTION_BANK["Python"])
    sanitized = [
        {"id": q["id"], "question": q["question"], "options": q["options"], "difficulty": q.get("difficulty", "Intermediate")}
        for q in questions
    ]
    return {"skill": skill, "total": len(sanitized), "questions": sanitized}

@router.post("/submit")
def submit_assessment(sub: AssessmentSubmission):
    questions = QUESTION_BANK.get(sub.skill, QUESTION_BANK["Python"])
    correct_count = 0
    total = len(questions)
    for idx, q in enumerate(questions):
        if idx < len(sub.answers) and sub.answers[idx] == q["correct"]:
            correct_count += 1
            
    score_pct = (correct_count / total) * 100.0 if total > 0 else 80.0
    ml_result = verifier.verify_skill(
        skill_name=sub.skill,
        assessment_score=score_pct,
        code_complexity_score=sub.practical_code_score or 85.0
    )
    
    student = next((s for s in STUDENTS if s["id"] == sub.student_id), STUDENTS[0])
    student["skills"][sub.skill] = {
        "score": ml_result["verified_score"],
        "level": ml_result["proficiency"],
        "verified": True
    }
    
    # Step 4.E Additive Snapshot Recompute Hook (Non-blocking)
    _recompute_student_application_snapshots(sub.student_id, student["skills"])
    
    top_opp = OPPORTUNITIES[0]
    updated_match = matcher.match_student_to_opportunity(student["skills"], top_opp)
    
    return {
        "status": "success",
        "skill": sub.skill,
        "correct_count": correct_count,
        "total_questions": total,
        "raw_assessment_pct": score_pct,
        "ml_verification": ml_result,
        "updated_opportunity_match": {
            "title": top_opp["title"],
            "company": top_opp["company"],
            "new_match_percentage": updated_match["match_percentage"],
            "previous_match_percentage": 92,
            "explanation": updated_match["explanation"]
        }
    }

@router.post("/verify-certificate")
def verify_certificate(req: CertificateVerificationRequest):
    student = next((s for s in STUDENTS if s["id"] == req.student_id), STUDENTS[0])
    result = credential_verifier.verify_credential(
        credential_url_or_code=req.credential_url_or_code,
        student_name=student["name"],
        claimed_skill=req.claimed_skill
    )
    if result["is_authentic"]:
        new_score = min(99, round(student["verified_score"] + result["skill_boost"]))
        return {
            "status": "success",
            "verification": result,
            "previous_verified_score": student["verified_score"],
            "new_verified_score": new_score,
            "updated_top_match_pct": 98
        }
    return {"status": "rejected", "verification": result}

@router.post("/verify-qr")
def verify_qr(req: VerifyQRRequest):
    student_id = req.student_id or "std_1"
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    result = credential_verifier.verify_credential(
        credential_url_or_code=req.qr_payload,
        student_name=student.get("name", "Dhruv Patil"),
        claimed_skill="Deep Learning & PyTorch"
    )
    return {
        "status": "success" if result.get("is_authentic") else "rejected",
        "is_valid": result.get("is_authentic", False),
        "issuer": result.get("issuer", "NPTEL / Swayam National Registry"),
        "skill": result.get("claimed_skill", "Deep Learning & PyTorch"),
        "student_name": student.get("name", "Dhruv Patil"),
        "issue_date": "2026-08-15",
        "sha256_hash": result.get("audit_hash", "0xa4f89d31b9e28f110c7e2b74051a96da438fbcd58269e8b15a6b0c20188941cf"),
        "tamper_detected": result.get("anomaly_detected", False),
        "reputable_issuer": result.get("is_authentic", False),
        "confidence_pct": result.get("confidence_pct", 98.4),
        "verification": result
    }

@router.get("/jd-analysis")
def get_student_jd_analysis(
    student_id: str = Query("std_1"),
    auth_check = Depends(require_roles(["student", "recruiter", "academician", "admin"]))
):
    """
    Step 4.A: Returns JD-based skill analysis for every available opportunity for the logged-in student,
    sorted by overallFit descending.
    Strictly uses verified skills data; never uses personal PII attributes.
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    active_opps = filter_active_opportunities(OPPORTUNITIES, include_expired=False)

    analyses = []
    for opp in active_opps:
        analysis = analyze_student_for_opportunity(student.get("skills", {}), opportunity=opp)
        analyses.append({
            "opportunity_id": opp.get("id"),
            "opportunityId": opp.get("id"),
            "title": opp.get("title"),
            "company": opp.get("company"),
            "logo_text": opp.get("logo_text", "COMPANY"),
            "location": opp.get("location"),
            "stipend": opp.get("stipend"),
            "type": opp.get("type"),
            "deadline": opp.get("deadline"),
            "color_theme": opp.get("color_theme", "indigo"),
            "overallFit": analysis["overallFit"],
            "verdict": analysis["verdict"],
            "mustHaveCoverage": analysis["mustHaveCoverage"],
            "niceToHaveCoverage": analysis["niceToHaveCoverage"],
            "skills": analysis["skills"],
            "topGaps": analysis["topGaps"],
            "summary": analysis["summary"],
            "explanation": analysis["explanation"]
        })

    analyses.sort(key=lambda x: x["overallFit"], reverse=True)

    return {
        "status": "success",
        "student_id": student_id,
        "total": len(analyses),
        "analyses": analyses,
        "opportunities": analyses
    }
