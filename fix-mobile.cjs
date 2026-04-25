const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /<div className="overflow-auto custom-scrollbar flex-1">/g,
  '<div className="overflow-x-auto custom-scrollbar flex-1 relative w-full">'
);

app = app.replace(
  /<table className="w-full text-left border-collapse">/g,
  '<table className="w-full text-left border-collapse whitespace-nowrap lg:whitespace-normal">'
);

app = app.replace(
  /className="px-4 py-2 bg-\[#1f2335\] text-\[#7aa2f7\] hover:bg-\[#7aa2f7\] text-\[#15161e\] hover:text-\[#c0caf5\] border border-indigo-500\/20 text-\[10px\] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-end gap-2 ml-auto"/g,
  'className="px-4 py-2 bg-transparent text-white border-white border hover:bg-white hover:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ml-auto shrink-0"'
);

// We had already replaced text-[#7aa2f7] hover:bg-[#7aa2f7] text-[#15161e] hover:text-[#c0caf5] with text-white hover:bg-[#7aa2f7] hover:text-[#15161e] previously.
app = app.replace(
  /className="px-4 py-2 bg-\[#1f2335\] text-white hover:bg-\[#7aa2f7\] hover:text-\[#15161e\] border border-indigo-500\/20 text-\[10px\] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-end gap-2 ml-auto"/g,
  'className="px-4 py-2 bg-transparent text-white border-white border hover:bg-white hover:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ml-auto shrink-0"'
);

app = app.replace(
  /<th className="p-4 font-bold">Category<\/th>/g,
  '<th className="p-4 font-bold hidden md:table-cell">Category</th>'
);

app = app.replace(
  /<th className="p-4 font-bold">Difficulty<\/th>/g,
  '<th className="p-4 font-bold hidden sm:table-cell">Difficulty</th>'
);

app = app.replace(
  /<td className="p-4">\s*<span className="text-\[10px\] font-bold uppercase tracking-widest text-\[#a9b1d6\] bg-\[#15161e\] border border-\[#292e42\] px-2 py-1 rounded">\s*\{q\.category \? q\.category\.replace\('DSA - ', ''\) : 'Algorithm'\}\s*<\/span>\s*<\/td>/g,
  `<td className="p-4 hidden md:table-cell">
                                             <span className="text-[10px] font-bold uppercase tracking-widest text-[#a9b1d6] bg-[#15161e] border border-[#292e42] px-2 py-1 rounded">
                                                {q.category ? q.category.replace('DSA - ', '') : 'Algorithm'}
                                             </span>
                                          </td>`
);

app = app.replace(
  /<span className="cursor-pointer group-hover:text-\[#c0caf5\] transition-colors" onClick=\{[^\}]*\}>\{q\.question\}<\/span>/g,
  '<span className="cursor-pointer group-hover:text-[#c0caf5] transition-colors whitespace-normal sm:whitespace-nowrap max-w-[150px] sm:max-w-none line-clamp-2 md:line-clamp-none block" onClick={() => window.open(q.answer, \'_blank\')}>{q.question}</span>'
);

// We need to hide difficulty on mobile. We replaced th above, now td.
app = app.replace(
  /<td className="p-4">\s*<div className="flex items-center gap-2">\s*<span className=\{\`text-\[10px\] font-bold uppercase tracking-widest \$\{diff === 'Hard' \? 'text-red-400' : diff === 'Easy' \? 'text-\[#9ece6a\]' : 'text-amber-400'\}\`\}>\s*\{diff\}\s*<\/span>/g,
  `<td className="p-4 hidden sm:table-cell">
                                             <div className="flex items-center gap-2">
                                               <span className={\`text-[10px] font-bold uppercase tracking-widest \${diff === 'Hard' ? 'text-red-400' : diff === 'Easy' ? 'text-[#9ece6a]' : 'text-amber-400'}\`}>
                                                 {diff}
                                               </span>`
);

fs.writeFileSync('src/App.tsx', app);
