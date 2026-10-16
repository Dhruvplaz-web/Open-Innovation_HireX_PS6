"""
Standardized Aptitude & Engineering Problem Bank
Covers Quantitative Math, Logical Reasoning, and Core Computer Science.
Includes step-by-step mathematical explanations.
"""

APTITUDE_QUESTIONS = [
    # --- QUANTITATIVE APTITUDE ---
    {
        "id": "q_1",
        "category": "Quantitative",
        "topic": "Time & Work",
        "difficulty": "Medium",
        "question": "A can finish a software module in 12 days and B can finish it in 18 days. If they work together for 4 days, what fraction of the module remains unfinished?",
        "options": ["5/9", "4/9", "7/18", "1/3"],
        "correct": 1,
        "explanation": "1-day work of A = 1/12. 1-day work of B = 1/18. Combined 1-day work = (1/12 + 1/18) = 5/36. In 4 days, work done = 4 * (5/36) = 20/36 = 5/9. Remaining work = 1 - 5/9 = 4/9."
    },
    {
        "id": "q_2",
        "category": "Quantitative",
        "topic": "Percentages & Profit",
        "difficulty": "Easy",
        "question": "A recruiter offers a stipend of ₹40,000. If the student receives an 8% cost-of-living allowance and a 5% performance bonus on base stipend, what is the total payout?",
        "options": ["₹44,000", "₹45,200", "₹45,000", "₹46,000"],
        "correct": 1,
        "explanation": "Total increase = 8% + 5% = 13%. Payout = ₹40,000 * 1.13 = ₹45,200."
    },
    {
        "id": "q_3",
        "category": "Quantitative",
        "topic": "Speed & Distance",
        "difficulty": "Medium",
        "question": "A data packet travels from Pune to Mumbai (150 km) at 60 km/h and returns at 90 km/h. What is the harmonic mean average speed for the entire round trip?",
        "options": ["72 km/h", "75 km/h", "70 km/h", "80 km/h"],
        "correct": 0,
        "explanation": "Average speed for equal distances = 2xy / (x + y) = 2 * 60 * 90 / (60 + 90) = 10800 / 150 = 72 km/h."
    },

    # --- LOGICAL REASONING ---
    {
        "id": "l_1",
        "category": "Logical",
        "topic": "Coding & Decoding",
        "difficulty": "Easy",
        "question": "In a certain code, 'PYTHON' is written as 'QZWIPO'. How is 'REACT' coded in that same pattern?",
        "options": ["SFBDU", "SGCDV", "SDBCU", "SFCEU"],
        "correct": 0,
        "explanation": "Each letter is shifted forward by +1: R->S, E->F, A->B, C->D, T->U. Result is SFBDU."
    },
    {
        "id": "l_2",
        "category": "Logical",
        "topic": "Syllogisms",
        "difficulty": "Medium",
        "question": "Statements: (1) All microservices are scalable. (2) Some scalable systems are fault-tolerant. Conclusion: (I) Some microservices are fault-tolerant. (II) All scalable systems are microservices.",
        "options": ["Only Conclusion I follows", "Only Conclusion II follows", "Neither I nor II follows", "Both I and II follow"],
        "correct": 2,
        "explanation": "From 'All A are B' and 'Some B are C', no definite relation between A and C can be concluded without distribution. Hence, neither follows."
    },

    # --- CORE COMPUTER SCIENCE ---
    {
        "id": "cs_1",
        "category": "Core CS",
        "topic": "DBMS Normalization",
        "difficulty": "Medium",
        "question": "A database relation is in 3NF and every non-trivial functional dependency X -> Y has X as a superkey. Which normal form is it strictly in?",
        "options": ["BCNF (Boyce-Codd NF)", "2NF", "4NF", "1NF"],
        "correct": 0,
        "explanation": "By definition, a relation is in BCNF if in every non-trivial functional dependency X -> Y, X is a superkey."
    },
    {
        "id": "cs_2",
        "category": "Core CS",
        "topic": "Operating Systems",
        "difficulty": "Hard",
        "question": "Which of the following is NOT one of Coffman's four mandatory conditions for a system deadlock to occur?",
        "options": ["Mutual Exclusion", "Hold and Wait", "Preemptive Resource Allocation", "Circular Wait"],
        "correct": 2,
        "explanation": "Coffman's conditions require 'No Preemption' (resources cannot be forcibly taken). Preemptive resource allocation prevents deadlocks, rather than causing them."
    }
]

CODING_CHALLENGES = [
    {
        "id": "ch_1",
        "title": "Two Sum (Target Array Indices)",
        "difficulty": "Easy",
        "category": "Algorithms & Hash Tables",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nAssume each input has exactly one solution.",
        "starter_code": "def two_sum(nums, target):\n    # TODO: Implement in O(N) using a hash map\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
        "test_cases": [
            {"input": "nums = [2, 7, 11, 15], target = 9", "expected": "[0, 1]", "is_hidden": False},
            {"input": "nums = [3, 2, 4], target = 6", "expected": "[1, 2]", "is_hidden": False},
            {"input": "nums = [3, 3], target = 6", "expected": "[0, 1]", "is_hidden": True}
        ]
    },
    {
        "id": "ch_2",
        "title": "Valid Palindrome String",
        "difficulty": "Easy",
        "category": "Strings & Two-Pointer",
        "description": "A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.",
        "starter_code": "def is_palindrome(s):\n    # TODO: Clean string and verify in O(N) time\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]",
        "test_cases": [
            {"input": "s = 'A man, a plan, a canal: Panama'", "expected": "True", "is_hidden": False},
            {"input": "s = 'race a car'", "expected": "False", "is_hidden": False},
            {"input": "s = ' '", "expected": "True", "is_hidden": True}
        ]
    }
]
