const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

const newAnswers = {
  1: `### How do you version a REST API?

There are three primary ways to version APIs, each with unique tradeoffs:

1. **URI Versioning (e.g., \`/api/v1/users\`)**
   - **Pros:** Excellent visibility, easy to share links, fully compatible with caching layers and CDNs.
   - **Cons:** Violates strict REST principles (a URI should represent the resource identity, not the schema).
   - **Best for:** Most modern web APIs (Stripe, Twitter) use this because developer experience (DX) is king.

2. **Header Versioning / Accept Header (e.g., \`Accept: application/vnd.company.v1+json\`)**
   - **Pros:** Strict REST compliance. URLs stay clean (\`/api/users\`).
   - **Cons:** Harder to test in a browser without tools like Postman. Caching layers need to inspect the \`Vary: Accept\` header.

3. **Query Parameter (e.g., \`/api/users?version=1\`)**
   - **Pros:** Very simple to implement. 
   - **Cons:** Can get messy and is often considered a bad practice compared to URI versioning.

**My Approach:**
Practically, I prefer routing versions in the URL. URL versioning is easier for internal platform tools to browse, test, and debug.`,
  
  3: `### How do you handle API rate limiting?

Rate limiting is crucial for protecting APIs from abuse (DDoS) and controlling costs.

#### Common Algorithms:
1. **Token Bucket:** Tokens are added to a bucket at a fixed rate. Each request consumes one token. If empty, the request is dropped. Good for allowing short spikes.
2. **Leaky Bucket:** Requests enter a queue. They are processed at a fixed, constant rate. Smooths out traffic spikes completely.
3. **Fixed Window:** Uses a given timeframe (e.g., 0-59 seconds). If limit hits, wait till the next minute. Prone to spikes at the edges of the window.
4. **Sliding Window Log/Counter:** A hybrid that fixes the edge-spike issue of fixed windows by keeping a rolling count.

#### Implementation:
- **Redis:** Usually, we use Redis for distributed rate limiting. An API gateway (like Kong or NGINX) checks the user's IP or API key against a Redis counter with a TTL.
- **Headers:** Always return standard HTTP headers:
  - \`X-RateLimit-Limit\`: Total allowed requests.
  - \`X-RateLimit-Remaining\`: Remaining requests in current window.
  - \`X-RateLimit-Reset\`: Time when the limit resets.
- **HTTP Code:** Return \`429 Too Many Requests\` when the limit is breached.`,

  4: `### How do you handle distributed transactions across microservices?

Distributed transactions are challenging because of the CAP theorem and the lack of a central coordinator. 

#### Why avoid 2-Phase Commit (2PC)?
- **Blocking:** During the prepare phase, locks are held across databases. If the coordinator goes down, resources stay locked. 
- **Scalability:** It scales extremely poorly in high-throughput microservice architectures.

#### The Saga Pattern
Instead of ACID, we rely on **BASE** (Basically Available, Soft state, Eventual consistency). A Saga is a sequence of local transactions.

1. **Choreography (Event-Driven):** Each service publishes domain events upon success. Downstream services listen to these events and perform their local transactions.
2. **Orchestration (Command-Driven):** A central orchestrator (like AWS Step Functions or Netflix Conductor) tells participating services what to explicitly do.

#### Compensating Transactions
If a step in the Saga fails, we cannot simply \`ROLLBACK\`. We must explicitly execute a **compensating transaction** to undo the structural changes of the previous steps (e.g., if step 1 deducted money and step 2 failed, we publish an event to execute step 1's compensation: refund the money).`,

  5: `### What is idempotency and why is it crucial in platform engineering?

**Definition:** 
An API is idempotent if making the same request multiple times produces the identical side effect as making it a single time.
HTTP methods like \`GET\`, \`PUT\`, and \`DELETE\` are defined to be idempotent by the spec, while \`POST\` is not.

#### Why it's critical:
Network calls are flaky. A client sends a "Create Kubernetes Cluster" (\`POST\`) request. The server successfully creates it, but the network drops the \`201 Created\` response. The client assumes failure and retries the \`POST\`. Without idempotency, they just spun up two expensive clusters.

#### How to implement it:
1. **Idempotency Key:** The client generates a unique UUID (e.g., \`Idempotency-Key: 1234-abcd\`) and sends it with the request.
2. **Key Storage:** The server checks an Idempotency Store (Redis or a DB table).
   - If the key exists and request is in progress: Wait and return the same response.
   - If the key exists and is completed: Immediately serve the cached response payload.
   - If the key does not exist: Save the key and execute the operation safely.`,

  6: `### What is the N+1 query problem and how do you fix it?

The N+1 query problem is a massive performance bottleneck common in ORMs (Object-Relational Mappers).

#### Scenario:
Imagine fetching a list of 100 \`Authors\` and their associated \`Books\`.
1. The ORM runs **1 query** to fetch the 100 Authors.
2. The code iterates through each Author to render their books. 
3. The ORM lazily evaluates this and fires **100 additional queries** (one for each author's books, hence N+1).

#### How to fix it:
1. **Eager Fetching:** Instruct the ORM to load relationships upfront using SQL \`JOIN\`s. 
   - Hibernate/JPA: \`JOIN FETCH\`
   - Django: \`select_related()\` or \`prefetch_related()\`
   - Entity Framework: \`.Include()\`
2. **Batch Loading (GraphQL Dataloader):** In GraphQL APIs, N+1 is very common. Tools like \`DataLoader\` batch all the foreign keys requested in the current tick into a single \`WHERE id IN (...)\` query.`,

  // Also enhance some Kubernetes answers
  66: `### Explain the difference between a Deployment and a StatefulSet.

\`\`\`mermaid
graph LR
  subgraph Deployment
    Pod1[Pod hash-12f]
    Pod2[Pod hash-59b]
  end

  subgraph StatefulSet
    Pod0[Pod-0]
    Pod1[Pod-1]
  end
\`\`\`

Both manage the deployment of pods, but they have completely different assumptions about the workload.

#### Deployments (Stateless Workloads):
- **Identity:** Pods get random hashes (e.g., \`web-5cd89d\`). They are completely interchangeable.
- **Ordering:** Pods are started, stopped, and scaled in parallel.
- **Storage:** If a pod dies, any new pod gets a fresh volume or doesn't care about storage.
- **Use Cases:** Web servers, frontend APIs, background workers.

#### StatefulSets (Stateful Workloads):
- **Identity:** Pods get sticky, unique, ordered network identities (e.g., \`db-0\`, \`db-1\`, \`db-2\`). 
- **Ordering:** They are scaled up sequentially (db-0, then db-1) and scaled down in reverse (db-2, then db-1).
- **Storage:** They use VolumeClaimTemplates. If \`db-0\` is deleted and recreated, it re-attaches to the exact same PersistentVolume.
- **Use Cases:** Databases (MySQL, PostgreSQL), message queues (Kafka, RabbitMQ), or caching clusters (Redis).`
};

for (const [id, newAnswer] of Object.entries(newAnswers)) {
  const regex = new RegExp(`(\\{\\s*id:\\s*${id},[\\s\\S]*?answer\\s*:\\s*)".*?"(,|\\n\\s*\\})`, 'g');
  code = code.replace(regex, `$1 ${JSON.stringify(newAnswer)}$2`);
}

fs.writeFileSync('src/data.ts', code, 'utf-8');
