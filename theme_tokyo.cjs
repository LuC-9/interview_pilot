const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Global Background
content = content.replace(/bg-\[#0B0E14\]/g, 'bg-[#1a1b26]');
content = content.replace(/bg-\[#e0e7ff\]/g, 'bg-[#1a1b26]');

// Card backgrounds
content = content.replace(/bg-\[#151921\]/g, 'bg-[#1f2335]');
content = content.replace(/bg-slate-800/g, 'bg-[#1f2335]');
content = content.replace(/bg-slate-900/g, 'bg-[#15161e]');

// Borders
content = content.replace(/border-slate-800\/50/g, 'border-[#292e42]');
content = content.replace(/border-slate-800/g, 'border-[#292e42]');
content = content.replace(/border-slate-700/g, 'border-[#292e42]');

// Text colors
content = content.replace(/text-slate-300/g, 'text-[#c0caf5]');
content = content.replace(/text-white/g, 'text-[#c0caf5]');
content = content.replace(/text-slate-400/g, 'text-[#a9b1d6]');
content = content.replace(/text-slate-500/g, 'text-[#565f89]');

// Hover states
content = content.replace(/hover:bg-slate-800\/20/g, 'hover:bg-[#292e42]');
content = content.replace(/hover:border-slate-500/g, 'hover:border-[#7aa2f7]');
content = content.replace(/hover:text-white/g, 'hover:text-[#c0caf5]');
content = content.replace(/hover:text-slate-300/g, 'hover:text-[#c0caf5]');

// Indigo/Blue Highlights -> Developer Blue
content = content.replace(/bg-indigo-600/g, 'bg-[#7aa2f7] text-[#15161e]');
content = content.replace(/text-indigo-500/g, 'text-[#7aa2f7]');
content = content.replace(/text-indigo-400/g, 'text-[#7aa2f7]');
content = content.replace(/bg-blue-600/g, 'bg-[#7aa2f7] text-[#15161e]');
content = content.replace(/text-blue-500/g, 'text-[#7aa2f7]');
content = content.replace(/text-blue-400/g, 'text-[#7aa2f7]');
content = content.replace(/bg-blue-100/g, 'bg-[#7aa2f7]/20');
content = content.replace(/border-blue-500\/20/g, 'border-[#7aa2f7]/30');
content = content.replace(/bg-indigo-600\/10/g, 'bg-[#7aa2f7]/10');
content = content.replace(/bg-blue-600\/10/g, 'bg-[#7aa2f7]/10');

// Emerald -> Green highlight
content = content.replace(/text-emerald-500/g, 'text-[#9ece6a]');
content = content.replace(/text-emerald-400/g, 'text-[#9ece6a]');
content = content.replace(/bg-emerald-500/g, 'bg-[#9ece6a]');
content = content.replace(/border-emerald-500\/30/g, 'border-[#9ece6a]/30');

// Shadows (Remove gross pastel shadows)
content = content.replace(/shadow-\[2px_2px_0_rgba\(15,23,42,1\)\]/g, 'shadow-sm');
content = content.replace(/shadow-\[4px_4px_0_rgba\(15,23,42,1\)\]/g, 'shadow-md');
content = content.replace(/border-2/g, 'border');

fs.writeFileSync('src/App.tsx', content);
console.log('Applied byluc.in Tokyo Night theme!');
