/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sparkles, Clock, CheckSquare, Square, RefreshCw, Info, HelpCircle, AlertCircle
} from "lucide-react";
import { Subject, Task, SemesterItem } from "../types";
import { generateSmartLocalSchedule } from "../utils/localPlanner";

interface PlannerTabProps {
  subjects: Subject[];
  semesters: SemesterItem[];
  tasks: Task[];
  availableHours: number;
  focusPreference: 'morning' | 'afternoon' | 'night';
  onSetAvailableHours: (hours: number) => void;
  onSetFocusPreference: (pref: 'morning' | 'afternoon' | 'night') => void;
  onSetTasks: (tasks: Task[]) => void;
  onToggleTask: (taskId: string) => void;
  onAddCustomTask: (text: string, subjectId?: string, type?: string) => void;
}

export const PlannerTab: React.FC<PlannerTabProps> = ({
  subjects,
  semesters,
  tasks,
  availableHours,
  focusPreference,
  onSetAvailableHours,
  onSetFocusPreference,
  onSetTasks,
  onToggleTask,
  onAddCustomTask,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [customText, setCustomText] = React.useState("");
  const [customSubjectId, setCustomSubjectId] = React.useState("");
  const [adviceText, setAdviceText] = React.useState(
    "Recalculate your targets whenever assignments or exam dates shift."
  );

  // Calls server-side Gemini planning endpoint or falls back locally
  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects,
          availableHours,
          preferences: { focusPreference },
        }),
      });

      if (!response.ok) throw new Error("API Offline or server error");
      const data = await response.json();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        // Hydrate IDs and resolve correct subject entities cleanly
        const remapped: Task[] = data.tasks.map((t: any, idx: number) => ({
          id: `task-gemini-${idx}-${Date.now()}`,
          subjectId: t.subjectId || subjects[idx % subjects.length]?.id || undefined,
          subjectName: t.subjectName || (t.subjectId ? subjects.find(s => s.id === t.subjectId)?.name : null) || "General",
          text: t.text || t.name || "",
          completed: false,
          type: t.type || "Active Practice",
          badge: t.badge || "Core",
        }));
        onSetTasks(remapped);
        if (data.advice) setAdviceText(data.advice);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.warn("AI Planner falling back to direct local algorithms:", err);
      // Client-side priority-ranking calculation
      const fallbackTasks = generateSmartLocalSchedule(
        subjects,
        semesters,
        availableHours,
        focusPreference
      );
      onSetTasks(fallbackTasks);
      setAdviceText("Local fallback active. Adjust plans to focus on subjects with nearing deadlines.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onAddCustomTask(customText, customSubjectId || undefined, "Manual Task");
    setCustomText("");
    setCustomSubjectId("");
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Header Card */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Smart Study Planner</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mb-6">
          Specify your metrics below. Study Ally computes and distributes review checkpoints to automatically prevent cram sessions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Study available times input setter */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Available Hours Today
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="12"
                value={availableHours}
                onChange={(e) => onSetAvailableHours(parseInt(e.target.value) || 3)}
                className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-100 dark:bg-slate-800 rounded-full"
              />
              <span className="text-sm font-extrabold text-slate-800 dark:text-white min-w-[50px] text-right">
                {availableHours} hrs
              </span>
            </div>
          </div>

          {/* Productivity Time Bias */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Focus Time Balance
            </label>
            <div className="flex gap-2">
              {(["morning", "afternoon", "night"] as const).map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => onSetFocusPreference(pref)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border text-center capitalize transition duration-150 ${
                    focusPreference === pref
                      ? "bg-violet-600 text-white border-transparent shadow-sm"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* Regenerate Action Trigger */}
          <div className="flex items-end">
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Calculating Models..." : "Generate Study Agenda"}</span>
            </button>
          </div>

        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-100/50 dark:border-violet-950/30">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-medium">
            <b className="font-extrabold text-violet-900 dark:text-violet-300">Pace Advice:</b> {adviceText}
          </p>
        </div>
      </section>

      {/* Structured Planned Agenda List */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Task Agenda Checklist */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1">Today's Study Agenda</h3>
          <p className="text-xs text-slate-400 mb-4 font-semibold">Tick off targets cleanly as you study to record unit log checkpoints.</p>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <CheckSquare className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 max-w-xs font-medium">
                  Agenda empty. Click "Generate Study Agenda" to calculate the optimal breakdown.
                </p>
              </div>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onToggleTask(t.id)}
                  className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer hover:border-violet-500 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition duration-150 select-none ${
                    t.completed 
                      ? "border-slate-100 bg-slate-50/70 dark:bg-slate-900 dark:border-slate-800 opacity-60" 
                      : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start gap-3.5 pr-2">
                    <button
                      type="button"
                      className="mt-0.5 flex-shrink-0 text-violet-600 focus:outline-none"
                    >
                      {t.completed ? (
                        <CheckSquare className="w-5 h-5 fill-violet-600 text-white" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                      )}
                    </button>
                    <div>
                      <span className={`text-xs font-semibold ${t.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>
                        [{t.subjectName}] {t.text}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                        {t.type}
                      </p>
                    </div>
                  </div>

                  {/* Task context pill badge */}
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-black ${
                    t.badge === "Urgent" || t.badge === "Exam" || t.badge === "Weak"
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                      : t.badge === "Due"
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                      : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400"
                  }`}>
                    {t.badge}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manual Extra Study Planner Task insertion */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">Add Specific Review</h3>
          <p className="text-xs text-slate-400 mb-4 font-semibold">Append custom tasks to today's study timeline manually.</p>

          <form onSubmit={handleAddCustom} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">TASK DESCRIPTOR</label>
              <input
                type="text"
                placeholder="e.g., Revise Graph proofs"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">LINK TO COURSE (OPTIONAL)</label>
              <select
                value={customSubjectId}
                onChange={(e) => setCustomSubjectId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500"
              >
                <option value="">-- No Link (General Target) --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-400 hover:bg-violet-100 transition"
            >
              Insert Custom Task
            </button>
          </form>

          {/* Interactive Advice block */}
          <div className="mt-6 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Pacing Recommendation</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Aim for 45 minutes of hyper-focused study, followed immediately by 5 minutes of self-check recall, to maximize permanent cognitive retention.
              </p>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
