import { dsaQuestions } from './dsaData';
import { systemDesignQuestions } from './systemDesignData';

export type Category = 
  | 'General Backend' 
  | 'Python & FastAPI' 
  | 'Node.js & TypeScript' 
  | 'Java & Spring Boot' 
  | 'Platform & DevOps' 
  | 'Frontend'
  | 'DSA - Arrays & Strings'
  | 'DSA - Trees & Graphs'
  | 'DSA - Dynamic Programming'
  | 'System Design'
  | 'Evolent Day 1: Software & Platform'
  | 'Evolent Day 2: Kubernetes Core'
  | 'Evolent Day 3: The CNCF Stack';

export interface Question {
  id: number;
  category: Category;
  question: string;
  answer: string;
  isPlatform?: boolean; // If true, appears in Evolent track
  tags?: string[];
}

export interface RoadmapStep {
  id: string;
  phase: string;
  title: string;
  topics: string[];
  duration: string;
  focus: string;
}

export const masterRoadmap: RoadmapStep[] = [
  {
    id: 'b1',
    phase: 'Backend Core (Week 1-2)',
    title: 'Distributed Systems & Architecture',
    duration: '14 Days',
    focus: 'Scalability & Reliability',
    topics: ['CAP Theorem & Consistency', 'Message Queues (Kafka/Rabbit)', 'Caching Strategies (Redis/Memcached)', 'API Design (REST/gRPC/GraphQL)', 'Database Internals (B-Trees vs LSM)']
  },
  {
    id: 'f1',
    phase: 'Frontend Mastery (Week 3-4)',
    title: 'Rendering & Performance',
    duration: '14 Days',
    focus: 'UX & Runtime Efficiency',
    topics: ['Hydration & Streaming', 'State Orchestration', 'Bundle Optimization', 'Core Web Vitals', 'Micro-frontends Architecture']
  },
  {
    id: 'd1',
    phase: 'DSA Grind (Week 5-8)',
    title: 'The Algorithmic Compass',
    duration: '30 Days',
    focus: 'Problem Solving Patterns',
    topics: ['Sliding Window & Two Pointers', 'Graph Traversal (DFS/BFS)', 'Dynamic Programming basics', 'System Design Interviews', 'Concurrency Patterns']
  }
];

export interface Tutorial {
  id: number;
  title: string;
  provider: string;
  duration: string;
  url: string;
  tags: string[];
}

export const tutorials: Tutorial[] = [
  {
    id: 1,
    title: "Kubernetes Tutorial for Beginners [FULL COURSE]",
    provider: "TechWorld with Nana",
    duration: "3:30:00",
    url: "https://www.youtube.com/watch?v=X48VuDVv0do",
    tags: ["Kubernetes", "DevOps", "Containers"]
  },
  {
    id: 2,
    title: "FastAPI Full Course - Python Framework for Modern APIs",
    provider: "freeCodeCamp",
    duration: "19:00:00",
    url: "https://www.youtube.com/watch?v=0sOvCWFmrtA",
    tags: ["FastAPI", "Python", "Backend"]
  },
  {
    id: 3,
    title: "React Course - Beginner to Advanced",
    provider: "Codevolution",
    duration: "10:00:00",
    url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
    tags: ["React", "Frontend", "JavaScript"]
  },
  {
    id: 4,
    title: "Next.js 14 Full Course 2024",
    provider: "JavaScript Mastery",
    duration: "6:00:00",
    url: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
    tags: ["Next.js", "Frontend", "Fullstack"]
  },
  {
    id: 5,
    title: "Angular Full Course - Learn Angular in 5 Hours",
    provider: "SimpliLearn",
    duration: "5:00:00",
    url: "https://www.youtube.com/watch?v=3qBXWUpoPHo",
    tags: ["Angular", "Frontend", "TypeScript"]
  },
  {
    id: 6,
    title: "Terraform Full Course for Beginners",
    provider: "TechWorld with Nana",
    duration: "2:15:00",
    url: "https://www.youtube.com/watch?v=SLB_c_ayRmc",
    tags: ["Terraform", "Infrastructure", "Azure"]
  },
  {
    id: 7,
    title: "System Design Interview Course",
    provider: "Exponent",
    duration: "4:00:00",
    url: "https://www.youtube.com/watch?v=f9ge2uG_o5s",
    tags: ["System Design", "Architecture", "Backend"]
  }
];

export const questions: Question[] = [
...systemDesignQuestions,

  // --- Section 1: General Backend & System Design ---
  {
    id: 1,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you version a REST API?",
    answer:      "### What is the N+1 query problem and how do you fix it?\n\nThe N+1 query problem is a massive performance bottleneck common in ORMs (Object-Relational Mappers).\n\n#### Scenario:\nImagine fetching a list of 100 `Authors` and their associated `Books`.\n1. The ORM runs **1 query** to fetch the 100 Authors.\n2. The code iterates through each Author to render their books. \n3. The ORM lazily evaluates this and fires **100 additional queries** (one for each author's books, hence N+1).\n\n#### How to fix it:\n1. **Eager Fetching:** Instruct the ORM to load relationships upfront using SQL `JOIN`s. \n   - Hibernate/JPA: `JOIN FETCH`\n   - Django: `select_related()` or `prefetch_related()`\n   - Entity Framework: `.Include()`\n2. **Batch Loading (GraphQL Dataloader):** In GraphQL APIs, N+1 is very common. Tools like `DataLoader` batch all the foreign keys requested in the current tick into a single `WHERE id IN (...)` query."
  },
  {
    id: 2,
    category: 'General Backend',
    isPlatform: true,
    question: "What is the difference between PUT and PATCH?",
    answer: "PUT replaces the entire resource. PATCH applies partial updates. If a developer only wants to update a Kubernetes cluster name without touching other metadata, I'd expose a PATCH endpoint."
  },
  {
    id: 3,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you handle API rate limiting?",
    answer:  "### How do you handle API rate limiting?\n\nRate limiting is crucial for protecting APIs from abuse (DDoS) and controlling costs.\n\n#### Common Algorithms:\n1. **Token Bucket:** Tokens are added to a bucket at a fixed rate. Each request consumes one token. If empty, the request is dropped. Good for allowing short spikes.\n2. **Leaky Bucket:** Requests enter a queue. They are processed at a fixed, constant rate. Smooths out traffic spikes completely.\n3. **Fixed Window:** Uses a given timeframe (e.g., 0-59 seconds). If limit hits, wait till the next minute. Prone to spikes at the edges of the window.\n4. **Sliding Window Log/Counter:** A hybrid that fixes the edge-spike issue of fixed windows by keeping a rolling count.\n\n#### Implementation:\n- **Redis:** Usually, we use Redis for distributed rate limiting. An API gateway (like Kong or NGINX) checks the user's IP or API key against a Redis counter with a TTL.\n- **Headers:** Always return standard HTTP headers:\n  - `X-RateLimit-Limit`: Total allowed requests.\n  - `X-RateLimit-Remaining`: Remaining requests in current window.\n  - `X-RateLimit-Reset`: Time when the limit resets.\n- **HTTP Code:** Return `429 Too Many Requests` when the limit is breached."
  },
  {
    id: 4,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you handle distributed transactions across microservices?",
    answer:  "### How do you handle distributed transactions across microservices?\n\nDistributed transactions are challenging because of the CAP theorem and the lack of a central coordinator. \n\n#### Why avoid 2-Phase Commit (2PC)?\n- **Blocking:** During the prepare phase, locks are held across databases. If the coordinator goes down, resources stay locked. \n- **Scalability:** It scales extremely poorly in high-throughput microservice architectures.\n\n#### The Saga Pattern\nInstead of ACID, we rely on **BASE** (Basically Available, Soft state, Eventual consistency). A Saga is a sequence of local transactions.\n\n1. **Choreography (Event-Driven):** Each service publishes domain events upon success. Downstream services listen to these events and perform their local transactions.\n2. **Orchestration (Command-Driven):** A central orchestrator (like AWS Step Functions or Netflix Conductor) tells participating services what to explicitly do.\n\n#### Compensating Transactions\nIf a step in the Saga fails, we cannot simply `ROLLBACK`. We must explicitly execute a **compensating transaction** to undo the structural changes of the previous steps (e.g., if step 1 deducted money and step 2 failed, we publish an event to execute step 1's compensation: refund the money)."
  },
  {
    id: 5,
    category: 'General Backend',
    isPlatform: true,
    question: "What is idempotency and why is it crucial in platform engineering?",
    answer:  "### What is idempotency and why is it crucial in platform engineering?\n\n**Definition:** \nAn API is idempotent if making the same request multiple times produces the identical side effect as making it a single time.\nHTTP methods like `GET`, `PUT`, and `DELETE` are defined to be idempotent by the spec, while `POST` is not.\n\n#### Why it's critical:\nNetwork calls are flaky. A client sends a \"Create Kubernetes Cluster\" (`POST`) request. The server successfully creates it, but the network drops the `201 Created` response. The client assumes failure and retries the `POST`. Without idempotency, they just spun up two expensive clusters.\n\n#### How to implement it:\n1. **Idempotency Key:** The client generates a unique UUID (e.g., `Idempotency-Key: 1234-abcd`) and sends it with the request.\n2. **Key Storage:** The server checks an Idempotency Store (Redis or a DB table).\n   - If the key exists and request is in progress: Wait and return the same response.\n   - If the key exists and is completed: Immediately serve the cached response payload.\n   - If the key does not exist: Save the key and execute the operation safely."
  },
  {
    id: 6,
    category: 'General Backend',
    isPlatform: true,
    question: "What is the N+1 query problem and how do you fix it?",
    answer:  "### What is the N+1 query problem and how do you fix it?\n\nThe N+1 query problem is a massive performance bottleneck common in ORMs (Object-Relational Mappers).\n\n#### Scenario:\nImagine fetching a list of 100 `Authors` and their associated `Books`.\n1. The ORM runs **1 query** to fetch the 100 Authors.\n2. The code iterates through each Author to render their books. \n3. The ORM lazily evaluates this and fires **100 additional queries** (one for each author's books, hence N+1).\n\n#### How to fix it:\n1. **Eager Fetching:** Instruct the ORM to load relationships upfront using SQL `JOIN`s. \n   - Hibernate/JPA: `JOIN FETCH`\n   - Django: `select_related()` or `prefetch_related()`\n   - Entity Framework: `.Include()`\n2. **Batch Loading (GraphQL Dataloader):** In GraphQL APIs, N+1 is very common. Tools like `DataLoader` batch all the foreign keys requested in the current tick into a single `WHERE id IN (...)` query."
  },
  {
    id: 7,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you secure PII (Personally Identifiable Information) in a backend system?",
    answer: "I use encryption at rest (AWS KMS/Azure Key Vault) and encryption in transit (TLS). I also implement field-level encryption for sensitive data like emails and use 'Split Collection' or 'Column Masking' strategies to restrict access."
  },
  {
    id: 8,
    category: 'General Backend',
    isPlatform: true,
    question: "Explain the concept of 'Circuit Breaking' in microservices.",
    answer: "It's a pattern to prevent cascading failures. If a downstream service is failing, the circuit 'opens' and subsequent calls fail fast without waiting for timeouts, allowing the failing service to recover. Tools like Resilience4j or Istio handle this."
  },
  {
    id: 9,
    category: 'General Backend',
    isPlatform: true,
    question: "What is the difference between SQL and NoSQL?",
    answer: "SQL is relational, has a strict schema, and is better for complex queries and ACID compliance. NoSQL is non-relational, flexible schema, and scales horizontally more easily. I choose based on the data structure and access patterns."
  },
  {
    id: 10,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you handle zero-downtime database migrations?",
    answer: "Using a 'Expand and Contract' pattern: 1) Add new column/table, 2) Dual write to both old and new, 3) Migrate old data, 4) Update code to read from new, 5) Remove old storage. Tools like Flyway or Liquibase help automate this."
  },

  // --- Section 2: Python & FastAPI ---
  {
    id: 21,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "Why use FastAPI over Flask or Django?",
    answer: "FastAPI is built on standard Python type hints, natively supports async/await, auto-generates Swagger/OpenAPI docs, and is exceptionally fast because it runs on ASGI (Starlette/Uvicorn)."
  },
  {
    id: 22,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What is Pydantic and how is it used in FastAPI?",
    answer: "Pydantic is used for data validation and serialization. You define request/response schemas as Python classes. It automatically converts types, validates input, and provides clear error messages for invalid data."
  },
  {
    id: 23,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "Explain 'async def' vs 'def' in FastAPI routes.",
    answer: "Use 'async def' for I/O bound tasks (API calls, DB queries) to allow the event loop to handle other requests while waiting. Use plain 'def' for CPU-bound tasks; FastAPI will run these in a separate thread pool to avoid blocking the main loop."
  },
  {
    id: 24,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "How do you handle Global Exceptions in FastAPI?",
    answer: "By registering an exception handler using @app.exception_handler(). I catch custom exceptions and return a standardized JSON error response structure to maintain consistency."
  },
  {
    id: 25,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What is the use of Dependency Injection in FastAPI?",
    answer: "Using the 'Depends' keyword. It's great for reusing logic like database sessions, authentication (extracting JWT), or common parameter validation across multiple routes."
  },
  {
    id: 26,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "How do you manage database connections efficiently in Python?",
    answer: "Using connection pooling (like SQLAlchemy's QueuePool). I ensure that sessions are created and closed properly, usually using a Context Manager or a FastAPI dependency with 'yield' to ensure cleanup."
  },

  // --- Section 3: Node.js & TypeScript ---
  {
    id: 41,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain the Node.js Event Loop.",
    answer: "Node.js is single-threaded but non-blocking. The event loop offloads I/O operations to the OS kernel (via libuv). When I/O finishes, a callback is placed in the queue, and the event loop executes it when the call stack is empty."
  },
  {
    id: 42,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What are the advantages of TypeScript over JavaScript?",
    answer: "Static typing, better IDE support (Intellisense), and catching errors at compile-time. It's essential for large-scale platform codebases like Backstage where many developers contribute."
  },
  {
    id: 43,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "How do you handle memory leaks in a Node.js process?",
    answer: "Avoid global variables, unclosed event listeners, and huge closures. I use the V8 profiler or 'heap snapshots' to detect leaks. In K8s, I monitor 'OOMKilled' events which often indicate memory issues."
  },
  {
    id: 44,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What is the difference between Interfaces and Types in TS?",
    answer: "Interfaces can be 'merged' (declaration merging) and are generally better for defining object shapes. Types are more flexible, allowing Union, Intersection, and Tuple types which Interfaces cannot do."
  },
  {
    id: 45,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain 'Promise.all' vs 'Promise.settleAll'.",
    answer: "Promise.all fails fast if any promise rejects. Promise.settleAll waits for all promises to finish (either resolved or rejected) and returns an array of results, which is useful when you want to continue despite partial failures."
  },

  // --- Section 4: Java & Spring Boot ---
  {
    id: 61,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is Dependency Injection (DI) in Spring?",
    answer: "Spring manages the lifecycle of objects (Beans) and injects them where needed. I prefer Constructor Injection because it makes the code immutable and easier to unit test without needing the full Spring Context."
  },
  {
    id: 62,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "Explain @RestController vs @Controller.",
    answer: "@RestController is a convenience annotation that combines @Controller and @ResponseBody. It tells Spring that every method returns data (JSON) directly instead of a view/template."
  },
  {
    id: 63,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is Spring Boot Actuator?",
    answer: "It provides built-in endpoints for monitoring and managing your application. I use it for /health and /metrics endpoints, which are essential for Kubernetes and Prometheus monitoring."
  },
  {
    id: 64,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "How do you handle Global Exceptions in Spring Boot?",
    answer: "Using @ControllerAdvice and @ExceptionHandler. It allows me to catch any exception thrown by a controller and return a standardized JSON error response to the client."
  },
  {
    id: 65,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is the difference between Spring MVC and Spring WebFlux?",
    answer: "Spring MVC is synchronous/blocking (one thread per request). Spring WebFlux is non-blocking/reactive (using Netty), which allows handling a high number of concurrent connections with minimal threads."
  },

  // --- Section 5: Platform & DevOps (JD Specific) ---
  {
    id: 81,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is Backstage and why did Spotify build it?",
    answer: "Backstage is an Internal Developer Platform (IDP) framework. It provides a 'Software Catalog' to unify resources and 'Software Templates' to create 'Golden Paths', reducing developer cognitive load and fragmentation."
  },
  {
    id: 82,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "Explain the difference between Taint and Toleration in Kubernetes.",
    answer: "A Taint is applied to a Node to repel certain pods. A Toleration is applied to a Pod to allow it to be scheduled on a tainted node. This is used for node isolation (e.g., keeping monitoring pods on specific nodes)."
  },
  {
    id: 83,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "How does ArgoCD implement GitOps?",
    answer: "ArgoCD follows a 'pull' model. It lives in the cluster and monitors a Git repo for changes in manifests. When Git changes, ArgoCD automatically 'syncs' the cluster to match the Git state, preventing configuration drift."
  },
  {
    id: 84,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is KEDA and why use it over standard HPA?",
    answer: "KEDA (Kubernetes Event-driven Autoscaling) allows scaling based on external events (e.g., Azure Service Bus queue length) rather than just CPU/Memory. It can also scale pods down to zero, which standard HPA cannot."
  },
  {
    id: 85,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "How do you structure Terraform code for multiple environments?",
    answer: "I use Terraform Modules for reusable components and either Workspaces or separate directory structures (e.g., envs/prod, envs/dev) to pass different variables to the same modules while sharing the same logic."
  },
  {
    id: 86,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is Kyverno?",
    answer: "Kyverno is a policy engine for Kubernetes. It allows you to define policies as K8s resources to validate, mutate, and generate configurations. For example, I can enforce that all pods must have resource limits defined."
  },
  {
    id: 87,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "Explain the difference between AKS and Azure Container Apps (ACA).",
    answer: "AKS is fully managed Kubernetes providing deep control over the cluster. ACA is a serverless container platform built on KEDA and Dapr, better for teams who want to run containers without managing the underlying K8s infrastructure."
  },
  {
    id: 11,
    category: 'General Backend',
    isPlatform: true,
    question: "What is an API Gateway and what problems does it solve?",
    answer: "An API Gateway acts as a single entry point for all clients. It handles cross-cutting concerns like SSL termination, rate limiting, authentication, request routing, and protocol translation (e.g., REST to gRPC)."
  },
  {
    id: 12,
    category: 'General Backend',
    isPlatform: true,
    question: "Explain the 'Database per Service' pattern.",
    answer: "Each microservice has its own private data store. This ensures loose coupling and allows services to choose the DB best suited for their needs (e.g., Neo4j for a graph, Postgres for relational), but it makes cross-service reporting harder."
  },
  {
    id: 13,
    category: 'General Backend',
    isPlatform: true,
    question: "What is Eventual Consistency?",
    answer: "In distributed systems, eventual consistency means that after an update, all replicas will eventually see the same data, but not necessarily immediately. This is commonly used in NoSQL databases to provide higher availability."
  },
  {
    id: 14,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you handle high-volume write operations?",
    answer: "I use 'Write-Behind Caching' or 'Buffer and Batch'. Instead of writing to the DB on every request, I push events to a queue (like SQS/Kafka) and have a worker batch-process them into the database."
  },
  {
    id: 15,
    category: 'General Backend',
    isPlatform: true,
    question: "What is the differences between monorepo and polyrepo?",
    answer: "Monorepo stores all microservices in one Git repo (common for IDPs like Backstage). Polyrepo gives each service its own. Monorepo simplifies cross-service refactoring and dependency management but can lead to huge CI build times."
  },
  {
    id: 16,
    category: 'General Backend',
    isPlatform: true,
    question: "Explain the CAP theorem.",
    answer: "Consistency, Availability, Partition Tolerance. A distributed system can only provide 2 out of 3. In platform infra, we often prioritize Partition Tolerance and Availability (AP) with eventual consistency."
  },
  {
    id: 27,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What is a python virtual environment?",
    answer: "A tool to create an isolated environment for Python projects. It ensures that dependencies for project A don't conflict with project B. Tools like venv, poetry, or conda are used."
  },
  {
    id: 28,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "Explain the difference between 'list' and 'tuple' in Python.",
    answer: "Lists are mutable (can change), tuples are immutable (fixed size, cannot change). Tuples are faster and used for data that shouldn't change, like configuration coordinates."
  },
  {
    id: 29,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "How do you handle long-running tasks in a Python backend?",
    answer: "I use Celery with Redis or RabbitMQ. The API returns a 'task_id', and Celery workers process the job in the background. I use Flower to monitor the task status."
  },
  {
    id: 30,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What is Type Hinting in Python 3.5+?",
    answer: "It allows you to explicitly state the type of variables and function arguments. FastAPI uses this to auto-generate docs and validate types at the entry point."
  },
  {
    id: 31,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What are decorators in Python and give a real use case.",
    answer: "A function that wraps another function. Real use case: a @logging decorator that logs the input/output of every API call, or an @auth_required decorator."
  },
  {
    id: 46,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain Npm vs Yarn vs Pnpm.",
    answer: "Npm is the default. Yarn is faster and has better lock-files. Pnpm is extremely disk-efficient because it uses content-addressable storage (hard links), which is great for CI environments."
  },
  {
    id: 47,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What is the 'fs' module in Node.js?",
    answer: "The 'File System' module used to interact with the server's disk. In a platform tool, I use it to read K8s config files or scan directories for service metadata."
  },
  {
    id: 48,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain Error First Callbacks.",
    answer: "A legacy Node convention where the first argument of a callback is the error object. If null, the operation succeeded. Modern Node uses async/await, but you still see this in older libraries."
  },
  {
    id: 49,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What is 'strict mode' in TypeScript?",
    answer: "A compiler flag that enables stricter type checking (like noImplicitAny, strictNullChecks). I always keep it on to prevent 'undefined is not a function' errors."
  },
  {
    id: 50,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "How do you secure a Node.js API?",
    answer: "Helmet (security headers), rate-limiting (express-rate-limit), CORS configuration, and ensuring all dependencies are scanned for vulnerabilities (npm audit)."
  },
  {
    id: 66,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is Maven and how does it manage dependencies?",
    answer:  "### Explain the difference between a Deployment and a StatefulSet.\n\n```mermaid\ngraph LR\n  subgraph Deployment\n    Pod1[Pod hash-12f]\n    Pod2[Pod hash-59b]\n  end\n\n  subgraph StatefulSet\n    Pod0[Pod-0]\n    Pod1[Pod-1]\n  end\n```\n\nBoth manage the deployment of pods, but they have completely different assumptions about the workload.\n\n#### Deployments (Stateless Workloads):\n- **Identity:** Pods get random hashes (e.g., `web-5cd89d`). They are completely interchangeable.\n- **Ordering:** Pods are started, stopped, and scaled in parallel.\n- **Storage:** If a pod dies, any new pod gets a fresh volume or doesn't care about storage.\n- **Use Cases:** Web servers, frontend APIs, background workers.\n\n#### StatefulSets (Stateful Workloads):\n- **Identity:** Pods get sticky, unique, ordered network identities (e.g., `db-0`, `db-1`, `db-2`). \n- **Ordering:** They are scaled up sequentially (db-0, then db-1) and scaled down in reverse (db-2, then db-1).\n- **Storage:** They use VolumeClaimTemplates. If `db-0` is deleted and recreated, it re-attaches to the exact same PersistentVolume.\n- **Use Cases:** Databases (MySQL, PostgreSQL), message queues (Kafka, RabbitMQ), or caching clusters (Redis)."
  },
  {
    id: 67,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "Explain JPA Repository vs Crud Repository.",
    answer: "JPARepository extends PagingAndSortingRepository, which extends CrudRepository. JPARepository adds JPA-specific methods like flushing the persistence context."
  },
  {
    id: 68,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is the '@Value' annotation in Spring?",
    answer: "It's used to inject values from properties files into Java variables. Example: @Value('${app.name}') private String appName;"
  },
  {
    id: 69,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "How do you configure Spring Boot for different environments (Dev vs Prod)?",
    answer: "Using Spring Profiles. I create application-dev.properties and application-prod.properties and activate them via the 'spring.profiles.active' env var."
  },
  {
    id: 70,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is the difference between Spring Boot and Spring Framework?",
    answer: "Spring Framework is the core toolset. Spring Boot is an 'opinionated' layer on top that provides auto-configuration, embedded servers (Tomcat), and starters to get running instantly."
  },
  {
    id: 88,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "Explain the lifecycle of a request in Kubernetes.",
    answer: "User -> Ingress Controller (Nginx/Traefik) -> Ingress Rule -> Service (ClusterIP) -> Pod (container). Ingress handles SSL/Routing; Service handles internal load balancing."
  },
  {
    id: 89,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is a 'Sidecar' container?",
    answer: "An extra container running in the same Pod as the application. Common uses: Envoy proxy (Service Mesh), Log shipping (Fluentd), or Secret syncing (Vault)."
  },
  {
    id: 90,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "How do you manage Kubernetes secrets securely?",
    answer: "Plain K8s secrets are only base64 encoded. I prefer using Azure Key Vault with Secret Store CSI Driver, or HashiCorp Vault, to inject secrets into pods at runtime securely."
  },
  {
    id: 91,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is 'Configuration Drift' and how to prevent it?",
    answer: "When the live infrastructure differs from the IaC code (manual changes). I prevent it by using GitOps (ArgoCD) for K8s and 'Terraform Cloud/Atlantis' for infra, with frequent 'plan' runs."
  },
  {
    id: 92,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "Explain the 12-factor app methodology.",
    answer: "A set of best practices for building cloud-native apps. Key points: Codebase in Git, Explicit dependencies, Config in Environment, Backing services as attached resources, Stateless processes."
  },
  {
    id: 93,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is a Helm Chart?",
    answer: "A package manager for Kubernetes. It allows you to template manifest files (YAML) and manage complex deployments with variables (values.yaml), making apps reusable."
  },
  {
    id: 94,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "How do you handle multi-tenancy in Kubernetes?",
    answer: "Using Namespaces to isolate resources, Network Policies to restrict traffic between namespaces, and Resource Quotas to prevent one team from hogging all CPU/Memory."
  },
  {
    id: 95,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is the difference between horizontal and vertical scaling?",
    answer: "Horizontal (HPA): adding more pods/instances. Vertical (VPA): adding more CPU/RAM to existing pods. Horizontal is generally preferred for stateless apps."
  },
  {
    id: 17,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you handle API Authentication vs Authorization?",
    answer: "Authentication is verifying WHO you are (e.g., login, API keys). Authorization is verifying WHAT you can do (e.g., RBAC, scopes). I use JWT for auth and a nested policy engine or DB check for authorization."
  },
  {
    id: 18,
    category: 'General Backend',
    isPlatform: true,
    question: "What is GZIP compression and why use it for APIs?",
    answer: "It's a way to compress JSON payloads before sending them over the network. It reduces bandwidth usage and latency, especially for large lists of data. Most modern servers/browsers support it via 'Content-Encoding: gzip'."
  },
  {
    id: 19,
    category: 'General Backend',
    isPlatform: true,
    question: "Explain the concept of 'Graceful Shutdown'.",
    answer: "When a process is told to stop (SIGTERM), it should stop accepting new requests, finish pending ones, close database connections, and then exit. This prevents data loss and 502 errors during deployments."
  },
  {
    id: 20,
    category: 'General Backend',
    isPlatform: true,
    question: "What is an IDP (Internal Developer Platform)?",
    answer: "A layer on top of infrastructure that provides self-service capabilities for developers. It abstracts complex cloud tools so devs can focus on code, not YAML."
  },
  {
    id: 32,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "Explain Python's 'Global Interpreter Lock' (GIL).",
    answer: "A mutex that allows only one thread to hold the control of the Python interpreter. This means Python cannot truly run multiple threads in parallel for CPU-bound tasks, making 'multiprocessing' necessary for raw performance."
  },
  {
    id: 33,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What are 'list comprehensions' and why are they used?",
    answer: "A concise way to create lists. Example: [x*x for x in range(10)]. They are more readable and often faster than traditional for-loops."
  },
  {
    id: 34,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "How do you handle JSON serialization in Python?",
    answer: "FastAPI uses Pydantic or the standard 'json' library. Pydantic is preferred because it handles complex types like Datetime and UUID automatically."
  },
  {
    id: 35,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What is 'Pip'?",
    answer: "The package installer for Python. It installs libraries from the Python Package Index (PyPI). Modern teams use 'Poetry' or 'Pipenv' for better dependency management."
  },
  {
    id: 51,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain the difference between 'Var', 'Let', and 'Const'.",
    answer: "'Var' is function-scoped and hoisted. 'Let' is block-scoped. 'Const' is block-scoped and immutable (cannot be reassigned). Use 'Const' by default."
  },
  {
    id: 52,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What is 'transpilation' in the context of TypeScript?",
    answer: "The process of converting TypeScript code into JavaScript so it can be executed by Node.js or a browser. The 'tsc' compiler handles this."
  },
  {
    id: 53,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain 'Arrow Functions' and how they handle 'this'.",
    answer: "Arrow functions (=>) don't have their own 'this' context; they inherit it from the surrounding scope. This avoids many bugs common in traditional function declarations."
  },
  {
    id: 54,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What is 'Middleware' in Express.js?",
    answer: "Functions that have access to the request object (req), response object (res), and the next middleware function. They can modify requests, perform logging, or end the response cycle."
  },
  {
    id: 55,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "How do you implement unit tests in Node.js?",
    answer: "I use Jest or Vitest. They provide a test runner, assertion library, and mocking capabilities. I write tests for logic units in isolation from external services."
  },
  {
    id: 71,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is a 'Spring Bean'?",
    answer: "An object that is instantiated, assembled, and managed by the Spring IoC container. You define them using @Component or @Bean annotations."
  },
  {
    id: 72,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "Explain the difference between 'JDK' and 'JRE'.",
    answer: "JDK (Java Development Kit) is used to DEVELOP Java apps. JRE (Java Runtime Environment) is only for RUNNING them. Developers need the JDK."
  },
  {
    id: 73,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is 'Spring Cloud'?",
    answer: "A suite of tools for building distributed systems (microservices). It includes tools for service discovery, configuration management, and intelligent routing."
  },
  {
    id: 74,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "How does Spring Boot handle JSON by default?",
    answer: "It uses the Jackson library to automatically serialize and deserialize Java objects to/from JSON."
  },
  {
    id: 75,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is the 'pom.xml' file?",
    answer: "The Project Object Model file for Maven. It contains configuration for the project, including dependencies, build plugins, and versioning."
  },
  {
    id: 96,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is a 'Liveness Probe' vs 'Readiness Probe'?",
    answer: "Liveness: checks if the container is ALIVE. If it fails, K8s kills and restarts it. Readiness: checks if the container is READY to serve traffic. If it fails, K8s stops routing traffic to it."
  },
  {
    id: 97,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "Explain 'Infrastructure as Code' (IaC).",
    answer: "Managing and provisioning infrastructure through machine-readable definition files rather than manual hardware configuration or interactive configuration tools."
  },
  {
    id: 98,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is 'Immutable Infrastructure'?",
    answer: "The practice of never modifying a running server; instead, you build a new one from an image and replace the old one. Containers are inherently immutable."
  },
  {
    id: 99,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "Explain 'Blue-Green Deployment'.",
    answer: "A deployment strategy where you have two identical environments. 'Green' is live, 'Blue' is the new version. Once tested, you switch traffic to Blue. If it fails, you switch back instantly."
  },
  {
    id: 100,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "What is a 'Service Mesh'?",
    answer: "A dedicated infrastructure layer for handling service-to-service communication, providing observability, security (mTLS), and reliability (retries, timeouts) automatically."
  },
  {
    id: 111,
    category: 'General Backend',
    isPlatform: true,
    question: "What is the difference between gRPC and REST?",
    answer: "gRPC uses Protocol Buffers (binary) and HTTP/2, making it faster and more efficient for service-to-service communication. REST uses JSON (text) and HTTP/1.1, which is more human-readable and universal for browser-to-server communication."
  },
  {
    id: 112,
    category: 'General Backend',
    isPlatform: true,
    question: "Explain the 'Outbox Pattern'.",
    answer: "It solves the problem of atomicity between database updates and event publishing. Instead of publishing to a queue directly, the event is saved to an 'Outbox' table in the same DB transaction. A separate process reads the table and publishes to the queue."
  },
  {
    id: 113,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you defend against a DDoS attack at the application layer?",
    answer: "Using WAF (Web Application Firewall), IP rate limiting, geo-blocking, and implementing aggressive caching at the CDN/Edge level. I also ensure that my backend has auto-scaling enabled to absorb traffic spikes."
  },
  {
    id: 114,
    category: 'General Backend',
    isPlatform: true,
    question: "What is 'Distributed Tracing'?",
    answer: "A method to track a request as it travels through multiple microservices. Each request gets a unique Trace ID, allowing developers to see where latencies or failures occur in complex call chains."
  },
  {
    id: 115,
    category: 'General Backend',
    isPlatform: true,
    question: "How do you handle large file uploads in a microservices architecture?",
    answer: "Instead of streaming files through multiple services, I use 'Pre-signed URLs'. The API returns a temporary upload link directly to Azure Blob Storage or S3, and the client uploads directly there, notifying the backend when finished."
  },
  {
    id: 121,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What is 'FastAPI Background Tasks' vs 'Celery'?",
    answer: "BackgroundTasks is for simple, in-process tasks like sending an email after a response. Celery is for heavy, distributed tasks that need a dedicated worker pool, persistence, and complex retry logic."
  },
  {
    id: 122,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "Explain Python's 'MRO' (Method Resolution Order).",
    answer: "The order in which Python looks for a method in a class hierarchy (C3 Linearization). This is relevant for complex inheritance patterns common in some platform frameworks."
  },
  {
    id: 123,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "What is a 'generator' in Python?",
    answer: "A function that uses 'yield' to return a series of values lazily. They are memory-efficient because they don't load the entire list into RAM, which is great for processing large log files."
  },
  {
    id: 124,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "How do you profile memory usage in Python?",
    answer: "I use tools like 'memory_profiler' or 'objgraph'. In production, I monitor the RSS (Resident Set Size) of the process in Kubernetes to catch slow leaks."
  },
  {
    id: 131,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What is 'Worker Threads' in Node.js?",
    answer: "A module that allows running JavaScript in parallel on multiple threads. Unlike the Event Loop (one thread), Worker Threads are ideal for CPU-intensive tasks like image processing or cryptography."
  },
  {
    id: 132,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain the 'Buffer' class in Node.js.",
    answer: "Used to handle binary data. Since JS strings are UTF-16, Buffers allow Node to interact with streams of binary data from the network or file system efficiently."
  },
  {
    id: 133,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What is 'Tree Shaking'?",
    answer: "A build optimization that removes dead/unused code from the final bundle. TypeScript and modern bundlers (like Vite/Rollup) handle this to keep microservice deployment images small."
  },
  {
    id: 134,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain 'Union Types' in TypeScript.",
    answer: "Allowing a variable to be one of several types (e.g., string | number). This is incredibly useful for parsing API responses where a field might be an object or an error message."
  },
  {
    id: 141,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is the 'JVM' (Java Virtual Machine)?",
    answer: "The runtime that executes Java bytecode. It provides memory management (Garbage Collection), security, and platform independence."
  },
  {
    id: 142,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "Explain the 'G1 Garbage Collector'.",
    answer: "A server-style garbage collector for multi-processor machines with large memory. It splits the heap into regions and prioritizes collecting the most 'garbage-filled' ones to minimize pause times."
  },
  {
    id: 143,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is 'Spring Cloud Gateway'?",
    answer: "A reactive API Gateway built on Spring WebFlux. It provides a way to route requests, handle cross-cutting concerns, and integrate with Service Discovery tools like Eureka."
  },
  {
    id: 144,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "Explain 'Reflection' in Java.",
    answer: "The ability of a program to inspect or modify its own structure at runtime. Spring uses it extensively for Dependency Injection and processing annotations."
  },
  // --- Section 6: Frontend - React ---
  {
    id: 101,
    category: 'Frontend',
    question: "What is the Virtual DOM and how does it work?",
    answer: "The Virtual DOM is a lightweight copy of the real DOM. When state changes, React creates a new virtual tree, compares it with the old one (diffing), and updates only the necessary parts of the real DOM (reconciliation) for efficiency."
  },
  {
    id: 102,
    category: 'Frontend',
    question: "Explain the difference between useMemo and useCallback.",
    answer: "useMemo memoizes the RESULT of a value-returning function. useCallback memoizes the FUNCTION instance itself. Both are used to prevent unnecessary re-renders in performance-sensitive components."
  },
  {
    id: 103,
    category: 'Frontend',
    question: "What is the React Context API?",
    answer: "A way to share data (state) between components without 'prop drilling' through every level. It's ideal for static data like themes, locales, or user authentication state."
  },
  {
    id: 104,
    category: 'Frontend',
    question: "Explain React 18 Concurrent Rendering.",
    answer: "Concurrent mode allows React to interrupt a long-running render task to handle high-priority user input, keeping the UI responsive. Features like useTransition and useDeferredValue leverage this."
  },
  // --- Section 7: Frontend - Next.js ---
  {
    id: 201,
    category: 'Frontend',
    question: "What is the difference between SSR, SSG, and ISR?",
    answer: "SSR (Server Side Rendering) generates HTML on every request. SSG (Static Site Generation) generates HTML at build time. ISR (Incremental Static Regeneration) updates static content after build without needing a full rebuild."
  },
  {
    id: 202,
    category: 'Frontend',
    question: "What is the App Router in Next.js 13/14?",
    answer: "A new routing system based on React Server Components. It supports streaming, nested layouts, and simplified data fetching within the 'app' directory, replacing the legacy 'pages' router."
  },
  {
    id: 203,
    category: 'Frontend',
    question: "Explain Server Components vs Client Components.",
    answer: "Server Components are the default; they render on the server and reduce client-side JS. Client Components are marked with 'use client' and handle interactivity, state, and browser APIs."
  },
  // --- Section 8: Frontend - Angular ---
  {
    id: 301,
    category: 'Frontend',
    question: "What is Change Detection in Angular?",
    answer: "The process by which Angular synchronizes the model (component state) with the view (DOM). By default, it uses the CheckAlways strategy, but 'OnPush' can be used for better performance."
  },
  {
    id: 302,
    category: 'Frontend',
    question: "Explain Angular Dependency Injection.",
    answer: "Angular has a hierarchical DI system. Services are registered in providers (root, module, or component level) and injected into constructors, promoting modularity and testability."
  },
  {
    id: 303,
    category: 'Frontend',
    question: "What are Observables and RxJS used for in Angular?",
    answer: "Observables handle asynchronous data streams (like HTTP requests or user input). RxJS provides operators (map, filter, switchMap) to transform and combine these streams efficiently."
  },
  // --- Section 9: DSA ---
  {
    id: 401,
    category: 'DSA - Arrays & Strings',
    question: "What is Big O notation?",
    answer: "A mathematical notation that describes the limiting behavior of a function when the argument tends towards infinity. In CS, it's used to classify algorithms according to how their run time or space requirements grow as the input size grows."
  },
  {
    id: 402,
    category: 'DSA - Arrays & Strings',
    question: "Difference between an Array and a Linked List?",
    answer: "Arrays have O(1) random access but O(N) insertion/deletion (shifting). Linked Lists have O(N) access but O(1) insertion/deletion if you have the pointer, as they don't require contiguous memory."
  },
  {
    id: 403,
    category: 'DSA - Arrays & Strings',
    question: "How does a Hash Table work internally?",
    answer: "It uses a hash function to map keys to bucket indices. Collisions are handled via Chaining (linked lists in buckets) or Open Addressing (probing for the next empty slot). Average case access is O(1)."
  },
  {
    id: 404,
    category: 'DSA - Dynamic Programming',
    question: "Explain the concept of Dynamic Programming.",
    answer: "An optimization technique that solves complex problems by breaking them into overlapping subproblems, solving each once and storing the result (memoization/tabulation) to avoid redundant calculations."
  },
  {
    id: 405,
    category: 'DSA - Trees & Graphs',
    question: "Difference between DFS and BFS?",
    answer: "DFS (Depth First Search) uses a stack (or recursion) to explore as far as possible along each branch. BFS (Breadth First Search) uses a queue to explore all neighbors at the current depth before moving to the next level."
  },
  // --- Expanded Node.js ---
  {
    id: 501,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "What is 'Fastify' and why use it over Express?",
    answer: "Fastify is a highly focused web framework for Node.js, providing low overhead and powerful plugin architecture. It is often 2-3x faster than Express and has built-in schema validation using JSON Schema."
  },
  {
    id: 502,
    category: 'Node.js & TypeScript',
    isPlatform: true,
    question: "Explain Node.js 'Microservices' communication patterns.",
    answer: "Common patterns include Synchronous (HTTP/gRPC) and Asynchronous (Message Brokers like RabbitMQ/Kafka). Event-driven architecture is highly preferred for decoupling services."
  },
  // --- Expanded Java ---
  {
    id: 601,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "What is 'Lombok' and how does it work?",
    answer: "A Java library that plugs into your editor and build tools, spicing up your java. It uses annotations like @Data to generate boilerplate code like getters, setters, and constructors at compile time."
  },
  {
    id: 602,
    category: 'Java & Spring Boot',
    isPlatform: true,
    question: "Explain 'Distributed Tracing' in Spring Boot.",
    answer: "Implemented using Spring Cloud Sleuth and Zipkin/Jaeger. It adds unique IDs to headers, allowing you to track a single request across multiple microservices."
  },
  // --- Expanded FastAPI ---
  {
    id: 701,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "How to handle 'CORS' in FastAPI?",
    answer: "Using CORSMiddleware from the fastapi.middleware.cors module. You configure allowed origins, methods, and headers to control cross-domain access."
  },
  // --- Section 6: Python & FastAPI (LONG FORM) ---
  {
    id: 620,
    category: 'Python & FastAPI',
    isPlatform: true,
    question: "How do you handle Database Sessions in an Async FastAPI application?",
    answer: "Using SQLAlchemy's `async_sessionmaker`. We inject the session into routes using `Depends()`. \n\n```python\nasync def get_db():\n    async with async_session() as session:\n        yield session\n```\nIt is critical to use the `async with` context manager to ensure the connection is released back to the pool immediately after the request, preventing 'connection leaks' which are a common cause of production outages in high-traffic FastAPI services."
  },
  // --- Section 7: Platform & DevOps (JD SPECIFIC) ---
  {
    id: 720,
    category: 'Platform & DevOps',
    isPlatform: true,
    question: "Explain how Kyverno works to enforce organization-wide K8s security policies.",
    answer: "Kyverno is a Kubernetes-native policy engine. It runs as an **Admission Controller**. When a developer tries to create a resource (like a Deployment): \n1. Kyverno intercepts the request. \n2. It checks its policies (e.g., 'All images must come from Azure Container Registry'). \n3. It can either **Mutate** the request (automatically inject sidecars/labels) or **Validate** and **Reject** the request if it violates the rules.\n\nThis is 'Policy as Code' which ensures that even if a developer forgets to add security limits, the platform enforces it automatically."
  },
  {
    id: 1001,
    category: 'Evolent Day 1: Software & Platform',
    question: 'How do Backstage Software Templates accelerate developer onboarding?',
    answer: "Backstage uses Software Templates to scaffold new services. A developer clicks 'Create React App' or 'Create FastAPI Backend' and the template automates creating the GitHub repository, setting up CI/CD pipelines in GitHub Actions, registering the API in the Backstage Catalog, and establishing default SonarQube scanning. This eliminates 'Day 0' setup friction and enforces standards.",
    isPlatform: true,
    tags: ['Backstage', 'IDP', 'DX']
  },
  {
    id: 1002,
    category: 'Evolent Day 1: Software & Platform',
    question: 'Compare FastAPI, Node.js, and Spring Boot for a high-throughput microservice.',
    answer: "FastAPI is excellent for ML/Data-heavy workloads leveraging Python's ecosystem, boasting high performance due to Starlette and Pydantic. Node.js excels in I/O-bound operations with its event-driven non-blocking architecture. Spring Boot is the heavyweight champion for complex enterprise systems needing extensive transactions, robust security, and strict patterns, running on the optimized JVM.",
    isPlatform: true,
    tags: ['Architecture', 'FastAPI', 'Node.js', 'Spring Boot']
  },
  {
    id: 1003,
    category: 'Evolent Day 1: Software & Platform',
    question: 'Explain the benefits of multi-stage Docker builds.',
    answer: "Multi-stage builds allow you to use a heavyweight image containing compilers, testing frameworks, and linting tools in the first stage. In the final stage, you copy ONLY the compiled binaries or minimal artifacts into a severely stripped-down base image (like distroless). This reduces final image size dramatically, speeding pull times, and lowering security vulnerabilities.",
    isPlatform: true,
    tags: ['Docker', 'DevOps', 'Security']
  },
  {
    id: 1004,
    category: 'Evolent Day 1: Software & Platform',
    question: 'What are common DB and Caching patterns for horizontally scaled services?',
    answer: "For reads: Read-Replicas where the app writes to the Master but reads from Replicas. For caching: Look-aside, Write-through. For large writes: Sharding database at application or DB level. In microservices, we also use CQRS (Command Query Responsibility Segregation) to completely decouple read models (e.g., Elasticsearch) from write models (e.g., PostgreSQL).",
    isPlatform: true,
    tags: ['Database', 'Caching', 'System Design']
  },
  {
    id: 1005,
    category: 'Evolent Day 1: Software & Platform',
    question: 'What role does "Frontend" play in Platform Engineering?',
    answer: "In Platform Engineering, the 'Frontend' is typically the Internal Developer Portal (IDP) like Backstage. It acts as the single pane of glass for developers to view docs, API schemas, and CI/CD status. A well-designed IDP abstracts complex infrastructure, empowering engineers to provision databases or cloud resources via UI self-service without needing deep Terraform knowledge.",
    isPlatform: true,
    tags: ['Frontend', 'IDP', 'Platform']
  },
  {
    id: 2001,
    category: 'Evolent Day 2: Kubernetes Core',
    question: 'What are the differences between Azure Kubernetes Service (AKS) vs Azure Container Apps (ACA)?',
    answer: "AKS provides full control over the control plane, worker nodes, CNI plugins, and allows deep customization with CRDs and Service Meshes. ACA is a managed Serverless container service built on top of AKS and KEDA, where MS manages the K8s infrastructure. In ACA, you deploy containers and scale via KEDA rules, losing cluster-level control but dramatically reducing operational overhead.",
    isPlatform: true,
    tags: ['Azure', 'AKS', 'Kubernetes']
  },
  {
    id: 2002,
    category: 'Evolent Day 2: Kubernetes Core',
    question: 'Terraform vs Ansible: When to use which?',
    answer: "Terraform is a declarative IaC tool designed to provision and manage immutable infrastructure (VPCs, DBs) and maintains state (.tfstate). Ansible is a procedural Configuration Management tool, better suited for mutable infrastructure (installing packages on a VM). Use Terraform to provision the cloud resources, and Ansible (or Helm) to configure what runs inside.",
    isPlatform: true,
    tags: ['Terraform', 'Ansible', 'IaC']
  },
  {
    id: 2003,
    category: 'Evolent Day 2: Kubernetes Core',
    question: 'How do you debug a CrashLoopBackOff pod in K8s?',
    answer: "CrashLoopBackOff means the pod crashes repeatedly. Steps: 1) `kubectl describe pod <name>` to check events. 2) `kubectl logs <name> --previous` to see logs from the crashed container instance. 3) Override the entrypoint: modify deployment to run `sleep 3600`, then `kubectl exec -it <pod> -- sh` to manually run the app inside the environment.",
    isPlatform: true,
    tags: ['Kubernetes', 'Debugging', 'Ops']
  },
  {
    id: 2004,
    category: 'Evolent Day 2: Kubernetes Core',
    question: 'Helm vs Kustomize: Compare their approaches to K8s manifests.',
    answer: "Helm uses Go-templating allowing variables inside `values.yaml` to inject into configurations, managing the full lifecycle of a 'Release'. Kustomize does NOT use templates. It uses a purely declarative overlay approach where environment-specific 'overlays' patch a 'base' YAML file, and is natively built into kubectl (`kubectl apply -k`).",
    isPlatform: true,
    tags: ['Helm', 'Kustomize', 'Kubernetes']
  },
  {
    id: 3001,
    category: 'Evolent Day 3: The CNCF Stack',
    question: 'Explain GitOps with ArgoCD. How does it prevent drift?',
    answer: "GitOps uses Git as the single source of truth. ArgoCD runs as an agent inside the K8s cluster, continuously polling the Git repository. If developers manually `kubectl edit` a deployment (causing Configuration Drift), ArgoCD detects the discrepancy and automatically overwrites the cluster state back to match whatever is in Git (Self-Healing).",
    isPlatform: true,
    tags: ['ArgoCD', 'GitOps', 'CI/CD']
  },
  {
    id: 3002,
    category: 'Evolent Day 3: The CNCF Stack',
    question: 'How does KEDA differ from standard HPA?',
    answer: "Standard Horizontal Pod Autoscaler (HPA) scales pods based on CPU or Memory metrics. KEDA expands this by allowing pods to scale based on external events, like the queue length of RabbitMQ, Azure Service Bus messages, or custom Prometheus metrics. Critically, KEDA allows scaling down to zero (Scale-to-Zero), which standard HPA cannot do.",
    isPlatform: true,
    tags: ['KEDA', 'Autoscaling', 'Kubernetes']
  },
  {
    id: 3004,
    category: 'Evolent Day 3: The CNCF Stack',
    question: 'Behavioral Scenario Drills: The Bonus Multiplier',
    answer: "Technical skills are expected, but behavioral impact is a multiplier. You must demonstrate: 1) Empathy for developers (DX as a product). 2) Blameless Post-Mortems (focusing on system failure, not human). 3) Mentorship (upskilling product engineers to understand K8s primitives instead of just opening ad-hoc tickets).",
    isPlatform: true,
    tags: ['Behavioral', 'Leadership', 'Culture']
  },
  {
    id: 4001,
    category: 'Frontend',
    question: 'How does React 18 Concurrent Features change rendering?',
    answer: "React 18 introduces Concurrent Rendering, meaning rendering is interruptible. Previously, rendering could block the main thread. Now, React can pause, yield to the browser for interactions, and resume. This powers `useTransition` and Server-Side Suspense streaming.",
    tags: ['React', 'Performance']
  },
  {
    id: 4002,
    category: 'Frontend',
    question: 'Explain SSR, SSG, and ISR in Next.js.',
    answer: "SSG: HTML generated at build time (blogs). SSR: HTML generated on EVERY request (fresh data). ISR: Next.js serves a cached page up to a `revalidate` time. After that, it triggers a background rebuild, meaning the next user gets fresh data without SSR latency.",
    tags: ['Next.js', 'Rendering']
  },
  {
    id: 4003,
    category: 'Frontend',
    question: 'What is the purpose of useMemo and useCallback?',
    answer: "Both are for performance optimization to prevent unnecessary re-renders. `useMemo` caches the RESULT of a calculation, only re-computing when dependencies change. `useCallback` caches the FUNCTION INSTANCE itself, useful when passing callbacks to optimized child components (like those wrapped in React.memo) so their props don't appear to change on every render.",
    tags: ['React', 'Hooks', 'Performance']
  },
  {
    id: 4004,
    category: 'Frontend',
    question: 'How does Dependency Injection work in Angular?',
    answer: "Angular has a hierarchical DI system. You provide services at the module (`@NgModule`), component, or root layer (`providedIn: 'root'`). When a component asks for a dependency in its constructor, the Injector looks up the tree until it finds a provider. `providedIn: 'root'` is preferred as it enables tree-shaking.",
    tags: ['Angular', 'DI', 'Architecture']
  },
  {
    id: 4005,
    category: 'Frontend',
    question: 'Describe Next.js 13+ App Router vs Pages Router.',
    answer: "The App Router uses React Server Components by default, meaning components run on the server and send zero JS to the client unless marked with `'use client'`. It uses a nested folder structure where `layout.tsx`, `page.tsx`, and `error.tsx` exist in the same directory, dramatically improving nested layouts and data fetching compared to `_app.js` and `_document.js`.",
    tags: ['Next.js', 'App Router', 'RSC']
  },
  {
    id: 5001,
    category: 'DSA - Arrays & Strings',
    question: 'How do you optimize identifying anagrams in an array of strings?',
    answer: "Brute force sorts every string (O(K log K) per string). Optimized: Hash Map where the key is the character count (an array of 26 integers or stringified version like '1a1b1c'). Time complexity becomes O(N * K).",
    tags: ['Arrays', 'Hashing', 'Medium']
  },
  {
    id: 5002,
    category: 'DSA - Trees & Graphs',
    question: 'Explain the difference between Dijkstra and A* pathfinding.',
    answer: "Dijkstra's explores uniformly by expanding the lowest cost node found. A* extends Dijkstra by using a Heuristic function. It expands nodes based on cost-so-far PLUS estimated-cost-to-target. If the heuristic never overestimates, A* guarantees shortest path exploring fewer nodes.",
    tags: ['Graphs', 'Algorithms', 'Hard']
  },
  {
    id: 5003,
    category: 'DSA - Dynamic Programming',
    question: 'How do you structure a solution for the 0/1 Knapsack Problem?',
    answer: "Identify state: `index` of item, and `remaining_weight`. Next, identify choices: either Include the item (if weight <= remaining) OR Exclude the item. Finally, use memoization (top-down) or a 2D DP array (bottom-up) storing `dp[i][w] = max(value[i] + dp[i-1][w-weight[i]], dp[i-1][w])`.",
    tags: ['DP', 'Optimization', 'Hard']
  },
  {
    id: 5004,
    category: 'DSA - Arrays & Strings',
    question: 'Explain the Sliding Window technique.',
    answer: "Used for finding subarrays/substrings that meet certain criteria (e.g., longest substring without repeating characters). Instead of nested loops O(N^2), you maintain two pointers (left and right). You expand `right` until a condition is met or broken, then shrink `left` to restore the condition. This reduces time to O(N).",
    tags: ['Arrays', 'Two Pointers', 'Medium']
  },
  {
    id: 5005,
    category: 'DSA - Trees & Graphs',
    question: 'How do you detect a cycle in a Directed Graph vs Undirected Graph?',
    answer: "Undirected: Use DFS/BFS and keep track of a 'visited' array. If you visit a node that is already visited AND is not the immediate parent, there is a cycle. Directed: Use DFS with a 'recursion stack' (or colors: white, gray, black). If you reach a node currently in the recursion stack (gray), a cycle exists.",
    tags: ['Graphs', 'DFS', 'Medium']
  }
];
