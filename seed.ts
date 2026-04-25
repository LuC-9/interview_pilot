import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { parse } from 'csv-parse/sync';

const db = new Database('database.db');

// Initialize schema
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

  CREATE INDEX IF NOT EXISTS idx_company_period ON company_questions(company, period);
`);

console.log('Seeding data...');

const basePath = 'lc-company';
const periods = {
  'thirty-days.csv': '30_days',
  'three-months.csv': '3_months',
  'six-months.csv': '6_months',
  'more-than-six-months.csv': 'more_than_6_months',
  'all.csv': 'all',
};

let items: string[] = [];
if (fs.existsSync(basePath)) {
  items = fs.readdirSync(basePath);
} else {
  console.log(`Directory ${basePath} does not exist. Skipping...`);
}
const companies = items.filter(item => {
  return fs.statSync(path.join(basePath, item)).isDirectory() && item !== '.git';
});

const insertQuestion = db.prepare(`
  INSERT INTO questions (id, url, title, difficulty, acceptance) 
  VALUES (@id, @url, @title, @difficulty, @acceptance)
  ON CONFLICT(id) DO UPDATE SET 
    url = excluded.url, 
    title = excluded.title, 
    difficulty = excluded.difficulty, 
    acceptance = excluded.acceptance
`);

const insertCQ = db.prepare(`
  INSERT INTO company_questions (company, question_id, period, frequency, raw_frequency, sort_order)
  VALUES (@company, @question_id, @period, @frequency, @raw_frequency, @sort_order)
  ON CONFLICT DO NOTHING
`);

db.transaction(() => {
  for (const company of companies) {
    for (const [filename, period] of Object.entries(periods)) {
      const filePath = path.join(basePath, company, filename);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
          const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            relax_quotes: true,
            relax_column_count: true
          });
          
          let sortOrder = 0;
          for (const rec of records) {
            const record = rec as any;
            if (!record.ID || !record.Title) continue;
            
            const id = parseInt(record.ID, 10);
            if (isNaN(id)) continue;
            
            const acceptance = parseFloat((record['Acceptance %'] || '0').replace('%', ''));
            const freqStr = record['Frequency %'] || '0%';
            const frequency = parseFloat(freqStr.replace('%', ''));

            insertQuestion.run({
              id,
              url: record.URL || '',
              title: record.Title,
              difficulty: record.Difficulty || 'Medium',
              acceptance
            });

            insertCQ.run({
              company,
              question_id: id,
              period,
              frequency,
              raw_frequency: freqStr,
              sort_order: sortOrder++
            });
          }
        } catch(e) {
             console.error(`Failed to parse ${filePath}`, e);
        }
      }
    }
  }
})();

console.log('Seeding completed. Database is ready.');

