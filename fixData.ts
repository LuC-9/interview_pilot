import Database from 'better-sqlite3';
import { dsaQuestions } from './src/dsaData';

const dbPath = process.env.DB_PATH || 'database.db';
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY,
    url TEXT,
    title TEXT,
    difficulty TEXT,
    acceptance REAL
  );

  CREATE TABLE IF NOT EXISTS company_questions (
    company TEXT,
    question_id INTEGER,
    period TEXT,
    frequency REAL,
    raw_frequency TEXT,
    sort_order INTEGER,
    PRIMARY KEY (company, question_id, period)
  );
`);

const insertQuestion = db.prepare(`
  INSERT INTO questions (id, url, title, difficulty, acceptance) 
  VALUES (@id, @url, @title, @difficulty, @acceptance)
  ON CONFLICT(id) DO NOTHING
`);

const insertCQ = db.prepare(`
  INSERT INTO company_questions (company, question_id, period, frequency, raw_frequency, sort_order)
  VALUES (@company, @question_id, @period, @frequency, @raw_frequency, @sort_order)
  ON CONFLICT DO NOTHING
`);

const companies = [
  'google', 'meta', 'amazon', 'microsoft', 'apple', 'netflix',
  'uber', 'airbnb', 'tiktok', 'bytedance', 'linkedin', 'adobe',
  'atlassian', 'bloomberg', 'oracle', 'salesforce', 'stripe',
  'snowflake', 'databricks', 'doordash', 'robinhood', 'spotify',
  'twitch', 'pinterest', 'intuit', 'square', 'twilio', 'expedia',
  'zillow', 'instacart', 'lyft', 'snapchat', 'discord', 'reddit'
];
const periods = ['30_days', '3_months', '6_months', 'more_than_6_months', 'all'];

db.transaction(() => {
  // First, insert real questions
  for (const q of dsaQuestions) {
    const diff = (q.tags && q.tags.length > 0) ? q.tags[0] : 'Medium';
    insertQuestion.run({
      id: q.id,
      url: q.answer,
      title: q.question,
      difficulty: diff,
      acceptance: Math.floor(Math.random() * 50) + 30
    });

    for (const company of companies) {
      for (const period of periods) {
        if (Math.random() > 0.8) {
          insertCQ.run({
            company,
            question_id: q.id,
            period,
            frequency: Math.floor(Math.random() * 100),
            raw_frequency: Math.floor(Math.random() * 100) + '%',
            sort_order: Math.floor(Math.random() * 1000)
          });
        }
      }
    }
  }

  // Next, mock an additional 3000 questions to represent all leetcode problems
  for (let i = 1; i <= 3000; i++) {
    const isHard = Math.random() > 0.8;
    const isEasy = Math.random() < 0.3;
    const difficulty = isHard ? 'Hard' : isEasy ? 'Easy' : 'Medium';
    
    insertQuestion.run({
      id: 20000 + i,
      url: `https://leetcode.com/problems/mock-question-${i}/`,
      title: `LeetCode Advanced Algorithm ${i}`,
      difficulty,
      acceptance: Math.floor(Math.random() * 60) + 20
    });

    // Assigning to random companies so "All LeetCode Problems" can be populated
    if (Math.random() > 0.5) {
      for (const period of periods) {
        if(Math.random() > 0.8) {
           const randomCompany = companies[Math.floor(Math.random() * companies.length)];
           insertCQ.run({
             company: randomCompany,
             question_id: 20000 + i,
             period,
             frequency: Math.floor(Math.random() * 50),
             raw_frequency: Math.floor(Math.random() * 50) + '%',
             sort_order: Math.floor(Math.random() * 5000)
           });
        }
      }
    }
  }
})();

console.log("Seeded mock questions into DB!");
