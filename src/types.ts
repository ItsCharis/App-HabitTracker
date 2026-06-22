/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PrimaryHabit {
  id: string;
  name: string;
  targetTime: string; // HH:MM, e.g., '04:30'
  checked: boolean;
  streak: number;
  category: 'Spiritual' | 'Kesehatan' | 'Akademik' | 'Lainnya';
}

export interface SecondaryHabit {
  id: string;
  name: string;
  targetTime?: string; // e.g., '08:00', optional
  checked: boolean;
  pointsReward: number; // e.g., 10, 15, 20
  category: 'Olahraga' | 'Pengembangan' | 'Sosial' | 'Lainnya';
}

export interface TodoTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  category: string; // 'Kuliah' | 'Organisasi' | 'Pribadi' | etc.
  completed: boolean;
  deadlineTime?: string; // HH:MM
}

export interface MilestoneSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface BigProject {
  id: string;
  title: string;
  description: string;
  deadlineDate: string; // YYYY-MM-DD
  status: 'not_started' | 'in_progress' | 'completed';
  subtasks: MilestoneSubtask[];
  weeklyTarget: string; // text description
  category: string; // e.g. 'Kuliah' | 'Tugas Akhir' | etc.
}

export interface DailyHistoryItem {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g., 'Senin', 'Selasa'
  primaryCompleted: number;
  primaryTotal: number;
  secondaryCompleted: number;
  secondaryTotal: number;
  tasksCompleted: number;
  tasksTotal: number;
  pointsEarned: number;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  currentStreak: number;
  maxStreak: number;
  lastUpdatedDate: string; // YYYY-MM-DD
  username: string;
}
