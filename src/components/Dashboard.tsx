/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  CheckCircle, 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  Activity, 
  Award,
  Sparkles,
  ChevronRight,
  Target
} from 'lucide-react';
import { PrimaryHabit, SecondaryHabit, TodoTask, DailyHistoryItem, UserStats } from '../types';
import { getFormattedDate } from '../utils';

interface DashboardProps {
  stats: UserStats;
  primaryHabits: PrimaryHabit[];
  secondaryHabits: SecondaryHabit[];
  todoTasks: TodoTask[];
  history: DailyHistoryItem[];
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({
  stats,
  primaryHabits,
  secondaryHabits,
  todoTasks,
  history,
  setActiveTab
}: DashboardProps) {
  const [viewScope, setViewScope] = useState<'today' | 'weekly' | 'monthly'>('today');

  // Calculations for Today
  const totalPrimary = primaryHabits.length;
  const completedPrimary = primaryHabits.filter(h => h.checked).length;
  const primaryPct = totalPrimary > 0 ? Math.round((completedPrimary / totalPrimary) * 100) : 0;

  const totalSecondary = secondaryHabits.length;
  const completedSecondary = secondaryHabits.filter(h => h.checked).length;
  const secondaryPct = totalSecondary > 0 ? Math.round((completedSecondary / totalSecondary) * 100) : 0;

  const totalTasks = todoTasks.length;
  const completedTasks = todoTasks.filter(t => t.completed).length;
  const tasksPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Points that can be earned today
  const potentialPointsToday = secondaryHabits.reduce((acc, h) => acc + (h.checked ? h.pointsReward : 0), 0) +
    todoTasks.reduce((acc, t) => acc + (t.completed ? (t.priority === 'high' ? 10 : t.priority === 'medium' ? 5 : 2) : 0), 0);

  // Overall compliance score today
  const overallCompleted = completedPrimary + completedSecondary + completedTasks;
  const overallTotal = totalPrimary + totalSecondary + totalTasks;
  const overallScorePct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  // Weekly stats calculator (last 7 logs + today)
  const getWeeklyStats = () => {
    const last7 = history.slice(0, 6); // Grab historical logs
    const totalDays = last7.length + 1;
    
    let sumPrimaryComp = completedPrimary;
    let sumPrimaryTotal = totalPrimary;
    let sumTasksComp = completedTasks;
    let sumTasksTotal = totalTasks;
    let totalPointsEarned = potentialPointsToday;

    last7.forEach(item => {
      sumPrimaryComp += item.primaryCompleted;
      sumPrimaryTotal += item.primaryTotal;
      sumTasksComp += item.tasksCompleted;
      sumTasksTotal += item.tasksTotal;
      totalPointsEarned += item.pointsEarned;
    });

    const primaryAvg = sumPrimaryTotal > 0 ? Math.round((sumPrimaryComp / sumPrimaryTotal) * 100) : 0;
    const tasksAvg = sumTasksTotal > 0 ? Math.round((sumTasksComp / sumTasksTotal) * 100) : 0;

    return { primaryAvg, tasksAvg, totalPointsEarned, totalDays };
  };

  const weeklyStats = getWeeklyStats();

  // Monthly stats calculator (all history up to 30 days + today)
  const getMonthlyStats = () => {
    const last30 = history;
    const totalDays = last30.length + 1;

    let sumPrimaryComp = completedPrimary;
    let sumPrimaryTotal = totalPrimary;
    let sumTasksComp = completedTasks;
    let sumTasksTotal = totalTasks;
    let totalPointsEarned = potentialPointsToday;

    last30.forEach(item => {
      sumPrimaryComp += item.primaryCompleted;
      sumPrimaryTotal += item.primaryTotal;
      sumTasksComp += item.tasksCompleted;
      sumTasksTotal += item.tasksTotal;
      totalPointsEarned += item.pointsEarned;
    });

    const primaryAvg = sumPrimaryTotal > 0 ? Math.round((sumPrimaryComp / sumPrimaryTotal) * 100) : 0;
    const tasksAvg = sumTasksTotal > 0 ? Math.round((sumTasksComp / sumTasksTotal) * 100) : 0;

    return { primaryAvg, tasksAvg, totalPointsEarned, totalDays };
  };

  const monthlyStats = getMonthlyStats();

  // Choose display values based on active switch filter
  let displayPrimaryPct = primaryPct;
  let displayTasksPct = tasksPct;
  let labelScope = "Hari Ini";
  let displayPointsReceived = potentialPointsToday;

  if (viewScope === 'weekly') {
    displayPrimaryPct = weeklyStats.primaryAvg;
    displayTasksPct = weeklyStats.tasksAvg;
    labelScope = "7 Hari Terakhir";
    displayPointsReceived = weeklyStats.totalPointsEarned;
  } else if (viewScope === 'monthly') {
    displayPrimaryPct = monthlyStats.primaryAvg;
    displayTasksPct = monthlyStats.tasksAvg;
    labelScope = "30 Hari Terakhir";
    displayPointsReceived = monthlyStats.totalPointsEarned;
  }

  // Get student specialized motivational message based on metrics
  const getTips = () => {
    if (primaryPct === 100 && tasksPct === 100) {
      return {
        title: "Performa Sempurna! 🎉",
        desc: "Kamu menyelesaikan semua target wajib harian dan tugas hari ini. Pertahankan dedikasi luar biasa ini!"
      };
    } else if (primaryPct >= 60) {
      return {
        title: "Kondisi Stabil & Sehat ⚡",
        desc: "Kebiasaan wajibmu berada di batas hijau (>60%). Otakmu bekerja optimal, ayo selesaikan sisa tugas kuliahmu!"
      };
    } else if (todoTasks.some(t => t.priority === 'high' && !t.completed)) {
      return {
        title: "Ada Tugas Prioritas Menunggu ⚠️",
        desc: "Fokuslah terlebih dahulu pada tugas berprioritas tinggi hari ini. Selesaikan dalam 30 menit ke depan!"
      };
    } else {
      return {
        title: "Satu Langkah Kecil Setiap Hari 🌱",
        desc: "Mulailah dengan mencentang satu aktivitas ringan harian. Langkah kecil merupakan kunci sustainabilitas!"
      };
    }
  };

  const motivationTip = getTips();

  // Create SVG points coordinates for the history chart preview
  const chartPoints = () => {
    // We reverse history to show chronological order (older -> newer) up to last 7 days + today
    const histSource = [...history.slice(0, 6)].reverse();
    const dataList = histSource.map(h => ({
      name: h.dayName.substring(0, 3),
      pct: h.primaryTotal > 0 ? Math.round((h.primaryCompleted / h.primaryTotal) * 100) : 0,
      taskPct: h.tasksTotal > 0 ? Math.round((h.tasksCompleted / h.tasksTotal) * 100) : 0,
    }));
    
    // Add today
    dataList.push({
      name: 'Hari ini',
      pct: primaryPct,
      taskPct: tasksPct,
    });

    return dataList;
  };

  const activeChartData = chartPoints();

  return (
    <div className="space-y-6" id="dashboard-tab">
      
      {/* Header section with current Date & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-linear-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-800 dark:bg-slate-900 px-3 py-1 rounded-full text-xs text-indigo-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{getFormattedDate()}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Halo, <span className="text-indigo-400">{stats.username}</span>! 👋🏼
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Selesaikan agenda harian Anda, pertahankan streak keteraturan habits, serta kelola pertumbuhan akademis secara mandiri.
          </p>
        </div>
        
        {/* Core Daily Target Completion Widget */}
        <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 self-start md:self-auto shrink-0 min-w-[200px]">
          <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
            {/* SVG circle generator */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-slate-700 fill-none"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-indigo-400 fill-none transition-all duration-500 ease-out"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - overallScorePct / 100)}`}
              />
            </svg>
            <span className="absolute text-sm font-bold">{overallScorePct}%</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Skor Kepatuhan</span>
            <div className="text-lg font-bold text-white">Hari Ini</div>
            <p className="text-xs text-slate-300">
              {completedPrimary + completedSecondary + completedTasks} dari {overallTotal} agenda selesai
            </p>
          </div>
        </div>
      </div>

      {/* Switcher View: Hari Ini (Today) | Mingguan (Weekly) | Bulanan (Monthly) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          <span>Informasi Ringkasan Aktivitas</span>
        </h2>
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
          <button
            id="btn-view-today"
            onClick={() => setViewScope('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              viewScope === 'today'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Hari Ini
          </button>
          <button
            id="btn-view-weekly"
            onClick={() => setViewScope('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              viewScope === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Mingguan
          </button>
          <button
            id="btn-view-monthly"
            onClick={() => setViewScope('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              viewScope === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Habit Achievement Ratio */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-xs flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Kepatuhan Habits (Wajib)</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{displayPrimaryPct}%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Rata-rata kepatuhan pada <span className="font-semibold">{labelScope}</span>
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('habits')}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <span>Atur kebiasaan</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 text-emerald-500 font-bold text-lg border border-emerald-100/50 dark:border-emerald-900/30">
            🎯
          </div>
        </div>

        {/* Card 2: Task Ratios */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-xs flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-500 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
              <span>Rasio Tugas Kuliah</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{displayTasksPct}%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Rasio penyelesaian to-do list <span className="font-semibold">{labelScope}</span>
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <span>Buka daftar tugas</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center shrink-0 text-sky-500 font-bold text-lg border border-sky-100/50 dark:border-sky-900/30">
            📊
          </div>
        </div>

        {/* Card 3: Streaks and Levels */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500 animate-bounce-subtle" />
              <span>Siklus Produktif</span>
            </div>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
              Level {stats.level}
            </span>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-1">
                {stats.currentStreak} <span className="text-sm font-semibold text-slate-500">Hari</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Streak harian berturut-turut. Rekor: <span className="font-semibold">{stats.maxStreak} hari</span>
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-end gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>{stats.totalPoints} pts</span>
              </div>
              <span className="text-[10px] text-slate-400">Akumulasi Skor</span>
            </div>
          </div>

          <div className="w-full mt-4 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            {/* Progress to next level. Each level requires 200 pts */}
            <div 
              className="bg-linear-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(stats.totalPoints % 200) / 2}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
            <span>Level {stats.level}</span>
            <span>{stats.totalPoints % 200} / 200 XP menuju level selanjutnya</span>
          </div>
        </div>

      </div>

      {/* Mid Section: Chart (Diagram Performa) & Motivation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Graph Column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Diagram Performa Pekan Ini</h3>
              <p className="text-xs text-slate-400">Siklus penyelesaian target (habits wajib & tugas kuliah harian)</p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                <span className="text-slate-500 dark:text-slate-400">Habits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-sky-500 rounded-full inline-block"></span>
                <span className="text-slate-500 dark:text-slate-400">Tugas</span>
              </div>
            </div>
          </div>

          {/* SVG Performance Chart Rendering */}
          <div className="w-full h-56 pt-2 select-none">
            <div className="w-full h-full flex flex-col justify-between">
              {/* Plot area */}
              <div className="flex-1 w-full relative flex items-end">
                {/* Y-Axis lines helper grids */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800/50 w-full h-0"></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800/50 w-full h-0"></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800/50 w-full h-0"></div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800/50 w-full h-0"></div>
                </div>

                {/* Bars or coordinates for each day */}
                <div className="w-full h-full flex items-end justify-between px-2 relative z-10">
                  {activeChartData.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer px-1">
                      
                      {/* Bar Heights container */}
                      <div className="flex items-end justify-center gap-1.5 w-full h-[85%] pb-1">
                        {/* Primary Habit column bar */}
                        <div 
                          className="w-3 md:w-5 bg-linear-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400 rounded-t-sm transition-all duration-500 group-hover:opacity-90 relative"
                          style={{ height: `${Math.max(day.pct, 4)}%` }}
                        >
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-xs font-semibold whitespace-nowrap transition-opacity pointer-events-none">
                            Habit: {day.pct}%
                          </div>
                        </div>

                        {/* Task completion column bar */}
                        <div 
                          className="w-3 md:w-5 bg-linear-to-t from-sky-500 to-sky-400 dark:from-sky-600 dark:to-sky-400 rounded-t-sm transition-all duration-500 group-hover:opacity-90 relative"
                          style={{ height: `${Math.max(day.taskPct, 4)}%` }}
                        >
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-xs font-semibold whitespace-nowrap transition-opacity pointer-events-none">
                            Tugas: {day.taskPct}%
                          </div>
                        </div>
                      </div>

                      {/* Day Name */}
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 mt-2 block shrink-0">
                        {day.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart border decoration */}
              <div className="border-t border-slate-100 dark:border-slate-800 w-full mt-1"></div>
            </div>
          </div>
        </div>

        {/* Motivational Tips & Daily Highlights Panel */}
        <div className="space-y-6">
          
          {/* Dynamic AI-Assisted Recommendation Card design */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-xs shrink-0 flex flex-col justify-between min-h-[224px]">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 animate-pulse">
                  <Sparkles className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Productivity Co-Pilot</span>
              </div>
              <h4 className="text-md font-extrabold text-slate-900 dark:text-white">{motivationTip.title}</h4>
              <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
                "{motivationTip.desc}"
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/65 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-350 font-bold">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Target besok disesuaikan</span>
              </span>
              <button 
                onClick={() => setViewScope('today')} 
                className="font-extrabold text-indigo-650 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
              >
                Pahami tips
              </button>
            </div>
          </div>

          {/* Quick Stats overview panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detail Capaian</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-50 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Habit Wajib Selesai</span>
                <span className="font-bold text-slate-800 dark:text-white">{completedPrimary} / {totalPrimary}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-50 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Sumbangan Poin Sunnah</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">+{completedSecondary * 15} pts</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Tugas Kuliah Selesai</span>
                <span className="font-bold text-slate-800 dark:text-white">{completedTasks} / {totalTasks}</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-center text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-50/50 dark:border-indigo-950/40">
              🎁 Bonus XP diperoleh hari ini: +{potentialPointsToday} XP
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
