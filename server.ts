import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import Database from 'better-sqlite3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const dbPath = process.env.DB_PATH || 'database.db';

// If deploying to a platform like Fly.io with a volume, the volume might be empty.
// We can copy the local seeded 'database.db' to the volume if it doesn't exist yet.
if (process.env.DB_PATH && !fs.existsSync(process.env.DB_PATH)) {
  const localDbPath = path.join(process.cwd(), 'database.db');
  if (fs.existsSync(localDbPath)) {
    console.log(`Copying local seeded database to volume path: ${process.env.DB_PATH}`);
    try {
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(process.env.DB_PATH), { recursive: true });
      fs.copyFileSync(localDbPath, process.env.DB_PATH);
    } catch (err) {
      console.error("Failed to copy database to volume:", err);
    }
  }
}

const db = new Database(dbPath);

// Check if database needs seeding (on first startup or fresh volume)
async function seedDatabaseIfEmpty() {
  try {
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
    
    if (tables.length === 0) {
      console.log('Database is empty. Seeding data...');
      
      // Download the company questions data
      console.log('Downloading LeetCode company questions data...');
      await execPromise('npx -y degit snehasishroy/leetcode-companywise-interview-questions lc-company --force');
      
      // Run the seed script
      console.log('Running seed script...');
      await execPromise('npx tsx seed.ts');
      
      console.log('Database seeding completed successfully!');
    } else {
      console.log('Database already seeded, skipping initialization.');
    }
  } catch (err) {
    console.error('Error during database seeding:', err);
    throw err;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  const PORT = 3000;

  // API constraints: 
  // GET /api/companies (list all companies that have questions)
  app.get("/api/companies", (req, res) => {
    const rows = db.prepare(`SELECT DISTINCT company FROM company_questions ORDER BY company`).all();
    res.json(rows.map((r: any) => r.company));
  });

  app.post("/api/sync-data", async (req, res) => {
    try {
      // Disconnect DB momentarily if needed, or better, seed writes while readonly handles reads? 
      // Seed script re-opens it. Since better-sqlite3 locks occasionally, let's close the DB here, run seed, reopen.
      // Actually better to just run the script, if readonly it might allow another process to write.
      // Wait, let's try direct child process.
      await execPromise('npx -y degit snehasishroy/leetcode-companywise-interview-questions lc-company --force');
      await execPromise('npx tsx seed.ts');
      res.json({ success: true, message: 'Data synced successfully' });
    } catch (err) {
      console.error("Sync error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/analyze-resume", async (req, res) => {
    const { resumeText } = req.body;
    if (!resumeText) {
        return res.status(400).json({ error: "resumeText is required" });
    }

    const fallbackAnalyze = () => {
      const lowerText = resumeText.toLowerCase();
      // Expanded skills list with better coverage
      const allSkills = [
        'react', 'vue', 'angular', 'nodejs', 'node', 'express', 'typescript', 'javascript',
        'kubernetes', 'docker', 'aws', 'gcp', 'azure', 'cloud', 
        'python', 'java', 'go', 'rust', 'c++', 'c#',
        'sql', 'postgres', 'mongodb', 'nosql', 'redis', 'elasticsearch',
        'system design', 'microservices', 'rest', 'graphql', 'grpc',
        'kafka', 'rabbitmq', 'ci/cd', 'jenkins', 'gitlab', 'github', 'terraform', 'ansible',
        'linux', 'unix', 'shell', 'bash', 'git', 'agile', 'scrum'
      ];
      
      const matched = allSkills.filter(skill => {
        // Handle special characters better
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
        return regex.test(lowerText);
      });
      
      const missing = allSkills.filter(skill => {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
        return !regex.test(lowerText);
      }).slice(0, 8); // Show top 8 missing
      
      // Better scoring calculation (out of total skills, not fixed 10)
      const rawScore = Math.min(100, Math.max(20, Math.floor((matched.length / allSkills.length) * 100)));
      
      let feedback = "";
      if (rawScore > 85) feedback = "Excellent! Strong technical foundation across multiple domains. Ready for senior/staff-level platform engineering roles.";
      else if (rawScore > 70) feedback = "Strong technical profile. Consider deepening expertise in cloud infrastructure and DevOps to strengthen platform engineering alignment.";
      else if (rawScore > 50) feedback = "Solid foundation. Recommend building more experience with Kubernetes, cloud platforms (AWS/GCP/Azure), and infrastructure-as-code tools.";
      else if (rawScore > 30) feedback = "Good start. Focus on adding cloud platform experience, containerization (Docker/K8s), and DevOps tooling to improve platform engineering fit.";
      else feedback = "Foundation exists. Build expertise in: Kubernetes, cloud platforms, infrastructure automation, system design, and distributed systems.";

      return { score: rawScore, matched, missing, feedback };
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
          console.warn("GEMINI_API_KEY is not defined, falling back to regex analysis");
          return res.json(fallbackAnalyze());
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      const prompt = `Analyze this resume for alignment with platform engineering and full-stack roles. 

Evaluate these key areas:
1. Programming languages (especially: Python, Go, Rust, TypeScript, Java)
2. Cloud platforms (AWS, GCP, Azure)
3. Container & orchestration (Docker, Kubernetes)
4. Infrastructure as code (Terraform, Ansible, CloudFormation)
5. CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions)
6. Distributed systems & messaging (Kafka, RabbitMQ, gRPC)
7. Databases (SQL, NoSQL, caching)
8. Frontend (React, Vue, etc.)
9. DevOps & monitoring (Prometheus, ELK, DataDog)
10. System design experience

Return a JSON object with EXACTLY these fields:
{
  "score": <number 1-100 based on overall platform engineering fit>,
  "matched": [<array of up to 15 skills/areas found in resume>],
  "missing": [<array of up to 10 most important missing skills for platform engineer>],
  "feedback": "<specific actionable feedback about career positioning for platform engineering>"
}

Resume text: ${resumeText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      // Remove any markdown formatting (e.g. ```json ... ```)
      text = text.replace(/```[a-z]*\n?/ig, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(text);
      res.json(analysis);
    } catch (error) {
      console.error("AI analysis error, falling back to regex analysis:", error);
      res.json(fallbackAnalyze());
    }
  });

  // GET /api/questions?company=google&period=all&sortBy=frequency&sortOrder=desc&page=1&limit=50
  app.get("/api/questions", (req, res) => {
    const company = req.query.company as string || 'google';
    const period = req.query.period as string || 'all';
    const sortBy = req.query.sortBy as string || 'sort_order';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '50');
    const search = req.query.search as string || '';
    const prepTopic = req.query.prepTopic as string || 'all';

    // Topics list to map to keywords
    const topicKeywords: Record<string, string[]> = {
       'Array': ['Array', 'Sum', 'Number', 'Matrix', 'Product', 'Duplicate', 'Element', 'Water', 'Subarray'],
       'String': ['String', 'Palindrome', 'Word', 'Character', 'Anagram', 'Substring', 'Parentheses', 'Prefix'],
       'Hash Table': ['Hash', 'Map', 'Sum', 'Duplicate', 'Frequency', 'Unique'],
       'Tree': ['Tree', 'Binary', 'BST', 'Order', 'Depth', 'Node', 'Path'],
       'Graph': ['Graph', 'Island', 'Course', 'Schedule', 'Node', 'Component', 'Network'],
       'Dynamic Programming': ['Dynamic', 'DP', 'Path', 'Cost', 'Profit', 'Ways', 'Subsequence', 'Jump', 'Robber'],
       'Sorting': ['Sort', 'Merge', 'Interval', 'Kth', 'Smallest', 'Largest', 'Median'],
       'Greedy': ['Greedy', 'Jump', 'Schedule', 'Interval', 'Task', 'Max', 'Min'],
       'Binary Search': ['Search', 'Matrix', 'Rotated', 'Median', 'Find', 'Peak'],
       'Two Pointers': ['Pointer', 'Sum', 'Water', 'Sequence', 'Palindrome', 'Merge']
    };

    const keywords = (prepTopic && prepTopic !== 'all' && topicKeywords[prepTopic]) ? topicKeywords[prepTopic] : [];

    // Only allow specific columns for sorting to prevent SQL injection
    const allowedSortColumns = ['sort_order', 'frequency', 'difficulty_val', 'acceptance', 'id'];
    const actualSortBy = allowedSortColumns.includes(sortBy) ? sortBy : (company === 'all_problems' ? 'id' : 'sort_order');
    
    // Sort difficulty properly (Easy = 1, Medium = 2, Hard = 3)
    let sortClause = "";
    if (actualSortBy === 'difficulty_val') {
       sortClause = `CASE q.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END ${sortOrder}`;
    } else if (actualSortBy === 'frequency' || actualSortBy === 'sort_order') {
       sortClause = company === 'all_problems' ? `q.id ${sortOrder}` : `cq.${actualSortBy} ${sortOrder}`;
    } else {
       sortClause = `q.${actualSortBy} ${sortOrder}`;
    }

    const offset = (page - 1) * limit;

    let query: string;
    let countQuery: string;
    let params: any[] = [];
    let countParams: any[] = [];

    if (company === 'all_problems') {
      let whereClause = "1=1";
      if (search) {
        whereClause += " AND q.title LIKE ?";
        params.push(`%${search}%`);
        countParams.push(`%${search}%`);
      }
      if (period !== 'all' && period !== 'more_than_6_months' && period !== '6_months' && period !== '3_months' && period !== '30_days') {
         // Optionally filter by difficulty if period is reused as difficulty for all_problems
         // But let's just keep it simple, period is ignored for 'all_problems'
         const validDifficulties = ['Easy', 'Medium', 'Hard'];
         if (validDifficulties.includes(period)) {
           whereClause += " AND q.difficulty = ?";
           params.push(period);
           countParams.push(period);
         }
      }
      if (keywords.length > 0) {
        const keywordConditions = keywords.map(() => "q.title LIKE ?").join(" OR ");
        whereClause += ` AND (${keywordConditions})`;
        keywords.forEach(kw => {
           params.push(`%${kw}%`);
           countParams.push(`%${kw}%`);
        });
      }

      query = `
        SELECT 
          q.id, q.url as answer, q.title as question, q.difficulty, q.acceptance,
          0 as frequency, '0%' as raw_frequency
        FROM questions q
        WHERE ${whereClause}
        ORDER BY ${sortClause}
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);

      countQuery = `
        SELECT count(*) as total
        FROM questions q
        WHERE ${whereClause}
      `;
    } else {
      let whereClause = "cq.company = ? AND cq.period = ?";
      params.push(company, period);
      countParams.push(company, period);
      
      if (search) {
        whereClause += " AND q.title LIKE ?";
        params.push(`%${search}%`);
        countParams.push(`%${search}%`);
      }
      if (keywords.length > 0) {
        const keywordConditions = keywords.map(() => "q.title LIKE ?").join(" OR ");
        whereClause += ` AND (${keywordConditions})`;
        keywords.forEach(kw => {
           params.push(`%${kw}%`);
           countParams.push(`%${kw}%`);
        });
      }

      query = `
        SELECT 
          q.id, q.url as answer, q.title as question, q.difficulty, q.acceptance,
          cq.frequency, cq.raw_frequency
        FROM company_questions cq
        JOIN questions q ON cq.question_id = q.id
        WHERE ${whereClause}
        ORDER BY ${sortClause}
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);

      countQuery = `
        SELECT count(*) as total
        FROM company_questions cq
        JOIN questions q ON cq.question_id = q.id
        WHERE ${whereClause}
      `;
    }

    try {
      const rows = db.prepare(query).all(...params);
      const totalRow = db.prepare(countQuery).get(...countParams) as any;
      res.json({
        data: rows.map((r: any) => ({
          ...r,
          tags: [r.difficulty] // Map to existing frontend interface format
        })),
        total: totalRow.total,
        page,
        limit
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Initialize and start the server
(async () => {
  try {
    await seedDatabaseIfEmpty();
    await startServer();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
