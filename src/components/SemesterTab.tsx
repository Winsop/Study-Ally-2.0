/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sparkles, Calendar, Plus, Trash2, CheckSquare, Square, 
  AlertTriangle, CheckCircle2, Info, GraduationCap 
} from "lucide-react";
import { Subject, SemesterItem } from "../types";
import { getDaysRemaining } from "../utils/localPlanner";

interface SemesterTabProps {
  subjects: Subject[];
  semesters: SemesterItem[];
  onAddSemesterItem: (
    title: string,
    subjectId: string,
    type: SemesterItem['type'],
    deadline: string,
    priority: SemesterItem['priority']
  ) => void;
  onToggleSemesterCompleted: (id: string) => void;
  onDeleteSemesterItem: (id: string) => void;
}

export const SemesterTab: React.FC<SemesterTabProps> = ({
  subjects,
  semesters,
  onAddSemesterItem,
  onToggleSemesterCompleted,
  onDeleteSemesterItem,
}) => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [type, setType] = React.useState<SemesterItem['type']>("Assignment");
  const [deadline, setDeadline] = React.useState("");
  const [priority, setPriority] = React.useState<SemesterItem['priority']>("Medium");

  const activeDeliverables = semesters.filter(s => !s.completed);
  const completedDeliverables = semesters.filter(s => s.completed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) {
      alert("Please enter a title and select a course subject!");
      return;
    }
    onAddSemesterItem(title, subjectId, type, deadline, priority);
    setTitle("");
    setSubjectId("");
    setType("Assignment");
    setDeadline("");
    setPriority("Medium");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Statistics Cards header */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all duration-200">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Deliverables</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{semesters.length} Checklist Items</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all duration-200">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Deliverables</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{activeDeliverables.length} Remaining</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all duration-200">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Assignments</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{completedDeliverables.length} Completed</h3>
          </div>
        </div>

      </section>

      {/* 2. Main list and add trigger */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Deliverables Directory */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Active Deliverables</h3>
                <p className="text-xs text-slate-400 font-semibold">Semester-specific checklists. High priority items are auto-prioritised inside smart planners.</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-3.5 py-2 border text-xs font-bold text-violet-600 border-violet-200 dark:border-violet-700/60 dark:text-violet-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create item</span>
              </button>
            </div>

            {/* inline creation block */}
            {showAddForm && (
              <form 
                onSubmit={handleSubmit}
                className="mb-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border space-y-4 transition"
              >
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Add Semester Checkpoint</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g. Lab 4 record upload"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">LINKED COURSE</label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                      required
                    >
                      <option value="">-- Choose Subject Course --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">DELIVERABLE TYPE</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as SemesterItem['type'])}
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                    >
                      <option value="Assignment">Assignment</option>
                      <option value="Lab Record">Lab Record Book</option>
                      <option value="Internal Assessment">Internal Assessment (Tests)</option>
                      <option value="Quiz">Evaluated Class Quiz</option>
                      <option value="Mid-Sem Exam">Mid-Semester Exam Checkpoints</option>
                      <option value="End-Sem Exam">End-Semester Final Exams</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">DEADLINE DUE DATE</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">URGENCY PRIORITY</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as SemesterItem['priority'])}
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                    >
                      <option value="High">🔴 High Urgency</option>
                      <option value="Medium">🟡 Medium Urgency</option>
                      <option value="Low">🔵 Low Urgency</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-500 dark:text-slate-400 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-violet-600 hover:bg-violet-700 transition"
                  >
                    Insert Checkpoint
                  </button>
                </div>
              </form>
            )}

            {/* List layout of elements */}
            {activeDeliverables.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No active deliverables tracked. Add lab records or examinations above.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeDeliverables.map(item => {
                  const days = getDaysRemaining(item.deadline);
                  const isHigh = item.priority === 'High';
                  const isLow = item.priority === 'Low';

                  return (
                    <div key={item.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleSemesterCompleted(item.id)}
                          className="mt-0.5 text-slate-300 dark:text-slate-700 hover:text-violet-600 transition"
                        >
                          <Square className="w-4.5 h-4.5" />
                        </button>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">
                            {item.title}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                            {item.subjectName} • {item.type}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Days till deadline */}
                        <span className={`text-[11px] font-extrabold ${days !== null && days <= 3 ? "text-rose-600 font-extrabold" : "text-slate-500"}`}>
                          {days !== null ? `${days} days` : "No date"}
                        </span>

                        {/* Priority highlight pill */}
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                          isHigh 
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400" 
                            : isLow 
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" 
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                        }`}>
                          {item.priority}
                        </span>

                        <button
                          onClick={() => onDeleteSemesterItem(item.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Finished assignments history */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-2.5">Cleared Deliverables history</h3>
            {completedDeliverables.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No cleared items logged yet. Keep checklist items completed to archive.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 opacity-60">
                {completedDeliverables.map(item => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onToggleSemesterCompleted(item.id)}
                        className="text-emerald-500 animate-pulse"
                      >
                        <CheckSquare className="w-4.5 h-4.5 fill-emerald-500 text-white" />
                      </button>
                      <div>
                        <span className="font-semibold text-slate-600 line-through truncate max-w-[170px] inline-block">{item.title}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.subjectName} • {item.type}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteSemesterItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Semester Best Practices and Instructions sidebar */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 h-fit space-y-4">
          <GraduationCap className="w-8 h-8 text-indigo-500" />
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Active Milestone Tracking</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            By sorting internals, lab books, and mid-semester checklists onto active calendars, Study Ally maps high-priority milestones to Today's Study Plan automatically.
          </p>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border text-[11px] text-slate-400 hover:border-violet-400 transition leading-relaxed">
            <b>Pacing Tip:</b> Complete Lab report drafts 48 hours prior to final reviews to reserve focus time for practice mock tests.
          </div>
        </div>

      </section>

    </div>
  );
};
