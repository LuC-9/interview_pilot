const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// The exact string in the file for button:
const targetButton = `className="px-4 py-2 bg-[#1f2335] text-white hover:bg-[#7aa2f7] hover:text-[#15161e] border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-end gap-2 ml-auto"`;
const replaceButton = `className="px-4 py-2 bg-transparent text-white border-white border hover:bg-white hover:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ml-auto shrink-0"`;

app = app.replace(targetButton, replaceButton);

// Overflow fix for mobile
const targetOverflow = `<div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">`;
const replaceOverflow = `<div className="overflow-x-auto custom-scrollbar flex-1 w-full relative">
                        <table className="w-full text-left border-collapse whitespace-nowrap lg:whitespace-normal">`;

app = app.replace(targetOverflow, replaceOverflow);

const targetThCat = `<th className="p-4 font-bold">Category</th>`;
const replaceThCat = `<th className="p-4 font-bold hidden md:table-cell">Category</th>`;
app = app.replace(targetThCat, replaceThCat);

const targetThDiff = `<th className="p-4 font-bold">Difficulty</th>`;
const replaceThDiff = `<th className="p-4 font-bold hidden sm:table-cell">Difficulty</th>`;
app = app.replace(targetThDiff, replaceThDiff);

const targetTdCatCat = `<td className="p-4">
                                             <span className="text-[10px] font-bold uppercase tracking-widest text-[#a9b1d6] bg-[#15161e] border border-[#292e42] px-2 py-1 rounded">
                                                {q.category ? q.category.replace('DSA - ', '') : 'Algorithm'}
                                             </span>
                                          </td>`;
const replaceTdCatCat = `<td className="p-4 hidden md:table-cell">
                                             <span className="text-[10px] font-bold uppercase tracking-widest text-[#a9b1d6] bg-[#15161e] border border-[#292e42] px-2 py-1 rounded">
                                                {q.category ? q.category.replace('DSA - ', '') : 'Algorithm'}
                                             </span>
                                          </td>`;
app = app.replace(targetTdCatCat, replaceTdCatCat);

const targetTdDiffDiff = `<td className="p-4">
                                             <div className="flex items-center gap-2">
                                               <span className={\`text-[10px] font-bold uppercase tracking-widest \${diff === 'Hard' ? 'text-red-400' : diff === 'Easy' ? 'text-[#9ece6a]' : 'text-amber-400'}\`}>`;

const replaceTdDiffDiff = `<td className="p-4 hidden sm:table-cell">
                                             <div className="flex items-center gap-2">
                                               <span className={\`text-[10px] font-bold uppercase tracking-widest \${diff === 'Hard' ? 'text-red-400' : diff === 'Easy' ? 'text-[#9ece6a]' : 'text-amber-400'}\`}>`;
app = app.replace(targetTdDiffDiff, replaceTdDiffDiff);

const targetTdProblem = `<span className="cursor-pointer group-hover:text-[#c0caf5] transition-colors" onClick={() => window.open(q.answer, '_blank')}>{q.question}</span>`;
const replaceTdProblem = `<span className="cursor-pointer group-hover:text-[#c0caf5] transition-colors whitespace-normal sm:whitespace-nowrap max-w-[120px] sm:max-w-none line-clamp-2 sm:line-clamp-none block" onClick={() => window.open(q.answer, '_blank')}>{q.question}</span>`;
app = app.replace(targetTdProblem, replaceTdProblem);

fs.writeFileSync('src/App.tsx', app);
