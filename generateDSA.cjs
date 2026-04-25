const fs = require('fs');

const fileContent = fs.readFileSync('t1/prisma/seed/sheets/neetcode150.ts', 'utf8');

const regex = /url:\s*"https:\/\/leetcode\.com\/problems\/([^/]+)\/",\s*group:\s*"([^"]+)"/g;

let match;
let questions = [];
let id = 10000;

function titleCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Since we don't know the exact difficulty, we can do a naive switch or default to Medium.
const hardList = ['trapping-rain-water', 'minimum-window-substring', 'sliding-window-maximum', 'find-median-from-data-stream', 'merge-k-sorted-lists', 'reverse-nodes-in-k-group', 'serialize-and-deserialize-binary-tree', 'binary-tree-maximum-path-sum', 'word-search-ii', 'word-ladder', 'n-queens', 'burst-balloons', 'longest-increasing-path-in-a-matrix', 'largest-rectangle-in-histogram'];
const easyList = ['two-sum', 'valid-anagram', 'contains-duplicate', 'valid-parentheses', 'merge-two-sorted-lists', 'best-time-to-buy-and-sell-stock', 'valid-palindrome', 'invert-binary-tree', 'maximum-depth-of-binary-tree', 'diameter-of-binary-tree', 'balanced-binary-tree', 'same-tree', 'subtree-of-another-tree', 'lowest-common-ancestor-of-a-binary-search-tree', 'binary-search', 'first-bad-version', 'climbing-stairs', 'min-cost-climbing-stairs', 'reverse-linked-list', 'linked-list-cycle', 'number-of-1-bits', 'counting-bits', 'missing-number', 'reverse-bits', 'single-number', 'happy-number', 'plus-one']

while ((match = regex.exec(fileContent)) !== null) {
  const slug = match[1];
  const group = match[2];
  
  let diff = 'Medium';
  if (hardList.includes(slug)) diff = 'Hard';
  else if (easyList.includes(slug)) diff = 'Easy';

  questions.push({
    id: id++,
    category: `DSA - ${group}`,
    question: titleCase(slug),
    answer: `https://leetcode.com/problems/${slug}/`,
    tags: [diff]
  });
}

fs.writeFileSync('src/dsaData.ts', `export const dsaQuestions = ${JSON.stringify(questions, null, 2)};\n`);
