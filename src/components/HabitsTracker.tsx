/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Clock, 
  Heart, 
  ShieldAlert,
  Search,
  BookOpen,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { PrimaryHabit, SecondaryHabit, UserStats } from '../types';
import { isPastTargetTime } from '../utils';

interface HabitsTrackerProps {
  stats: UserStats;
  primaryHabits: PrimaryHabit[];
  secondaryHabits: SecondaryHabit[];
  setPrimaryHabits: React.Dispatch<React.SetStateAction<PrimaryHabit[]>>;
  setSecondaryHabits: React.Dispatch<React.SetStateAction<SecondaryHabit[]>>;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

export default function HabitsTracker({
  stats,
  primaryHabits,
  secondaryHabits,
  setPrimaryHabits,
  setSecondaryHabits,
  setStats
}: HabitsTrackerProps) {
  // UI States
  const [activeHabitTab, setActiveHabitTab] = useState<'compulsory' | 'optional'>('compulsory');
  const [showAddPrimary, setShowAddPrimary] = useState(false);
  const [showAddSecondary, setShowAddSecondary] = useState(false);

  // Form States - Primary Custom Addition
  const [pName, setPName] = useState('');
  const [pTime, setPTime] = useState('06:00');
  const [pCategory, setPCategory] = useState<'Spiritual' | 'Kesehatan' | 'Akademik' | 'Lainnya'>('Akademik');

  // Form States - Secondary Custom Addition
  const [sName, setSName] = useState('');
  const [sTime, setSTime] = useState('08:00');
  const [sPoints, setSPoints] = useState(15);
  const [sCategory, setSCategory] = useState<'Olahraga' | 'Pengembangan' | 'Sosial' | 'Lainnya'>('Pengembangan');

  // Alarm ticks updates
  const [currentTimeTick, setCurrentTimeTick] = useState(new Date());

  useEffect(() => {
    // Keep checking current time every 15 seconds to update "missed" (red indicator) status
    const interval = setInterval(() => {
      setCurrentTimeTick(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Primary Check Action
  const togglePrimaryCheck = (id: string) => {
    setPrimaryHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const nextChecked = !habit.checked;
        return {
          ...habit,
          checked: nextChecked
        };
      }
      return habit;
    }));
  };

  // Secondary Check Action
  const toggleSecondaryCheck = (id: string) => {
    setSecondaryHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const nextChecked = !habit.checked;
        
        // Add or remove points live
        setStats(statsPrev => {
          const modPoints = nextChecked ? habit.pointsReward : -habit.pointsReward;
          const finalPoints = Math.max(0, statsPrev.totalPoints + modPoints);
          const newLevel = Math.floor(finalPoints / 200) + 1;
          return {
            ...statsPrev,
            totalPoints: finalPoints,
            level: newLevel
          };
        });

        return {
          ...habit,
          checked: nextChecked
        };
      }
      return habit;
    }));
  };

  // Delete Handlers
  const deletePrimary = (id: string, name: string) => {
    if (confirm(`Hapus kebiasaan '${name}'?`)) {
      setPrimaryHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const deleteSecondary = (id: string, name: string) => {
    if (confirm(`Hapus kebiasaan sunnah '${name}'?`)) {
      setSecondaryHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  // Add Handlers
  const handleAddPrimary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const newHabit: PrimaryHabit = {
      id: 'p_custom_' + Date.now(),
      name: pName.trim(),
      targetTime: pTime,
      checked: false,
      streak: 0,
      category: pCategory
    };

    setPrimaryHabits(prev => [...prev, newHabit]);
    setPName('');
    setShowAddPrimary(false);
  };

  const handleAddSecondary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim()) return;

    const newHabit: SecondaryHabit = {
      id: 's_custom_' + Date.now(),
      name: sName.trim(),
      targetTime: sTime || undefined,
      checked: false,
      pointsReward: Number(sPoints) || 10,
      category: sCategory
    };

    setSecondaryHabits(prev => [...prev, newHabit]);
    setSName('');
    setSTime('08:00');
    setSPoints(15);
    setShowAddSecondary(false);
  };

  // Category Colors
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Spiritual': return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'Kesehatan': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Akademik': return 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/30';
      case 'Olahraga': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/20';
      case 'Pengembangan': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30';
      case 'Sosial': return 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/30';
      default: return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-900/30';
    }
  };

  return (
    <div className="space-y-6" id="habits-section">
      
      {/* Tab Switcher Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 self-start">
          <button
            id="tab-prime"
            onClick={() => setActiveHabitTab('compulsory')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeHabitTab === 'compulsory'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Habits Wajib (Primer)</span>
          </button>
          
          <button
            id="tab-second"
            onClick={() => setActiveHabitTab('optional')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeHabitTab === 'optional'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500 font-bold" />
            <span>Habits Tambahan (Sunnah)</span>
          </button>
        </div>

        {/* Quick action button based on selected sub-tab */}
        <div>
          {activeHabitTab === 'compulsory' ? (
            <button
              id="btn-add-primary-habit"
              onClick={() => setShowAddPrimary(!showAddPrimary)}
              className="w-full sm:w-auto h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Habit Wajib</span>
            </button>
          ) : (
            <button
              id="btn-add-secondary-habit"
              onClick={() => setShowAddSecondary(!showAddSecondary)}
              className="w-full sm:w-auto h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Habit Sunnah</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab Description Banner */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        {activeHabitTab === 'compulsory' ? (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Penjelasan Habits Wajib (Primer): </span>
            Aktivitas wajib ini harus diselesaikan sebelum tenggat waktu target dicapai. Jika Anda belum menyelesaikannya setelah jam target terlewati, baris habit akan otomatis memerah ("Terlewat") sebagai asisten pembina kepatuhan diri. Habit ini terus melacak kontinitas berturut-turut (streak).
          </div>
        ) : (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Penjelasan Habits Tambahan (Sunnah & Opsional): </span>
            Aktivitas pelengkap untuk merawat fisik dan mental Anda yang berbuah <span className="font-semibold text-indigo-600 dark:text-indigo-400">Poin Hadiah (XP Reward)</span> untuk meningkatkan level profil mahasiswa. Tidak ada sanksi berlabel merah jika tidak dilakukan.
          </div>
        )}
      </div>

      {/* FORM: Add Primary Habit Component */}
      {showAddPrimary && activeHabitTab === 'compulsory' && (
        <form onSubmit={handleAddPrimary} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tambah Target Kebiasaan Wajib</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Nama Kebiasaan</label>
              <input
                id="input-primary-name"
                type="text"
                required
                placeholder="Contoh: Sholat Ashar Terjadwal"
                value={pName}
                onChange={e => setPName(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Target Waktu Penyelesaian</label>
              <input
                id="input-primary-time"
                type="time"
                required
                value={pTime}
                onChange={e => setPTime(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Kategori Bidang</label>
              <select
                id="select-primary-category"
                value={pCategory}
                onChange={e => setPCategory(e.target.value as any)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="Spiritual">Spiritual / Keagamaan</option>
                <option value="Kesehatan">Kesehatan / Kebugaran</option>
                <option value="Akademik">Akademik / Kuliah</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddPrimary(false)}
              className="h-11 px-4 text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              Batalkan
            </button>
            <button
              id="submit-primary"
              type="submit"
              className="h-11 px-6 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              Simpan Kebiasaan
            </button>
          </div>
        </form>
      )}

      {/* FORM: Add Secondary Habit Component */}
      {showAddSecondary && activeHabitTab === 'optional' && (
        <form onSubmit={handleAddSecondary} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tambah Target Kebiasaan Sunnah (Pilihan)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Nama Kebiasaan Sunnah</label>
              <input
                id="input-secondary-name"
                type="text"
                required
                placeholder="Contoh: Tadarus Al-Quran 1 Ruku'"
                value={sName}
                onChange={e => setSName(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Saran Waktu (Opsional)</label>
              <input
                id="input-secondary-time"
                type="time"
                value={sTime}
                onChange={e => setSTime(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Poin Hadiah (XP Reward)</label>
              <select
                id="select-secondary-points"
                value={sPoints}
                onChange={e => setSPoints(Number(e.target.value))}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value={10}>+10 XP (Ringan)</option>
                <option value={15}>+15 XP (Sedang)</option>
                <option value={20}>+20 XP (Tantangan)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Kategori Bidang</label>
              <select
                id="select-secondary-category"
                value={sCategory}
                onChange={e => setSCategory(e.target.value as any)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="Pengembangan">Pengembangan Diri</option>
                <option value="Olahraga">Olahraga / Fisik</option>
                <option value="Sosial">Sosial / Sedekah</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddSecondary(false)}
              className="h-11 px-4 text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              Batalkan
            </button>
            <button
              id="submit-secondary"
              type="submit"
              className="h-11 px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Simpan Sunnah
            </button>
          </div>
        </form>
      )}

      {/* CORE RENDER LISTS */}
      {activeHabitTab === 'compulsory' ? (
        
        /* ----------------------------------------------------
           TAB: HABITS WAJIB (PRIMER)
           ---------------------------------------------------- */
        <div className="space-y-4">
          {primaryHabits.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-12 px-4 text-center">
              <span className="text-4xl text-slate-300 dark:text-slate-700 block mb-3">🛡️</span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Belum ada daftar kebiasaan wajib.</p>
              <p className="text-xs text-slate-400 mt-1">Gunakan tombol 'Tambah Habit Wajib' di kanan atas untuk membuat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {primaryHabits.map(habit => {
                const missed = !habit.checked && isPastTargetTime(habit.targetTime);
                
                return (
                  <div
                    key={habit.id}
                    className={`bg-white dark:bg-slate-900 p-4.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                      habit.checked 
                        ? 'border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/5 dark:bg-emerald-950/5'
                        : missed
                          ? 'border-rose-200 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/10 shadow-xs'
                          : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    
                    {/* Checkbox & Text Info Column */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      
                      {/* Standard Big Touch Friendly Checkbox (at least 44x44px target box) */}
                      <button
                        id={`btn-check-primary-${habit.id}`}
                        onClick={() => togglePrimaryCheck(habit.id)}
                        className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-200 ${
                          habit.checked
                            ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                            : missed
                              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-500 hover:bg-rose-100'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-transparent hover:border-indigo-400'
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[3px]" />
                      </button>

                      <div className="space-y-1.5 min-w-0">
                        {/* Title of the Habit with checked styling option */}
                        <p className={`text-sm font-bold truncate ${
                          habit.checked 
                            ? 'text-slate-400 dark:text-slate-500 line-through' 
                            : 'text-slate-850 dark:text-slate-100'
                        }`}>
                          {habit.name}
                        </p>

                        {/* Extra badging row */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          {/* target indicator */}
                          <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border ${
                            habit.checked 
                              ? 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/20' 
                              : missed
                                ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-900/30 font-bold'
                                : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-450 dark:border-slate-850'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>Target: {habit.targetTime}</span>
                          </span>

                          {/* category indicator */}
                          <span className={`px-2 py-0.5 rounded-full border font-semibold ${getCategoryTheme(habit.category)}`}>
                            {habit.category}
                          </span>

                          {/* Streak Fire tag */}
                          {habit.streak > 0 && (
                            <span className="flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-250 font-bold px-2 py-0.5 rounded-full dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/20 shadow-xs">
                              <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>Streak {habit.streak}d</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions Column */}
                    <div className="flex items-center gap-2shrink-0">
                      {/* Missed Warning banner sign */}
                      {!habit.checked && missed && (
                        <div className="flex flex-col items-end text-right text-[10px] text-rose-500 dark:text-rose-400 font-bold">
                          <span className="bg-rose-100 dark:bg-rose-950/60 px-2 py-1 rounded-lg">Terlewat!</span>
                        </div>
                      )}
                      
                      {/* Delete icon */}
                      <button
                        onClick={() => deletePrimary(habit.id, habit.name)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                        title="Hapus Kebiasaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        
        /* ----------------------------------------------------
           TAB: HABITS OPUS (GOOD TO HAVE / SUNNAH / OPTIONAL)
           ---------------------------------------------------- */
        <div className="space-y-4" id="habits-sunnah-content">
          {secondaryHabits.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-12 px-4 text-center">
              <span className="text-4xl text-slate-300 dark:text-slate-700 block mb-3">🍃</span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Belum ada daftar kebiasaan sunnah.</p>
              <p className="text-xs text-slate-400 mt-1">Gunakan tombol 'Tambah Habit Sunnah' di kanan atas untuk membuat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryHabits.map(habit => {
                return (
                  <div
                    key={habit.id}
                    className={`bg-white dark:bg-slate-900 p-4.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                      habit.checked 
                        ? 'border-emerald-100 dark:border-emerald-950 bg-emerald-50/5 dark:bg-emerald-950/5 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    
                    {/* Checkbox & Info layout */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      
                      {/* Touch point (at least 44px) checkbox */}
                      <button
                        id={`btn-check-secondary-${habit.id}`}
                        onClick={() => toggleSecondaryCheck(habit.id)}
                        className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-200 ${
                          habit.checked
                            ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-650 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-transparent hover:border-emerald-400'
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[3px]" />
                      </button>

                      <div className="space-y-1.5 min-w-0">
                        {/* Title of the optional Habit */}
                        <p className={`text-sm font-bold truncate ${
                          habit.checked 
                            ? 'text-slate-400 dark:text-slate-500 line-through' 
                            : 'text-slate-850 dark:text-slate-100'
                        }`}>
                          {habit.name}
                        </p>

                        {/* Badges strip */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          {/* Points Reward marker */}
                          <span className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full border ${
                            habit.checked
                              ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900/40 dark:border-slate-850'
                              : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900/30'
                          }`}>
                            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>+{habit.pointsReward} XP</span>
                          </span>

                          {/* Time tag if set */}
                          {habit.targetTime && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-200 font-semibold px-2 py-0.5 rounded-full dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-850">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Saran: {habit.targetTime}</span>
                            </span>
                          )}

                          {/* category */}
                          <span className={`px-2 py-0.5 rounded-full border font-semibold ${getCategoryTheme(habit.category)}`}>
                            {habit.category}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Trash delete action */}
                    <button
                      onClick={() => deleteSecondary(habit.id, habit.name)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                      title="Hapus Kebiasaan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
