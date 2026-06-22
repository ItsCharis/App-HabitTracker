/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Activity, 
  ClipboardList, 
  Layers, 
  History, 
  Sun, 
  Moon, 
  GraduationCap,
  Flame,
  Award,
  CircleAlert,
  CalendarDays
} from 'lucide-react';

// Models & UTILS
import { PrimaryHabit, SecondaryHabit, TodoTask, BigProject, DailyHistoryItem, UserStats } from './types';
import { 
  getFormattedDate, 
  getLocalDateString, 
  checkAndTriggerDailyReset,
  DEFAULT_PRIMARY_HABITS, 
  DEFAULT_SECONDARY_HABITS, 
  DEFAULT_TODOTASKS, 
  DEFAULT_BIGPROJECTS, 
  DEFAULT_HISTORY, 
  DEFAULT_STATS 
} from './utils';

// UI SUB-COMPONENTS
import Dashboard from './components/Dashboard';
import HabitsTracker from './components/HabitsTracker';
import TodoList from './components/TodoList';
import MilestoneTracker from './components/MilestoneTracker';
import HistoryLogs from './components/HistoryLogs';

export default function App() {
  
  // ----------------------------------------------------
  // INITIALIZATIONS & STATE LOADING
  // ----------------------------------------------------
  
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('mahasiswa_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const [primaryHabits, setPrimaryHabits] = useState<PrimaryHabit[]>(() => {
    const saved = localStorage.getItem('mahasiswa_primary');
    return saved ? JSON.parse(saved) : DEFAULT_PRIMARY_HABITS;
  });

  const [secondaryHabits, setSecondaryHabits] = useState<SecondaryHabit[]>(() => {
    const saved = localStorage.getItem('mahasiswa_secondary');
    return saved ? JSON.parse(saved) : DEFAULT_SECONDARY_HABITS;
  });

  const [todoTasks, setTodoTasks] = useState<TodoTask[]>(() => {
    const saved = localStorage.getItem('mahasiswa_todotasks');
    return saved ? JSON.parse(saved) : DEFAULT_TODOTASKS;
  });

  const [bigProjects, setBigProjects] = useState<BigProject[]>(() => {
    const saved = localStorage.getItem('mahasiswa_bigprojects');
    return saved ? JSON.parse(saved) : DEFAULT_BIGPROJECTS;
  });

  const [history, setHistory] = useState<DailyHistoryItem[]>(() => {
    const saved = localStorage.getItem('mahasiswa_history');
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('mahasiswa_active_tab');
    return saved || 'dashboard';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mahasiswa_dark_mode');
    return saved === 'true'; // Devised to false (light theme) on fresh launch
  });

  // ----------------------------------------------------
  // PERSISTENCE SYNC OPERATIONS
  // ----------------------------------------------------
  
  useEffect(() => {
    localStorage.setItem('mahasiswa_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('mahasiswa_primary', JSON.stringify(primaryHabits));
  }, [primaryHabits]);

  useEffect(() => {
    localStorage.setItem('mahasiswa_secondary', JSON.stringify(secondaryHabits));
  }, [secondaryHabits]);

  useEffect(() => {
    localStorage.setItem('mahasiswa_todotasks', JSON.stringify(todoTasks));
  }, [todoTasks]);

  useEffect(() => {
    localStorage.setItem('mahasiswa_bigprojects', JSON.stringify(bigProjects));
  }, [bigProjects]);

  useEffect(() => {
    localStorage.setItem('mahasiswa_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('mahasiswa_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('mahasiswa_dark_mode', String(darkMode));
  }, [darkMode]);

  // ----------------------------------------------------
  // DAILY ROLL OVER & RESET TIMERS
  // ----------------------------------------------------

  useEffect(() => {
    // Check if the date has changed since our last update on mount
    const resetResult = checkAndTriggerDailyReset(
      stats,
      primaryHabits,
      secondaryHabits,
      todoTasks,
      history
    );

    if (resetResult.didReset) {
      setStats(resetResult.stats);
      setPrimaryHabits(resetResult.primary);
      setSecondaryHabits(resetResult.secondary);
      setTodoTasks(resetResult.tasks);
      setHistory(resetResult.history);
      
      // Delay to allow DOM initialization
      setTimeout(() => {
        alert("📆 Hari baru telah terdeteksi! Kebiasaan harian (Habits) dan tugas harian telah di-reset. Rekaman produktivitas kemarin berhasil diarsipkan di tab Riwayat!");
      }, 1000);
    }
  }, []); // Run safely on startup mount once

  // ----------------------------------------------------
  // RENDER SECTORS DISPATCHER
  // ----------------------------------------------------

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats}
            primaryHabits={primaryHabits}
            secondaryHabits={secondaryHabits}
            todoTasks={todoTasks}
            history={history}
            setActiveTab={setActiveTab}
          />
        );
      case 'habits':
        return (
          <HabitsTracker 
            stats={stats}
            primaryHabits={primaryHabits}
            secondaryHabits={secondaryHabits}
            setPrimaryHabits={setPrimaryHabits}
            setSecondaryHabits={setSecondaryHabits}
            setStats={setStats}
          />
        );
      case 'tasks':
        return (
          <TodoList 
            stats={stats}
            todoTasks={todoTasks}
            setTodoTasks={setTodoTasks}
            setStats={setStats}
          />
        );
      case 'projects':
        return (
          <MilestoneTracker 
            bigProjects={bigProjects}
            setBigProjects={setBigProjects}
          />
        );
      case 'history':
        return (
          <HistoryLogs 
            history={history}
            stats={stats}
            primaryHabits={primaryHabits}
            secondaryHabits={secondaryHabits}
            todoTasks={todoTasks}
            bigProjects={bigProjects}
            setHistory={setHistory}
            setStats={setStats}
            setPrimaryHabits={setPrimaryHabits}
            setSecondaryHabits={setSecondaryHabits}
            setTodoTasks={setTodoTasks}
            setBigProjects={setBigProjects}
          />
        );
      default:
        return <div className="text-center py-10 font-bold">404 Tab Tidak Ditemukan</div>;
    }
  };

  // Navigations Links Definitions
  const navigationTabs = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: Activity },
    { id: 'tasks', label: 'Tugas Harian', icon: ClipboardList },
    { id: 'projects', label: 'Proyek Besar', icon: Layers },
    { id: 'history', label: 'Riwayat data', icon: History },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* 1. LAYOUT COMPONENT: Desktop Sidebar & Header wrapper */}
      <div className="flex">
        
        {/* Sidebar Left Component - Desktop Only */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 h-screen sticky top-0 shrink-0 justify-between">
          <div className="space-y-6">
            
            {/* Header Brand */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="p-2 bg-indigo-650 text-white rounded-xl shadow-md">
                <GraduationCap className="w-6 h-6 shrink-0" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-tight dark:text-white">Prod canva</div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest">Akademik Co-Pilot</div>
              </div>
            </div>

            {/* Student Profile Overview Card */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-extrabold text-sm text-indigo-750">
                  AM
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{stats.username}</div>
                  <div className="text-[10px] text-slate-400">Mahasiswa Aktif</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">Poin:</span>
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                  <Award className="w-3.5 h-3.5 text-yellow-500" />
                  {stats.totalPoints} XP
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 px-1.5 py-0.5 rounded-sm">
                  Lv. {stats.level}
                </span>
              </div>
            </div>

            {/* Interactive Sidebar Navigation lists */}
            <nav className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 block px-3 py-1 uppercase tracking-wider">Navigasi Utama</span>
              {navigationTabs.map(tab => {
                const IconComp = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`sidebar-link-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full h-11 px-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all relative ${
                      active
                        ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/35 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950/40'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    
                    {/* Active side indicator */}
                    {active && (
                      <span className="absolute right-0 top-3 bottom-3 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-l-md"></span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Sidebar Footer Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4">
            {/* Theme switcher option */}
            <button
              id="sidebar-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center justify-between text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
              </div>
              <span className="text-[9px] text-slate-400 px-1 py-0.5 rounded border border-slate-200/50">Toggle</span>
            </button>

            <div className="text-[10px] text-center text-slate-400 font-medium">
              Vite SPA Build • 2026
            </div>
          </div>
        </aside>

        {/* 2. MAIN LAYOUT BODY */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          
          {/* Mobile Top Header */}
          <header className="lg:hidden h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <GraduationCap className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-sm font-extrabold tracking-tight dark:text-white">Prod canva</span>
            </div>

            {/* Right profile info & Theme switcher */}
            <div className="flex items-center gap-3">
              {/* Point chip marker */}
              <div className="bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-0.5">
                <Award className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                <span>{stats.totalPoints} XP</span>
              </div>

              {/* Theme toggle mobile button (min touch size 44px) */}
              <button
                id="mobile-theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60"
                title="Suhu Tema"
              >
                {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-slate-650" />}
              </button>
            </div>
          </header>

          {/* MAIN CONTAINER PAGE SCROLLING */}
          <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto overflow-x-hidden">
            
            {/* View container animate slide-in */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {renderActiveSection()}
              </motion.div>
            </AnimatePresence>

          </main>

        </div>

      </div>

      {/* 3. LAYOUT COMPONENT: Bottom Mobile Nav Navigation bar (min touch target size 44x44px per chunk) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 flex items-center justify-around z-50">
        {navigationTabs.map(tab => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full select-none cursor-pointer relative"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                active 
                  ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950 dark:text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-350'
              }`}>
                <IconComp className="w-5 h-5 shrink-0" />
              </div>
              <span className={`text-[8.5px] font-bold ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {tab.id === 'projects' ? 'Proyek' : tab.label.split(' ')[0]}
              </span>

              {/* Top accent indicator active */}
              {active && (
                <span className="absolute top-0 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-md"></span>
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );
}
