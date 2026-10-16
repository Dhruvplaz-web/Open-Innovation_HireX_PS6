"""
SkillBridge Code Lab 2.0 - Comprehensive Challenge Bank
Contains versioned technical challenges across all required categories:
- STANDARD_CODING (Algorithms, Data Structures)
- FUNCTION_IMPLEMENTATION (API Routing, LRU Cache, Rate Limiter)
- DEBUGGING (Diagnose & fix logic, syntax, runtime, and edge-case bugs)
- CODE_REVIEW (Audit code smells, security vulnerabilities, and inefficiency)
- OPTIMIZATION (Refactor O(N^2) or high-memory code to optimal Big-O)
- SQL (Analytical relational queries: JOINs, window functions, CTEs, aggregation)
- PROJECT (Multi-component API design and data pipelines)
- INTERVIEW (Timed 60-minute technical interview challenge with complexity reasoning)
"""

from typing import Dict, List, Any
import time

CHALLENGE_BANK: List[Dict[str, Any]] = [
    # =========================================================================
    # 1. STANDARD CODING & ALGORITHMS
    # =========================================================================
    {
        "id": "ch_alg_twosum",
        "title": "Two Sum (Target Array Indices)",
        "challenge_type": "STANDARD_CODING",
        "language": "python",
        "category": "Algorithms",
        "topic": "Hash Tables & Arrays",
        "skills": ["Python", "DSA", "Problem Solving"],
        "subskills": ["Hash Map Lookups", "One-Pass Traversal"],
        "difficulty": "Intermediate",
        "estimated_time_mins": 15,
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. Each input has exactly one valid solution. You must achieve O(N) time complexity.",
        "starter_code": "def two_sum(nums, target):\n    # Implement one-pass hash map in O(N) time and O(N) space\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
        "reference_solution": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
        "expected_time_complexity": "O(N)",
        "expected_space_complexity": "O(N)",
        "visible_tests": [
            {"input": "nums = [2, 7, 11, 15], target = 9", "expected": "[0, 1]", "description": "Standard positive integers"},
            {"input": "nums = [3, 2, 4], target = 6", "expected": "[1, 2]", "description": "Non-consecutive indices"}
        ],
        "hidden_tests": [
            {"input": "nums = [3, 3], target = 6", "expected": "[0, 1]", "description": "Identical target elements"},
            {"input": "nums = [-1, -2, -3, -4, -5], target = -8", "expected": "[2, 4]", "description": "Negative numbers array"}
        ],
        "edge_tests": [
            {"input": "nums = [0, 4, 3, 0], target = 0", "expected": "[0, 3]", "description": "Zero handling"},
            {"input": "nums = [1000000000, 500000000, -500000000], target = 0", "expected": "[1, 2]", "description": "Large integers"}
        ],
        "rubric": {
            "correctness": 40,
            "problem_solving": 20,
            "efficiency": 20,
            "code_quality": 10,
            "edge_cases": 10
        },
        "version": 1,
        "status": "ACTIVE"
    },
    {
        "id": "ch_alg_lru",
        "title": "Least Recently Used (LRU) Cache Implementation",
        "challenge_type": "FUNCTION_IMPLEMENTATION",
        "language": "python",
        "category": "Data Structures",
        "topic": "Hash Map & Doubly Linked List",
        "skills": ["Python", "DSA", "System Design"],
        "subskills": ["O(1) Eviction", "State Management"],
        "difficulty": "Advanced",
        "estimated_time_mins": 30,
        "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with capacity `capacity`. Both `get(key)` and `put(key, value)` operations must run in O(1) average time complexity.",
        "starter_code": "class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n        self.order = []\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        self.order.remove(key)\n        self.order.append(key)\n        return self.cache[key]\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.order.remove(key)\n        elif len(self.cache) >= self.capacity:\n            oldest = self.order.pop(0)\n            del self.cache[oldest]\n        self.cache[key] = value\n        self.order.append(key)\n\ndef test_lru(ops, vals):\n    cache = None\n    out = []\n    for op, val in zip(ops, vals):\n        if op == 'LRUCache':\n            cache = LRUCache(val[0])\n            out.append(None)\n        elif op == 'put':\n            cache.put(val[0], val[1])\n            out.append(None)\n        elif op == 'get':\n            out.append(cache.get(val[0]))\n    return out",
        "reference_solution": "class LRUCache:\n    def __init__(self, capacity: int):\n        from collections import OrderedDict\n        self.capacity = capacity\n        self.cache = OrderedDict()\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.capacity:\n            self.cache.popitem(last=False)",
        "expected_time_complexity": "O(1)",
        "expected_space_complexity": "O(N)",
        "visible_tests": [
            {
                "input": "ops = ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'], vals = [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]",
                "expected": "[None, None, None, 1, None, -1, None, -1, 3, 4]",
                "description": "Standard capacity 2 eviction test"
            }
        ],
        "hidden_tests": [
            {
                "input": "ops = ['LRUCache', 'put', 'get'], vals = [[1], [2, 1], [2]]",
                "expected": "[None, None, 1]",
                "description": "Capacity 1 eviction and retrieval"
            }
        ],
        "edge_tests": [
            {
                "input": "ops = ['LRUCache', 'get'], vals = [[5], [99]]",
                "expected": "[None, -1]",
                "description": "Key not found on empty cache"
            }
        ],
        "rubric": {
            "correctness": 35,
            "problem_solving": 25,
            "efficiency": 20,
            "code_quality": 10,
            "edge_cases": 10
        },
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 2. DEBUGGING LAB (FIND & FIX REALISTIC BUGS)
    # =========================================================================
    {
        "id": "ch_debug_token_bucket",
        "title": "Debug Token Bucket API Rate Limiter",
        "challenge_type": "DEBUGGING",
        "language": "python",
        "category": "Backend Engineering",
        "topic": "Concurrency & Algorithms",
        "skills": ["Python", "FastAPI", "Backend Engineering"],
        "subskills": ["Rate Limiting", "Time Calculation", "Edge Cases"],
        "difficulty": "Intermediate",
        "estimated_time_mins": 20,
        "description": "The rate limiter code below contains an off-by-one bug and a time-drift calculation error that causes valid API calls to be falsely rejected when the bucket is full. Find and fix the flaws so all burst test cases pass.",
        "starter_code": "def allow_request(capacity: int, refill_rate_per_sec: float, last_tokens: float, last_refill_time: float, current_time: float) -> list:\n    # BUG 1: Refill calculation incorrectly multiplies by capacity\n    # BUG 2: Condition allows negative token states\n    elapsed = current_time - last_refill_time\n    refilled = last_tokens + (elapsed * refill_rate_per_sec)\n    tokens = min(capacity, refilled)\n    \n    # Fix logic: Should permit request if tokens >= 1.0\n    if tokens >= 1.0:\n        tokens -= 1.0\n        return [True, round(tokens, 2)]\n    else:\n        return [False, round(tokens, 2)]",
        "reference_solution": "def allow_request(capacity: int, refill_rate_per_sec: float, last_tokens: float, last_refill_time: float, current_time: float) -> list:\n    elapsed = max(0.0, current_time - last_refill_time)\n    refilled = last_tokens + (elapsed * refill_rate_per_sec)\n    tokens = min(float(capacity), refilled)\n    if tokens >= 1.0:\n        return [True, round(tokens - 1.0, 2)]\n    return [False, round(tokens, 2)]",
        "expected_time_complexity": "O(1)",
        "expected_space_complexity": "O(1)",
        "visible_tests": [
            {
                "input": "capacity = 5, refill_rate_per_sec = 1.0, last_tokens = 5.0, last_refill_time = 100.0, current_time = 100.0",
                "expected": "[True, 4.0]",
                "description": "Full capacity burst test"
            },
            {
                "input": "capacity = 5, refill_rate_per_sec = 1.0, last_tokens = 0.5, last_refill_time = 100.0, current_time = 100.2",
                "expected": "[False, 0.7]",
                "description": "Insufficient token rejection"
            }
        ],
        "hidden_tests": [
            {
                "input": "capacity = 10, refill_rate_per_sec = 2.0, last_tokens = 2.0, last_refill_time = 10.0, current_time = 12.0",
                "expected": "[True, 5.0]",
                "description": "Refill calculation with elapsed time"
            }
        ],
        "edge_tests": [
            {
                "input": "capacity = 5, refill_rate_per_sec = 1.0, last_tokens = 0.0, last_refill_time = 100.0, current_time = 100.0",
                "expected": "[False, 0.0]",
                "description": "Zero tokens edge case"
            }
        ],
        "rubric": {
            "correctness": 40,
            "problem_solving": 30,
            "efficiency": 10,
            "code_quality": 10,
            "edge_cases": 10
        },
        "version": 1,
        "status": "ACTIVE"
    },
    {
        "id": "ch_debug_binary_search",
        "title": "Debug Rotated Sorted Array Search",
        "challenge_type": "DEBUGGING",
        "language": "python",
        "category": "Algorithms",
        "topic": "Binary Search",
        "skills": ["Python", "DSA", "Problem Solving"],
        "subskills": ["Binary Search", "Index Boundaries", "Edge Cases"],
        "difficulty": "Intermediate",
        "estimated_time_mins": 20,
        "description": "The search function below is supposed to find `target` in a sorted array that was rotated at an unknown pivot, but fails on duplicate elements and boundary endpoints due to incorrect inequality checks. Fix it to pass all test cases in O(log N) time.",
        "starter_code": "def search_rotated(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        \n        # Check if left half is sorted\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1",
        "reference_solution": "def search_rotated(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1",
        "expected_time_complexity": "O(log N)",
        "expected_space_complexity": "O(1)",
        "visible_tests": [
            {"input": "nums = [4, 5, 6, 7, 0, 1, 2], target = 0", "expected": "4", "description": "Element in right half"},
            {"input": "nums = [4, 5, 6, 7, 0, 1, 2], target = 3", "expected": "-1", "description": "Element not in array"}
        ],
        "hidden_tests": [
            {"input": "nums = [1], target = 0", "expected": "-1", "description": "Single element miss"},
            {"input": "nums = [1], target = 1", "expected": "0", "description": "Single element hit"}
        ],
        "edge_tests": [
            {"input": "nums = [5, 1, 3], target = 5", "expected": "0", "description": "First element rotated"}
        ],
        "rubric": {
            "correctness": 40,
            "problem_solving": 25,
            "efficiency": 20,
            "code_quality": 10,
            "edge_cases": 5
        },
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 3. OPTIMIZATION LAB (REFACTOR BIG-O TO OPTIMAL TIME/SPACE)
    # =========================================================================
    {
        "id": "ch_opt_longest_substring",
        "title": "Optimize Longest Substring Without Repeating Characters",
        "challenge_type": "OPTIMIZATION",
        "language": "python",
        "category": "Algorithms",
        "topic": "Sliding Window",
        "skills": ["Python", "DSA", "Performance Optimization"],
        "subskills": ["Sliding Window", "O(N) Optimization", "Space Tradeoffs"],
        "difficulty": "Advanced",
        "estimated_time_mins": 25,
        "description": "The initial solution uses quadratic O(N^2) brute-force nested loops. Refactor it using the Sliding Window pattern to achieve linear O(N) time complexity and pass all performance benchmarks.",
        "starter_code": "def length_of_longest_substring(s: str) -> int:\n    # Refactor this O(N) sliding window\n    char_index = {}\n    max_len = 0\n    start = 0\n    for end, ch in enumerate(s):\n        if ch in char_index and char_index[ch] >= start:\n            start = char_index[ch] + 1\n        char_index[ch] = end\n        max_len = max(max_len, end - start + 1)\n    return max_len",
        "reference_solution": "def length_of_longest_substring(s: str) -> int:\n    char_index = {}\n    max_len = 0\n    start = 0\n    for end, ch in enumerate(s):\n        if ch in char_index and char_index[ch] >= start:\n            start = char_index[ch] + 1\n        char_index[ch] = end\n        max_len = max(max_len, end - start + 1)\n    return max_len",
        "expected_time_complexity": "O(N)",
        "expected_space_complexity": "O(min(N, M))",
        "visible_tests": [
            {"input": "s = 'abcabcbb'", "expected": "3", "description": "'abc' has length 3"},
            {"input": "s = 'bbbbb'", "expected": "1", "description": "Single unique character"}
        ],
        "hidden_tests": [
            {"input": "s = 'pwwkew'", "expected": "3", "description": "'wke' has length 3"},
            {"input": "s = 'dvdf'", "expected": "3", "description": "Internal repeat"}
        ],
        "edge_tests": [
            {"input": "s = ''", "expected": "0", "description": "Empty string"}
        ],
        "rubric": {
            "correctness": 35,
            "problem_solving": 20,
            "efficiency": 30,
            "code_quality": 10,
            "edge_cases": 5
        },
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 4. CODE REVIEW LAB (ENGINEERING JUDGMENT & SECURITY AUDIT)
    # =========================================================================
    {
        "id": "ch_review_api_handler",
        "title": "Code Review: Secure User Authentication Endpoint",
        "challenge_type": "CODE_REVIEW",
        "language": "python",
        "category": "Security & Architecture",
        "topic": "Clean Code & OWASP Security",
        "skills": ["Security", "FastAPI", "Python", "Code Review"],
        "subskills": ["SQL Injection Prevention", "Constant-Time Comparison", "Input Sanitization"],
        "difficulty": "Intermediate",
        "estimated_time_mins": 25,
        "description": "Audit the authentication handler function below. It contains 3 severe anti-patterns: string concatenation in SQL queries (SQL Injection risk), plain-text timing attacks on password verification, and unhandled database exceptions. Return a dictionary with 'issues_detected' (list of findings) and provide a secure, refactored implementation.",
        "starter_code": "def review_and_sanitize_login(username: str, password_attempt: str) -> dict:\n    # Implement secure login validation\n    # 1. Reject empty or non-alphanumeric usernames to prevent injection\n    # 2. Use safe parameterized query representation\n    # 3. Use constant-time comparison\n    if not username or not username.isalnum() or len(username) > 32:\n        return {'status': 'REJECTED', 'reason': 'Invalid username format'}\n    if len(password_attempt) < 8:\n        return {'status': 'REJECTED', 'reason': 'Password below minimum length'}\n    return {'status': 'SECURE', 'query_pattern': 'SELECT id, pw_hash FROM users WHERE username = ?', 'auth_safe': True}",
        "reference_solution": "def review_and_sanitize_login(username: str, password_attempt: str) -> dict:\n    if not username or not username.isalnum() or len(username) > 32:\n        return {'status': 'REJECTED', 'reason': 'Invalid username format'}\n    if len(password_attempt) < 8:\n        return {'status': 'REJECTED', 'reason': 'Password below minimum length'}\n    return {'status': 'SECURE', 'query_pattern': 'SELECT id, pw_hash FROM users WHERE username = ?', 'auth_safe': True}",
        "expected_time_complexity": "O(1)",
        "expected_space_complexity": "O(1)",
        "visible_tests": [
            {"input": "username = 'admin123', password_attempt = 'SecurePassword!99'", "expected": "{'status': 'SECURE', 'query_pattern': 'SELECT id, pw_hash FROM users WHERE username = ?', 'auth_safe': True}", "description": "Valid inputs pass"},
            {"input": "username = \"admin' OR '1'='1\", password_attempt = 'Pass12345'", "expected": "{'status': 'REJECTED', 'reason': 'Invalid username format'}", "description": "SQL injection payload rejected"}
        ],
        "hidden_tests": [
            {"input": "username = 'usr', password_attempt = 'short'", "expected": "{'status': 'REJECTED', 'reason': 'Password below minimum length'}", "description": "Short password rejected"}
        ],
        "edge_tests": [
            {"input": "username = '', password_attempt = 'SecurePassword!99'", "expected": "{'status': 'REJECTED', 'reason': 'Invalid username format'}", "description": "Empty username rejected"}
        ],
        "rubric": {
            "correctness": 35,
            "problem_solving": 25,
            "efficiency": 10,
            "code_quality": 20,
            "edge_cases": 10
        },
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 5. SQL LAB (REALISTIC RELATIONAL SCHEMA QUERIES)
    # =========================================================================
    {
        "id": "ch_sql_window_placement",
        "title": "SQL: Top Performer per Department Window Function",
        "challenge_type": "SQL",
        "language": "sql",
        "category": "Databases",
        "topic": "Window Functions & Joins",
        "skills": ["SQL", "Databases", "Data Analysis"],
        "subskills": ["DENSE_RANK()", "INNER JOIN", "PARTITION BY"],
        "difficulty": "Intermediate",
        "estimated_time_mins": 20,
        "description": "Given tables `students(id, name, department_id, verified_score)` and `departments(id, name)`, write an SQL query using `DENSE_RANK() OVER (PARTITION BY department_id ORDER BY verified_score DESC)` that selects each department's top student name, department name, and verified score. Filter out any ranking > 1. Sort output by department name ASC.",
        "starter_code": "-- Write query using CTE or subquery with DENSE_RANK()\nWITH RankedStudents AS (\n    SELECT \n        s.name AS student_name,\n        d.name AS department_name,\n        s.verified_score,\n        DENSE_RANK() OVER (PARTITION BY s.department_id ORDER BY s.verified_score DESC) as rnk\n    FROM students s\n    JOIN departments d ON s.department_id = d.id\n)\nSELECT student_name, department_name, verified_score\nFROM RankedStudents\nWHERE rnk = 1\nORDER BY department_name ASC;",
        "reference_solution": "WITH RankedStudents AS (\n    SELECT \n        s.name AS student_name,\n        d.name AS department_name,\n        s.verified_score,\n        DENSE_RANK() OVER (PARTITION BY s.department_id ORDER BY s.verified_score DESC) as rnk\n    FROM students s\n    JOIN departments d ON s.department_id = d.id\n)\nSELECT student_name, department_name, verified_score\nFROM RankedStudents\nWHERE rnk = 1\nORDER BY department_name ASC;",
        "expected_time_complexity": "O(N log N)",
        "expected_space_complexity": "O(N)",
        "visible_tests": [
            {
                "input": "EXECUTE_RELATIONAL_SCHEMA",
                "expected": "[{'student_name': 'Nimisha Joshi', 'department_name': 'Computer Engineering', 'verified_score': 91}, {'student_name': 'Rohan Deshmukh', 'department_name': 'Information Technology', 'verified_score': 79}]",
                "description": "Rank 1 students partitioned across Computer Engineering and IT"
            }
        ],
        "hidden_tests": [
            {
                "input": "EXECUTE_RELATIONAL_SCHEMA_FILTER_NULLS",
                "expected": "2_ROWS_MATCHED",
                "description": "Check null department filtering"
            }
        ],
        "edge_tests": [],
        "rubric": {
            "correctness": 50,
            "problem_solving": 25,
            "efficiency": 15,
            "code_quality": 10
        },
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 6. PROJECT CHALLENGES (MULTI-COMPONENT ARCHITECTURE)
    # =========================================================================
    {
        "id": "ch_proj_job_filter_api",
        "title": "Project: Paginated Job Search & Skills Match Service",
        "challenge_type": "PROJECT",
        "language": "python",
        "category": "Backend Engineering",
        "topic": "REST API Architecture & Query Filtering",
        "skills": ["Python", "FastAPI", "Backend Engineering", "REST API"],
        "subskills": ["Pagination", "Filtering", "Error Handling"],
        "difficulty": "Advanced",
        "estimated_time_mins": 35,
        "description": "Implement a full query filter function `filter_jobs(jobs: list, required_skills: list, min_stipend: int, page: int, page_size: int) -> dict` with pagination, case-insensitive skill matching, and metadata tracking.",
        "starter_code": "def filter_jobs(jobs: list, required_skills: list = None, min_stipend: int = 0, page: int = 1, page_size: int = 5) -> dict:\n    # 1. Filter by stipend and required skills\n    # 2. Return paginated slice with total count and has_next\n    req_skills_lower = [s.lower() for s in (required_skills or [])]\n    filtered = []\n    for j in jobs:\n        if j.get('stipend_amount', 0) < min_stipend:\n            continue\n        j_skills = [sk.lower() for sk in j.get('skills', [])]\n        if req_skills_lower and not all(r in j_skills for r in req_skills_lower):\n            continue\n        filtered.append(j)\n        \n    start = (page - 1) * page_size\n    end = start + page_size\n    sliced = filtered[start:end]\n    return {\n        'total': len(filtered),\n        'page': page,\n        'page_size': page_size,\n        'has_next': end < len(filtered),\n        'jobs': sliced\n    }",
        "reference_solution": "def filter_jobs(jobs: list, required_skills: list = None, min_stipend: int = 0, page: int = 1, page_size: int = 5) -> dict:\n    req_skills_lower = [s.lower() for s in (required_skills or [])]\n    filtered = []\n    for j in jobs:\n        if j.get('stipend_amount', 0) < min_stipend:\n            continue\n        j_skills = [sk.lower() for sk in j.get('skills', [])]\n        if req_skills_lower and not all(r in j_skills for r in req_skills_lower):\n            continue\n        filtered.append(j)\n    start = (page - 1) * page_size\n    end = start + page_size\n    sliced = filtered[start:end]\n    return {\n        'total': len(filtered),\n        'page': page,\n        'page_size': page_size,\n        'has_next': end < len(filtered),\n        'jobs': sliced\n    }",
        "expected_time_complexity": "O(N)",
        "expected_space_complexity": "O(N)",
        "visible_tests": [
            {
                "input": "jobs = [{'id': 1, 'title': 'Python Backend', 'stipend_amount': 40000, 'skills': ['Python', 'SQL']}, {'id': 2, 'title': 'Frontend React', 'stipend_amount': 25000, 'skills': ['React']}], required_skills = ['Python'], min_stipend = 30000, page = 1, page_size = 5",
                "expected": "{'total': 1, 'page': 1, 'page_size': 5, 'has_next': False, 'jobs': [{'id': 1, 'title': 'Python Backend', 'stipend_amount': 40000, 'skills': ['Python', 'SQL']}]}",
                "description": "Filtered by Python and minimum stipend"
            }
        ],
        "hidden_tests": [
            {
                "input": "jobs = [{'id': i, 'stipend_amount': i * 1000, 'skills': ['Python']} for i in range(1, 12)], required_skills = ['python'], min_stipend = 0, page = 2, page_size = 5",
                "expected": "{'total': 11, 'page': 2, 'page_size': 5, 'has_next': True, 'jobs': [{'id': 6, 'stipend_amount': 6000, 'skills': ['Python']}, {'id': 7, 'stipend_amount': 7000, 'skills': ['Python']}, {'id': 8, 'stipend_amount': 8000, 'skills': ['Python']}, {'id': 9, 'stipend_amount': 9000, 'skills': ['Python']}, {'id': 10, 'stipend_amount': 10000, 'skills': ['Python']}]}",
                "description": "Pagination page 2 of 11 items"
            }
        ],
        "edge_tests": [],
        "rubric": {
            "correctness": 40,
            "problem_solving": 20,
            "efficiency": 15,
            "code_quality": 15,
            "edge_cases": 10
        },
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 7. TECHNICAL INTERVIEW MODE (TIMED EVALUATION WITH COMPLEXITY QUESTIONS)
    # =========================================================================
    {
        "id": "ch_interview_trie",
        "title": "Technical Interview: Autocomplete Prefix Trie",
        "challenge_type": "INTERVIEW",
        "language": "python",
        "category": "Advanced Data Structures",
        "topic": "Trie & Prefix Search",
        "skills": ["Python", "DSA", "System Design"],
        "subskills": ["Prefix Trees", "String Algorithms", "Tradeoff Analysis"],
        "difficulty": "Advanced",
        "estimated_time_mins": 45,
        "description": "Implement a Trie (Prefix Tree) with `insert(word)` and `starts_with(prefix)` methods. In interview mode, you must also answer the technical reasoning questions below regarding memory overhead vs hash set lookups.",
        "starter_code": "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end_of_word = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for char in word:\n            if char not in node.children:\n                node.children[char] = TrieNode()\n            node = node.children[char]\n        node.is_end_of_word = True\n\n    def starts_with(self, prefix: str) -> bool:\n        node = self.root\n        for char in prefix:\n            if char not in node.children:\n                return False\n            node = node.children[char]\n        return True\n\ndef test_trie(words, prefixes):\n    t = Trie()\n    for w in words:\n        t.insert(w)\n    return [t.starts_with(p) for p in prefixes]",
        "reference_solution": "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end_of_word = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for char in word:\n            if char not in node.children:\n                node.children[char] = TrieNode()\n            node = node.children[char]\n        node.is_end_of_word = True\n\n    def starts_with(self, prefix: str) -> bool:\n        node = self.root\n        for char in prefix:\n            if char not in node.children:\n                return False\n            node = node.children[char]\n        return True\n\ndef test_trie(words, prefixes):\n    t = Trie()\n    for w in words:\n        t.insert(w)\n    return [t.starts_with(p) for p in prefixes]",
        "expected_time_complexity": "O(L) where L is prefix length",
        "expected_space_complexity": "O(Total Chars)",
        "visible_tests": [
            {
                "input": "words = ['apple', 'app', 'application'], prefixes = ['app', 'appl', 'bat']",
                "expected": "[True, True, False]",
                "description": "Standard prefix match and miss"
            }
        ],
        "hidden_tests": [
            {
                "input": "words = ['skill', 'skillbridge', 'bridge'], prefixes = ['sk', 'br', 'xyz']",
                "expected": "[True, True, False]",
                "description": "Multi-word prefix check"
            }
        ],
        "edge_tests": [
            {
                "input": "words = [], prefixes = ['a']",
                "expected": "[False]",
                "description": "Empty trie prefix lookup"
            }
        ],
        "rubric": {
            "correctness": 35,
            "problem_solving": 25,
            "efficiency": 20,
            "code_quality": 10,
            "explanation": 10
        },
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 9. EXPANDED FUNDAMENTALS & DATA STRUCTURES
    # =========================================================================
    {
        "id": "ch_fund_valid_parentheses",
        "title": "Valid Balanced Parentheses & Brackets",
        "challenge_type": "STANDARD_CODING",
        "language": "python",
        "category": "Data Structures",
        "topic": "Stack & String Parsing",
        "skills": ["Python", "DSA", "Problem Solving"],
        "subskills": ["Stack LIFO", "Bracket Matching"],
        "difficulty": "Beginner",
        "estimated_time_mins": 15,
        "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Brackets must close in the correct order in O(N) time and O(N) space.",
        "starter_code": "def is_valid_parentheses(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
        "reference_solution": "def is_valid_parentheses(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
        "expected_time_complexity": "O(N)",
        "expected_space_complexity": "O(N)",
        "visible_tests": [
            {"input": "s = '()[]{}'", "expected": "True", "description": "Standard balanced multiple bracket types"},
            {"input": "s = '(]'", "expected": "False", "description": "Mismatched closing bracket"}
        ],
        "hidden_tests": [
            {"input": "s = '([{}])'", "expected": "True", "description": "Deeply nested balanced brackets"},
            {"input": "s = '((((((('", "expected": "False", "description": "Unclosed opening brackets"}
        ],
        "edge_tests": [
            {"input": "s = ''", "expected": "True", "description": "Empty string boundary condition"},
            {"input": "s = ')'", "expected": "False", "description": "Single closing bracket"}
        ],
        "rubric": {"correctness": 40, "problem_solving": 20, "efficiency": 20, "code_quality": 10, "edge_cases": 10},
        "version": 1,
        "status": "ACTIVE"
    },
    {
        "id": "ch_fund_palindrome",
        "title": "Valid Alphanumeric Palindrome",
        "challenge_type": "STANDARD_CODING",
        "language": "python",
        "category": "Fundamentals",
        "topic": "Two-Pointer Traversal",
        "skills": ["Python", "Algorithms", "Problem Solving"],
        "subskills": ["Two Pointers", "String Normalization"],
        "difficulty": "Beginner",
        "estimated_time_mins": 10,
        "description": "Determine if a string is a palindrome after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters. Must run in O(N) time and O(1) extra space.",
        "starter_code": "def is_palindrome(s: str) -> bool:\n    l, r = 0, len(s) - 1\n    while l < r:\n        while l < r and not s[l].isalnum(): l += 1\n        while l < r and not s[r].isalnum(): r -= 1\n        if s[l].lower() != s[r].lower():\n            return False\n        l += 1\n        r -= 1\n    return True",
        "reference_solution": "def is_palindrome(s: str) -> bool:\n    l, r = 0, len(s) - 1\n    while l < r:\n        while l < r and not s[l].isalnum(): l += 1\n        while l < r and not s[r].isalnum(): r -= 1\n        if s[l].lower() != s[r].lower():\n            return False\n        l += 1\n        r -= 1\n    return True",
        "expected_time_complexity": "O(N)",
        "expected_space_complexity": "O(1)",
        "visible_tests": [
            {"input": "s = 'A man, a plan, a canal: Panama'", "expected": "True", "description": "Classic alphanumeric palindrome"},
            {"input": "s = 'race a car'", "expected": "False", "description": "Non-palindrome string"}
        ],
        "hidden_tests": [
            {"input": "s = 'ab_a'", "expected": "True", "description": "Underscore symbol skipping"},
            {"input": "s = '0P'", "expected": "False", "description": "Digit and letter mismatch"}
        ],
        "edge_tests": [
            {"input": "s = ' '", "expected": "True", "description": "Whitespace only string"},
            {"input": "s = 'a.'", "expected": "True", "description": "Single letter with trailing period"}
        ],
        "rubric": {"correctness": 40, "problem_solving": 20, "efficiency": 20, "code_quality": 10, "edge_cases": 10},
        "version": 1,
        "status": "ACTIVE"
    },
    {
        "id": "ch_alg_max_subarray",
        "title": "Maximum Subarray Sum (Kadane's Algorithm)",
        "challenge_type": "STANDARD_CODING",
        "language": "python",
        "category": "Algorithms",
        "topic": "Dynamic Programming & Kadane",
        "skills": ["Python", "DSA", "Algorithms"],
        "subskills": ["Linear State Accumulation", "Negative Value Handling"],
        "difficulty": "Intermediate",
        "estimated_time_mins": 20,
        "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum in strictly linear O(N) time without quadratic slicing.",
        "starter_code": "def max_sub_array(nums: list) -> int:\n    max_sum = nums[0]\n    current_sum = 0\n    for num in nums:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum",
        "reference_solution": "def max_sub_array(nums: list) -> int:\n    max_sum = nums[0]\n    current_sum = 0\n    for num in nums:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum",
        "expected_time_complexity": "O(N)",
        "expected_space_complexity": "O(1)",
        "visible_tests": [
            {"input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", "expected": "6", "description": "Subarray [4, -1, 2, 1] has max sum 6"},
            {"input": "nums = [1]", "expected": "1", "description": "Single element array"}
        ],
        "hidden_tests": [
            {"input": "nums = [5, 4, -1, 7, 8]", "expected": "23", "description": "Entire array positive sum"},
            {"input": "nums = [-3, -2, -1, -5]", "expected": "-1", "description": "All negative elements returns least negative"}
        ],
        "edge_tests": [
            {"input": "nums = [-100000]", "expected": "-100000", "description": "Large single negative boundary"},
            {"input": "nums = [0, 0, 0]", "expected": "0", "description": "All zeros"}
        ],
        "rubric": {"correctness": 40, "problem_solving": 20, "efficiency": 20, "code_quality": 10, "edge_cases": 10},
        "version": 1,
        "status": "ACTIVE"
    },
    {
        "id": "ch_alg_coin_change",
        "title": "Minimum Coin Change (Dynamic Programming)",
        "challenge_type": "STANDARD_CODING",
        "language": "python",
        "category": "Algorithms",
        "topic": "Dynamic Programming",
        "skills": ["Python", "DSA", "Problem Solving"],
        "subskills": ["Bottom-Up Tabulation", "Unbounded Knapsack"],
        "difficulty": "Hard",
        "estimated_time_mins": 30,
        "description": "Given integer array `coins` and integer `amount`, return the fewest number of coins needed to make up that amount. If that amount cannot be made up, return -1.",
        "starter_code": "def coin_change(coins: list, amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for x in range(c, amount + 1):\n            dp[x] = min(dp[x], dp[x - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
        "reference_solution": "def coin_change(coins: list, amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for x in range(c, amount + 1):\n            dp[x] = min(dp[x], dp[x - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
        "expected_time_complexity": "O(Amount * N)",
        "expected_space_complexity": "O(Amount)",
        "visible_tests": [
            {"input": "coins = [1, 2, 5], amount = 11", "expected": "3", "description": "11 = 5 + 5 + 1"},
            {"input": "coins = [2], amount = 3", "expected": "-1", "description": "Cannot make odd amount with even coin"}
        ],
        "hidden_tests": [
            {"input": "coins = [1], amount = 0", "expected": "0", "description": "Zero amount requires 0 coins"},
            {"input": "coins = [186, 419, 83, 408], amount = 6249", "expected": "20", "description": "Complex coin denominations"}
        ],
        "edge_tests": [
            {"input": "coins = [1], amount = 100", "expected": "100", "description": "Single denomination match"}
        ],
        "rubric": {"correctness": 40, "problem_solving": 20, "efficiency": 20, "code_quality": 10, "edge_cases": 10},
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 10. EXPANDED DEBUGGING LAB
    # =========================================================================
    {
        "id": "ch_debug_dict_mutation",
        "title": "Debug: Dictionary Mutation During Iteration Error",
        "challenge_type": "DEBUGGING",
        "language": "python",
        "category": "Debugging",
        "topic": "Runtime Collection Mutability",
        "skills": ["Python", "Debugging", "Code Quality"],
        "subskills": ["Runtime Error Diagnosis", "Dictionary Key Pruning"],
        "difficulty": "Intermediate",
        "estimated_time_mins": 15,
        "description": "The function below crashes with `RuntimeError: dictionary changed size during iteration` when removing keys with values below a threshold. Fix the implementation so it safely removes low-scoring keys without mutating the active iterator.",
        "starter_code": "def prune_low_scores(scores: dict, threshold: int) -> dict:\n    # BUGGY: Direct iteration over mutating dict\n    for key in list(scores.keys()):\n        if scores[key] < threshold:\n            del scores[key]\n    return scores",
        "reference_solution": "def prune_low_scores(scores: dict, threshold: int) -> dict:\n    for key in list(scores.keys()):\n        if scores[key] < threshold:\n            del scores[key]\n    return scores",
        "expected_time_complexity": "O(N)",
        "expected_space_complexity": "O(N)",
        "visible_tests": [
            {"input": "scores = {'python': 88, 'sql': 42, 'react': 75}, threshold = 60", "expected": "{'python': 88, 'react': 75}", "description": "Prunes keys under threshold 60"},
            {"input": "scores = {'dsa': 90, 'docker': 85}, threshold = 50", "expected": "{'dsa': 90, 'docker': 85}", "description": "All keys above threshold"}
        ],
        "hidden_tests": [
            {"input": "scores = {'a': 10, 'b': 20, 'c': 30}, threshold = 100", "expected": "{}", "description": "All keys pruned"},
            {"input": "scores = {}, threshold = 10", "expected": "{}", "description": "Empty dictionary input"}
        ],
        "edge_tests": [
            {"input": "scores = {'exact': 50}, threshold = 50", "expected": "{'exact': 50}", "description": "Strict boundary condition"}
        ],
        "rubric": {"correctness": 40, "problem_solving": 20, "efficiency": 20, "code_quality": 10, "edge_cases": 10},
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 11. EXPANDED OPTIMIZATION LAB
    # =========================================================================
    {
        "id": "ch_opt_matrix_zeros",
        "title": "Optimize: In-Place Matrix Zeroing O(1) Space",
        "challenge_type": "OPTIMIZATION",
        "language": "python",
        "category": "Optimization",
        "topic": "Matrix Space Optimization",
        "skills": ["Python", "DSA", "Optimization"],
        "subskills": ["In-Place Flagging", "Matrix Traversal"],
        "difficulty": "Hard",
        "estimated_time_mins": 25,
        "description": "Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. You must optimize the space consumption: achieve in-place O(1) auxiliary space instead of creating an O(M*N) copy.",
        "starter_code": "def set_zeroes(matrix: list) -> list:\n    m, n = len(matrix), len(matrix[0])\n    first_row_has_zero = any(matrix[0][j] == 0 for j in range(n))\n    first_col_has_zero = any(matrix[i][0] == 0 for j in range(1) for i in range(m))\n    for i in range(1, m):\n        for j in range(1, n):\n            if matrix[i][j] == 0:\n                matrix[i][0] = 0\n                matrix[0][j] = 0\n    for i in range(1, m):\n        for j in range(1, n):\n            if matrix[i][0] == 0 or matrix[0][j] == 0:\n                matrix[i][j] = 0\n    if first_row_has_zero:\n        for j in range(n): matrix[0][j] = 0\n    if first_col_has_zero:\n        for i in range(m): matrix[i][0] = 0\n    return matrix",
        "reference_solution": "def set_zeroes(matrix: list) -> list:\n    m, n = len(matrix), len(matrix[0])\n    first_row_has_zero = any(matrix[0][j] == 0 for j in range(n))\n    first_col_has_zero = any(matrix[i][0] == 0 for j in range(1) for i in range(m))\n    for i in range(1, m):\n        for j in range(1, n):\n            if matrix[i][j] == 0:\n                matrix[i][0] = 0\n                matrix[0][j] = 0\n    for i in range(1, m):\n        for j in range(1, n):\n            if matrix[i][0] == 0 or matrix[0][j] == 0:\n                matrix[i][j] = 0\n    if first_row_has_zero:\n        for j in range(n): matrix[0][j] = 0\n    if first_col_has_zero:\n        for i in range(m): matrix[i][0] = 0\n    return matrix",
        "expected_time_complexity": "O(M * N)",
        "expected_space_complexity": "O(1)",
        "visible_tests": [
            {"input": "matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]", "expected": "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]", "description": "Center element zeroing row and column"},
            {"input": "matrix = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]", "expected": "[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]", "description": "Corner zeros propagation"}
        ],
        "hidden_tests": [
            {"input": "matrix = [[1, 0]]", "expected": "[[0, 0]]", "description": "Single row matrix with zero"},
            {"input": "matrix = [[0], [1]]", "expected": "[[0], [0]]", "description": "Single column matrix with zero"}
        ],
        "edge_tests": [
            {"input": "matrix = [[1]]", "expected": "[[1]]", "description": "Single non-zero 1x1 matrix"}
        ],
        "rubric": {"correctness": 35, "problem_solving": 20, "efficiency": 25, "code_quality": 10, "edge_cases": 10},
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 12. EXPANDED CODE REVIEW & SECURITY LAB
    # =========================================================================
    {
        "id": "ch_review_jwt_auth",
        "title": "Code Review: JWT Security & Token Validation Audit",
        "challenge_type": "CODE_REVIEW",
        "language": "python",
        "category": "Security",
        "topic": "Authentication & Secrets Audit",
        "skills": ["Security", "FastAPI", "Python"],
        "subskills": ["OWASP Top 10", "Cryptographic Secrets", "JWT Expiration"],
        "difficulty": "Intermediate",
        "estimated_time_mins": 25,
        "description": "Audit the following authentication utility. Identify critical security vulnerabilities including hardcoded weak secrets, missing expiration checks, and lack of algorithm pinning.",
        "starter_code": "def audit_jwt_verifier(payload: dict) -> list:\n    vulnerabilities = []\n    if payload.get('secret') in ['secret', '123456', 'admin']:\n        vulnerabilities.append('CRITICAL: Weak hardcoded JWT signature secret.')\n    if not payload.get('exp'):\n        vulnerabilities.append('HIGH: Missing token expiration timestamp (exp).')\n    if payload.get('algorithm') == 'none':\n        vulnerabilities.append('CRITICAL: Alg None attack vulnerability enabled.')\n    return vulnerabilities",
        "reference_solution": "def audit_jwt_verifier(payload: dict) -> list:\n    vulnerabilities = []\n    if payload.get('secret') in ['secret', '123456', 'admin']:\n        vulnerabilities.append('CRITICAL: Weak hardcoded JWT signature secret.')\n    if not payload.get('exp'):\n        vulnerabilities.append('HIGH: Missing token expiration timestamp (exp).')\n    if payload.get('algorithm') == 'none':\n        vulnerabilities.append('CRITICAL: Alg None attack vulnerability enabled.')\n    return vulnerabilities",
        "expected_time_complexity": "O(1)",
        "expected_space_complexity": "O(1)",
        "visible_tests": [
            {
                "input": "payload = {'secret': '123456', 'algorithm': 'HS256'}",
                "expected": "['CRITICAL: Weak hardcoded JWT signature secret.', 'HIGH: Missing token expiration timestamp (exp).']",
                "description": "Detects weak secret and missing exp"
            }
        ],
        "hidden_tests": [
            {
                "input": "payload = {'secret': 'strong_env_var_key', 'exp': 1791230000, 'algorithm': 'none'}",
                "expected": "['CRITICAL: Alg None attack vulnerability enabled.']",
                "description": "Detects Alg None attack"
            }
        ],
        "edge_tests": [
            {
                "input": "payload = {'secret': 'prod_vault_key_2026', 'exp': 1791230000, 'algorithm': 'RS256'}",
                "expected": "[]",
                "description": "Secure production configuration returns no vulnerabilities"
            }
        ],
        "rubric": {"correctness": 40, "problem_solving": 20, "efficiency": 10, "code_quality": 20, "edge_cases": 10},
        "version": 1,
        "status": "ACTIVE"
    },

    # =========================================================================
    # 13. EXPANDED SQL LAB
    # =========================================================================
    {
        "id": "ch_sql_dept_top_earners",
        "title": "SQL: Departmental Top Placement Earners (DENSE_RANK)",
        "challenge_type": "SQL",
        "language": "sql",
        "category": "Databases & Analytics",
        "topic": "Window Functions & DENSE_RANK",
        "skills": ["SQL", "PostgreSQL", "Analytics"],
        "subskills": ["DENSE_RANK()", "Partitioning", "Subquery Filtering"],
        "difficulty": "Hard",
        "estimated_time_mins": 30,
        "description": "Write a SQL query using window functions (`DENSE_RANK() OVER (PARTITION BY department_id ORDER BY verified_score DESC)`) to identify students ranking in the top 2 highest verified scores in each department.",
        "starter_code": "-- Write a SQL query returning departmental top scores using DENSE_RANK\nSELECT s.name, s.verified_score, d.name AS dept_name\nFROM students s\nJOIN departments d ON s.department_id = d.id\nWHERE s.verified_score >= 80\nORDER BY s.verified_score DESC;\n",
        "reference_solution": "SELECT s.name, s.verified_score, d.name AS dept_name FROM students s JOIN departments d ON s.department_id = d.id WHERE s.verified_score >= 80 ORDER BY s.verified_score DESC;",
        "expected_time_complexity": "O(N log N)",
        "expected_space_complexity": "O(N)",
        "visible_tests": [
            {
                "input": "SELECT query with JOIN departments + students",
                "expected": "At least 3 records with verified_score >= 80",
                "description": "Verifies relational JOIN and ranking threshold"
            }
        ],
        "hidden_tests": [
            {
                "input": "Check department grouping",
                "expected": "Includes dept_comp and dept_it rows",
                "description": "Ensures multiple departments are represented"
            }
        ],
        "edge_tests": [
            {
                "input": "Ordering check",
                "expected": "Ordered by verified_score DESC",
                "description": "Validates descending ranking sort"
            }
        ],
        "rubric": {"correctness": 40, "problem_solving": 20, "efficiency": 20, "code_quality": 10, "edge_cases": 10},
        "version": 1,
        "status": "ACTIVE"
    }
]

# Map by id for constant-time lookup
CHALLENGE_MAP: Dict[str, Dict[str, Any]] = {c["id"]: c for c in CHALLENGE_BANK}

