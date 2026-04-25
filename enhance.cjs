const fs = require('fs');
let code = fs.readFileSync('src/systemDesignData.ts', 'utf-8');

const newAnswers = {
  "Design Twitter": `### 1. Requirements

**Functional:**
- Users can post tweets (text + images).
- Users can follow/unfollow others.
- Home timeline (tweets from people they follow), User timeline (their own tweets).

**Non-Functional:**
- Highly available (reads are more critical than writes).
- Low latency (timeline generation should be fast).
- Eventual consistency is acceptable for timelines.

### 2. Capacity Estimation
- DAU: 200 Million
- Average 2 tweets per user per day.
- 400M tweets/day -> ~4600 TPS.
- Read heavy system: Read/Write ratio typically 100:1.

### 3. High Level Design

\`\`\`mermaid
graph TD
  Client -->|HTTPS| LB(Load Balancer)
  LB --> API Gateway
  
  API Gateway --> TweetSvc(Tweet Service)
  API Gateway --> TimelineSvc(Timeline Service)
  API Gateway --> UserSvc(User Service)
  
  TweetSvc --> TweetDB[(Tweet Database)]
  TweetSvc --> Cache[(Tweet Cache)]
  
  TimelineSvc --> TimelineCache[(Timeline Cache / Redis)]
  UserSvc --> UserDB[(User Database)]
\`\`\`

### 4. System Components
- **Tweet Service:** Handles posting tweets. Drops messages into a Kafka queue for processing (fanout).
- **Timeline Service:** Generates home timeline. Uses a pull model for celebrities and push (fanout) for normal users.
- **User Service:** Manages user profiles and follow/unfollow relationships.

### 5. Fanout Mechanism
- **Fanout on Write (Push):** When a user tweets, we synchronously/asynchronously push the tweet to the timelines of their followers in Redis.
- **Fanout on Read (Pull):** Used for celebrities (e.g., millions of followers). Pushing to millions of followers is too slow. Instead, followers fetch the celebrity's tweets dynamically when reading the timeline.

### 6. Data Model
- **User DB:** Relational DB or NoSQL. \`id\`, \`username\`, \`email\`.
- **Tweet DB:** NoSQL (e.g., Cassandra) or Sharded SQL. \`tweet_id\`, \`user_id\`, \`content\`, \`created_at\`.
- **Follower Graph:** Graph DB or RDBMS with adjacency list. \`follower_id\`, \`followee_id\`.

### 7. Core Bottlenecks
- **Thundering Herd:** Celebrities tweeting can overload cache. Fix: Use message queues, rate limiting, and hybrid fanout (push/pull).
- **Database Hotspots:** Extensive sharding by \`tweet_id\` with Snowflake ID generation to distribute load.
`,
  "Design YouTube": `### 1. Requirements

**Functional:**
- Upload videos.
- View/stream videos.
- Search for videos.
- Like/Comment on videos.

**Non-Functional:**
- High availability.
- No buffering (Smooth streaming).
- High scalability.

### 2. Capacity Planning
- DAU: 1 Billion
- Storage: Massive! If 1M videos uploaded per day, avg 50MB -> 50TB/day. Use object storage (S3).

### 3. High Level Architecture

\`\`\`mermaid
graph TD
  Client --> LB
  LB --> WebServer
  
  WebServer --> UploadService
  WebServer --> StreamService
  WebServer --> SearchService
  
  UploadService --> VideoQueue(Kafka)
  VideoQueue --> Transcoder(Transcoder Workers)
  Transcoder --> S3[(Object Storage / S3)]
  
  S3 --> CDN
  StreamService --> CDN
  
  UploadService --> MetadataDB[(Metadata DB)]
  SearchService --> ElasticSearch
\`\`\`

### 4. Components
- **Upload Service:** Chunks video and saves to reliable storage. Adds job to Kafka.
- **Transcoder:** Pulls from Kafka, encodes videos to different resolutions (1080p, 720p) and formats (MP4, WebM).
- **CDN:** Video chunks are geographically cached for low-latency streaming.
- **Streaming Service:** Serves video content dynamically using protocols like HLS or DASH.

### 5. Detailed Breakdown
- **Video Storage:** Distributed object storage (e.g., Amazon S3, Google Cloud Storage).
- **Metadata Storage:** SQL database (MySQL/PostgreSQL) with scaling via Read Replicas and Sharding.
- **Search:** ElasticSearch cluster indexing video titles, tags, and descriptions.

### 6. Scaling & Fault Tolerance
- Replicate Metadata databases across multiple regions.
- Multi-CDN strategy to avoid single point of failure.
- Auto-scaling transcoder workers based on Kafka queue size.
`,
  "Design Netflix": `### 1. Requirements

**Functional:**
- Browse personalized catalog.
- High-quality video streaming.
- Resume playing from last stopped time.

**Non-Functional:**
- Extremely high availability (global).
- Lowest possible latency for streaming.
- DRM (Digital Rights Management) support.

### 2. High Level Design

\`\`\`mermaid
graph TD
  Client --> LB
  LB --> API_Gateway
  
  API_Gateway --> AuthSvc
  API_Gateway --> PlaybackSvc
  API_Gateway --> RecommendationSvc
  
  PlaybackSvc --> OpenConnect(Netflix Open Connect / CDN)
  OpenConnect --> Client
  
  API_Gateway --> BookmarkDB[(Viewing History DB)]
\`\`\`

### 3. Core Architecture
- **Control Plane (AWS):** User auth, licensing, metadata, UI rendering, viewing history.
- **Data Plane (Netflix Open Connect):** Custom global CDN installed directly at ISPs.

### 4. Open Connect (CDN)
- Netflix predicts which shows will be popular in which regions and actively pushes videos to local ISP Open Connect Appliances (OCAs) during off-peak hours.
- When a user streams, the video is served directly from the OCA inside their ISP's network, reducing latency to zero.

### 5. Database Choices
- **User/Metadata:** Cassandra (highly available, partition tolerant).
- **Viewing History:** Stored in Cassandra, fast writes for tracking exact play timestamps.

### 6. Resilience
- Chaos Engineering (Chaos Monkey) ensures microservices survive random process terminations.
`
}

code = code.replace(
  /\{\s*"id"\s*:\s*10000,\s*"category"\s*:\s*"System Design",\s*"question"\s*:\s*"Design Twitter",\s*"answer"\s*:\s*"[^"]*",([\s\S]*?)\}/,
  `{
    "id": 10000,
    "category": "System Design",
    "question": "Design Twitter",
    "answer": ${JSON.stringify(newAnswers["Design Twitter"])},
    $1
  }`
);

code = code.replace(
  /\{\s*"id"\s*:\s*10001,\s*"category"\s*:\s*"System Design",\s*"question"\s*:\s*"Design YouTube",\s*"answer"\s*:\s*"[^"]*",([\s\S]*?)\}/,
  `{
    "id": 10001,
    "category": "System Design",
    "question": "Design YouTube",
    "answer": ${JSON.stringify(newAnswers["Design YouTube"])},
    $1
  }`
);

code = code.replace(
  /\{\s*"id"\s*:\s*10002,\s*"category"\s*:\s*"System Design",\s*"question"\s*:\s*"Design Netflix",\s*"answer"\s*:\s*"[^"]*",([\s\S]*?)\}/,
  `{
    "id": 10002,
    "category": "System Design",
    "question": "Design Netflix",
    "answer": ${JSON.stringify(newAnswers["Design Netflix"])},
    $1
  }`
);

const genericMatch = /Detailed scenario and walk-through covering: 1\. Requirements \(Functional & Non-Functional\), 2\. Capacity Estimation, 3\. High Level Design, 4\. Component Details, 5\. API Design, 6\. Data Model, 7\. Scaling \(Load balancing, Caching, Sharding\), 8\. Fault Tolerance & Bottlenecks\./g;

const detailedGeneric = `### 1. Requirements Gathering
- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?
- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.

### 2. Capacity Estimation
- Estimate Data Storage requirements based on DAU, content size, and retention rate.
- Estimate Bandwidth and TPS (Transactions Per Second).

### 3. High Level Design
\`\`\`mermaid
graph TD
  Client --> API_Gateway
  API_Gateway --> Load_Balancer
  Load_Balancer --> Web_Nodes
  Web_Nodes --> Cache[(Memory Cache)]
  Web_Nodes --> DB[(Master DB)]
  DB --> Replica1[(Read Replica)]
\`\`\`

### 4. Components & Microservices
Detail the standalone logical services (e.g. Auth Service, Media Service, Search Service).

### 5. API Design
Example: \`POST /api/v1/resource\` -> Returns \`201 Created\`

### 6. Database Schema & Data Models
Choose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.

### 7. Scaling Strategies
- Cache implementation (Redis/Memcached).
- Horizontal scaling vs Vertical scaling.
- Database Sharding.

### 8. Fault Tolerance & Bottlenecks
Identify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.`;

code = code.replace(genericMatch, detailedGeneric);

fs.writeFileSync('src/systemDesignData.ts', code, 'utf-8');
