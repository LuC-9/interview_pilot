const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace global dark backgrounds with pastel
content = content.replace(/bg-\[#0B0E14\]/g, 'bg-[#e0e7ff]');
content = content.replace(/bg-\[#151921\]/g, 'bg-white shadow-[4px_4px_0_rgba(15,23,42,1)] border-2 border-slate-900');
content = content.replace(/text-slate-300/g, 'text-slate-800');
content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/text-slate-400/g, 'text-slate-600');
content = content.replace(/text-slate-500/g, 'text-slate-600'); // changed slightly for better contrast on light
content = content.replace(/text-slate-600/g, 'text-slate-700'); 

// Slate borders
content = content.replace(/border-slate-800\/50/g, 'border-slate-900/10');
content = content.replace(/border-slate-800/g, 'border-slate-900');
content = content.replace(/border-slate-700/g, 'border-slate-900');

// Fix text inside bg-slate-800 before it changes
// Avoid nested changes by targeting exactly
content = content.replace(/bg-slate-800\/20/g, 'bg-slate-50');
content = content.replace(/bg-slate-800\/30/g, 'bg-slate-50');
content = content.replace(/bg-slate-800/g, 'bg-[#c7d2fe] border-2 border-slate-900 shadow-[2px_2px_0_rgba(15,23,42,1)] text-slate-900');
content = content.replace(/bg-slate-900/g, 'bg-white border-2 border-slate-900 shadow-inner');
content = content.replace(/bg-indigo-900\/50/g, 'bg-white border-2 border-slate-900 shadow-inner');
content = content.replace(/bg-\[#0a0f1a\]/g, 'bg-white/50');
content = content.replace(/bg-\[#05080f\]/g, 'bg-white rounded-xl shadow-[4px_4px_0_rgba(15,23,42,1)] border-2 border-slate-900');

// Table hover
content = content.replace(/hover:bg-slate-800\/20/g, 'hover:bg-slate-100');

// Indigo and Blue stuff
content = content.replace(/bg-indigo-600\/10/g, 'bg-[#c7d2fe] border-2 border-slate-900 shadow-[4px_4px_0_rgba(15,23,42,1)]');
content = content.replace(/bg-blue-600\/10/g, 'bg-blue-100 border-2 border-slate-900 shadow-[4px_4px_0_rgba(15,23,42,1)]');
content = content.replace(/bg-emerald-500\/10/g, 'bg-emerald-100 border-2 border-slate-900 text-emerald-800');

// Special text rules for buttons that shouldn't disappear
content = content.replace(/text-indigo-400/g, 'text-indigo-700');
content = content.replace(/text-blue-400/g, 'text-blue-700');
content = content.replace(/text-emerald-400/g, 'text-emerald-700');

fs.writeFileSync('src/App.tsx', content);
console.log("Theme updated");
