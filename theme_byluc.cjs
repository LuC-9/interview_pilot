const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Reverse pastel
content = content.replace(/bg-[#e0e7ff]/g, 'bg-[#13141c]');
content = content.replace(/bg-white shadow-[4px_4px_0_rgba(15,23,42,1)] border-2 border-slate-900/g, 'bg-[#1e2029] border border-slate-800');
content = content.replace(/text-slate-800/g, 'text-slate-300');
content = content.replace(/text-slate-900/g, 'text-white');
content = content.replace(/text-slate-600/g, 'text-slate-400');
content = content.replace(/text-slate-700/g, 'text-slate-500');

// Slate borders
content = content.replace(/border-slate-900\/10/g, 'border-slate-800/50');
content = content.replace(/border-slate-900/g, 'border-slate-800');

// Fix text inside bg-slate-800 before it changes
content = content.replace(/bg-slate-50/g, 'bg-slate-800/20');
content = content.replace(/bg-[#c7d2fe] border-2 border-slate-800 shadow-[2px_2px_0_rgba(15,23,42,1)] text-white/g, 'bg-slate-800');
content = content.replace(/bg-white border-2 border-slate-800 shadow-inner/g, 'bg-slate-900');
content = content.replace(/bg-white\/50/g, 'bg-[#0a0f1a]');
content = content.replace(/bg-white rounded-xl shadow-[4px_4px_0_rgba(15,23,42,1)] border-2 border-slate-800/g, 'bg-[#05080f]');

// Table hover
content = content.replace(/hover:bg-slate-100/g, 'hover:bg-slate-800/20');

// Indigo and Blue stuff
content = content.replace(/bg-[#c7d2fe] border-2 border-slate-800 shadow-[4px_4px_0_rgba(15,23,42,1)]/g, 'bg-indigo-600/10');
content = content.replace(/bg-blue-100 border-2 border-slate-800 shadow-[4px_4px_0_rgba(15,23,42,1)]/g, 'bg-blue-600/10');
content = content.replace(/bg-emerald-100 border-2 border-slate-800 text-emerald-800/g, 'bg-emerald-500/10');

// Special text rules for buttons that shouldn't disappear
content = content.replace(/text-indigo-700/g, 'text-indigo-400');
content = content.replace(/text-blue-700/g, 'text-blue-400');
content = content.replace(/text-emerald-700/g, 'text-emerald-400');

fs.writeFileSync('src/App.tsx', content);
console.log('Restored to dark theme matching byluc.in');
