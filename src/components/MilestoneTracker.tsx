/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Clock, 
  Flag, 
  ChevronDown, 
  ChevronUp, 
  Layout, 
  Target,
  Calendar,
  Layers,
  Edit2,
  Check
} from 'lucide-react';
import { BigProject, MilestoneSubtask } from '../types';

interface MilestoneTrackerProps {
  bigProjects: BigProject[];
  setBigProjects: React.Dispatch<React.SetStateAction<BigProject[]>>;
}

export default function MilestoneTracker({
  bigProjects,
  setBigProjects
}: MilestoneTrackerProps) {
  // Local toggles
  const [showAddProject, setShowAddProject] = useState(false);
  const [expandedProjectIds, setExpandedProjectIds] = useState<Record<string, boolean>>({ bp1: true });

  // Add Project Form States
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDeadline, setProjDeadline] = useState('');
  const [projCategory, setProjCategory] = useState('Kuliah');
  const [projWeekly, setProjWeekly] = useState('');
  const [subtaskInputs, setSubtaskInputs] = useState<string[]>(['', '']);

  // Add Subtask Inline States
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedProjectIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Add Project Submission Handler
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    const startingSubtasks: MilestoneSubtask[] = subtaskInputs
      .filter(input => input.trim() !== '')
      .map((input, index) => ({
        id: `sub_${Date.now()}_${index}`,
        title: input.trim(),
        completed: false
      }));

    const newProject: BigProject = {
      id: 'bp_' + Date.now(),
      title: projTitle.trim(),
      description: projDesc.trim(),
      deadlineDate: projDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'in_progress',
      weeklyTarget: projWeekly.trim() || 'Selesaikan sub-task prioritas minggu ini',
      category: projCategory,
      subtasks: startingSubtasks
    };

    setBigProjects(prev => [...prev, newProject]);
    
    // Clear inputs
    setProjTitle('');
    setProjDesc('');
    setProjDeadline('');
    setProjCategory('Kuliah');
    setProjWeekly('');
    setSubtaskInputs(['', '']);
    setShowAddProject(false);
  };

  // Add more subtask rows in the create form
  const addSubtaskField = () => {
    setSubtaskInputs(prev => [...prev, '']);
  };

  const removeSubtaskField = (index: number) => {
    setSubtaskInputs(prev => prev.filter((_, i) => i !== index));
  };

  const updateSubtaskField = (index: number, val: string) => {
    setSubtaskInputs(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Toggle Subtask Completion in Project Cards
  const toggleSubtask = (projId: string, subtaskId: string) => {
    setBigProjects(prev => prev.map(proj => {
      if (proj.id === projId) {
        const updatedSubtasks = proj.subtasks.map(sub => {
          if (sub.id === subtaskId) {
            return { ...sub, completed: !sub.completed };
          }
          return sub;
        });

        // Calculate if all elements are done
        const total = updatedSubtasks.length;
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        let nextStatus = proj.status;

        if (total > 0 && completedCount === total) {
          nextStatus = 'completed';
        } else if (completedCount > 0) {
          nextStatus = 'in_progress';
        }

        return {
          ...proj,
          subtasks: updatedSubtasks,
          status: nextStatus
        };
      }
      return proj;
    }));
  };

  // Add subtask inline directly on existing big projects
  const addSubtaskInline = (projId: string) => {
    const titleVal = newSubtaskTitle[projId];
    if (!titleVal || !titleVal.trim()) return;

    setBigProjects(prev => prev.map(proj => {
      if (proj.id === projId) {
        const newSub: MilestoneSubtask = {
          id: `sub_inline_${Date.now()}`,
          title: titleVal.trim(),
          completed: false
        };
        const updatedSubtasks = [...proj.subtasks, newSub];

        return {
          ...proj,
          subtasks: updatedSubtasks,
          // rollback completed status back to in_progress because a new uncompleted element is added
          status: proj.status === 'completed' ? 'in_progress' : proj.status
        };
      }
      return proj;
    }));

    // Clear inline textbox
    setNewSubtaskTitle(prev => ({ ...prev, [projId]: '' }));
  };

  // Delete Project Card
  const deleteProject = (id: string, title: string) => {
    if (confirm(`Hapus Proyek Besar '${title}'? Semua data sub-task di dalamnya akan hilang.`)) {
      setBigProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  // Update Manual Project Status
  const updateProjectStatus = (id: string, nextStatus: 'not_started' | 'in_progress' | 'completed') => {
    setBigProjects(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: nextStatus
        };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6" id="projects-section">
      
      {/* Title & Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-1000 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Proyek Besar (Milestone Tracker)</span>
          </h2>
          <p className="text-xs text-slate-400">Pecah proyek kuliah jangka panjang menjadi sasaran kecil demi mitigasi penumpukan tugas.</p>
        </div>
        
        <button
          id="btn-add-project"
          onClick={() => setShowAddProject(!showAddProject)}
          className="w-full sm:w-auto h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Proyek Besar Baru</span>
        </button>
      </div>

      {/* FORM: Create Big Project */}
      {showAddProject && (
        <form onSubmit={handleAddProject} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Inisialisasi Proyek Besar Mahasiswa</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-slate-500 font-semibold">Nama Proyek</label>
              <input
                id="input-project-title"
                type="text"
                required
                placeholder="Contoh: Penyusunan Skripsi Bab I - III"
                value={projTitle}
                onChange={e => setProjTitle(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Grup / Kategori</label>
              <input
                id="input-project-category"
                type="text"
                required
                placeholder="Contoh: Tugas Akhir, KKN, Organisasi"
                value={projCategory}
                onChange={e => setProjCategory(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-slate-500 font-semibold">Deskripsi Umum Proyek</label>
              <textarea
                id="input-project-desc"
                placeholder="Tuliskan tujuan umum atau arahan dosen pembimbing..."
                value={projDesc}
                onChange={e => setProjDesc(e.target.value)}
                className="w-full min-h-[80px] p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none"
              />
            </div>

            {/* Deadline & Weekly target */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold">Tenggat Target Kalender</label>
                <input
                  id="input-project-deadline"
                  type="date"
                  required
                  value={projDeadline}
                  onChange={e => setProjDeadline(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs text-slate-500 font-semibold">Sasaran Mingguan (Weekly Target)</label>
              <input
                id="input-project-weekly"
                type="text"
                placeholder="🎯 Fokus minggu ini: Contoh: Sketsa latar belakang awal dan kuesioner"
                value={projWeekly}
                onChange={e => setProjWeekly(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

          </div>

          {/* Subtasks array generator */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Breakdown Milestones (Sub-task awal)</label>
              <button
                type="button"
                onClick={addSubtaskField}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Sub-task</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {subtaskInputs.map((input, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold w-4">{index + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Nama sub-task ke-${index + 1}`}
                    value={input}
                    onChange={e => updateSubtaskField(index, e.target.value)}
                    className="flex-1 h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                  {subtaskInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubtaskField(index)}
                      className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddProject(false)}
              className="h-11 px-4 text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              Batalkan
            </button>
            <button
              id="submit-project"
              type="submit"
              className="h-11 px-6 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              Simpan Proyek Besar
            </button>
          </div>
        </form>
      )}

      {/* PROJECTS LIST CARDS */}
      <div className="space-y-4">
        {bigProjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-12 px-4 text-center">
            <span className="text-4xl text-slate-300 dark:text-slate-700 block mb-3">📂</span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Belum ada proyek besar terdaftar.</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan tombol 'Buat Proyek Besar Baru' di kanan atas untuk memulai memecah rencana studi Anda.</p>
          </div>
        ) : (
          bigProjects.map(proj => {
            const isExpanded = expandedProjectIds[proj.id];
            
            // Percentage calculators for subtasks
            const totalSubs = proj.subtasks.length;
            const completedSubs = proj.subtasks.filter(s => s.completed).length;
            const progressPct = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

            const isCompleted = proj.status === 'completed';

            return (
              <div
                key={proj.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 ${
                  isCompleted 
                    ? 'border-emerald-150 bg-emerald-50/5 dark:bg-slate-900 dark:border-emerald-950/20' 
                    : 'border-slate-100 dark:border-slate-800 shadow-xs hover:border-slate-200 dark:hover:border-slate-750'
                }`}
              >
                
                {/* Header Row Clickable to expand */}
                <div 
                  onClick={() => toggleExpand(proj.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  {/* Title Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-150 dark:border-indigo-900/30">
                        {proj.category}
                      </span>

                      {/* Manual Status Badges */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        proj.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950 dark:text-emerald-400'
                          : proj.status === 'in_progress'
                            ? 'bg-sky-100 text-sky-850 dark:bg-sky-950 dark:text-sky-400'
                            : 'bg-slate-100 text-slate-850 dark:bg-slate-800 dark:text-white'
                      }`}>
                        {proj.status === 'completed' ? '🟢 Selesai' : proj.status === 'in_progress' ? '🔵 Sedang Berjalan' : '⚪ Belum Mulai'}
                      </span>
                    </div>

                    <h3 className={`text-md font-extrabold truncate ${isCompleted ? 'text-slate-450 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                      {proj.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-450 max-w-2xl line-clamp-2">
                      {proj.description}
                    </p>
                  </div>

                  {/* Calculations and Actions Column on the right */}
                  <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end">
                    
                    {/* Progress indicators */}
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-1.5 md:justify-end">
                        <span className="text-xs text-slate-400">Milestone</span>
                        <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{completedSubs} / {totalSubs}</span>
                      </div>
                      
                      {/* mini progress bar */}
                      <div className="w-28 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">{progressPct}% Selesai</span>
                    </div>

                    {/* Deadline time tag */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-[9px] text-slate-400">Deadline</div>
                        <div className="font-bold text-slate-800 dark:text-white">{proj.deadlineDate}</div>
                      </div>
                    </div>

                    {/* Expand/Collapse icons */}
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-850 dark:hover:text-white">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>

                  </div>

                </div>

                {/*展开 sub-task expansion box */}
                {isExpanded && (
                  <div className="border-t border-slate-50 dark:border-slate-850 p-5 space-y-4 bg-slate-50/40 dark:bg-slate-950/10">
                    
                    {/* 1. Weekly targets indicator highlight */}
                    <div className="bg-linear-to-r from-indigo-50/70 to-blue-50/30 dark:from-indigo-950/20 dark:to-transparent border-l-4 border-indigo-500 p-3.5 rounded-r-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        <Target className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>SASARAN PEKANAN (WEEKLY TARGET)</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 italic">
                        "{proj.weeklyTarget}"
                      </p>
                    </div>

                    {/* 2. Subtask checkboxes lists */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <span>Milestones Checklist</span>
                      </h4>

                      {proj.subtasks.map(subItem => (
                        <div
                          key={subItem.id}
                          onClick={() => toggleSubtask(proj.id, subItem.id)}
                          className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer select-none group"
                        >
                          <button
                            id={`btn-complete-sub-${subItem.id}`}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                              subItem.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-transparent group-hover:border-indigo-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </button>
                          
                          <span className={`text-xs font-bold ${subItem.completed ? 'text-slate-400 dark:text-slate-500 line-through font-normal' : 'text-slate-800 dark:text-slate-200'}`}>
                            {subItem.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 3. Inline additions of sub-tasks and operational modifiers */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                      
                      {/* Inline text input */}
                      <input
                        id={`input-inline-subtask-${proj.id}`}
                        type="text"
                        placeholder="Tambahkan milestone baru..."
                        value={newSubtaskTitle[proj.id] || ''}
                        onChange={e => setNewSubtaskTitle(prev => ({ ...prev, [proj.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') addSubtaskInline(proj.id); }}
                        className="flex-1 w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />

                      {/* Submission triggers & Delete card button */}
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
                        <button
                          id={`btn-add-inline-subtask-${proj.id}`}
                          onClick={() => addSubtaskInline(proj.id)}
                          className="h-10 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-650 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Tambah Sub-task
                        </button>

                        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                        <button
                          id={`btn-delete-project-${proj.id}`}
                          onClick={() => deleteProject(proj.id, proj.title)}
                          className="h-10 px-3 border border-rose-200 text-rose-500 hover:bg-rose-50/50 rounded-xl text-xs flex items-center gap-1 font-bold"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus Proyek</span>
                        </button>
                      </div>

                    </div>

                    {/* 4. Manual overwrite of Project overall Status */}
                    <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                      <span>Ubah Status Manual:</span>
                      <button 
                        onClick={() => updateProjectStatus(proj.id, 'not_started')}
                        className={`px-2 py-1 rounded border ${proj.status === 'not_started' ? 'bg-slate-200 text-slate-800 font-bold border-slate-350' : 'bg-transparent border-slate-150'}`}
                      >
                        Not Started
                      </button>
                      <button 
                        onClick={() => updateProjectStatus(proj.id, 'in_progress')}
                        className={`px-2 py-1 rounded border ${proj.status === 'in_progress' ? 'bg-sky-100 text-sky-800 font-bold border-sky-200' : 'bg-transparent border-slate-150'}`}
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => updateProjectStatus(proj.id, 'completed')}
                        className={`px-2 py-1 rounded border ${proj.status === 'completed' ? 'bg-emerald-100 text-emerald-800 font-bold border-emerald-200' : 'bg-transparent border-slate-150'}`}
                      >
                        Completed
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
