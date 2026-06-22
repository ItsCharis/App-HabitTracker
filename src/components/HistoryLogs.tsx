/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  History, 
  Trash2, 
  CheckCircle2, 
  Award, 
  AlertCircle,
  FileText,
  Import,
  Check,
  RotateCcw,
  X,
  User,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { DailyHistoryItem, UserStats, PrimaryHabit, SecondaryHabit, TodoTask, BigProject } from '../types';
import { 
  DEFAULT_STATS, 
  DEFAULT_PRIMARY_HABITS, 
  DEFAULT_SECONDARY_HABITS, 
  DEFAULT_TODOTASKS, 
  DEFAULT_BIGPROJECTS 
} from '../utils';

interface HistoryLogsProps {
  history: DailyHistoryItem[];
  stats: UserStats;
  primaryHabits: PrimaryHabit[];
  secondaryHabits: SecondaryHabit[];
  todoTasks: TodoTask[];
  bigProjects: BigProject[];
  setHistory: React.Dispatch<React.SetStateAction<DailyHistoryItem[]>>;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  setPrimaryHabits: React.Dispatch<React.SetStateAction<PrimaryHabit[]>>;
  setSecondaryHabits: React.Dispatch<React.SetStateAction<SecondaryHabit[]>>;
  setTodoTasks: React.Dispatch<React.SetStateAction<TodoTask[]>>;
  setBigProjects: React.Dispatch<React.SetStateAction<BigProject[]>>;
}

export default function HistoryLogs({
  history,
  stats,
  primaryHabits,
  secondaryHabits,
  todoTasks,
  bigProjects,
  setHistory,
  setStats,
  setPrimaryHabits,
  setSecondaryHabits,
  setTodoTasks,
  setBigProjects
}: HistoryLogsProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importNotice, setImportNotice] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });

  // Custom states for dialog modals (fixes sandboxed iframe restrictions)
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState(stats.username || 'Achmad Maimun');

  // Export state to JSON
  const handleExportData = () => {
    try {
      const fullBackup = {
        stats,
        primaryHabits,
        secondaryHabits,
        todoTasks,
        bigProjects,
        history
      };

      const jsonStr = JSON.stringify(fullBackup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mahasiswa_productivity_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setImportNotice({
        status: 'success',
        message: 'Data berhasil diekspor menjadi berkas backup JSON!'
      });
    } catch (e) {
      setImportNotice({
        status: 'error',
        message: 'Gagal melakukan ekspor data.'
      });
    }
  };

  // State import validator
  const processImportJSON = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Basic schema validations
      if (!parsed.stats || !parsed.primaryHabits || !parsed.secondaryHabits || !parsed.todoTasks) {
        throw new Error('Format berkas tidak sesuai. Pastikan berkas ekspor orisinal.');
      }

      setStats(parsed.stats);
      setPrimaryHabits(parsed.primaryHabits);
      setSecondaryHabits(parsed.secondaryHabits);
      setTodoTasks(parsed.todoTasks);
      if (parsed.bigProjects) setBigProjects(parsed.bigProjects);
      if (parsed.history) setHistory(parsed.history);

      setImportNotice({
        status: 'success',
        message: 'Data berhasil disinkronisasi dan diimpor sepenuhnya! Halaman diperbarui.'
      });
    } catch (e: any) {
      setImportNotice({
        status: 'error',
        message: e.message || 'Berkas JSON rusak atau strukturnya salah.'
      });
    }
  };

  // Click File Selector Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImportJSON(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  // Drag and Drop support
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImportJSON(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const executeClearHistory = () => {
    setHistory([]);
    setImportNotice({
      status: 'success',
      message: 'Riwayat performa mingguan berhasil dibersihkan.'
    });
    setShowClearHistoryModal(false);
  };

  const executeResetAllData = () => {
    const finalUsername = newProfileName.trim() !== '' ? newProfileName.trim() : 'Achmad Maimun';

    const resetStats: UserStats = {
      totalPoints: 0,
      level: 1,
      currentStreak: 0,
      maxStreak: 0,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      username: finalUsername
    };

    // Set all stats and progress variables back to uncompleted/unearned levels
    setStats(resetStats);
    setPrimaryHabits(DEFAULT_PRIMARY_HABITS.map(h => ({ ...h, checked: false, streak: 0 })));
    setSecondaryHabits(DEFAULT_SECONDARY_HABITS.map(h => ({ ...h, checked: false })));
    setTodoTasks(DEFAULT_TODOTASKS.map(t => ({ ...t, completed: false })));
    setBigProjects(DEFAULT_BIGPROJECTS.map(bp => ({
      ...bp,
      status: 'not_started',
      subtasks: bp.subtasks.map(s => ({ ...s, completed: false }))
    })));
    setHistory([]);

    setImportNotice({
      status: 'success',
      message: 'Aplikasi berhasil di-reset ke awal! Selamat memulai lembaran produktivitas baru 🎉'
    });
    
    setShowResetModal(false);
  };

  return (
    <div className="space-y-6" id="history-section">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-1000 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <span>Penyimpanan, Ekspor & Riwayat Performa Mingguan</span>
          </h2>
          <p className="text-xs text-slate-400">Analisis rekam jejak kepatuhan serta pencapaian kumulatif per minggu serta lakukan pencadangan data secara aman.</p>
        </div>
      </div>

      {/* Notices */}
      {importNotice.status && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
          importNotice.status === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-150'
            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-150'
        }`}>
          {importNotice.status === 'success' ? (
            <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <div className="font-semibold">{importNotice.message}</div>
        </div>
      )}

      {/* BACKUP OPERATIONS SECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Export Data Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Mencadangkan Data (Ekspor)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seluruh rekor kebiasaan wajib, sunnah, rekor streak harian, to-do harian, dan milestone proyek besar disimpan secara lokal di peramban (browser) Anda. Ekspor berkas ini untuk memindahkan catatan produktivitas ke gawai (device) HP Android atau komputer lain.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/65 flex flex-col gap-2">
            <button
              id="btn-export-data"
              onClick={handleExportData}
              className="w-full h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Berkas (.json)</span>
            </button>
            <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-400 font-mono px-1">
              <span>Format Cadangan</span>
              <span className="font-semibold text-slate-500 dark:text-slate-300">JSON v2.0</span>
            </div>
          </div>
        </div>

        {/* Drag and Drop File Import Panel */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
            dragActive 
              ? 'border-indigo-400 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-sm' 
              : 'border-slate-100 dark:border-slate-800'
          }`}
        >
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <span>SINKRONISASI DATA (IMPOR)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tarik & Letakkan berkas cadangan JSON Anda ke kotak ini, atau ketuk tombol untuk mencari dari berkas galeri lokal.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/65 flex flex-col gap-2">
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json"
              onChange={handleFileChange}
              className="hidden" 
            />

            <button
              id="btn-import-data"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-11 px-5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih & Impor Berkas</span>
            </button>
            <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-400 px-1">
              <span>Metode Drag-Drop</span>
              <span className="font-semibold text-slate-500 dark:text-slate-300 italic">
                {dragActive ? "Lepas sekarang! 📥" : "Seret file ke sini"}
              </span>
            </div>

          </div>
        </div>

        {/* Reset All Data Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <span>Mulai Dari Awal (Reset)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingin memulai siklus kebiasaan baru atau mengulang rekor Anda kembali ke nol? Fitur ini akan membersihkan rekor kemajuan Anda dan mengulang poin, level, streak harian, serta tugas kembali ke keadaan awal.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/65 flex flex-col gap-2">
            <button
              id="btn-reset-all-data"
              onClick={() => { setNewProfileName(stats.username || 'Achmad Maimun'); setShowResetModal(true); }}
              className="w-full h-11 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Mulai Ulang Aplikasi</span>
            </button>
            <div className="flex items-center justify-between text-[10px] text-rose-500 font-mono px-1">
              <span>Konsekuensi</span>
              <span className="font-bold uppercase tracking-wider">Reset Total</span>
            </div>
          </div>
        </div>

      </div>

       {/* COMPILATION SUMMARY REKORD LOGS LISTS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 space-y-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-150 dark:border-slate-800">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Log Riwayat Performa Mingguan</h3>
            <p className="text-xs text-slate-400">Arsip pencapaian kumulatif dan kepatuhan yang dikelompokkan per pekan.</p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setShowClearHistoryModal(true)}
              className="px-3 py-1.5 border border-rose-200 text-rose-500 hover:bg-rose-50/15 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Arsip</span>
            </button>
          )}
        </div>

        {/* List render */}
        <div className="space-y-3.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-3xl text-slate-300 block mb-2">📜</span>
              <p className="text-xs text-slate-400">Belum ada arsip riwayat mingguan tersimpan.</p>
              <p className="text-[10px] text-slate-400 mt-1">Data harian akan otomatis diakumulasikan dan diringkas ke rentang pekan aktif setiap tanggal berganti.</p>
            </div>
          ) : (
            history.map((hist, idx) => {
              // calculations
              const primaryPct = hist.primaryTotal > 0 ? Math.round((hist.primaryCompleted / hist.primaryTotal) * 100) : 0;
              const taskPct = hist.tasksTotal > 0 ? Math.round((hist.tasksCompleted / hist.tasksTotal) * 100) : 0;
              const overallPct = Math.round((primaryPct + taskPct) / 2);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  
                  {/* Date name */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{hist.date}</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{hist.dayName}</div>
                  </div>

                  {/* Indicators stats metrics */}
                  <div className="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-8 flex-1 sm:justify-end">
                    
                    <div className="text-xs">
                      <div className="text-slate-400 font-medium">Habits Primer</div>
                      <div className="font-bold text-slate-800 dark:text-white flex items-baseline gap-1">
                        <span>{hist.primaryCompleted} / {hist.primaryTotal}</span>
                        <span className="text-[10px] text-emerald-500 font-semibold">({primaryPct}%)</span>
                      </div>
                    </div>

                    <div className="text-xs">
                      <div className="text-slate-400 font-medium">Agenda To-Do</div>
                      <div className="font-bold text-slate-850 dark:text-white flex items-baseline gap-1">
                        <span>{hist.tasksCompleted} / {hist.tasksTotal}</span>
                        <span className="text-[10px] text-sky-500 font-semibold">({taskPct}%)</span>
                      </div>
                    </div>

                    <div className="text-xs">
                      <div className="text-slate-400 font-medium">Poin Terkumpul</div>
                      <div className="font-extrabold text-amber-500 dark:text-amber-400 flex items-center gap-0.5">
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>+{hist.pointsEarned} XP</span>
                      </div>
                    </div>

                    {/* Progress Badge percentage */}
                    <div className="pt-2 sm:pt-0">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                        overallPct >= 80
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-450'
                          : overallPct >= 50
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400'
                            : 'bg-slate-150 text-slate-700 border border-slate-250 dark:bg-slate-850 dark:text-slate-400'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{overallPct}% Produktif</span>
                      </span>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Custom Reset Modal (Fixes iframe restriction blocks) */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop overlay layout */}
          <div 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs transition-opacity"
            onClick={() => setShowResetModal(false)}
          />
          
          {/* Modal Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top decorative hazard pattern */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-600" />
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-1000 dark:text-slate-100">Reset Semua Data Anda?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tindakan ini bersifat permanen dan tidak bisa dibatalkan. Seluruh poin XP, kemajuan level, rekor hari berturut-turut, agenda tugas harian, dan arsip riwayat mingguan akan diatur ulang kembali ke keadaan awal.
                </p>
              </div>
            </div>

            {/* List of resets */}
            <div className="my-4 p-4 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-100/30 dark:border-rose-900/20 space-y-2">
              <div className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Detail Modifikasi:</div>
              <ul className="text-xs text-slate-600 dark:text-slate-450 space-y-1 list-disc list-inside">
                <li>Total Akumulasi Skor XP & Level Leveling</li>
                <li>Rekor Streak & Evaluasi Mingguan</li>
                <li>Agenda Checklist & Milestone Proyek</li>
              </ul>
            </div>

            {/* Profile input name */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Nama Profil Pengguna Baru:</span>
              </label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Tulis nama untuk profil baru..."
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-800 dark:text-slate-200 font-semibold"
                id="reset-profile-name-input"
              />
            </div>

            {/* Actions button group */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 h-11 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                id="btn-cancel-reset"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeResetAllData}
                className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                id="btn-confirm-reset"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Sekarang</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Clear History Logs Modal */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs transition-opacity"
            onClick={() => setShowClearHistoryModal(false)}
          />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl text-amber-500 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-1000 dark:text-slate-100">Bersihkan Arsip Riwayat?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Apakah Anda yakin ingin mengosongkan seluruh statistik terekam performa mingguan Anda? Catatan pengerjaan aktif pekan ini akan tetap dipertahankan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowClearHistoryModal(false)}
                className="flex-1 h-11 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-355 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                id="btn-cancel-clear-history"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeClearHistory}
                className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                id="btn-confirm-clear-history"
              >
                <Trash2 className="w-4 h-4 animate-pulse" />
                <span>Hapus Riwayat</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
