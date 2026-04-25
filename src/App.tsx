/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { 
  BookOpen, 
  Terminal, 
  Cloud, 
  Cpu, 
  Code2, 
  Search, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Lightbulb, 
  Layout,
  MessageSquare,
  Clock,
  ClipboardList,
  Target,
  Zap,
  Box,
  Compass,
  Check,
  ChevronDown,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ClipboardPen,
  ArrowLeft,
  LineChart,
  Upload,
  X,
  FileText,
  RefreshCcw
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { questions, Question, tutorials, Tutorial, Category, masterRoadmap } from './data';
import { dsaQuestions } from './dsaData';

type Tab = 'bank' | 'plan' | 'mock' | 'jd' | 'tutorials' | 'dsa';
type AppMode = 'evolent' | 'master';

const MermaidChart = ({ chart }: { chart: string }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose',
      });
      mermaid.render(`mermaid-${Math.random().toString(36).substring(2)}`, chart)
        .then(({ svg }) => {
          if (chartRef.current) {
             chartRef.current.innerHTML = svg;
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [chart]);

  return <div ref={chartRef} className="mermaid-chart my-4 flex justify-center bg-[#1a1b26] p-4 rounded-xl border border-[#292e42]" />;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('bank');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAnswerIdx, setShowAnswerIdx] = useState<number[]>([]);
  const [appMode, setAppMode] = useState<AppMode>('evolent');
  const [activeLab, setActiveLab] = useState<{ title: string; cat: string; diff: string } | null>(null);
  const [dsaMode, setDsaMode] = useState<string>('patterns');
  const [dbCompanies, setDbCompanies] = useState<string[]>([]);
  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [timePeriod, setTimePeriod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('frequency');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [page, setPage] = useState<number>(1);
  const [totalDbQuestions, setTotalDbQuestions] = useState<number>(0);
  const [dsaSearchQuery, setDsaSearchQuery] = useState<string>('');
  const [dsaDebouncedSearch, setDsaDebouncedSearch] = useState<string>('');
  const [dsaDifficultyFilter, setDsaDifficultyFilter] = useState<string>('all');
  const [showPrepGuide, setShowPrepGuide] = useState<boolean>(false);

  const [prepTab, setPrepTab] = useState<'ds' | 'algo'>('ds');
  const [prepTopic, setPrepTopic] = useState<string>('all');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeAlignment, setResumeAlignment] = useState<{ score: number; missing: string[]; matched: string[]; feedback: string } | null>(null);

  const getMockChartData = (company: string, tab: 'ds' | 'algo') => {
    const seed = company.charCodeAt(0) + company.charCodeAt(company.length - 1);
    const dsaCategories = [
      { name: 'Array', value: 20 + (seed % 15), color: '#3b82f6' },
      { name: 'String', value: 15 + (seed % 10), color: '#10b981' },
      { name: 'Hash Table', value: 12 + (seed % 8), color: '#f59e0b' },
      { name: 'Tree', value: 10 + (seed % 5), color: '#6366f1' },
      { name: 'Graph', value: 8 + (seed % 4), color: '#ec4899' },
    ];
    const algoCategories = [
      { name: 'Dynamic Programming', value: 18 + (seed % 12), color: '#8b5cf6' },
      { name: 'Sorting', value: 12 + (seed % 8), color: '#ef4444' },
      { name: 'Greedy', value: 10 + (seed % 6), color: '#14b8a6' },
      { name: 'Binary Search', value: 8 + (seed % 5), color: '#f97316' },
      { name: 'Two Pointers', value: 15 + (seed % 10), color: '#0ea5e9' },
    ];
    return tab === 'ds' ? dsaCategories : algoCategories;
  };

  const chartData = getMockChartData(dsaMode, prepTab);
  const activeTopicObj = prepTopic === 'all' ? chartData[0] : chartData.find(d => d.name === prepTopic) || chartData[0];
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDsaDebouncedSearch(dsaSearchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [dsaSearchQuery]);

  // Fetch companies from DB
  const fetchCompanies = () => {
    return fetch('/api/companies')
      .then(res => res.json())
      .then(data => setDbCompanies(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSyncData = async () => {
    setIsSyncingData(true);
    try {
      const res = await fetch('/api/sync-data', { method: 'POST' });
      if (res.ok) {
        await fetchCompanies();
        setPage(1); // triggers question refetch
        // small hack to force trigger refetch if page is already 1
        setTotalDbQuestions(prev => prev + 1); 
        setTimeout(() => setTotalDbQuestions(prev => prev - 1), 50);
      } else {
        const err = await res.json();
        alert("Failed to sync data: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to sync data");
    } finally {
      setIsSyncingData(false);
    }
  };

  useEffect(() => {
    setShowPrepGuide(false);
    setPrepTab('ds');
    setPrepTopic('all');
  }, [dsaMode]);

  useEffect(() => {
    setPrepTopic('all');
    setPage(1);
  }, [prepTab]);

  useEffect(() => {
    setPage(1);
  }, [prepTopic, dsaMode, timePeriod, dsaDifficultyFilter]);

  // Fetch questions from DB when mode is not patterns
  useEffect(() => {
    if (dsaMode !== 'patterns') {
      const actualPeriod = dsaMode === 'all_problems' ? dsaDifficultyFilter : timePeriod;
      let url = `/api/questions?company=${dsaMode}&period=${actualPeriod}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=50&search=${encodeURIComponent(dsaDebouncedSearch)}`;
      if (prepTopic !== 'all') {
         url += `&prepTopic=${encodeURIComponent(prepTopic)}`;
      }
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setDbQuestions(data.data || []);
          setTotalDbQuestions(data.total || 0);
        })
        .catch(console.error);
    }
  }, [dsaMode, timePeriod, sortBy, sortOrder, page, dsaDebouncedSearch, dsaDifficultyFilter, prepTopic]);

  const [expandedNotesId, setExpandedNotesId] = useState<number | null>(null);

  // Progress Tracking State
  const [completedIds, setCompletedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('master_prep_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const navigateToSyllabus = (target: string) => {
    if (target === 'evolent-day-1') {
      setSelectedCategory('Evolent Day 1: Software & Platform');
      setActiveTab('bank');
    } else if (target === 'evolent-day-2') {
      setSelectedCategory('Evolent Day 2: Kubernetes Core');
      setActiveTab('bank');
    } else if (target === 'evolent-day-3') {
      setSelectedCategory('Evolent Day 3: The CNCF Stack');
      setActiveTab('bank');
    } else if (target === 'b1') {
      setSelectedCategory('General Backend'); // Or whatever is roughly equivalent
      setActiveTab('bank');
    } else if (target === 'f1') {
      setSelectedCategory('Frontend');
      setActiveTab('bank');
    } else if (target === 'd1') {
      setActiveTab('dsa');
    } else if (target === 'system-design') {
      setSelectedCategory('System Design');
      setActiveTab('bank');
    }
  };

  const [notes, setNotes] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('master_prep_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [focusText, setFocusText] = useState(() => {
    return localStorage.getItem('master_prep_focus') || 'Distributed Systems: CAP Theorem, Partitioning, and Consistency models.';
  });
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('master_prep_focus', focusText);
  }, [focusText]);

  useEffect(() => {
    setSelectedTag(null);
  }, [selectedCategory]);

  const handleUpdateNote = (id: number, val: string) => {
    const newNotes = { ...notes, [id]: val };
    setNotes(newNotes);
    localStorage.setItem('master_prep_notes', JSON.stringify(newNotes));
  };

  const exportData = () => {
    const data = { completedIds, notes };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview_pilot_session.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.completedIds) setCompletedIds(data.completedIds);
        if (data.notes) setNotes(data.notes);
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzingResume(true);
    
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }
      
      const analysis = await response.json();

      setResumeAlignment({
        score: analysis.score || 30,
        matched: analysis.matched || [],
        missing: analysis.missing || [],
        feedback: analysis.feedback || "AI analysis failed, please try again."
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      // Fallback
      setResumeAlignment({
        score: 30,
        matched: [],
        missing: ['React', 'Node', 'Typescript', 'Kubernetes', 'AWS'],
        feedback: "AI analysis unavailable."
      });
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('master_prep_completed', JSON.stringify(completedIds));
  }, [completedIds]);

  const toggleComplete = (id: number) => {
    setCompletedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Logic for Evolent mode vs Master mode
      if (appMode === 'evolent' && !q.isPlatform) return false;

      const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           q.answer.toLowerCase().includes(searchQuery.toLowerCase());
                           
      let matchesCategory = false;
      if (!selectedCategory) {
        matchesCategory = true;
      } else if (selectedCategory === 'evolent-day-1') {
        matchesCategory = ['Evolent Day 1: Software & Platform', 'Python & FastAPI', 'Node.js & TypeScript', 'Java & Spring Boot', 'General Backend'].includes(q.category);
      } else if (selectedCategory === 'evolent-day-2') {
        matchesCategory = ['Evolent Day 2: Kubernetes Core', 'Platform & DevOps'].includes(q.category);
      } else if (selectedCategory === 'evolent-day-3') {
        matchesCategory = ['Evolent Day 3: The CNCF Stack'].includes(q.category);
      } else {
        matchesCategory = q.category === selectedCategory || (selectedCategory && q.category.startsWith(selectedCategory)) || false;
      }

      let matchesTag = true;
      if (selectedTag && q.tags) {
        matchesTag = q.tags.includes(selectedTag);
      } else if (selectedTag && !q.tags) {
        matchesTag = false;
      }

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, selectedCategory, appMode, selectedTag]);

  const currentDsaQuestions = useMemo(() => {
    if (dsaMode === 'patterns') {
      return dsaQuestions;
    }
    return dbQuestions;
  }, [dsaMode, dbQuestions]);

  const availableTags = useMemo(() => {
    if (!selectedCategory) return [];
    const tags = new Set<string>();
    questions.forEach(q => {
      if (q.category === selectedCategory || q.category.startsWith(selectedCategory)) {
        if (q.tags) q.tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags).sort();
  }, [selectedCategory]);

  const toggleAnswer = (id: number) => {
    setShowAnswerIdx(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const categories = Array.from(new Set(questions.map(q => q.category)));

  return (
    <div className="min-h-screen bg-[#1a1b26] text-[#c0caf5] font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="bg-[#1a1b26] border-b border-[#292e42] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 lg:py-0 lg:h-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${appMode === 'evolent' ? 'bg-[#7aa2f7]/10 border border-[#7aa2f7]/30 text-[#7aa2f7]' : 'bg-[#f7768e]/10 border border-[#f7768e]/30 text-[#f7768e]'}`}>
                {appMode === 'evolent' ? <Terminal size={24} /> : <Zap size={24} />}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#c0caf5] leading-none">
                  {appMode === 'evolent' ? <>Interview <span className="text-[#7aa2f7]">Pilot</span></> : <>Master <span className="text-[#f7768e]">Path</span></>}
                </h1>
                <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-widest mt-1.5">
                  {appMode === 'evolent' ? 'Evolent Platform Engineer Prep' : 'Full-Stack & DSA Mastery'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
            {activeTab !== 'dsa' && (
              <div className="flex bg-[#1f2335] border-[#292e42] p-1 rounded-lg border border-[#292e42] shrink-0">
                <button 
                  onClick={() => setAppMode('evolent')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${appMode === 'evolent' ? 'bg-[#7aa2f7] text-[#15161e] shadow-lg' : 'text-[#a9b1d6] hover:text-[#c0caf5]'}`}
                >
                  Evolent
                </button>
                <button 
                  onClick={() => setAppMode('master')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${appMode === 'master' ? 'bg-[#f7768e] text-[#15161e] shadow-lg' : 'text-[#a9b1d6] hover:text-[#c0caf5]'}`}
                >
                  Master
                </button>
              </div>
            )}

            <nav className="flex overflow-x-auto custom-scrollbar items-center gap-2 bg-[#1f2335] border-[#292e42] p-1 border border-[#292e42] rounded-xl w-full lg:w-auto pb-1 sm:pb-1">
              {[
                { id: 'bank', label: 'Bank', icon: BookOpen },
                { id: 'dsa', label: 'DSA Hub', icon: Box },
                { id: 'plan', label: 'Roadmap', icon: Clock },
                { id: 'mock', label: 'Simulator', icon: MessageSquare },
                { id: 'jd', label: 'Analysis', icon: ClipboardList }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as Tab)}
                  className={`flex shrink-0 items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === t.id 
                      ? 'bg-[#7aa2f7] text-[#15161e] shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                      : 'text-[#a9b1d6] hover:text-[#c0caf5] hover:bg-[#1f2335] text-[#a9b1d6]'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Sidebar - Dynamically Content */}
          {activeTab !== 'dsa' && (
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            {appMode === 'evolent' ? (
              <>
                <h2 className="text-[10px] font-bold text-[#a9b1d6] uppercase tracking-widest mb-6 border-b border-[#292e42] pb-2">Evolent Pilot Roadmap</h2>
                
                {[
                  { id: 'evolent-day-1', matchCat: 'Evolent Day 1: Software & Platform', classPrefix: 'emerald', day: 'Day 01: Core Systems', title: 'Backstage & Backend APIs', desc: 'IDP architecture, FastAPI, Node plugins.' },
                  { id: 'evolent-day-2', matchCat: 'Evolent Day 2: Kubernetes Core', classPrefix: 'blue', day: 'Day 02: Infrastructure', title: 'K8s & Terraform', desc: 'AKS, Helm, TF Modules, State.' },
                  { id: 'evolent-day-3', matchCat: 'Evolent Day 3: The CNCF Stack', classPrefix: 'purple', day: 'Day 03: The Paved Road', title: 'GitOps & CNCF Stack', desc: 'ArgoCD, Kyverno, KEDA scaling.' }
                ].map((item, idx) => {
                  const isActive = selectedCategory === item.id || selectedCategory === item.matchCat;
                  const sectionQs = questions.filter(q => q.category === item.matchCat);
                  const sectionDone = sectionQs.filter(q => completedIds.includes(q.id));
                  const pct = Math.round((sectionDone.length / (sectionQs.length || 1)) * 100);
                  
                  const colors = {
                    emerald: {
                      borderActive: 'border-emerald-500',
                      bgActive: 'bg-emerald-400',
                      textDay: 'text-[#9ece6a]',
                      textPct: 'text-[#9ece6a]',
                      bgBar: 'bg-[#9ece6a]/80',
                      hoverBorder: 'group-hover:border-emerald-500',
                      shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                    },
                    blue: {
                      borderActive: 'border-blue-500',
                      bgActive: 'bg-blue-400',
                      textDay: 'text-[#7aa2f7]',
                      textPct: 'text-[#7aa2f7]',
                      bgBar: 'bg-blue-500/80',
                      hoverBorder: 'group-hover:border-blue-500',
                      shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                    },
                    purple: {
                      borderActive: 'border-purple-500',
                      bgActive: 'bg-purple-400',
                      textDay: 'text-purple-400',
                      textPct: 'text-purple-500',
                      bgBar: 'bg-purple-500/80',
                      hoverBorder: 'group-hover:border-purple-500',
                      shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                    }
                  }[item.classPrefix as 'emerald' | 'blue' | 'purple'];

                  return (
                    <div 
                      key={item.id}
                      className={`relative pl-8 pb-8 transition-colors ${idx !== 2 ? 'border-l' : ''} ${isActive ? colors.borderActive : idx !== 2 ? 'border-[#292e42]' : ''} group cursor-pointer`}
                      onClick={() => navigateToSyllabus(item.id)}
                    >
                      <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full transition-all ${isActive ? (colors.bgActive + ' ' + colors.shadow) : ('border border-[#292e42] bg-[#1a1b26] ' + colors.hoverBorder)}`}></div>
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-[10px] ${colors.textDay} font-mono font-bold uppercase whitespace-nowrap`}>{item.day}</p>
                        <span className={`text-[10px] ${colors.textPct} font-bold`}>{pct}%</span>
                      </div>
                      <p className="text-sm text-[#c0caf5] font-medium mb-2">{item.title}</p>
                      
                      <div className="h-1 w-full bg-[#1f2335] text-[#a9b1d6] rounded-full overflow-hidden mb-2">
                        <div className={`h-full ${colors.bgBar} transition-all duration-500`} style={{ width: String(pct) + '%' }}></div>
                      </div>
                      
                      <p className="text-xs text-[#a9b1d6] leading-relaxed italic">{item.desc}</p>
                    </div>
                  );
                })}

                <div className="mt-8 p-5 bg-blue-500/5 border border-[#7aa2f7]/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={14} className="text-[#7aa2f7]" />
                    <p className="text-[10px] uppercase font-bold text-[#7aa2f7] tracking-wider">Mission Pro-Tip</p>
                  </div>
                  <p className="text-[11px] italic text-[#a9b1d6] leading-relaxed font-serif">
                    "Connect your Java background to their Python needs by highlighting structural API design proficiency."
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[10px] font-bold text-[#a9b1d6] uppercase tracking-widest mb-6 border-b border-[#292e42] pb-2">Master Prep Metrics</h2>
                <div className="space-y-4">
                  <div className="bg-[#1f2335] border-[#292e42] p-6 rounded-2xl border border-[#292e42]">
                    <p className="text-[10px] uppercase text-[#a9b1d6] font-bold tracking-widest mb-3">Overall Progress</p>
                    <div className="flex items-center gap-4 mb-4">
                       <span className="text-2xl font-mono text-[#c0caf5] leading-none">{Math.round((completedIds.length / questions.length) * 100) || 0}%</span>
                       <div className="h-1.5 flex-grow bg-[#1f2335] text-[#a9b1d6] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500" style={{ width: `${Math.round((completedIds.length / questions.length) * 100) || 0}%` }}></div>
                       </div>
                    </div>
                    
                    {[
                      { key: 'Backend', label: 'Week 1-2: Backend', cats: ['General Backend', 'Network & Security', 'Python & FastAPI', 'Node.js & TypeScript', 'Java & Spring Boot', 'Platform & DevOps'] },
                      { key: 'Frontend', label: 'Week 3-4: Frontend', cats: ['Frontend'] },
                      { key: 'DSA', label: 'Week 5-8: Algorithmic', cats: ['System Design', 'DSA - Arrays & Strings', 'DSA - Trees & Graphs', 'DSA - Dynamic Programming'] },
                    ].map(section => {
                      const sectionQs = questions.filter(q => section.cats.includes(q.category));
                      const sectionDone = sectionQs.filter(q => completedIds.includes(q.id));
                      const pct = Math.round((sectionDone.length / (sectionQs.length || 1)) * 100);
                      return (
                        <div key={section.key} className="mb-3">
                          <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-[#a9b1d6]">{section.label}</span>
                            <span className="text-[#7aa2f7]">{pct}%</span>
                          </div>
                          <div className="h-1 w-full bg-[#1f2335] text-[#a9b1d6] rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500/80 transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="p-6 bg-[#7aa2f7] text-[#15161e]/5 border border-indigo-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Compass size={14} className="text-[#7aa2f7]" />
                      <p className="text-[10px] uppercase font-bold text-[#7aa2f7] tracking-wider">Focus of the Week</p>
                    </div>
                    <textarea 
                      value={focusText}
                      onChange={(e) => setFocusText(e.target.value)}
                      className="w-full bg-transparent text-xs text-[#a9b1d6] leading-relaxed font-bold resize-none outline-none custom-scrollbar"
                      rows={3}
                    />
                  </div>

                  {availableTags.length > 0 && selectedCategory && (
                    <div className="p-6 bg-[#1f2335] border-[#292e42] border border-[#292e42] rounded-2xl mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Filter size={14} className="text-[#a9b1d6]" />
                        <p className="text-[10px] uppercase font-bold text-[#a9b1d6] tracking-wider">Subcategory Filter</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {availableTags.map(tag => (
                           <button
                             key={tag}
                             onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                             className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all border ${
                               tag === selectedTag 
                               ? 'bg-[#7aa2f7] text-[#15161e] border-indigo-500 text-[#c0caf5]'
                               : 'bg-[#1f2335] text-[#a9b1d6] border-[#292e42] text-[#a9b1d6] hover:border-[#7aa2f7] hover:text-[#c0caf5]'
                             }`}
                           >
                             {tag}
                           </button>
                         ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
          )}

          {/* Main Content Area */}
          <section className={`col-span-12 ${activeTab !== 'dsa' ? 'lg:col-span-9' : ''} space-y-6`}>
            <AnimatePresence mode="wait">
              {activeTab === 'bank' && (
                <motion.div
                  key="bank"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setIsResumeModalOpen(true)}
                      className="bg-[#1f2335] border-[#292e42] border border-[#292e42] p-5 rounded-xl flex flex-col justify-between cursor-pointer hover:border-[#7aa2f7] transition-all group"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] uppercase text-[#a9b1d6] font-bold tracking-widest">Resume Alignment</p>
                        <span className="text-[9px] uppercase tracking-widest text-[#7aa2f7] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Upload size={10} /> Analyze
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-mono text-[#c0caf5] leading-none">{resumeAlignment ? resumeAlignment.score : 85}%</span>
                        <div className="h-1.5 flex-grow bg-[#1f2335] text-[#a9b1d6] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${resumeAlignment ? resumeAlignment.score : 85}%` }}
                            className={`h-full ${resumeAlignment && resumeAlignment.score < 60 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-[#9ece6a] shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#1f2335] border-[#292e42] border border-[#292e42] p-5 rounded-xl space-y-4">
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#292e42] gap-4">
                        <div>
                          <p className="text-[10px] uppercase text-[#a9b1d6] font-bold tracking-widest mb-1 mt-1">Data Storage</p>
                          <p className="text-xs text-[#a9b1d6] font-medium tracking-tight">Sync your tracking progress</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 custom-scrollbar shrink-0">
                          <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 shrink-0 bg-[#1f2335] text-[#a9b1d6] hover:bg-slate-700 text-[#c0caf5] text-[9px] font-bold uppercase tracking-widest rounded-lg transition-colors border border-[#292e42] hover:border-slate-600 shadow-sm">
                            Import
                          </button>
                          <button onClick={exportData} className="px-3 py-1.5 shrink-0 bg-[#7aa2f7] text-[#15161e]/10 hover:bg-[#7aa2f7] text-[#15161e]/20 text-[#7aa2f7] text-[9px] font-bold uppercase tracking-widest rounded-lg transition-colors border border-[#7aa2f7]/30 hover:border-blue-500/40 shadow-sm flex items-center gap-2">
                            <Download size={12} /> Backup
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] uppercase text-[#a9b1d6] font-bold tracking-widest mb-1">Prep Status</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#9ece6a] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-xs font-bold text-[#c0caf5] uppercase tracking-tighter">Live Sync</span>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] uppercase text-[#a9b1d6] font-bold tracking-widest">Bank</p>
                           <p className="text-lg font-mono text-[#c0caf5] leading-none">{completedIds.length}/{questions.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9b1d6]" size={18} />
                      <input 
                        type="text" 
                        placeholder="SEARCH MISSION DATABASE..."
                        className="w-full pl-12 pr-4 py-4 bg-[#1f2335] border-[#292e42] border border-[#292e42] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-[#c0caf5] font-mono text-sm placeholder:text-[#a9b1d6] shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          !selectedCategory ? 'bg-[#7aa2f7] text-[#15161e] shadow-lg' : 'bg-[#1f2335] text-[#a9b1d6] text-[#a9b1d6] hover:text-[#c0caf5]'
                        }`}
                      >
                        ALL TOPICS
                      </button>
                      {Array.from(new Set(categories.map(cat => cat.split(' - ')[0]))).map((displayCat) => {
                        if (displayCat.includes('Evolent')) return null;
                        const isActive = selectedCategory?.startsWith(displayCat);
                        return (
                          <button 
                            key={displayCat}
                            onClick={() => setSelectedCategory(displayCat)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                              isActive ? 'bg-[#7aa2f7] text-[#15161e] shadow-lg' : 'bg-[#1f2335] text-[#a9b1d6] text-[#a9b1d6] hover:text-[#c0caf5]'
                            }`}
                          >
                            {displayCat.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question Cards */}
                  <div className="grid grid-cols-1 gap-3">
                    {filteredQuestions.map((q) => (
                      <div key={q.id}>
                        <QuestionCard 
                          q={q} 
                          isOpen={showAnswerIdx.includes(q.id)} 
                          onToggle={() => toggleAnswer(q.id)} 
                          isDone={completedIds.includes(q.id)}
                          onToggleDone={() => toggleComplete(q.id)}
                          note={notes[q.id] || ''}
                          onUpdateNote={(val) => handleUpdateNote(q.id, val)}
                          onSolve={() => { setActiveTab('dsa'); setActiveLab({ title: q.question, cat: q.category.replace('DSA - ', ''), diff: q.tags?.includes('Hard') ? 'Hard' : 'Medium' }); }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'tutorials' && (
                <motion.div
                  key="tutorials"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tutorials.map((video) => (
                      <div 
                        key={video.id}
                        className="bg-[#1f2335] border-[#292e42] border border-[#292e42] rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group"
                      >
                        <div className="aspect-video bg-[#15161e] flex items-center justify-center relative">
                          <Layout className="text-[#c0caf5] group-hover:text-[#7aa2f7]/20 transition-colors" size={48} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <a 
                              href={video.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-16 h-16 bg-[#7aa2f7] text-[#15161e] rounded-full flex items-center justify-center text-[#c0caf5] shadow-2xl opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all"
                            >
                              <ArrowRight size={24} />
                            </a>
                          </div>
                          <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/80 rounded text-[10px] font-mono text-[#c0caf5]">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-[#c0caf5] text-sm leading-tight mb-1 group-hover:text-[#7aa2f7] transition-colors">
                                {video.title}
                              </h4>
                              <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-widest">
                                {video.provider}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {video.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-[#1f2335]/50 text-[#a9b1d6] text-[#a9b1d6] text-[8px] font-bold rounded uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'plan' && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <div className="text-center space-y-4 mb-12">
                    <h2 className="text-4xl font-bold text-[#c0caf5] tracking-tight">The {appMode === 'evolent' ? '3-Day Triage' : '8-Week Master Roadmap'}</h2>
                    <p className="text-[#a9b1d6] max-w-2xl mx-auto">
                      {appMode === 'evolent' 
                        ? "A surgically precise preparation plan for the Evolent Platform Engineering role."
                        : "A comprehensive trajectory designed to transform you into a top-tier Full-Stack System Engineer."
                      }
                    </p>
                  </div>

                  {appMode === 'evolent' ? (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DayCard 
                          day="1" 
                          title="Software & Platform" 
                          icon={Code2}
                          items={[
                            "Backstage Catalog/Templates",
                            "FastAPI vs Node vs Spring",
                            "Multi-stage Docker builds",
                            "DB & Caching patterns"
                          ]}
                          focus="Frontend of Infra"
                          color="blue"
                          onClick={() => navigateToSyllabus('evolent-day-1')}
                        />
                        <DayCard 
                          day="2" 
                          title="Kubernetes Core" 
                          icon={Cloud}
                          items={[
                            "AKS/ACA Azure Specs",
                            "Terraform vs Ansible",
                            "K8s Resource Debugging",
                            "Helm/Kustomize diffs"
                          ]}
                          focus="The Stability Pillar"
                          color="emerald"
                          onClick={() => navigateToSyllabus('evolent-day-2')}
                        />
                        <DayCard 
                          day="3" 
                          title="The CNCF Stack" 
                          icon={Cpu}
                          items={[
                            "ArgoCD GitOps Patterns",
                            "KEDA Event-driven Scaling",
                            "Kyverno Policy Engine",
                            "Behavioral Scenario Drills"
                          ]}
                          focus="The Bonus Multiplier"
                          color="purple"
                          onClick={() => navigateToSyllabus('evolent-day-3')}
                        />
                     </div>
                  ) : (
                    <div className="space-y-6">
                      {masterRoadmap.map((step) => (
                        <div key={step.id} className="bg-[#1f2335] border-[#292e42] border border-[#292e42] p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-start hover:border-indigo-500/30 transition-all">
                          <div className="w-full md:w-56 shrink-0">
                            <span className="px-3 py-1 bg-indigo-500/10 text-[#7aa2f7] text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20 block w-fit mb-4">
                              {step.duration}
                            </span>
                            <p className="text-[#c0caf5] font-bold text-lg mb-1 leading-tight">{step.phase}</p>
                            <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-widest">{step.focus}</p>
                          </div>
                          <div className="flex-1 space-y-6">
                            <div>
                              <h4 className="text-xl font-bold text-[#c0caf5] mb-4">{step.title}</h4>
                              <div className="flex flex-wrap gap-2">
                                 {step.topics.map(t => (
                                   <span key={t} className="px-3 py-1.5 bg-[#1f2335]/50 text-[#a9b1d6] text-[#a9b1d6] text-xs font-medium rounded-xl border border-[#292e42]">{t}</span>
                                 ))}
                              </div>
                            </div>
                            <button 
                              onClick={() => navigateToSyllabus(step.id)}
                              className="flex items-center gap-2 text-[#7aa2f7] text-[10px] font-bold uppercase tracking-widest hover:text-[#7aa2f7] transition-colors group"
                            >
                              Expand Syllabus <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            {step.id === 'd1' && (
                              <button 
                                onClick={() => navigateToSyllabus('system-design')}
                                className="mt-4 flex items-center gap-2 text-[#7aa2f7] text-[10px] font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors group"
                              >
                                View System Design Questions <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'mock' && (
                <motion.div
                  key="mock"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-inner border transition-colors ${appMode === 'evolent' ? 'bg-blue-500/10 border-[#7aa2f7]/30 text-[#7aa2f7]' : 'bg-indigo-500/10 border-indigo-500/20 text-[#7aa2f7]'}`}>
                    {appMode === 'evolent' ? <MessageSquare size={32} /> : <Target size={32} />}
                  </div>
                  <h2 className="text-3xl font-bold text-[#c0caf5] mb-4 uppercase tracking-tight">Interview Technical Simulator</h2>
                  <p className="text-[#a9b1d6] mb-12 max-w-lg leading-relaxed text-sm">
                    {appMode === 'evolent' 
                      ? "High-pressure simulation for Evolent's Platform Engineering interview. Master the intersection of Software and Infrastructure."
                      : "The ultimate training ground. Select your discipline and prove your mastery in deep-dive technical rounds."
                    }
                  </p>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                      {appMode === 'evolent' ? (
                        <>
                          <div className="space-y-4">
                            <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-[0.2em] mb-2 px-2">Mission Day 1</p>
                            <button 
                              onClick={() => { setSelectedCategory('Evolent Day 1: Software & Platform'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-blue-500/50 group"
                            >
                              <div className="mb-4 text-[#7aa2f7] font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Terminal size={18} /> Software & Platform
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">Backstage Catalog, FastAPI vs Node, Docker, and Caching.</p>
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-[0.2em] mb-2 px-2">Mission Day 2</p>
                            <button 
                              onClick={() => { setSelectedCategory('Evolent Day 2: Kubernetes Core'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-emerald-500/50 group"
                            >
                              <div className="mb-4 text-[#9ece6a] font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Cloud size={18} /> Kubernetes Core
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">AKS, Terraform vs Ansible, and K8s Resource Debugging.</p>
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-[0.2em] mb-2 px-2">Mission Day 3</p>
                            <button 
                              onClick={() => { setSelectedCategory('Evolent Day 3: The CNCF Stack'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-purple-500/50 group"
                            >
                              <div className="mb-4 text-purple-500 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Cpu size={18} /> The CNCF Stack
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">ArgoCD, KEDA Event-driven Scaling, and Kyverno Policies.</p>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Backend Column */}
                          <div className="space-y-4">
                            <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-[0.2em] mb-2 px-2">Backend Engineering</p>
                            <button 
                              onClick={() => { setSelectedCategory('Python & FastAPI'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-blue-500/50 group"
                            >
                              <div className="mb-4 text-[#7aa2f7] font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Terminal size={18} /> FastAPI Track
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">Async APIs, Pydantic, and Deployment.</p>
                            </button>
                            <button 
                              onClick={() => { setSelectedCategory('Java & Spring Boot'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-red-500/50 group"
                            >
                              <div className="mb-4 text-red-500 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Zap size={18} /> Spring Boot Track
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">Enterprise patterns and JVM scaling.</p>
                            </button>
                            <button 
                              onClick={() => { setSelectedCategory('Node.js & TypeScript'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-emerald-600/50 group"
                            >
                              <div className="mb-4 text-emerald-600 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Code2 size={18} /> Node.js Track
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">Event Loop, Express, and Nest.js.</p>
                            </button>
                          </div>

                          {/* Frontend Column */}
                          <div className="space-y-4">
                            <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-[0.2em] mb-2 px-2">Frontend Engineering</p>
                            <button 
                              onClick={() => { setSelectedCategory('Frontend'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-purple-500/50 group"
                            >
                              <div className="mb-4 text-purple-500 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Layout size={18} /> Frontend Mastery
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">React, Next.js, Angular, and Performance.</p>
                            </button>
                          </div>

                          {/* DSA / Platform Column */}
                          <div className="space-y-4">
                            <p className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-[0.2em] mb-2 px-2">Logic & Infrastructure</p>
                            <button 
                              onClick={() => { setSelectedCategory('DSA - Arrays & Strings'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-amber-500/50 group"
                            >
                              <div className="mb-4 text-amber-500 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Compass size={18} /> DSA Basics
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">Sliding Window, Two Pointers.</p>
                            </button>
                            <button 
                              onClick={() => { setSelectedCategory('System Design'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-orange-500/50 group"
                            >
                              <div className="mb-4 text-orange-500 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Box size={18} /> System Design
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">Microservices, Scaling, Cache.</p>
                            </button>
                            <button 
                              onClick={() => { setSelectedCategory('Platform & DevOps'); setActiveTab('bank'); setSearchQuery(''); }}
                              className="w-full bg-[#1f2335] border-[#292e42] hover:bg-[#1C222C] p-6 rounded-2xl border border-[#292e42] text-left transition-all hover:border-emerald-500/50 group"
                            >
                              <div className="mb-4 text-[#9ece6a] font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Cloud size={18} /> Platform/DevOps
                              </div>
                              <p className="text-[11px] text-[#a9b1d6] leading-relaxed font-medium">K8s, GitOps, and IDP Architecture.</p>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                </motion.div>
              )}

              {activeTab === 'dsa' && (
                <motion.div
                  key="dsa"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {dsaMode !== 'patterns' && dsaMode !== 'all_problems' ? (
                    <div className="bg-[#7888f0] rounded-xl overflow-hidden border border-[#292e42] shadow-md">
                      <div className="flex justify-between items-center p-3 bg-[#7888f0] border-b-2 border-[#292e42]">
                        <button 
                          onClick={() => setDsaMode('all_problems')} 
                          className="flex items-center gap-2 bg-[#1f2335] text-[#c0caf5] px-4 py-2 rounded-lg font-bold text-sm border border-[#292e42] hover:bg-[#1f2335]/20 transition-colors shadow-sm active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
                        >
                          <ArrowLeft size={16} /> All Companies
                        </button>
                        <button 
                          onClick={() => setShowPrepGuide(!showPrepGuide)} 
                          className={`flex items-center gap-2 bg-[#1f2335] text-[#c0caf5] px-4 py-2 rounded-lg font-bold text-sm border border-[#292e42] hover:bg-[#1f2335]/20 transition-colors ${showPrepGuide ? 'shadow-inner translate-y-[2px] translate-x-[2px]' : 'shadow-sm active:shadow-none active:translate-y-[2px] active:translate-x-[2px]'}`}
                        >
                          <LineChart size={16} /> Prep Guide
                        </button>
                      </div>
                      <div className="bg-[#1f2335] p-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center font-black text-2xl uppercase border border-slate-200 text-[#a9b1d6]">
                            {dsaMode.substring(0, 1)}
                          </div>
                          <div>
                            <h2 className="text-3xl font-black capitalize text-[#c0caf5]">{dsaMode}</h2>
                            <p className="text-[#a9b1d6] font-bold">{totalDbQuestions} Problems</p>
                          </div>
                        </div>
                        <div className="w-full mt-4">
                          <div className="flex items-center gap-4 mb-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a9b1d6]">
                              Completed {completedIds.filter(id => dbQuestions.some(q => q.id === id)).length}/{totalDbQuestions}
                            </p>
                          </div>
                          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-[#292e42] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <div 
                              className="h-full bg-[#7888f0] border-r-2 border-[#292e42] transition-all duration-500" 
                              style={{ width: `${Math.round((completedIds.filter(id => dbQuestions.some(q => q.id === id)).length / totalDbQuestions) * 100) || 0}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#7aa2f7] text-[#15161e] rounded-3xl p-8 text-[#c0caf5] flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="max-w-xl">
                        <div className="flex flex-col mb-2 gap-4 sm:flex-row items-center justify-between">
                          <h2 className="text-3xl font-bold">DSA Mastery Hub</h2>
                          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={handleSyncData}
                              disabled={isSyncingData}
                              className={`bg-[#1f2335] text-[#c0caf5] border border-[#292e42] px-3 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:border-[#7aa2f7] transition-all flex items-center gap-2 whitespace-nowrap justify-center w-full sm:w-auto ${isSyncingData ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              <RefreshCcw size={14} className={isSyncingData ? "animate-spin text-[#7aa2f7]" : ""} />
                              {isSyncingData ? 'Syncing...' : 'Sync Data'}
                            </button>
                            <div className="relative w-full sm:w-auto">
                              <select 
                                value={dsaMode} 
                                onChange={(e) => setDsaMode(e.target.value)}
                                className="appearance-none bg-[#15161e] border border-[#292e42] text-[#c0caf5] text-[11px] font-bold rounded-xl px-4 py-2.5 outline-none uppercase tracking-widest w-full sm:w-auto cursor-pointer hover:border-[#7aa2f7] transition-all shadow-md pr-10"
                              >
                              <option value="patterns" className="bg-[#15161e] text-[#c0caf5] py-2">Neetcode 150 (Patterns)</option>
                              <option value="all_problems" className="bg-[#15161e] text-[#c0caf5] py-2">All LeetCode Problems</option>
                              <optgroup label="Top Companies" className="bg-[#1a1b26] text-[#7aa2f7] py-2 font-bold uppercase tracking-widest">
                                 {dbCompanies.map(key => (
                                    <option key={key} value={key} className="bg-[#15161e] text-[#a9b1d6]">{key}</option>
                                 ))}
                              </optgroup>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7aa2f7]">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        </div>
                        </div>
                        <p className="text-indigo-100/80 text-sm mb-6">
                          Curated algorithmic challenges. Focus on patterns or specific top company frequently asked questions to build intuition.
                        </p>
                        
                        <div className="w-full max-w-md">
                           <div className="flex justify-between items-end mb-2">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">DSA Progress</p>
                             <p className="text-xs font-mono font-bold">
                               {dsaMode === 'patterns' 
                                 ? `${currentDsaQuestions.filter(q => completedIds.includes(q.id)).length} / ${currentDsaQuestions.length}`
                                 : `${completedIds.length} / ${dsaMode === 'all_problems' ? 3865 : totalDbQuestions}`}
                             </p>
                           </div>
                           <div className="h-2 w-full bg-[#15161e] rounded-full overflow-hidden">
                             <div className="h-full bg-[#1f2335] shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500" 
                               style={{ width: `${dsaMode === 'patterns' ? Math.round((currentDsaQuestions.filter(q => completedIds.includes(q.id)).length / currentDsaQuestions.length) * 100) || 0 : Math.round((completedIds.length / (dsaMode === 'all_problems' ? 3865 : totalDbQuestions)) * 100) || 0}%` }} 
                             />
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {dsaMode !== 'patterns' && !showPrepGuide && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1f2335] border-[#292e42] p-4 rounded-2xl border border-[#292e42]">
                      <div className="flex flex-wrap gap-2 items-center flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a9b1d6]" size={14} />
                          <input 
                            type="text" 
                            placeholder="Search problems..." 
                            value={dsaSearchQuery}
                            onChange={(e) => setDsaSearchQuery(e.target.value)}
                            className="bg-[#15161e] border border-[#292e42] text-[#c0caf5] text-xs rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-indigo-500 transition-colors w-48"
                          />
                        </div>

                        {dsaMode === 'all_problems' ? (
                          <div className="relative">
                            <select
                              value={dsaDifficultyFilter}
                              onChange={(e) => { setDsaDifficultyFilter(e.target.value); setPage(1); }}
                              className="appearance-none bg-[#15161e] border border-[#292e42] text-[#c0caf5] text-[10px] font-bold rounded-lg px-3 py-1.5 outline-none uppercase tracking-widest cursor-pointer hover:border-[#7aa2f7] transition-all pr-8"
                            >
                              <option value="all">All Difficulties</option>
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#7aa2f7]">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              value={timePeriod}
                              onChange={(e) => { setTimePeriod(e.target.value); setPage(1); }}
                              className="appearance-none bg-[#15161e] border border-[#292e42] text-[#c0caf5] text-[10px] font-bold rounded-lg px-3 py-1.5 outline-none uppercase tracking-widest cursor-pointer hover:border-[#7aa2f7] transition-all pr-8"
                            >
                              <option value="all">All Time</option>
                              <option value="more_than_6_months">{">"} 6 Months</option>
                              <option value="6_months">6 Months</option>
                              <option value="3_months">3 Months</option>
                              <option value="30_days">30 Days</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#7aa2f7]">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        )}

                        <div className="h-6 w-px bg-[#1f2335] text-[#a9b1d6] hidden sm:block mx-1"></div>

                        <div className="relative">
                          <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="appearance-none bg-[#15161e] border border-[#292e42] text-[#c0caf5] text-[10px] font-bold rounded-lg px-3 py-1.5 outline-none uppercase tracking-widest cursor-pointer hover:border-[#7aa2f7] transition-all pr-8"
                          >
                            {dsaMode !== 'all_problems' && <option value="frequency">Sort by Frequency</option>}
                            <option value="id">Sort by ID</option>
                            <option value="difficulty_val">Sort by Difficulty</option>
                            <option value="acceptance">Sort by Acceptance</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#7aa2f7]">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                        <div className="relative">
                          <select
                            value={sortOrder}
                            onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
                            className="appearance-none bg-[#15161e] border border-[#292e42] text-[#c0caf5] text-[10px] font-bold rounded-lg px-3 py-1.5 outline-none uppercase tracking-widest cursor-pointer hover:border-[#7aa2f7] transition-all pr-8"
                          >
                            <option value="desc">Desc</option>
                            <option value="asc">Asc</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#7aa2f7]">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-[#a9b1d6]">
                        <span>Page {page} of {Math.ceil(totalDbQuestions / 50) || 1}</span>
                        <div className="flex gap-1">
                          <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="bg-[#1f2335] text-[#a9b1d6] hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed p-1.5 rounded-md"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button 
                            disabled={page >= Math.ceil(totalDbQuestions / 50)}
                            onClick={() => setPage(p => p + 1)}
                            className="bg-[#1f2335] text-[#a9b1d6] hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed p-1.5 rounded-md"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showPrepGuide && (
                    <div className="space-y-6">
                       <div className="bg-[#1f2335] text-[#a9b1d6] border border-[#292e42] rounded-xl overflow-hidden shadow-lg p-1">
                           <h3 className="text-lg font-bold text-[#c0caf5] mb-2 bg-[#15161e] rounded p-4 border border-[#292e42] shadow-inner">Most-Frequent <span className="capitalize">{dsaMode}</span> Interview Topics</h3>
                           <div className="bg-[#1f2335] text-[#a9b1d6] rounded-lg p-4 flex flex-col items-center relative min-h-[300px]">
                              <div className="w-full max-w-sm flex bg-[#15161e] rounded-xl font-bold text-sm mb-4 border border-[#292e42] overflow-hidden shadow-inner p-1">
                                 <button onClick={() => setPrepTab('ds')} className={`flex-1 py-1.5 rounded-lg transition-colors ${prepTab === 'ds' ? 'bg-[#7888f0] text-[#c0caf5] shadow' : 'text-[#a9b1d6] hover:text-slate-200'}`}>Data Structures</button>
                                 <button onClick={() => setPrepTab('algo')} className={`flex-1 py-1.5 rounded-lg transition-colors ${prepTab === 'algo' ? 'bg-[#7888f0] text-[#c0caf5] shadow' : 'text-[#a9b1d6] hover:text-slate-200'}`}>Algorithms</button>
                              </div>
                              <div className="absolute right-6 top-6 hidden sm:block">
                                <select 
                                  value={prepTopic} 
                                  onChange={e => setPrepTopic(e.target.value)} 
                                  className="appearance-none bg-[#15161e] text-[#c0caf5] font-bold text-[10px] uppercase tracking-widest pl-3 pr-8 py-1.5 rounded-lg border border-[#292e42] outline-none hover:border-[#7aa2f7] cursor-pointer transition-colors"
                                >
                                  <option value="all">All Topics</option>
                                  {chartData.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#7aa2f7]">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                              </div>
                              
                              <div className="w-[300px] h-[300px] mt-4 relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                       data={prepTopic === 'all' ? chartData : [activeTopicObj]}
                                       cx="50%"
                                       cy="50%"
                                       innerRadius={70}
                                       outerRadius={100}
                                       paddingAngle={2}
                                       dataKey="value"
                                       stroke="#1e293b"
                                       strokeWidth={3}
                                    >
                                       {(prepTopic === 'all' ? chartData : [activeTopicObj]).map((entry, index) => (
                                          <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color} 
                                            onClick={() => setPrepTopic(entry.name)} 
                                            style={{ cursor: 'pointer', outline: 'none' }}
                                          />
                                       ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} />
                                  </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none rounded-full select-none">
                                  <span className="text-2xl font-black text-[#c0caf5]">{activeTopicObj.value.toFixed(1)}%</span>
                                  <span className="text-[10px] text-[#a9b1d6] font-bold uppercase tracking-widest leading-none mt-1">Problems</span>
                                </div>
                              </div>
                           </div>
                       </div>
                       <div className="bg-[#1f2335] border-[#292e42] p-4 rounded-xl border border-[#292e42]">
                          <h3 className="text-[#c0caf5] font-bold text-lg"><span className="capitalize">{dsaMode}</span>'s Go-To Interview Problems</h3>
                       </div>
                    </div>
                  )}

                  <div className="bg-[#1f2335] border-[#292e42] border border-[#292e42] rounded-3xl overflow-hidden flex flex-col max-h-[700px]">
                     <div className="overflow-x-auto custom-scrollbar flex-1 relative w-full">
                       <table className="w-full text-left border-collapse whitespace-nowrap lg:whitespace-normal">
                          <thead>
                             <tr className="border-b border-[#292e42] text-[10px] uppercase tracking-widest text-[#a9b1d6] bg-[#15161e]/50">
                                 <th className="p-4 font-bold w-16 text-center">Status</th>
                                 <th className="p-4 font-bold">Problem</th>
                                 <th className="p-4 font-bold hidden md:table-cell">Category</th>
                                 <th className="p-4 font-bold hidden sm:table-cell">Difficulty</th>
                                 <th className="p-4 font-bold text-right">Action</th>
                             </tr>
                          </thead>
                          <tbody className="text-sm">
                             {currentDsaQuestions.map((q, idx) => {
                                const isSolved = completedIds.includes(q.id);
                                const diff = q.tags?.[0] || q.difficulty || 'Medium';
                                return (
                                   <React.Fragment key={q.id}>
                                     <tr className="border-b border-[#292e42] hover:bg-[#1f2335]/20 transition-colors group">
                                         <td className="p-4 flex justify-center">
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const id = q.id;
                                                setCompletedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                                              }}
                                              className={`w-6 h-6 rounded flex items-center justify-center transition-all ${isSolved ? 'bg-[#9ece6a]/20 text-[#9ece6a] border border-[#9ece6a]/30' : 'bg-[#1f2335] text-[#a9b1d6] text-[#a9b1d6] border border-[#292e42] hover:border-[#7aa2f7]'}`}
                                            >
                                               {isSolved && <Check size={14} />}
                                            </button>
                                         </td>
                                         <td className="p-4 font-bold text-[#c0caf5]">
                                            <div className="flex items-center gap-3">
                                              <span className="cursor-pointer group-hover:text-[#c0caf5] transition-colors whitespace-normal sm:whitespace-nowrap max-w-[120px] sm:max-w-none line-clamp-2 sm:line-clamp-none block" onClick={() => window.open(q.answer, '_blank')}>{q.question}</span>
                                              <button 
                                                onClick={() => setExpandedNotesId(expandedNotesId === q.id ? null : q.id)}
                                                className={`text-[10px] px-2 py-1 rounded border uppercase tracking-widest font-bold transition flex items-center gap-1 ${notes[q.id] ? 'bg-[#7aa2f7] text-[#15161e]/20 border-blue-500/30 text-[#7aa2f7] hover:bg-[#7aa2f7] text-[#15161e]/30' : 'bg-[#1f2335] text-[#a9b1d6] border-[#292e42] text-[#a9b1d6] hover:text-slate-200'}`}
                                              >
                                                <ClipboardPen size={12} />
                                                {notes[q.id] ? 'Edit Notes' : '+ Notes'}
                                              </button>
                                            </div>
                                         </td>
                                         <td className="p-4 hidden md:table-cell">
                                             <span className="text-[10px] font-bold uppercase tracking-widest text-[#a9b1d6] bg-[#15161e] border border-[#292e42] px-2 py-1 rounded">
                                                {q.category ? q.category.replace('DSA - ', '') : 'Algorithm'}
                                             </span>
                                          </td>
                                         <td className="p-4 hidden sm:table-cell">
                                             <div className="flex items-center gap-2">
                                               <span className={`text-[10px] font-bold uppercase tracking-widest ${diff === 'Hard' ? 'text-red-400' : diff === 'Easy' ? 'text-[#9ece6a]' : 'text-amber-400'}`}>
                                                 {diff}
                                               </span>
                                              {dsaMode !== 'patterns' && (
                                                <span className="text-[10px] font-mono text-[#a9b1d6] bg-[#1f2335]/50 text-[#a9b1d6] px-1 py-0.5 rounded">
                                                  {q.acceptance}% Acc
                                                </span>
                                              )}
                                              {dsaMode !== 'patterns' && dsaMode !== 'all_problems' && q.raw_frequency && (
                                                <span className="text-[10px] font-mono text-[#7aa2f7] bg-blue-900/30 border border-[#7aa2f7]/30 px-1 py-0.5 rounded">
                                                  {q.raw_frequency} Freq
                                                </span>
                                              )}
                                            </div>
                                         </td>
                                         <td className="p-4 text-right">
                                            <button 
                                              onClick={() => window.open(q.answer, '_blank')}
                                              className="px-4 py-2 bg-transparent text-white border-white border hover:bg-white hover:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ml-auto shrink-0"
                                            >
                                               Solve
                                            </button>
                                         </td>
                                     </tr>
                                     {expandedNotesId === q.id && (
                                       <tr className="bg-[#15161e]/40 border-b border-[#292e42]">
                                          <td colSpan={5} className="p-4">
                                            <div className="relative">
                                              <textarea
                                                className="w-full h-24 bg-[#15161e] border border-[#292e42] rounded-xl p-3 text-sm text-[#c0caf5] outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
                                                placeholder="Write your notes, hints, or approach for this problem..."
                                                value={notes[q.id] || ''}
                                                onChange={(e) => {
                                                  const newNotes = { ...notes, [q.id]: e.target.value };
                                                  setNotes(newNotes);
                                                  localStorage.setItem('master_prep_notes', JSON.stringify(newNotes));
                                                }}
                                              />
                                            </div>
                                          </td>
                                       </tr>
                                     )}
                                   </React.Fragment>
                                 );
                              })}
                          </tbody>
                       </table>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'jd' && (
                <motion.div
                  key="jd"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#1f2335] border-[#292e42] border border-[#292e42] rounded-3xl p-8">
                      <h3 className="text-xs font-bold text-[#c0caf5] uppercase tracking-widest mb-8 flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-[#9ece6a]" /> Must-Win Core Competencies
                      </h3>
                      <div className="space-y-5">
                        <SkillItemSleek label="Spotify Backstage" desc="Catalog, Templates, Plugin Arch"/>
                        <SkillItemSleek label="Azure AKS / ACA" desc="Serverless containers + K8s nodes"/>
                        <SkillItemSleek label="IaC (Terraform)" desc="Modular infra, State orchestration"/>
                        <SkillItemSleek label="GitOps (ArgoCD)" desc="Sync, Reconciliation, RBAC"/>
                        <SkillItemSleek label="Polyglot Backend" desc="FastAPI, Node.js, Spring Boot"/>
                      </div>
                    </div>

                    <div className="bg-[#1f2335] border-[#292e42] border border-[#292e42] rounded-3xl p-8">
                      <h3 className="text-xs font-bold text-[#c0caf5] uppercase tracking-widest mb-8 flex items-center gap-3">
                        <Star size={18} className="text-amber-500" /> Advanced CNCF Bonus Tracks
                      </h3>
                      <div className="space-y-5">
                        <SkillItemSleek label="KEDA" desc="Event-driven auto-scaling down to zero"/>
                        <SkillItemSleek label="Kyverno" desc="Policy-as-Code for K8s Governance"/>
                        <SkillItemSleek label="System Resilience" desc="Chaos engineering basics, OTel"/>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#15161e] border border-[#292e42] rounded-3xl p-8">
                    <h3 className="text-xs font-bold text-[#c0caf5] uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-[#292e42] pb-4">
                      <Layout size={18} className="text-[#7aa2f7]" /> Strategic Interview Pillars
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 bg-[#1a1b26] border border-[#292e42] rounded-xl group hover:border-blue-500/50 transition-colors">
                        <p className="text-[#c0caf5] text-[11px] font-bold mb-3 uppercase tracking-wider">The Customer Focus</p>
                        <p className="text-[11px] text-[#a9b1d6] italic font-medium leading-relaxed">"Evolents are internal customers. My goal is to maximize their velocity."</p>
                      </div>
                      <div className="p-5 bg-[#1a1b26] border border-[#292e42] rounded-xl group hover:border-emerald-500/50 transition-colors">
                        <p className="text-[#c0caf5] text-[11px] font-bold mb-3 uppercase tracking-wider">The Paved Road</p>
                        <p className="text-[11px] text-[#a9b1d6] italic font-medium leading-relaxed">"Infrastructure is a product. We build golden paths to remove friction."</p>
                      </div>
                      <div className="p-5 bg-[#1a1b26] border border-[#292e42] rounded-xl group hover:border-purple-500/50 transition-colors">
                        <p className="text-[#c0caf5] text-[11px] font-bold mb-3 uppercase tracking-wider">Automation First</p>
                        <p className="text-[11px] text-[#a9b1d6] italic font-medium leading-relaxed">"If a task is repetitive, it's a candidate for a Backstage template or plugin."</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Resume Analysis Modal */}
      <AnimatePresence>
        {isResumeModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1f2335] border border-[#292e42] shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-[#292e42]">
                <h3 className="text-sm font-bold text-[#c0caf5] uppercase tracking-widest flex items-center gap-2">
                  <FileText size={16} className="text-[#7aa2f7]" /> Resume Alignment Analysis
                </h3>
                <button
                  onClick={() => setIsResumeModalOpen(false)}
                  className="text-[#a9b1d6] hover:text-[#f7768e] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
                {!resumeAlignment ? (
                  <div className="space-y-4">
                      <p className="text-sm text-[#a9b1d6]">
                        Upload your resume file (PDF or TXT) to analyze alignment with platform and full-stack engineering core pillars.
                      </p>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => setResumeText(e.target?.result as string);
                            reader.readAsText(file);
                          }
                        }}
                        className="hidden" 
                        accept=".pdf,.txt,.md" 
                      />
                      
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-[#292e42] rounded-xl flex flex-col items-center justify-center gap-2 text-[#a9b1d6] hover:border-[#7aa2f7] transition-colors"
                      >
                       <Upload size={24} />
                       <span className="text-sm">Click to upload or drag & drop</span>
                      </button>

                      {resumeText && (
                        <div className="text-xs text-[#7aa2f7] font-bold">Resume content loaded ({resumeText.length} characters)</div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={handleAnalyzeResume}
                          disabled={isAnalyzingResume || !resumeText.trim()}
                          className="bg-[#7aa2f7] text-[#15161e] px-6 py-2 rounded-lg font-bold text-sm hover:shadow-[0_0_15px_rgba(122,162,247,0.4)] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                        {isAnalyzingResume ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-[#15161e] border-t-transparent animate-spin"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Upload size={16} /> Analyze Resume
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#292e42] pb-6">
                      <div>
                        <h4 className="text-3xl font-bold text-[#c0caf5] font-mono">{resumeAlignment.score}% Match</h4>
                        <p className="text-xs text-[#a9b1d6] mt-2 uppercase tracking-wide">Overall Alignment</p>
                      </div>
                      <div className="w-24 h-24">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie
                               data={[{name: 'Score', value: resumeAlignment.score}, {name: 'Remaining', value: 100 - resumeAlignment.score}]}
                               cx="50%" cy="50%"
                               innerRadius={25} outerRadius={40}
                               dataKey="value"
                               stroke="none"
                             >
                               <Cell key="cell-0" fill={resumeAlignment.score > 80 ? '#9ece6a' : resumeAlignment.score > 50 ? '#f59e0b' : '#f7768e'} />
                               <Cell key="cell-1" fill="#292e42" />
                             </Pie>
                           </PieChart>
                         </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-[#7aa2f7]/10 border border-[#7aa2f7]/30 rounded-xl p-4">
                      <p className="text-sm text-[#c0caf5] leading-relaxed">{resumeAlignment.feedback}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-bold text-[#9ece6a] uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Identified Pillars
                        </h5>
                        <div className="flex flex-wrap gap-2">
                           {resumeAlignment.matched.length > 0 ? resumeAlignment.matched.map(skill => (
                             <span key={skill} className="px-2.5 py-1 bg-[#9ece6a]/10 border border-[#9ece6a]/30 text-[#9ece6a] text-xs font-bold rounded-lg capitalize">
                               {skill}
                             </span>
                           )) : (
                             <span className="text-sm text-[#a9b1d6]">No core pillars detected.</span>
                           )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-[#f7768e] uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Target size={14} /> Target Areas for Inclusion
                        </h5>
                        <div className="flex flex-wrap gap-2">
                           {resumeAlignment.missing.length > 0 ? resumeAlignment.missing.map(skill => (
                             <span key={skill} className="px-2.5 py-1 bg-[#1a1b26] border border-[#292e42] text-[#a9b1d6] text-xs font-bold rounded-lg capitalize group cursor-pointer hover:border-[#f7768e] transition-colors relative">
                               {skill}
                             </span>
                           )) : (
                             <span className="text-sm text-[#a9b1d6]">You hit all the core keywords!</span>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setResumeAlignment(null)}
                        className="px-4 py-2 border border-[#292e42] text-[#a9b1d6] rounded-lg text-sm font-bold hover:bg-[#292e42] transition-colors"
                      >
                        Re-Analyze
                      </button>
                      <button
                        onClick={() => setIsResumeModalOpen(false)}
                        className="px-4 py-2 bg-[#1a1b26] border border-[#7aa2f7] text-[#7aa2f7] rounded-lg text-sm font-bold hover:bg-[#7aa2f7] hover:text-[#15161e] transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-[#292e42] p-4">
         <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] text-[#a9b1d6] uppercase font-mono tracking-widest">
           <p className="italic">"Platform Engineering is backend software engineering applied to infrastructure."</p>
           <p>SYSTEM.PROD_VER_2.4.9</p>
         </div>
      </footer>
    </div>
  );
}

function DayCard({ day, title, icon: Icon, items, focus, color, onClick }: { day: string, title: string, icon: any, items: string[], focus: string, color: 'blue' | 'emerald' | 'purple', onClick?: () => void }) {
  const colorMap = {
    blue: 'border-[#7aa2f7]/30 bg-blue-500/5 text-[#7aa2f7]',
    emerald: 'border-emerald-500/20 bg-[#9ece6a]/5 text-[#9ece6a]',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-500'
  };

  return (
    <div className={`bg-[#1f2335] border-[#292e42] border border-[#292e42] rounded-3xl p-6 transition-all hover:border-[#292e42] cursor-pointer`} onClick={onClick}>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${colorMap[color]}`}>
          MISSION_DAY_{day}
        </span>
      </div>
      <h3 className="text-sm font-bold text-[#c0caf5] mb-4 uppercase tracking-tight">{title}</h3>
      <ul className="space-y-3 mb-6">
        {items.map((item, i) => (
          <li key={i} className="text-[11px] text-[#a9b1d6] flex gap-2 font-medium">
            <CheckCircle2 size={14} className="text-[#a9b1d6] mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <div className="pt-4 border-t border-[#292e42]">
        <p className="text-[9px] font-bold text-[#a9b1d6] uppercase tracking-widest mb-1">Session Target</p>
        <p className="text-xs font-bold text-[#c0caf5]">{focus}</p>
      </div>
    </div>
  );
}

function QuestionCard({ q, isOpen, onToggle, isDone, onToggleDone, note, onUpdateNote, onSolve }: { 
  q: Question, 
  isOpen: boolean, 
  onToggle: () => void,
  isDone: boolean,
  onToggleDone: () => void,
  note: string,
  onUpdateNote: (val: string) => void,
  onSolve?: () => void,
}) {
  const isDSA = q.category.includes('DSA');
  const displayCategory = q.category.replace('Evolent Day ', 'Day ').replace('Frontend - ', '');
  
  return (
    <div className={`bg-[#1f2335] border-[#292e42] border transition-all rounded-2xl overflow-hidden ${isDone ? 'border-[#9ece6a]/30' : 'border-[#292e42] shadow-sm'} ${isOpen ? 'ring-1 ring-blue-500/20' : ''}`}>
      <div className="p-6 flex items-start gap-4 cursor-pointer hover:bg-[#1f2335]/20 transition-all" onClick={onToggle}>
        <div className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${isDone ? 'bg-[#9ece6a] border-emerald-500 text-[#c0caf5]' : 'border-[#292e42]'}`} 
          onClick={(e) => { e.stopPropagation(); onToggleDone(); }}>
          {isDone && <Check size={12} strokeWidth={4} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${isDone ? 'bg-emerald-100 border border-[#292e42] text-emerald-800 text-[#9ece6a]' : 'bg-blue-500/10 text-[#7aa2f7]'}`}>
              {displayCategory}
            </span>
            {q.isPlatform && (
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-[8px] font-bold uppercase tracking-widest border border-purple-500/20">
                Evolent Pilot
              </span>
            )}
          </div>
          <h3 className={`font-bold leading-tight text-sm transition-all ${isDone ? 'text-[#a9b1d6]' : 'text-[#c0caf5]'}`}>
            {q.question}
          </h3>
          {q.tags && q.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
               {q.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-[#1f2335] text-[#a9b1d6]/80 text-[#a9b1d6] rounded-[4px] text-[8px] font-bold uppercase tracking-widest border border-[#292e42]">
                    {tag}
                  </span>
               ))}
            </div>
          )}
        </div>
        <ChevronDown size={18} className={`text-[#a9b1d6] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#7aa2f7]' : ''}`} />
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#1A1F29]/50"
          >
            <div className="p-8 border-t border-[#292e42] text-[#c0caf5] text-sm leading-relaxed whitespace-pre-wrap font-medium">
              <div className="mb-4 text-xs font-bold uppercase tracking-widest text-[#7aa2f7]/80 flex items-center gap-2">
                <Box size={14} /> Expert Analysis
              </div>
              <div className="text-slate-200 mb-6 prose prose-invert max-w-none prose-pre:bg-[#1a1b26] prose-pre:border prose-pre:border-[#292e42] prose-h3:text-[#c0caf5]">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      if (!inline && match && match[1] === 'mermaid') {
                        return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
                      }
                      return <code className={className} {...props}>{children}</code>;
                    }
                  }}
                >
                  {q.answer}
                </ReactMarkdown>
              </div>
              
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#a9b1d6] mb-2">Personal Notes</p>
                <textarea 
                  className="w-full bg-[#1a1b26] border border-[#292e42] rounded-xl p-4 text-xs text-[#c0caf5] focus:outline-none focus:border-blue-500/50 resize-none"
                  rows={3}
                  placeholder="Add your thoughts or snippets here..."
                  value={note}
                  onChange={(e) => onUpdateNote(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="pt-6 border-t border-[#292e42] flex flex-wrap gap-4">
                 <button 
                   onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
                   className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${isDone ? 'bg-[#1f2335] text-[#a9b1d6] text-[#a9b1d6]' : 'bg-emerald-600 hover:bg-[#9ece6a] text-[#c0caf5] shadow-lg shadow-emerald-900/20'}`}
                 >
                   {isDone ? 'Done' : 'Mark as Done'}
                 </button>
                 {isDSA && onSolve && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); onSolve(); }}
                     className="px-4 py-2 bg-[#1f2335] text-[#7aa2f7] border border-indigo-500/30 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#7aa2f7] text-[#15161e] hover:text-[#c0caf5] transition-colors flex items-center gap-2"
                   >
                     <Code2 size={14} /> Solve in Sandbox
                   </button>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillItemSleek({ label, desc }: { label: string, desc: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-help transition-all transform hover:translate-x-1">
      <div className="w-1 h-8 bg-[#1f2335] text-[#a9b1d6] group-hover:bg-blue-500 rounded-full transition-colors shrink-0"></div>
      <div className="flex-1">
        <p className="font-bold text-[11px] text-[#c0caf5] uppercase tracking-wider group-hover:text-[#7aa2f7] transition-colors">{label}</p>
        <p className="text-[9px] text-[#a9b1d6] font-bold uppercase tracking-tight">{desc}</p>
      </div>
    </div>
  );
}

