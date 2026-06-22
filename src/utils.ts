/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrimaryHabit, SecondaryHabit, TodoTask, BigProject, DailyHistoryItem, UserStats } from './types';

// Get Indonesian Day Names
export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getFormattedDate(date: Date = new Date()): string {
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const dayNum = date.getDate();
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

export function getLocalDateString(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Checks if the current time is past the target time.
 * targetTime is in 'HH:MM' format.
 */
export function isPastTargetTime(targetTime: string): boolean {
  const now = new Date();
  const [targetHour, targetMin] = targetTime.split(':').map(Number);
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  if (currentHour > targetHour) return true;
  if (currentHour === targetHour && currentMin >= targetMin) return true;
  return false;
}

// Convert minutes to HH:MM format for visual presentation
export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  return timeStr;
}

// Get weekly date range string, e.g. "15 Jun - 21 Jun 2026"
export function getWeekRangeString(date: Date): string {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(current.setDate(diff));
  
  const s = new Date(m);
  s.setDate(m.getDate() + 6);
  
  const formatShort = (d: Date) => {
    const dayNum = d.getDate();
    const monthName = INDONESIAN_MONTHS[d.getMonth()].substring(0, 3);
    return `${dayNum} ${monthName}`;
  };
  
  return `${formatShort(m)} - ${formatShort(s)} ${m.getFullYear()}`;
}

// Get standard label like "Pekan Ini", "1 Pekan Lalu", etc relative to today
export function getRelativeWeekLabel(weekRangeStr: string): string {
  const today = new Date();
  const currentWeekRange = getWeekRangeString(today);
  if (weekRangeStr === currentWeekRange) {
    return "Pekan Ini";
  }
  
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekRange = getWeekRangeString(lastWeek);
  if (weekRangeStr === lastWeekRange) {
    return "1 Pekan Lalu";
  }
  
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const twoWeeksAgoRange = getWeekRangeString(twoWeeksAgo);
  if (weekRangeStr === twoWeeksAgoRange) {
    return "2 Pekan Lalu";
  }

  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  const threeWeeksAgoRange = getWeekRangeString(threeWeeksAgo);
  if (weekRangeStr === threeWeeksAgoRange) {
    return "3 Pekan Lalu";
  }

  return "Arsip Pekan";
}

export function updateHistoryDayNames(historyList: DailyHistoryItem[]): DailyHistoryItem[] {
  return historyList.map(item => ({
    ...item,
    dayName: getRelativeWeekLabel(item.date)
  }));
}

// Check and trigger daily reset and log to weekly history buckets
export function checkAndTriggerDailyReset(
  currentStats: UserStats,
  currentPrimary: PrimaryHabit[],
  currentSecondary: SecondaryHabit[],
  currentTasks: TodoTask[],
  currentHistory: DailyHistoryItem[]
): {
  stats: UserStats;
  primary: PrimaryHabit[];
  secondary: SecondaryHabit[];
  tasks: TodoTask[];
  history: DailyHistoryItem[];
  didReset: boolean;
} {
  const todayStr = getLocalDateString(new Date());
  
  if (currentStats.lastUpdatedDate === todayStr) {
    // Already updated today, no reset needed, just keep labels refreshed
    return {
      stats: currentStats,
      primary: currentPrimary,
      secondary: currentSecondary,
      tasks: currentTasks,
      history: updateHistoryDayNames(currentHistory),
      didReset: false,
    };
  }

  // A new day has arrived! Let's archive yesterday's completion data into its weekly bucket
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayWeekRange = getWeekRangeString(yesterday);

  // Calculate scores for yesterday
  const primaryCompletedCount = currentPrimary.filter(h => h.checked).length;
  const primaryTotalCount = currentPrimary.length;
  
  const secondaryCompletedCount = currentSecondary.filter(h => h.checked).length;
  const secondaryTotalCount = currentSecondary.length;

  const yesterdayTasks = currentTasks; // Tasks on the list yesterday
  const tasksCompletedCount = yesterdayTasks.filter(t => t.completed).length;
  const tasksTotalCount = yesterdayTasks.length;

  // Points earned yesterday
  let pointsBonus = 0;
  currentSecondary.forEach(h => {
    if (h.checked) {
      pointsBonus += h.pointsReward;
    }
  });
  // completed tasks reward
  yesterdayTasks.forEach(t => {
    if (t.completed) {
      pointsBonus += t.priority === 'high' ? 10 : t.priority === 'medium' ? 5 : 2;
    }
  });

  // Check if we already have an entry for yesterday's week range
  const existingWeekIdx = currentHistory.findIndex(item => item.date === yesterdayWeekRange);
  let updatedHistory = [...currentHistory];

  if (existingWeekIdx !== -1) {
    // Accumulate metrics inside the existing weekly entry
    const existing = updatedHistory[existingWeekIdx];
    updatedHistory[existingWeekIdx] = {
      ...existing,
      primaryCompleted: existing.primaryCompleted + primaryCompletedCount,
      primaryTotal: existing.primaryTotal + primaryTotalCount,
      secondaryCompleted: existing.secondaryCompleted + secondaryCompletedCount,
      secondaryTotal: existing.secondaryTotal + secondaryTotalCount,
      tasksCompleted: existing.tasksCompleted + tasksCompletedCount,
      tasksTotal: existing.tasksTotal + tasksTotalCount,
      pointsEarned: existing.pointsEarned + pointsBonus,
    };
  } else {
    // Create a new weekly history log space
    const newWeeklyItem: DailyHistoryItem = {
      date: yesterdayWeekRange,
      dayName: getRelativeWeekLabel(yesterdayWeekRange),
      primaryCompleted: primaryCompletedCount,
      primaryTotal: primaryTotalCount,
      secondaryCompleted: secondaryCompletedCount,
      secondaryTotal: secondaryTotalCount,
      tasksCompleted: tasksCompletedCount,
      tasksTotal: tasksTotalCount,
      pointsEarned: pointsBonus,
    };
    updatedHistory = [newWeeklyItem, ...updatedHistory];
  }

  // Refresh relative labels ("Pekan Ini", "1 Pekan Lalu", etc.) & limit to 12 weeks of historical logs (approx. 3 months)
  updatedHistory = updateHistoryDayNames(updatedHistory);
  if (updatedHistory.length > 12) {
    updatedHistory = updatedHistory.slice(0, 12);
  }

  // Calculate habit streaks
  // If a primary habit was completed yesterday, increment streak. Otherwise reset to 0.
  const updatedPrimary = currentPrimary.map(habit => {
    return {
      ...habit,
      streak: habit.checked ? habit.streak + 1 : 0,
      checked: false, // Reset for the new day
    };
  });

  // Reset secondary habits for the new day
  const updatedSecondary = currentSecondary.map(habit => ({
    ...habit,
    checked: false,
  }));

  // Clean completed tasks, but carry over active (uncompleted) tasks to the next day
  const updatedTasks = currentTasks.filter(t => !t.completed);

  // Overall productivity streak update
  // Overall streak holds if at least 60% of both primary habits and tasks were completed yesterday
  const primaryRatio = primaryTotalCount > 0 ? primaryCompletedCount / primaryTotalCount : 1;
  const wasHighlyProductive = primaryRatio >= 0.6;
  
  let newCurrentStreak = currentStats.currentStreak;
  if (wasHighlyProductive) {
    newCurrentStreak += 1;
  } else {
    newCurrentStreak = 0;
  }

  const newMaxStreak = Math.max(newCurrentStreak, currentStats.maxStreak);
  
  // Levels are based on points (every 200 points = 1 level increase)
  const currentTotalPoints = currentStats.totalPoints + pointsBonus;
  const newLevel = Math.floor(currentTotalPoints / 200) + 1;

  const updatedStats: UserStats = {
    ...currentStats,
    totalPoints: currentTotalPoints,
    level: newLevel,
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    lastUpdatedDate: todayStr,
  };

  return {
    stats: updatedStats,
    primary: updatedPrimary,
    secondary: updatedSecondary,
    tasks: updatedTasks,
    history: updatedHistory,
    didReset: true,
  };
}

// Default pre-populated data for first launch to make the interface instantly beautiful and useful
export const DEFAULT_PRIMARY_HABITS: PrimaryHabit[] = [
  { id: 'p1', name: 'Sholat Subuh & Doa Pagi', targetTime: '04:45', checked: true, streak: 5, category: 'Spiritual' },
  { id: 'p2', name: 'Minum Obat / Multivitamin Harian', targetTime: '07:30', checked: true, streak: 8, category: 'Kesehatan' },
  { id: 'p3', name: 'Kuliah / Studi Mandiri Terjadwal', targetTime: '09:00', checked: false, streak: 3, category: 'Akademik' },
  { id: 'p4', name: 'Makan Siang Sehat Rutin', targetTime: '12:30', checked: true, streak: 12, category: 'Kesehatan' },
  { id: 'p5', name: 'Membaca Diktat Kuliah 30 Menit', targetTime: '19:30', checked: false, streak: 2, category: 'Akademik' },
];

export const DEFAULT_SECONDARY_HABITS: SecondaryHabit[] = [
  { id: 's1', name: 'Sholat Dhuha / Meditasi Tenang', targetTime: '08:30', checked: true, pointsReward: 15, category: 'Pengembangan' },
  { id: 's2', name: 'Olahraga Ringan / Peregangan', targetTime: '16:30', checked: false, pointsReward: 20, category: 'Olahraga' },
  { id: 's3', name: 'Sedekah / Berbagi Sederhana', targetTime: '09:00', checked: true, pointsReward: 10, category: 'Sosial' },
  { id: 's4', name: 'Merapikan Kamar Kos', targetTime: '21:00', checked: false, pointsReward: 10, category: 'Lainnya' },
];

export const DEFAULT_TODOTASKS: TodoTask[] = [
  { id: 't1', title: 'Upload Tugas Analisis Desain Algoritma di Portal', priority: 'high', category: 'Kuliah', completed: false, deadlineTime: '14:00' },
  { id: 't2', title: 'Rapat Kerja Panitia Inaugurasi via Zoom', priority: 'medium', category: 'Organisasi', completed: true },
  { id: 't3', title: 'Belanja Keperluan Mingguan (Kost)', priority: 'low', category: 'Pribadi', completed: false },
  { id: 't4', title: 'Review Materi Kuliah Statistik Industri', priority: 'medium', category: 'Kuliah', completed: false },
];

export const DEFAULT_BIGPROJECTS: BigProject[] = [
  {
    id: 'bp1',
    title: 'Aplikasi Portofolio React (Tugas Akhir)',
    description: 'Mengembangkan aplikasi single page application modern menggunakan React 19, Tailwind CSS, dan animasi Framer Motion.',
    deadlineDate: '2026-07-15',
    status: 'in_progress',
    weeklyTarget: 'Menuntaskan visualisasi performa grafik & layout responsive mobile-first',
    category: 'Tugas Akhir',
    subtasks: [
      { id: 'sub1_1', title: 'Wireframing & Desain Dashboard UI', completed: true },
      { id: 'sub1_2', title: 'Setup Routing dan State Lokal', completed: true },
      { id: 'sub1_3', title: 'Membuat Custom Graphic Dashboard', completed: false },
      { id: 'sub1_4', title: 'Integrasi LocalStorage & Ekspor Berkas', completed: false },
    ],
  },
  {
    id: 'bp2',
    title: 'Laporan Kuliah Kerja Nyata (KKN)',
    description: 'Penyusunan laporan akhir kegiatan KKN tematik di desa binaan bersama jajaran pimpinan kelompok.',
    deadlineDate: '2026-08-01',
    status: 'not_started',
    weeklyTarget: 'Mengumpulkan dokumentasi kegiatan dari seluruh anggota divisi humas',
    category: 'Kuliah',
    subtasks: [
      { id: 'sub2_1', title: 'Mengompilasi Kata Pengantar & Logbook', completed: false },
      { id: 'sub2_2', title: 'Draft Bab I Latar Belakang Masalah', completed: false },
      { id: 'sub2_3', title: 'Penyusunan Lampiran Keuangan', completed: false },
    ],
  },
];

export const DEFAULT_HISTORY: DailyHistoryItem[] = [
  { date: '15 Jun - 21 Jun 2026', dayName: 'Pekan Ini', primaryCompleted: 24, primaryTotal: 30, secondaryCompleted: 12, secondaryTotal: 24, tasksCompleted: 12, tasksTotal: 15, pointsEarned: 135 },
  { date: '08 Jun - 14 Jun 2026', dayName: '1 Pekan Lalu', primaryCompleted: 28, primaryTotal: 35, secondaryCompleted: 18, secondaryTotal: 28, tasksCompleted: 15, tasksTotal: 18, pointsEarned: 195 },
  { date: '01 Jun - 07 Jun 2026', dayName: '2 Pekan Lalu', primaryCompleted: 23, primaryTotal: 35, secondaryCompleted: 15, secondaryTotal: 28, tasksCompleted: 14, tasksTotal: 16, pointsEarned: 170 },
  { date: '25 Mei - 31 Mei 2026', dayName: '3 Pekan Lalu', primaryCompleted: 22, primaryTotal: 30, secondaryCompleted: 11, secondaryTotal: 24, tasksCompleted: 12, tasksTotal: 14, pointsEarned: 115 },
];

export const DEFAULT_STATS: UserStats = {
  totalPoints: 345,
  level: 2,
  currentStreak: 4,
  maxStreak: 12,
  lastUpdatedDate: getLocalDateString(new Date()),
  username: 'Achmad Maimun',
};
