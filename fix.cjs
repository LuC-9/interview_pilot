const fs = require('fs');
let code = fs.readFileSync('src/systemDesignData.ts', 'utf-8');

// I need to fix the multi-line strings that start with "### 1. Requirements Gathering
// They are currently broken. Let's find all occurrences of:
// "answer": "### 1. Requirements Gathering\n... \n"

// Actually, I can just write a script to re-create the file correctly or fix it.
// I can just replace the broken part.
// The broken part looks like:
// "answer": "### 1. Requirements Gathering\n... \n`

code = code.replace(/"answer"\s*:\s*"### 1\. Requirements Gathering[\s\S]*?active\."/g, `"answer": ${JSON.stringify("### 1. Requirements Gathering\n- **Functional:** What should the system do? Who are the users? What are the inputs and outputs?\n- **Non-Functional:** High Availability, Consistency, Low Latency, Scalability thresholds.\n\n### 2. Capacity Estimation\n- Estimate Data Storage requirements based on DAU, content size, and retention rate.\n- Estimate Bandwidth and TPS (Transactions Per Second).\n\n### 3. High Level Design\n\`\`\`mermaid\ngraph TD\n  Client --> API_Gateway\n  API_Gateway --> Load_Balancer\n  Load_Balancer --> Web_Nodes\n  Web_Nodes --> Cache[(Memory Cache)]\n  Web_Nodes --> DB[(Master DB)]\n  DB --> Replica1[(Read Replica)]\n\`\`\`\n\n### 4. Components & Microservices\nDetail the standalone logical services (e.g. Auth Service, Media Service, Search Service).\n\n### 5. API Design\nExample: \`POST /api/v1/resource\` -> Returns \`201 Created\`\n\n### 6. Database Schema & Data Models\nChoose between SQL and NoSQL based on ACID requirements, structure, and read/write ratio.\n\n### 7. Scaling Strategies\n- Cache implementation (Redis/Memcached).\n- Horizontal scaling vs Vertical scaling.\n- Database Sharding.\n\n### 8. Fault Tolerance & Bottlenecks\nIdentify Single Points of Failure (SPOF) and mitigate using redundancy. Ensure monitoring and alerting systems are active.")}`);

fs.writeFileSync('src/systemDesignData.ts', code, 'utf-8');
