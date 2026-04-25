import { Question } from './data';
export const systemDesignQuestions: Question[] = [
  {
    "id": 10000,
    "category": "System Design",
    "question": "Design Twitter",
    "answer": "### 1. Requirements\n\n**Functional:**\n- Users can post tweets (text + images).\n- Users can follow/unfollow others.\n- Home timeline (tweets from people they follow), User timeline (their own tweets).\n\n**Non-Functional:**\n- Highly available (reads are more critical than writes).\n- Low latency (timeline generation should be fast).\n- Eventual consistency is acceptable for timelines.\n\n### 2. Capacity Estimation\n- DAU: 200 Million\n- Average 2 tweets per user per day.\n- 400M tweets/day -> ~4600 TPS.\n- Read heavy system: Read/Write ratio typically 100:1.\n\n### 3. High Level Design\n\n```mermaid\ngraph TD\n  Client -->|HTTPS| LB(Load Balancer)\n  LB --> API_Gateway\n  \n  API_Gateway --> TweetSvc(Tweet Service)\n  API_Gateway --> TimelineSvc(Timeline Service)\n  API_Gateway --> UserSvc(User Service)\n  \n  TweetSvc --> TweetDB[(Tweet Database)]\n  TweetSvc --> Cache[(Tweet Cache)]\n  \n  TimelineSvc --> TimelineCache[(Timeline Cache / Redis)]\n  UserSvc --> UserDB[(User Database)]\n```\n\n### 4. System Components\n- **Tweet Service:** Handles posting tweets. Drops messages into a Kafka queue for processing (fanout).\n- **Timeline Service:** Generates home timeline. Uses a pull model for celebrities and push (fanout) for normal users.\n- **User Service:** Manages user profiles and follow/unfollow relationships.\n\n### 5. Fanout Mechanism\n- **Fanout on Write (Push):** When a user tweets, we synchronously/asynchronously push the tweet to the timelines of their followers in Redis.\n- **Fanout on Read (Pull):** Used for celebrities (e.g., millions of followers). Pushing to millions of followers is too slow. Instead, followers fetch the celebrity's tweets dynamically when reading the timeline.\n\n### 6. Data Model\n- **User DB:** Relational DB or NoSQL. `id`, `username`, `email`.\n- **Tweet DB:** NoSQL (e.g., Cassandra) or Sharded SQL. `tweet_id`, `user_id`, `content`, `created_at`.\n- **Follower Graph:** Graph DB or RDBMS with adjacency list. `follower_id`, `followee_id`.\n\n### 7. Core Bottlenecks\n- **Thundering Herd:** Celebrities tweeting can overload cache. Fix: Use message queues, rate limiting, and hybrid fanout (push/pull).\n- **Database Hotspots:** Extensive sharding by `tweet_id` with Snowflake ID generation to distribute load.\n",
    
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  
  },
  {
    "id": 10001,
    "category": "System Design",
    "question": "Design YouTube",
    "answer": "### 1. Requirements\n\n**Functional:**\n- Upload videos.\n- View/stream videos.\n- Search for videos.\n- Like/Comment on videos.\n\n**Non-Functional:**\n- High availability.\n- No buffering (Smooth streaming).\n- High scalability.\n\n### 2. Capacity Planning\n- DAU: 1 Billion\n- Storage: Massive! If 1M videos uploaded per day, avg 50MB -> 50TB/day. Use object storage (S3).\n\n### 3. High Level Architecture\n\n```mermaid\ngraph TD\n  Client --> LB\n  LB --> WebServer\n  \n  WebServer --> UploadService\n  WebServer --> StreamService\n  WebServer --> SearchService\n  \n  UploadService --> VideoQueue(Kafka)\n  VideoQueue --> Transcoder(Transcoder Workers)\n  Transcoder --> S3[(Object Storage / S3)]\n  \n  S3 --> CDN\n  StreamService --> CDN\n  \n  UploadService --> MetadataDB[(Metadata DB)]\n  SearchService --> ElasticSearch\n```\n\n### 4. Components\n- **Upload Service:** Chunks video and saves to reliable storage. Adds job to Kafka.\n- **Transcoder:** Pulls from Kafka, encodes videos to different resolutions (1080p, 720p) and formats (MP4, WebM).\n- **CDN:** Video chunks are geographically cached for low-latency streaming.\n- **Streaming Service:** Serves video content dynamically using protocols like HLS or DASH.\n\n### 5. Detailed Breakdown\n- **Video Storage:** Distributed object storage (e.g., Amazon S3, Google Cloud Storage).\n- **Metadata Storage:** SQL database (MySQL/PostgreSQL) with scaling via Read Replicas and Sharding.\n- **Search:** ElasticSearch cluster indexing video titles, tags, and descriptions.\n\n### 6. Scaling & Fault Tolerance\n- Replicate Metadata databases across multiple regions.\n- Multi-CDN strategy to avoid single point of failure.\n- Auto-scaling transcoder workers based on Kafka queue size.\n",
    
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  
  },
  {
    "id": 10002,
    "category": "System Design",
    "question": "Design Netflix",
    "answer": "### 1. Requirements\n\n**Functional:**\n- Browse personalized catalog.\n- High-quality video streaming.\n- Resume playing from last stopped time.\n\n**Non-Functional:**\n- Extremely high availability (global).\n- Lowest possible latency for streaming.\n- DRM (Digital Rights Management) support.\n\n### 2. High Level Design\n\n```mermaid\ngraph TD\n  Client --> LB\n  LB --> API_Gateway\n  \n  API_Gateway --> AuthSvc\n  API_Gateway --> PlaybackSvc\n  API_Gateway --> RecommendationSvc\n  \n  PlaybackSvc --> OpenConnect(Netflix Open Connect / CDN)\n  OpenConnect --> Client\n  \n  API_Gateway --> BookmarkDB[(Viewing History DB)]\n```\n\n### 3. Core Architecture\n- **Control Plane (AWS):** User auth, licensing, metadata, UI rendering, viewing history.\n- **Data Plane (Netflix Open Connect):** Custom global CDN installed directly at ISPs.\n\n### 4. Open Connect (CDN)\n- Netflix predicts which shows will be popular in which regions and actively pushes videos to local ISP Open Connect Appliances (OCAs) during off-peak hours.\n- When a user streams, the video is served directly from the OCA inside their ISP's network, reducing latency to zero.\n\n### 5. Database Choices\n- **User/Metadata:** Cassandra (highly available, partition tolerant).\n- **Viewing History:** Stored in Cassandra, fast writes for tracking exact play timestamps.\n\n### 6. Resilience\n- Chaos Engineering (Chaos Monkey) ensures microservices survive random process terminations.\n",
    
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  
  },
  {
    "id": 10003,
    "category": "System Design",
    "question": "Design Uber",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10004,
    "category": "System Design",
    "question": "Design WhatsApp",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10005,
    "category": "System Design",
    "question": "Design Instagram",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10006,
    "category": "System Design",
    "question": "Design TikTok",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10007,
    "category": "System Design",
    "question": "Design Google Maps",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10008,
    "category": "System Design",
    "question": "Design Google Search",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10009,
    "category": "System Design",
    "question": "Design Airbnb",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10010,
    "category": "System Design",
    "question": "Design Amazon",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10011,
    "category": "System Design",
    "question": "Design Slack",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10012,
    "category": "System Design",
    "question": "Design Zoom",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10013,
    "category": "System Design",
    "question": "Design a URL Shortener",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10014,
    "category": "System Design",
    "question": "Design a Web Crawler",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10015,
    "category": "System Design",
    "question": "Design a Rate Limiter",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10016,
    "category": "System Design",
    "question": "Design a Key-Value Store",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10017,
    "category": "System Design",
    "question": "Design a Notification System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10018,
    "category": "System Design",
    "question": "Design an APM (Datadog)",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10019,
    "category": "System Design",
    "question": "Design a Distributed Cache",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10020,
    "category": "System Design",
    "question": "Design a Distributed Message Queue",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10021,
    "category": "System Design",
    "question": "Design a Distributed Task Scheduler",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10022,
    "category": "System Design",
    "question": "Design a Search Auto-complete",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10023,
    "category": "System Design",
    "question": "Design a News Feed System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10024,
    "category": "System Design",
    "question": "Design a Leaderboard",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10025,
    "category": "System Design",
    "question": "Design a Recommendation System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10026,
    "category": "System Design",
    "question": "Design a Parking Lot System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10027,
    "category": "System Design",
    "question": "Design a Vending Machine",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10028,
    "category": "System Design",
    "question": "Design an Elevator System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10029,
    "category": "System Design",
    "question": "Design a Chess Game",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10030,
    "category": "System Design",
    "question": "Design a Logging System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10031,
    "category": "System Design",
    "question": "Design a Proximity Service (Yelp)",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10032,
    "category": "System Design",
    "question": "Design a Distributed Lock",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10033,
    "category": "System Design",
    "question": "Design a CDN",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10034,
    "category": "System Design",
    "question": "Design a Video Streaming Platform",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10035,
    "category": "System Design",
    "question": "Design a Payment Gateway",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10036,
    "category": "System Design",
    "question": "Design a Stock Exchange",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10037,
    "category": "System Design",
    "question": "Design a Trading System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10038,
    "category": "System Design",
    "question": "Design a Banking System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10039,
    "category": "System Design",
    "question": "Design a Ticket Booking System (BookMyShow)",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10040,
    "category": "System Design",
    "question": "Design an E-commerce Cart",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10041,
    "category": "System Design",
    "question": "Design a Hotel Booking System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10042,
    "category": "System Design",
    "question": "Design a Flight Booking System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10043,
    "category": "System Design",
    "question": "Design a Ride-Sharing App",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10044,
    "category": "System Design",
    "question": "Design a Food Delivery App",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10045,
    "category": "System Design",
    "question": "Design a Chat Application",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10046,
    "category": "System Design",
    "question": "Design a Document Editor (Google Docs)",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10047,
    "category": "System Design",
    "question": "Design a Code Deployment System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10048,
    "category": "System Design",
    "question": "Design a CI/CD Pipeline",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10049,
    "category": "System Design",
    "question": "Design an API Gateway",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10050,
    "category": "System Design",
    "question": "Design a Load Balancer",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10051,
    "category": "System Design",
    "question": "Design a DNS Server",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10052,
    "category": "System Design",
    "question": "Design a Database Management System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10053,
    "category": "System Design",
    "question": "Design a Backup System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10054,
    "category": "System Design",
    "question": "Design a Fraud Detection System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10055,
    "category": "System Design",
    "question": "Design a Data Warehouse",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10056,
    "category": "System Design",
    "question": "Design a Metrics System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10057,
    "category": "System Design",
    "question": "Design an Alerting System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10058,
    "category": "System Design",
    "question": "Design a Configuration Management System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10059,
    "category": "System Design",
    "question": "Design a Recommendation Engine",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10060,
    "category": "System Design",
    "question": "Design an Analytics System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10061,
    "category": "System Design",
    "question": "Design a Web Browser",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10062,
    "category": "System Design",
    "question": "Design an Operating System Module",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10063,
    "category": "System Design",
    "question": "Design a Virtual Machine",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10064,
    "category": "System Design",
    "question": "Design a Cloud Infrastructure",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10065,
    "category": "System Design",
    "question": "Design a Container Orchestrator",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10066,
    "category": "System Design",
    "question": "Design a Serverless Platform",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10067,
    "category": "System Design",
    "question": "Design a Graph Database",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10068,
    "category": "System Design",
    "question": "Design a Document Database",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10069,
    "category": "System Design",
    "question": "Design a Time Series Database",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10070,
    "category": "System Design",
    "question": "Design a Microservice Architecture",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10071,
    "category": "System Design",
    "question": "Design a Service Mesh",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10072,
    "category": "System Design",
    "question": "Design a Identity Provider (OAuth)",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10073,
    "category": "System Design",
    "question": "Design a Two-Factor Authentication System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10074,
    "category": "System Design",
    "question": "Design a Captcha System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10075,
    "category": "System Design",
    "question": "Design a Web Application Firewall",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10076,
    "category": "System Design",
    "question": "Design a Penetration Testing Tool",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10077,
    "category": "System Design",
    "question": "Design a Vulnerability Scanner",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10078,
    "category": "System Design",
    "question": "Design a Malware Detection System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10079,
    "category": "System Design",
    "question": "Design an Intrusion Detection System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10080,
    "category": "System Design",
    "question": "Design a Data Loss Prevention System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10081,
    "category": "System Design",
    "question": "Design a Password Manager",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10082,
    "category": "System Design",
    "question": "Design a Key Management Service",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10083,
    "category": "System Design",
    "question": "Design a Cryptographic Library",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10084,
    "category": "System Design",
    "question": "Design a Smart Contract",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10085,
    "category": "System Design",
    "question": "Design a Blockchain",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10086,
    "category": "System Design",
    "question": "Design a Crypto Exchange",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10087,
    "category": "System Design",
    "question": "Design a Web3 Application",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10088,
    "category": "System Design",
    "question": "Design an IoT Platform",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10089,
    "category": "System Design",
    "question": "Design an Edge Computing System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10090,
    "category": "System Design",
    "question": "Design a Machine Learning Pipeline",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10091,
    "category": "System Design",
    "question": "Design a Data Processing System (Spark)",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10092,
    "category": "System Design",
    "question": "Design a Stream Processing System (Flink)",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10093,
    "category": "System Design",
    "question": "Design a MapReduce Framework",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10094,
    "category": "System Design",
    "question": "Design a Data Lake",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10095,
    "category": "System Design",
    "question": "Design an ETL Tool",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10096,
    "category": "System Design",
    "question": "Design a Data Integration Platform",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10097,
    "category": "System Design",
    "question": "Design a Business Intelligence Dashboard",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10098,
    "category": "System Design",
    "question": "Design an Advertisement Click Prediction System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10099,
    "category": "System Design",
    "question": "Design a Distributed File System like HDFS",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10100,
    "category": "System Design",
    "question": "Design a Cloud Storage System (S3)",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10101,
    "category": "System Design",
    "question": "Design a Live Video Broadcasting System",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10102,
    "category": "System Design",
    "question": "Design a Collaborative Whiteboard",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  },
  {
    "id": 10103,
    "category": "System Design",
    "question": "Design an Online Multiplayer Game Backend",
    "answer": "### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n```mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n```\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: `POST /api/v1/resource` -> Returns `201 Created`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.",
    "isPlatform": false,
    "tags": [
      "System Design",
      "Architecture"
    ]
  }
];