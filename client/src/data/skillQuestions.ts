export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'intermediate' | 'hard';
  targetTimeSeconds: number;
}

export interface SkillQuestionSet {
  easy: AssessmentQuestion[];
  intermediate: AssessmentQuestion[];
  hard: AssessmentQuestion[];
}

export const SKILL_QUESTION_BANKS: Record<string, SkillQuestionSet> = {
  Python: {
    easy: [
      {
        id: 'py_e1',
        question: 'Which of the following built-in collection types in Python is immutable?',
        options: ['List', 'Dictionary', 'Set', 'Tuple'],
        correct: 3,
        explanation: 'Tuples cannot be modified after creation, making them immutable and hashable.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'py_e2',
        question: 'What is the average time complexity of a dictionary key lookup in Python?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correct: 0,
        explanation: 'Python dictionaries use hash tables, giving average amortized O(1) lookup.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'py_e3',
        question: 'Which keyword is used to create an anonymous function in Python?',
        options: ['def', 'lambda', 'func', 'inline'],
        correct: 1,
        explanation: 'The lambda keyword defines small, single-expression anonymous functions.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'py_e4',
        question: 'What does the `pass` statement do in Python?',
        options: ['Skips to the next loop iteration', 'Terminates the program', 'Acts as a null statement placeholder', 'Returns None from a function'],
        correct: 2,
        explanation: '`pass` is a null statement used as a syntactic placeholder.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'py_e5',
        question: 'Which method removes and returns the last item from a list in Python?',
        options: ['pop()', 'remove()', 'delete()', 'shift()'],
        correct: 0,
        explanation: '`list.pop()` removes and returns the item at the specified index (default last item).',
        difficulty: 'easy',
        targetTimeSeconds: 30
      }
    ],
    intermediate: [
      {
        id: 'py_i1',
        question: 'What is the purpose of the `__slots__` attribute in a Python class?',
        options: [
          'Enables multiple inheritance with C3 linearization',
          'Prevents the dynamic creation of __dict__ per instance, optimizing memory',
          'Registers class methods into a global event loop',
          'Serializes class instances directly into JSON'
        ],
        correct: 1,
        explanation: '`__slots__` optimizes memory by preventing the creation of `__dict__` for each instance.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'py_i2',
        question: 'How do Python generators differ from standard functions returning lists?',
        options: [
          'Generators run in separate background threads',
          'Generators yield values lazily on-demand using iterator protocol, saving memory',
          'Generators cannot accept arguments',
          'Generators automatically vectorize calculations'
        ],
        correct: 1,
        explanation: 'Generators yield values one at a time using `yield`, maintaining internal state with minimal memory.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'py_i3',
        question: 'Which Python standard module is recommended for thread-safe FIFO queue operations?',
        options: ['collections.deque', 'queue.Queue', 'list', 'multiprocessing.Array'],
        correct: 1,
        explanation: '`queue.Queue` provides thread-safe locking primitives out of the box for producer-consumer workflows.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'py_i4',
        question: 'What is the effect of using `@functools.lru_cache` on a recursive function?',
        options: [
          'Compiles the function to C bytecode',
          'Memoizes function call results based on argument tuples up to maxsize',
          'Spawns a separate process per call',
          'Disables the call stack depth limit'
        ],
        correct: 1,
        explanation: '`lru_cache` caches return values for identical function arguments, transforming exponential recursion to linear.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'py_i5',
        question: 'In Python, what is the method resolution order (MRO) algorithm used in new-style classes?',
        options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'C3 Linearization', 'Dijkstra MRO'],
        correct: 2,
        explanation: 'Python uses the C3 Linearization algorithm to determine method resolution order in multiple inheritance.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      }
    ],
    hard: [
      {
        id: 'py_h1',
        question: 'What is the primary architectural implication of CPython\'s Global Interpreter Lock (GIL)?',
        options: [
          'Accelerates multi-core CPU linear algebra calculations',
          'Prevents concurrent execution of native Python bytecode across OS threads to protect CPython memory management',
          'Encrypts Python bytecode before compilation',
          'Prevents garbage collection from freeing active cyclic references'
        ],
        correct: 1,
        explanation: 'The GIL prevents multiple native OS threads from executing CPython bytecodes simultaneously to maintain thread-safe reference counting.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'py_h2',
        question: 'What happens when a long-running synchronous CPU-bound task is invoked directly inside an asyncio coroutine?',
        options: [
          'Asyncio automatically delegates it to an OS worker thread',
          'It blocks the single-threaded event loop, starving all other concurrent coroutines',
          'It raises a CoroutineBlockedException immediately',
          'CPython switches to greenlet mode'
        ],
        correct: 1,
        explanation: 'Synchronous CPU-bound calls block the single event loop thread. Offloading requires `loop.run_in_executor()` or `asyncio.to_thread()`.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'py_h3',
        question: 'How does CPython\'s generational garbage collector handle circular references?',
        options: [
          'Circular references cannot be freed in Python',
          'Using 3 generations (Gen 0, 1, 2) that track container objects and isolate unreachable reference cycles by discounting internal counts',
          'By forcing reference counters to negative infinity',
          'By serializing objects to temporary swap space'
        ],
        correct: 1,
        explanation: 'The generational GC tracks container objects across 3 generations and performs double-linked list traversal to detect cyclic islands.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'py_h4',
        question: 'What is a Python `memoryview` object and why is it used for high-throughput I/O?',
        options: [
          'A GUI debugger for memory leaks',
          'A zero-copy buffer protocol interface allowing slicing of byte sequences without data duplication',
          'An OS virtual memory paging table wrapper',
          'A persistent disk cache'
        ],
        correct: 1,
        explanation: '`memoryview` allows Python code to access the internal data of an object that supports the buffer protocol without copying memory.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'py_h5',
        question: 'What does `sys.settrace()` do in Python internals?',
        options: [
          'Sets CPU thread priority',
          'Registers a trace callback triggered on every function call, line execution, and exception return',
          'Allocates system RAM directly from the kernel',
          'Disables the GIL for designated code blocks'
        ],
        correct: 1,
        explanation: '`sys.settrace()` hooks into CPython bytecode evaluation loop, enabling line-by-line debuggers and code coverage profilers.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      }
    ]
  },

  React: {
    easy: [
      {
        id: 're_e1',
        question: 'What is the primary function of the `useState` hook in React?',
        options: [
          'Performs side effects and API requests',
          'Declares a state variable and provides a function to update it',
          'Optimizes component re-renders using shallow comparison',
          'Subscribes to global Redux store'
        ],
        correct: 1,
        explanation: '`useState` provides functional components with local state and state updater functions.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 're_e2',
        question: 'What prop must be uniquely assigned when rendering a dynamic list in React?',
        options: ['id', 'key', 'index', 'ref'],
        correct: 1,
        explanation: 'The `key` prop helps React identify which items have changed, been added, or been removed during reconciliation.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 're_e3',
        question: 'What hook is used to perform side effects such as data fetching in functional components?',
        options: ['useSideEffect', 'useEffect', 'useAction', 'useLifecycle'],
        correct: 1,
        explanation: '`useEffect` lets functional components perform side effects after rendering.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 're_e4',
        question: 'In React, what are props?',
        options: ['Internal mutable state', 'Read-only arbitrary inputs passed from parent to child', 'Global DOM references', 'CSS styling attributes'],
        correct: 1,
        explanation: 'Props are read-only properties passed down component trees to configure child elements.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 're_e5',
        question: 'What is JSX in React?',
        options: ['A database query language', 'A syntax extension for JavaScript that resembles HTML', 'A replacement for CSS', 'A bundler configuration'],
        correct: 1,
        explanation: 'JSX allows developers to write HTML-like markup inside JavaScript files, compiling to `React.createElement`.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      }
    ],
    intermediate: [
      {
        id: 're_i1',
        question: 'What is the main difference between `useMemo` and `useCallback`?',
        options: [
          '`useMemo` caches a calculated value; `useCallback` caches a function definition',
          '`useMemo` is asynchronous; `useCallback` is synchronous',
          '`useCallback` triggers re-renders; `useMemo` prevents them',
          '`useMemo` can only be used in class components'
        ],
        correct: 0,
        explanation: '`useMemo` memoizes the result of a function call, while `useCallback` memoizes the callback function itself.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 're_i2',
        question: 'When should `useLayoutEffect` be used instead of `useEffect`?',
        options: [
          'For all API data fetching',
          'When you need to measure DOM layout synchronously before the browser repaints to prevent visual flicker',
          'Only when server-side rendering with Next.js',
          'When handling WebSocket subscriptions'
        ],
        correct: 1,
        explanation: '`useLayoutEffect` runs synchronously after all DOM mutations but before browser paint, preventing visual layout shifts.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 're_i3',
        question: 'What does React Fiber enable that the older stack reconciler could not do?',
        options: [
          'Direct compilation into native WebAssembly',
          'Incremental rendering and cooperative scheduling by breaking reconciliation work into interruptible units',
          'Elimination of the virtual DOM entirely',
          'Direct multi-threaded rendering in Web Workers'
        ],
        correct: 1,
        explanation: 'Fiber breaks rendering work into incremental units, allowing browser priority interruptions and concurrent features.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 're_i4',
        question: 'What is the consequence of updating state inside a `useEffect` without a proper dependency array?',
        options: [
          'The state update is silently discarded',
          'An infinite render loop occurs, freezing the browser tab',
          'React converts the component into a PureComponent',
          'The browser throws an uncaught syntax error'
        ],
        correct: 1,
        explanation: 'Without a dependency array, `useEffect` runs on every render; updating state triggers a new render, causing an infinite loop.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 're_i5',
        question: 'What is the primary role of React Error Boundaries?',
        options: [
          'Catching network timeouts in fetch requests',
          'Catching JavaScript errors anywhere in the child component tree during rendering, lifecycle, and constructors, and rendering a fallback UI',
          'Validating TypeScript types at runtime',
          'Preventing cross-site scripting (XSS) attacks'
        ],
        correct: 1,
        explanation: 'Error boundaries catch errors during rendering, lifecycles, and child constructors, preserving the rest of the application.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      }
    ],
    hard: [
      {
        id: 're_h1',
        question: 'In React 18 Concurrent Mode, what is the role of `useTransition`?',
        options: [
          'CSS keyframe animation orchestration',
          'Marks state updates as non-urgent transitions, allowing urgent updates (like keystrokes) to interrupt them',
          'Converts client components into Server Components',
          'Synchronizes state across browser tabs using BroadcastChannel'
        ],
        correct: 1,
        explanation: '`useTransition` marks updates as transitions, keeping the UI responsive to user input while rendering heavy updates in the background.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 're_h2',
        question: 'How does React\'s synthetic event system differ from native browser events in modern React 17+?',
        options: [
          'Events are delegated to `document` in React 17+, whereas in React 16 they were on `window`',
          'Events are delegated to the root DOM container (`rootNode`) rather than `document`, facilitating safe multi-version nesting',
          'Synthetic events bypass native browser event dispatch entirely',
          'Synthetic events execute in Web Workers'
        ],
        correct: 1,
        explanation: 'React 17+ attaches event handlers to the root DOM container where the React tree is rendered rather than the global `document`.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 're_h3',
        question: 'What causes a "tearing" visual bug in concurrent rendering, and how does `useSyncExternalStore` solve it?',
        options: [
          'GPU texture overflow solved by WebGL shaders',
          'Concurrent renders reading mutable external stores at different timestamps during an interrupted render; solved by synchronous reads and bailouts',
          'CSS grid misalignment solved by flexbox',
          'Memory leaks from unmounted timers'
        ],
        correct: 1,
        explanation: '`useSyncExternalStore` guarantees synchronous reads from external stores, preventing UI components from rendering inconsistent states during concurrent transitions.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 're_h4',
        question: 'What is the internal data structure used by React Fiber nodes to navigate child and sibling relationships?',
        options: [
          'Doubly linked lists with parent pointers',
          'Singly linked list with `child`, `sibling`, and `return` (parent) pointers',
          'Binary search trees ordered by priority',
          'Hash maps indexed by component name'
        ],
        correct: 1,
        explanation: 'Fiber nodes use a singly linked tree with `child`, `sibling`, and `return` pointers, enabling depth-first traversal and interruption.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 're_h5',
        question: 'Under React Server Components (RSC) architecture, what is passed over the wire from server to client?',
        options: [
          'Compiled HTML strings only',
          'A serialized stream of JSX-like JSON virtual DOM tree nodes (RSC payload) with references to client component chunks',
          'Full JavaScript bundle with node_modules',
          'Binary Protobuf bytecode'
        ],
        correct: 1,
        explanation: 'RSC streams a serialized JSON description of the rendered UI tree without bundling server-only dependencies.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      }
    ]
  },

  'Machine Learning': {
    easy: [
      {
        id: 'ml_e1',
        question: 'Which of the following is an example of an Unsupervised Learning algorithm?',
        options: ['Linear Regression', 'Support Vector Machines', 'K-Means Clustering', 'Random Forest Classifier'],
        correct: 2,
        explanation: 'K-Means clusters unlabeled observations based on feature distances without target labels.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'ml_e2',
        question: 'What is the primary symptom of Overfitting in a machine learning model?',
        options: [
          'High training error and high validation error',
          'Very low training error but significantly higher validation error',
          'Model fails to calculate gradients',
          'Feature importances are all identical'
        ],
        correct: 1,
        explanation: 'Overfitting happens when a model memorizes training noise and fails to generalize to unseen test/validation data.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'ml_e3',
        question: 'Which metric is best suited for evaluating an imbalanced classification dataset (e.g. 99% negative, 1% positive)?',
        options: ['Accuracy', 'F1-Score / PR-AUC', 'Mean Squared Error', 'R-squared'],
        correct: 1,
        explanation: 'Accuracy is misleading on imbalanced datasets. F1-Score balances precision and recall.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'ml_e4',
        question: 'What does the term "Feature Scaling" achieve in gradient-based optimization algorithms?',
        options: [
          'Removes all outliers from the dataset',
          'Brings features to a comparable scale so gradient descent converges faster without oscillating',
          'Converts numeric features into categorical strings',
          'Reduces the number of columns automatically'
        ],
        correct: 1,
        explanation: 'Scaling (like StandardScaler) ensures spherical loss contours, enabling faster gradient descent convergence.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'ml_e5',
        question: 'In Linear Regression, what does the slope coefficient represent?',
        options: ['The y-intercept', 'The expected change in target variable for a one-unit change in the feature', 'The variance of residuals', 'The p-value of the dataset'],
        correct: 1,
        explanation: 'The slope coefficient measures the rate of change in the dependent variable per unit increase in the feature.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      }
    ],
    intermediate: [
      {
        id: 'ml_i1',
        question: 'What is the difference between L1 (Lasso) and L2 (Ridge) regularization?',
        options: [
          'Lasso penalizes absolute coefficients producing sparse feature selection; Ridge penalizes squared coefficients shrinking them continuously',
          'Ridge produces sparse zero coefficients; Lasso retains all weights',
          'L1 is used only for neural networks; L2 is used only for linear regression',
          'L2 is non-convex whereas L1 is convex'
        ],
        correct: 0,
        explanation: 'L1 adds the sum of absolute values, driving non-essential coefficients to zero; L2 shrinks weights without zeroing them.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'ml_i2',
        question: 'Why does the Vanishing Gradient problem occur in deep neural networks with Sigmoid activation functions?',
        options: [
          'Sigmoid derivatives saturate near zero for large inputs, causing gradients to diminish exponentially when backpropagated',
          'Sigmoid outputs values greater than 1.0',
          'Sigmoid functions are non-differentiable',
          'The learning rate automatically drops to zero'
        ],
        correct: 0,
        explanation: 'Sigmoid derivative max is 0.25; chaining multiple layers causes exponential decay of gradients towards zero.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'ml_i3',
        question: 'What is the primary advantage of Random Forest over a single Decision Tree?',
        options: [
          'Reduces bias significantly',
          'Reduces variance and overfitting by aggregating multiple decorrelated bootstrap trees via bagging',
          'Requires zero hyperparameter tuning',
          'Executes in O(1) time'
        ],
        correct: 1,
        explanation: 'Random Forest trains multiple decorrelated trees on bootstrap subsets, substantially reducing variance without increasing bias.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'ml_i4',
        question: 'What is the role of the Attention mechanism in Transformer neural networks?',
        options: [
          'Compresses images into discrete Fourier coefficients',
          'Dynamically weights the contextual relevance of all tokens in a sequence relative to each other regardless of distance',
          'Eliminates the need for activation functions',
          'Replaces backpropagation with evolutionary heuristics'
        ],
        correct: 1,
        explanation: 'Self-attention calculates pairwise query-key dot products to assign attention weights across all tokens in O(1) path length.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'ml_i5',
        question: 'In k-Fold Cross Validation with k=5, what portion of data is used for training in each fold?',
        options: ['20%', '50%', '80%', '100%'],
        correct: 2,
        explanation: 'In 5-fold CV, 4 folds (80%) are used for training and 1 fold (20%) is held out for validation in each iteration.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      }
    ],
    hard: [
      {
        id: 'ml_h1',
        question: 'In Self-Attention computation `Softmax(QK^T / sqrt(d_k))V`, why is the dot product scaled by `1 / sqrt(d_k)`?',
        options: [
          'To ensure mathematical symmetry with the Value matrix',
          'For large projection dimensions `d_k`, dot products grow large in magnitude, pushing softmax into regions with extremely small gradients',
          'To enforce unitary eigenvalues in weight matrices',
          'To convert floating point precision to integer 8-bit'
        ],
        correct: 1,
        explanation: 'Scaling prevents the dot product from exploding in variance (`Var(q·k) = d_k`), avoiding softmax saturation and vanishing gradients.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'ml_h2',
        question: 'What is the difference between Batch Normalization and Layer Normalization?',
        options: [
          'Batch Norm normalizes across the batch dimension per feature channel; Layer Norm normalizes across the feature dimension independently per sample',
          'Layer Norm requires a minimum batch size of 64',
          'Batch Norm is designed for Transformers while Layer Norm is for CNNs',
          'Layer Norm depends on running mean and variance accumulated during training'
        ],
        correct: 0,
        explanation: 'Layer Norm normalizes across all features for a single sample, making it ideal for variable-length sequences and batch size 1.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'ml_h3',
        question: 'What is the fundamental mathematical cause of Exploding Gradients in Recurrent Neural Networks (RNNs)?',
        options: [
          'Activation functions producing negative numbers',
          'Repeated multiplication of the hidden-to-hidden transition weight matrix `W_hh` whose largest singular value exceeds 1.0 across time steps',
          'Loss functions without upper bounds',
          'Softmax normalization errors'
        ],
        correct: 1,
        explanation: 'When backpropagating through long sequences, gradients scale with `(W_hh)^T`. If eigenvalues > 1, gradients explode exponentially.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'ml_h4',
        question: 'How does Adam optimizer adaptively update weights compared to standard SGD with momentum?',
        options: [
          'Maintains exponentially decaying moving averages of both past gradients (1st moment) and squared gradients (2nd moment) with bias correction',
          'Computes exact second-order Hessian matrix inversions',
          'Switches between L1 and L2 penalty at every epoch',
          'Randomly samples learning rates from a Gaussian prior'
        ],
        correct: 0,
        explanation: 'Adam combines momentum (first moment of gradients) and RMSprop (second raw moment of squared gradients) with initialization bias corrections.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'ml_h5',
        question: 'What is the Karush-Kuhn-Tucker (KKT) dual formulation condition utilized in Support Vector Machines?',
        options: [
          'Forces all training points to lie on the hyperplane',
          'Expresses the optimal margin separation purely in terms of inner products between support vectors and Lagrange multipliers',
          'Enforces zero misclassification on non-separable datasets',
          'Calculates cross-entropy loss analytically'
        ],
        correct: 1,
        explanation: 'The KKT dual problem depends solely on inner products `<x_i, x_j>`, enabling the Kernel trick for infinite-dimensional non-linear mapping.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      }
    ]
  },

  SQL: {
    easy: [
      {
        id: 'sql_e1',
        question: 'Which SQL clause is used to filter records before any grouping occurs?',
        options: ['HAVING', 'WHERE', 'ORDER BY', 'GROUP BY'],
        correct: 1,
        explanation: '`WHERE` filters individual rows before aggregation, while `HAVING` filters aggregated groups.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'sql_e2',
        question: 'Which statement removes all rows from a table without logging individual row deletions?',
        options: ['DELETE FROM', 'DROP TABLE', 'TRUNCATE TABLE', 'REMOVE TABLE'],
        correct: 2,
        explanation: '`TRUNCATE` is a DDL command that deallocates data pages rapidly without per-row logging.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'sql_e3',
        question: 'Which keyword guarantees that duplicate rows are eliminated from a SELECT query result?',
        options: ['UNIQUE', 'DISTINCT', 'DIFFERENT', 'GROUP'],
        correct: 1,
        explanation: '`SELECT DISTINCT` returns only unique records by discarding duplicates.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'sql_e4',
        question: 'What is the default sort order of the `ORDER BY` clause in SQL?',
        options: ['DESC (Descending)', 'ASC (Ascending)', 'Random', 'Natural Key'],
        correct: 1,
        explanation: 'By default, `ORDER BY` sorts values in ascending (`ASC`) order.',
        difficulty: 'easy',
        targetTimeSeconds: 30
      },
      {
        id: 'sql_e5',
        question: 'Which JOIN returns all records from the left table and matched records from the right table?',
        options: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN'],
        correct: 1,
        explanation: '`LEFT JOIN` returns all rows from the left table and matched rows from the right table (with NULLs for unmatched).',
        difficulty: 'easy',
        targetTimeSeconds: 30
      }
    ],
    intermediate: [
      {
        id: 'sql_i1',
        question: 'What is the primary purpose of a database Index (such as a B-Tree)?',
        options: [
          'Enforces encryption on storage disks',
          'Accelerates row lookups and range scans from O(N) sequential scans to O(log N)',
          'Compresses table data by 80%',
          'Prevents concurrent table updates'
        ],
        correct: 1,
        explanation: 'Indexes provide sorted search trees to accelerate record retrieval without full table scans.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'sql_i2',
        question: 'What is the difference between `UNION` and `UNION ALL` in SQL?',
        options: [
          '`UNION` executes a distinct sort to eliminate duplicates; `UNION ALL` preserves duplicates and is faster',
          '`UNION ALL` only works on numeric columns',
          '`UNION` works on tables from different databases; `UNION ALL` does not',
          '`UNION ALL` creates a temporary table on disk'
        ],
        correct: 0,
        explanation: '`UNION` de-duplicates rows via internal sorting/hashing; `UNION ALL` concatenates directly with lower overhead.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'sql_i3',
        question: 'What does a SQL Window Function like `ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC)` do?',
        options: [
          'Aggregates rows and collapses them into a single summary row per department',
          'Computes sequential ranks within each department partition while preserving individual row identity',
          'Filters out employees with zero salary',
          'Creates a materialized view on disk'
        ],
        correct: 1,
        explanation: 'Window functions perform calculations across related row sets without collapsing them into a single row like `GROUP BY`.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'sql_i4',
        question: 'What is an ACID transaction in relational databases?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Asynchronous, Concurrent, Indexed, Distributed',
          'Active, Clustered, Integrated, Dynamic',
          'Authentication, Cryptography, Integrity, Decryption'
        ],
        correct: 0,
        explanation: 'ACID guarantees database reliability: Atomicity (all-or-nothing), Consistency, Isolation, and Durability (persistence).',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      },
      {
        id: 'sql_i5',
        question: 'What is a Foreign Key constraint?',
        options: [
          'An index on a remote database server',
          'A field that uniquely identifies a row in another table, enforcing referential integrity',
          'A password hash stored in the schema',
          'A column that accepts only encrypted values'
        ],
        correct: 1,
        explanation: 'Foreign keys link data between tables to prevent invalid data insertion that violates relational constraints.',
        difficulty: 'intermediate',
        targetTimeSeconds: 45
      }
    ],
    hard: [
      {
        id: 'sql_h1',
        question: 'Under the standard SQL-92 isolation level `REPEATABLE READ`, which concurrency anomaly can still occur?',
        options: [
          'Dirty Read (reading uncommitted data)',
          'Non-Repeatable Read (re-reading modified row values)',
          'Phantom Read (concurrent transactions inserting new qualifying rows into a scanned range)',
          'Write Skew in all implementations'
        ],
        correct: 2,
        explanation: 'Standard Repeatable Read prevents dirty and non-repeatable reads, but may allow phantom inserts unless range/predicate locks are used.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'sql_h2',
        question: 'How does Multi-Version Concurrency Control (MVCC) enable high-throughput readers and writers simultaneously?',
        options: [
          'Writers acquire global table locks while readers read from cache',
          'Readers never block writers and writers never block readers by maintaining multiple row snapshots with transaction visibility timestamps',
          'Converts all tables into in-memory key-value maps',
          'Executes queries in single-threaded deterministic sequence'
        ],
        correct: 1,
        explanation: 'MVCC tags rows with `xmin`/`xmax` transaction IDs so transactions observe consistent historical snapshots without locking read queries.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'sql_h3',
        question: 'What is the architectural difference between a Clustered Index and a Non-Clustered (Secondary) Index?',
        options: [
          'Clustered indexes dictate the physical on-disk leaf storage order of actual table rows; Non-clustered indexes contain pointers to the clustered key or tuple ID',
          'A table can have unlimited clustered indexes',
          'Clustered indexes only support integer primary keys',
          'Non-clustered indexes cannot be used for sorting'
        ],
        correct: 0,
        explanation: 'A table can only have one clustered index because leaf nodes are the physical table data pages.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'sql_h4',
        question: 'What causes Write-Ahead Logging (WAL) in PostgreSQL / SQLite to guarantee Durability?',
        options: [
          'Changes are serialized to memory-mapped buffers only',
          'Transaction modifications must be flushed sequentially to append-only WAL disk log before buffer pool pages are marked committed',
          'Backups are dispatched across 3 availability zones',
          'Replaces disk writes with network RPCs'
        ],
        correct: 1,
        explanation: 'WAL ensures that changes are committed to sequential log storage on disk before table heap pages are lazily flushed, enabling crash recovery.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      },
      {
        id: 'sql_h5',
        question: 'In query execution engines, when does an Optimizer choose a Hash Join over a Nested Loop Join?',
        options: [
          'When one or both tables are very small and indexed',
          'When joining large unsorted tables without indexes on join predicates, hashing the smaller build table in memory for O(1) probe lookups',
          'Only when joining identical tables',
          'When sorting is required by an ORDER BY clause'
        ],
        correct: 1,
        explanation: 'Hash Join builds an in-memory hash table on the smaller relation and probes it with the larger relation, avoiding expensive O(N*M) nested loops.',
        difficulty: 'hard',
        targetTimeSeconds: 60
      }
    ]
  }
};

/**
 * Procedural Fallback Generator for any custom entered skill
 */
export function generateQuestionsForCustomSkill(skillName: string, difficulty: 'easy' | 'intermediate' | 'hard'): AssessmentQuestion[] {
  const norm = skillName.trim();
  const timeLimit = difficulty === 'easy' ? 30 : difficulty === 'intermediate' ? 45 : 60;

  if (difficulty === 'easy') {
    return [
      {
        id: `${norm}_e1`,
        question: `What is the core purpose and foundational philosophy of ${norm}?`,
        options: [
          `Provides a standardized, modular paradigm for software development and reliability in ${norm}`,
          `Acts as an operating system kernel driver`,
          `Replaces hardware network switches with software protocols`,
          `Is solely an offline database file format`
        ],
        correct: 0,
        explanation: `${norm} is built to standardize application architecture, maintainability, and reliable runtime execution.`,
        difficulty: 'easy',
        targetTimeSeconds: timeLimit
      },
      {
        id: `${norm}_e2`,
        question: `Which fundamental principle is recommended as a best practice when writing code in ${norm}?`,
        options: [
          `Disregarding exception handling to maximize CPU execution speed`,
          `Modularity, strict error handling, and clear separation of concerns`,
          `Hardcoding production credentials in source code`,
          `Writing all logic in a single top-level file`
        ],
        correct: 1,
        explanation: `Modularity and clear separation of concerns ensure long-term maintainability and testability in ${norm}.`,
        difficulty: 'easy',
        targetTimeSeconds: timeLimit
      },
      {
        id: `${norm}_e3`,
        question: `How are basic data structures and variables typically managed in ${norm}?`,
        options: [
          `Explicitly allocated through direct manual memory paging`,
          `Through standard scoped variable definitions and idiomatic collection abstractions`,
          `Compiled directly to assembly jump statements only`,
          `Statically linked into kernel registers`
        ],
        correct: 1,
        explanation: `Idiomatic collection abstractions and structured scoping form the foundation of ${norm}.`,
        difficulty: 'easy',
        targetTimeSeconds: timeLimit
      },
      {
        id: `${norm}_e4`,
        question: `What is the recommended approach for handling runtime errors and exceptions in ${norm}?`,
        options: [
          `Suppressing all error messages to prevent logs from growing`,
          `Catching specific error types, logging contextual data, and providing graceful fallbacks`,
          `Terminating the operating system immediately`,
          `Restarting the machine on any unhandled error`
        ],
        correct: 1,
        explanation: `Specific error handling and graceful fallbacks ensure resilient applications in ${norm}.`,
        difficulty: 'easy',
        targetTimeSeconds: timeLimit
      },
      {
        id: `${norm}_e5`,
        question: `Why is unit testing important when implementing features using ${norm}?`,
        options: [
          `It is required only for compiled legacy code`,
          `Verifies individual components meet design contracts and prevents regression bugs`,
          `Slows down deployments to allow manual testing`,
          `Generates binary installer packages automatically`
        ],
        correct: 1,
        explanation: `Unit testing establishes confidence in component contracts and avoids regressions across releases.`,
        difficulty: 'easy',
        targetTimeSeconds: timeLimit
      }
    ];
  }

  if (difficulty === 'intermediate') {
    return [
      {
        id: `${norm}_i1`,
        question: `How does concurrency or asynchronous execution work in ${norm}?`,
        options: [
          `Does not support any form of concurrency`,
          `Leverages event-driven non-blocking I/O or managed thread primitives with synchronization mechanisms`,
          `Executes all code strictly sequentially on a single hardware core`,
          `Spawns a separate virtual machine per function call`
        ],
        correct: 1,
        explanation: `${norm} provides event loops, coroutines, or thread-safe synchronization primitives for concurrent workloads.`,
        difficulty: 'intermediate',
        targetTimeSeconds: timeLimit
      },
      {
        id: `${norm}_i2`,
        question: `What is the most effective strategy to optimize memory usage and avoid memory leaks in ${norm}?`,
        options: [
          `Disabling garbage collection entirely`,
          `Releasing unneeded references, cleaning up event listeners, and using resource pooling`,
          `Increasing heap memory to unlimited size`,
          `Storing all data in global static variables`
        ],
        correct: 1,
        explanation: `Cleaning up long-lived references and utilizing object/connection pooling prevents heap fragmentation.`,
        difficulty: 'intermediate',
        targetTimeSeconds: timeLimit
      },
      {
        id: `${norm}_i3`,
        question: `Which architectural pattern is commonly adopted in ${norm} for scalable, testable systems?`,
        options: [
          `God Object pattern with monolithic global states`,
          `Layered / Clean Architecture with dependency injection and decoupled service interfaces`,
          `Spaghetti code with circular imports`,
          `Direct database queries embedded inside presentation components`
        ],
        correct: 1,
        explanation: `Clean Architecture and dependency injection decouple domain logic from external infrastructure.`,
        difficulty: 'intermediate',
        targetTimeSeconds: timeLimit
      },
      {
        id: `${norm}_i4`,
        question: `How should external API dependencies be managed and resiliently integrated in ${norm}?`,
        options: [
          `Unbounded blocking HTTP calls without timeouts`,
          `Circuit breakers, retries with exponential backoff, and strict timeout budgets`,
          `Assuming external services are always 100% available`,
          `Failing the entire application on the first network glitch`
        ],
        correct: 1,
        explanation: `Circuit breakers and exponential backoff prevent cascading outages across distributed services.`,
        difficulty: 'intermediate',
        targetTimeSeconds: timeLimit
      },
      {
        id: `${norm}_i5`,
        question: `What role does automated continuous integration (CI) play in ${norm} projects?`,
        options: [
          `Replaces human code reviews completely`,
          `Enforces automated linting, type-checking, test runs, and security audits before merging`,
          `Compiles binaries directly to end-user desktops`,
          `Generates marketing presentations`
        ],
        correct: 1,
        explanation: `CI pipelines enforce code quality, type correctness, and automated regression testing.`,
        difficulty: 'intermediate',
        targetTimeSeconds: timeLimit
      }
    ];
  }

  return [
    {
      id: `${norm}_h1`,
      question: `In high-throughput, low-latency environments using ${norm}, what is the primary bottleneck during CPU-bound processing?`,
      options: [
        `Disk I/O access times exclusively`,
        `Lock contention, cache line bouncing, and context switching across concurrent threads`,
        `Operating system window manager rendering overhead`,
        `Network socket buffer overflows`
      ],
      correct: 1,
      explanation: `Lock contention and thread context switching degrade performance in high-throughput CPU-bound architectures.`,
      difficulty: 'hard',
      targetTimeSeconds: timeLimit
    },
    {
      id: `${norm}_h2`,
      question: `How does ${norm} handle memory coherence and atomic memory operations under multi-core CPUs?`,
      options: [
        `All memory access is single-threaded`,
        `Through hardware memory barriers, compare-and-swap (CAS) primitives, and cache-coherence protocols`,
        `By disabling CPU L1/L2 caches`,
        `By rebooting worker nodes when race conditions occur`
      ],
      correct: 1,
      explanation: `CAS primitives and memory barriers guarantee atomic state transitions without global mutex serialization.`,
      difficulty: 'hard',
      targetTimeSeconds: timeLimit
    },
    {
      id: `${norm}_h3`,
      question: `What is the risk of unbounded in-memory queues in high-load ${norm} services, and how is it mitigated?`,
      options: [
        `Data loss mitigated by disabling queues`,
        `Out-of-memory crash mitigated by applying reactive Backpressure and bounded channel buffers`,
        `CPU underutilization mitigated by spinning threads`,
        `Compiler syntax errors`
      ],
      correct: 1,
      explanation: `Backpressure signals slow producers when consumer buffers reach capacity, preventing OutOfMemory crashes.`,
      difficulty: 'hard',
      targetTimeSeconds: timeLimit
    },
    {
      id: `${norm}_h4`,
      question: `How are zero-downtime distributed updates executed safely in ${norm} ecosystems?`,
      options: [
        `Stopping all servers simultaneously to apply updates`,
        `Canary or Blue-Green deployments with backward-compatible API contracts and schema migrations`,
        `Deleting the production database and rebuilding from seed data`,
        `Changing domain DNS records without rolling nodes`
      ],
      correct: 1,
      explanation: `Canary and rolling deployments alongside backward-compatible schemas ensure zero downtime.`,
      difficulty: 'hard',
      targetTimeSeconds: timeLimit
    },
    {
      id: `${norm}_h5`,
      question: `What profiling method is most accurate for identifying hot execution paths in production ${norm} instances?`,
      options: [
        `Adding manual print statements across all functions`,
        `Sampling-based CPU profilers and continuous distributed tracing (e.g. eBPF or flame graphs) with low overhead`,
        `Guessing based on source code line length`,
        `Checking disk space usage`
      ],
      correct: 1,
      explanation: `Low-overhead sampling profilers and flame graphs reveal CPU hotspots without distorting runtime performance.`,
      difficulty: 'hard',
      targetTimeSeconds: timeLimit
    }
  ];
}

export function getSkillQuestions(skillName: string, difficulty: 'easy' | 'intermediate' | 'hard'): AssessmentQuestion[] {
  // Find case-insensitive match in known banks
  const matchedKey = Object.keys(SKILL_QUESTION_BANKS).find(
    k => k.toLowerCase() === skillName.toLowerCase()
  );

  if (matchedKey && SKILL_QUESTION_BANKS[matchedKey][difficulty]) {
    return SKILL_QUESTION_BANKS[matchedKey][difficulty];
  }

  return generateQuestionsForCustomSkill(skillName, difficulty);
}
