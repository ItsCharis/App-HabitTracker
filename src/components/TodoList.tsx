/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Filter, 
  AlertTriangle,
  Folder,
  Tag,
  Save,
  X,
  XCircle,
  TrendingDown
} from 'lucide-react';
import { TodoTask, UserStats } from '../types';

interface TodoListProps {
  stats: UserStats;
  todoTasks: TodoTask[];
  setTodoTasks: React.Dispatch<React.SetStateAction<TodoTask[]>>;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

export default function TodoList({
  stats,
  todoTasks,
  setTodoTasks,
  setStats
}: TodoListProps) {
  // Local UI controller
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Filter Controllers
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [priorityFilter, setPriorityFilter] = useState<string>('semua');

  // Input States - Add Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskCategory, setTaskCategory] = useState('Kuliah');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  // Input States - Edit Form
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editCategory, setEditCategory] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // Helper arrays
  const categoriesList = Array.from(new Set(todoTasks.map(t => t.category)));

  // Add Task Handler
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const finalCategory = taskCategory === 'Lainnya' && customCategoryInput.trim() 
      ? customCategoryInput.trim() 
      : taskCategory;

    const newTask: TodoTask = {
      id: 't_' + Date.now(),
      title: taskTitle.trim(),
      priority: taskPriority,
      category: finalCategory,
      completed: false,
      deadlineTime: taskDeadline || undefined
    };

    setTodoTasks(prev => [...prev, newTask]);
    setTaskTitle('');
    setTaskDeadline('');
    setCustomCategoryInput('');
    setShowAddTask(false);
  };

  // Toggle Completion (and Dynamically Allocate/Deduct Gamified XP Points)
  const toggleTaskCompletion = (id: string) => {
    setTodoTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        
        // Calculate points delta based on priority
        let pointsDelta = 0;
        if (task.priority === 'high') pointsDelta = 10;
        else if (task.priority === 'medium') pointsDelta = 5;
        else pointsDelta = 2;

        setStats(statsPrev => {
          const modPoints = nextCompleted ? pointsDelta : -pointsDelta;
          const finalPoints = Math.max(0, statsPrev.totalPoints + modPoints);
          const newLevel = Math.floor(finalPoints / 200) + 1;
          return {
            ...statsPrev,
            totalPoints: finalPoints,
            level: newLevel
          };
        });

        return {
          ...task,
          completed: nextCompleted
        };
      }
      return task;
    }));
  };

  // Start Edit Mode Handler
  const startEdit = (task: TodoTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDeadline(task.deadlineTime || '');
  };

  // Save Edit Handler
  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;

    setTodoTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          title: editTitle.trim(),
          priority: editPriority,
          category: editCategory,
          deadlineTime: editDeadline || undefined
        };
      }
      return t;
    }));

    setEditingTaskId(null);
  };

  // Cancel Edit Handler
  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  // Delete Handler
  const deleteTask = (id: string, title: string) => {
    if (confirm(`Hapus tugas '${title}' dari daftar?`)) {
      setTodoTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // Filter operations
  const filteredTasks = todoTasks.filter(task => {
    const matchCategory = categoryFilter === 'semua' || task.category === categoryFilter;
    const matchPriority = priorityFilter === 'semua' || task.priority === priorityFilter;
    return matchCategory && matchPriority;
  });

  return (
    <div className="space-y-6" id="todo-tasks-section">
      
      {/* Title & Add Toggler Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-500" />
            <span>To-Do List Harian (Tugas Kecil)</span>
          </h2>
          <p className="text-xs text-slate-400">Kelola rincian tugas kuliah, pengurus organisasi, dan kebutuhan pribadimu.</p>
        </div>
        
        <button
          id="btn-add-todo"
          onClick={() => setShowAddTask(!showAddTask)}
          className="w-full sm:w-auto h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* FILTER CONSOLES */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-4 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-bold shrink-0">
          <Filter className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Saring Daftar:</span>
        </div>

        {/* Category Filters Select */}
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-extrabold tracking-wider shrink-0">Kategori</span>
          <select
            id="filter-category"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-9 px-2 text-xs border border-slate-200 dark:border-slate-850 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500 outline-hidden flex-1 cursor-pointer transition-colors"
          >
            <option value="semua">Semua Kategori</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Priority Filters Select */}
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-extrabold tracking-wider shrink-0">Prioritas</span>
          <select
            id="filter-priority"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="h-9 px-2 text-xs border border-slate-200 dark:border-slate-850 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500 outline-hidden flex-1 cursor-pointer transition-colors"
          >
            <option value="semua">Semua Prioritas</option>
            <option value="high">🔴 Tinggi (High)</option>
            <option value="medium">🟡 Sedang (Medium)</option>
            <option value="low">🔵 Rendah (Low)</option>
          </select>
        </div>
      </div>

      {/* FORM: Add Task Drawer */}
      {showAddTask && (
        <form onSubmit={handleAddTask} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-990 dark:text-white uppercase tracking-wider">Tambah Tugas Kuliah/Pribadi Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-slate-500 font-semibold">Judul Deskripsi Agenda</label>
              <input
                id="input-todo-title"
                type="text"
                required
                placeholder="Contoh: Mengunggah berkas rancangan UML kuliah PSI"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Prioritas Kepentingan</label>
              <select
                id="select-todo-priority"
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as any)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="high">🔴 Tinggi (High) - +10 XP</option>
                <option value="medium">🟡 Sedang (Medium) - +5 XP</option>
                <option value="low">🔵 Rendah (Low) - +2 XP</option>
              </select>
            </div>

            {/* Deadline Time */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Tenggat Jam (Opsional)</label>
              <input
                id="input-todo-deadline"
                type="time"
                value={taskDeadline}
                onChange={e => setTaskDeadline(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {/* Category Selectors */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Grup Kategori</label>
              <select
                id="select-todo-category"
                value={taskCategory}
                onChange={e => setTaskCategory(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="Kuliah">Kuliah / Studi</option>
                <option value="Organisasi">Organisasi Kampus</option>
                <option value="Pribadi">Urusan Pribadi</option>
                <option value="Lainnya">Kategori Lain...</option>
              </select>
            </div>

            {/* Custom Category Input if selected 'Lainnya' */}
            {taskCategory === 'Lainnya' && (
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs text-slate-500 font-semibold">Tulis Nama Kategori Baru</label>
                <input
                  id="input-todo-custom-category"
                  type="text"
                  placeholder="Masukkan kategori custom (misal: Skripsi, KP, Kos)"
                  value={customCategoryInput}
                  onChange={e => setCustomCategoryInput(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            )}

          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
              className="h-11 px-4 text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              Batalkan
            </button>
            <button
              id="submit-todo"
              type="submit"
              className="h-11 px-6 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              Simpan Tugas
            </button>
          </div>
        </form>
      )}

      {/* CORE TO-DO TASKS WRAPPER */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-12 px-4 text-center">
            <span className="text-4xl text-slate-300 dark:text-slate-700 block mb-3">📝</span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada daftar tugas yang terdeteksi.</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan saringan yang berbeda atau tambahkan tugas harian baru.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isEditing = editingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  task.completed 
                    ? 'border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/5 dark:bg-emerald-950/5' 
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-750 shadow-xs'
                }`}
              >
                
                {/* Checkbox and Text column wrapper */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  
                  {/* Big Touchpoint Checkbox Button */}
                  <button
                    id={`btn-complete-todo-${task.id}`}
                    disabled={isEditing}
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-200 ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 cursor-pointer'
                        : isEditing 
                          ? 'bg-slate-100 border-slate-250 text-slate-300 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-transparent hover:border-indigo-400 cursor-pointer'
                    }`}
                  >
                    <Check className="w-5 h-5 stroke-[3px]" />
                  </button>

                  {/* Text content or Editing form inside */}
                  {isEditing ? (
                    <div className="flex-1 space-y-3 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-850">
                      <input
                        id={`edit-title-${task.id}`}
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold">Kategori</label>
                          <input
                            id={`edit-category-${task.id}`}
                            type="text"
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs rounded-lg px-2 py-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold">Prioritas</label>
                          <select
                            id={`edit-priority-${task.id}`}
                            value={editPriority}
                            onChange={e => setEditPriority(e.target.value as any)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs rounded-lg px-2 py-1"
                          >
                            <option value="high">🔴 Tinggi (High)</option>
                            <option value="medium">🟡 Sedang (Medium)</option>
                            <option value="low">🔵 Rendah (Low)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-bold">Tenggat</label>
                          <input
                            id={`edit-deadline-${task.id}`}
                            type="time"
                            value={editDeadline}
                            onChange={e => setEditDeadline(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs rounded-lg px-2 py-1"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1.5">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-[10px] font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          id={`btn-save-edit-${task.id}`}
                          onClick={() => saveEdit(task.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Task Title */}
                      <p className={`text-sm font-bold truncate ${
                        task.completed 
                          ? 'text-slate-400 dark:text-slate-500 line-through' 
                          : 'text-slate-850 dark:text-slate-100'
                      }`}>
                        {task.title}
                      </p>

                      {/* Attribute Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Priority tag */}
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          task.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/10'
                            : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/10'
                              : 'bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/10'
                        }`}>
                          <span>{task.priority === 'high' ? '🔴 Tinggi' : task.priority === 'medium' ? '🟡 Sedang' : '🔵 Rendah'}</span>
                        </span>

                        {/* Category tag */}
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800">
                          <Folder className="w-3 h-3 text-slate-400" />
                          <span>{task.category}</span>
                        </span>

                        {/* Deadline time tag */}
                        {task.deadlineTime && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-950 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>Tenggat: {task.deadlineTime}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Operations column panel */}
                {!isEditing && (
                  <div className="flex items-center justify-end gap-1 shrink-0 self-end md:self-auto">
                    {/* Edit pen */}
                    <button
                      onClick={() => startEdit(task)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Ubah Tugas"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    {/* Delete trash */}
                    <button
                      id={`btn-delete-todo-${task.id}`}
                      onClick={() => deleteTask(task.id, task.title)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
