/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  History, Calendar, CheckSquare, BrainCircuit, ShieldCheck, 
  HelpCircle, Sparkles, TrendingUp, RefreshCw, Star 
} from "lucide-react";
import { Subject } from "../types";
import { getForgettingCurveStats } from "../utils/localPlanner";

interface RevisionTabProps {
  subjects: Subject[];
  onLogRevisionFeedback: (subjectId: string, difficulty: 'E' | 'M' | 'H') => void;
  onRefreshRevisions: () => void;
}

export const RevisionTab: React.FC<RevisionTabProps> = ({
  subjects,
  onLogRevisionFeedback,
  onRefreshRevisions,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  // Filters subjects due the current day or overdue
  const dueRevisionSubjects = subjects.filter(s => {
    if (!s.nextRevisionDate) return false;
    return s.nextRevisionDate <= todayStr && s.completedUnits < s.totalUnits;
  });

  // Filters subjects that have revision intervals configured, but aren't due right today
  const upcomingRevisionSubjects = subjects.filter(s => {
    if (!s.nextRevisionDate) return false;
    return s.nextRevisionDate > todayStr && s.completedUnits < s.totalUnits;
  });

  return (
    <div className="space-y-6">
      
      {/* Informative Spaced Repitition Hero Header */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-violet-600 animate-pulse" />
              <span>Cognitive Spaced Repetition Hub</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mt-1 leading-relaxed">
              Based on cognitive psychologist Ebbinghaus's <b>Forgetting Curve</b>, reviewing material at intervals of 1, 3, and 7 days doubles your memory stability and halts decay.
            </p>
          </div>
          <button
            onClick={onRefreshRevisions}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition self-start md:self-center"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recalculate Stability</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Due Revisions Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
            <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Topics Due For Revision Today</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-semibold">Immediate memory stabilization checks recommended for these topics.</p>

            {dueRevisionSubjects.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Memory logs completely stabilized</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">No urgent revision blocks due today. Excellent pacing!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dueRevisionSubjects.map((s) => {
                  const curve = getForgettingCurveStats(s.lastStudiedDate, s.revisionStage);
                  return (
                    <div 
                      key={s.id}
                      className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{s.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                            Stage {s.revisionStage}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                          Last session: {s.lastStudiedDate || "No logs"} • Predicted Retention: {curve.retrievability}% ({curve.status})
                        </p>
                      </div>

                      {/* Log Action Triggers */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1 uppercase">PRACTICE COMPLETED?</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onLogRevisionFeedback(s.id, 'E')}
                            className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 transition"
                            title="Very confident - increases interval delay"
                          >
                            Easy
                          </button>
                          <button
                            onClick={() => onLogRevisionFeedback(s.id, 'M')}
                            className="px-2.5 py-1 text-xs font-bold rounded bg-amber-50 dark:bg-amber-950/30 text-amber-600 hover:bg-amber-100 transition"
                            title="Moderate recollection - maintains schedule"
                          >
                            Medium
                          </button>
                          <button
                            onClick={() => onLogRevisionFeedback(s.id, 'H')}
                            className="px-2.5 py-1 text-xs font-bold rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 transition"
                            title="Forgotten/Hard - resets stability stage to 0"
                          >
                            Hard
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">Spaced Revisions Calendar</h3>
            <p className="text-xs text-slate-400 mb-4 font-semibold">Projected schedule for topics undergoing stabilization.</p>

            {upcomingRevisionSubjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No future revision checkpoints calculated. Study some units to seed intervals.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingRevisionSubjects.map((s) => {
                  const curve = getForgettingCurveStats(s.lastStudiedDate, s.revisionStage);
                  return (
                    <div key={s.id} className="py-3.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{s.name}</span>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                          Stage {s.revisionStage} • Decay Stability: {curve.retrievability}% ({curve.status})
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-bold">{s.nextRevisionDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Cognitive Health Intelligence Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Memory Quality Indexes</h3>

            <div className="space-y-4">
              {subjects.map((s) => {
                const curve = getForgettingCurveStats(s.lastStudiedDate, s.revisionStage);
                let textStyle = "text-emerald-500";
                if (curve.retrievability < 50) textStyle = "text-rose-500";
                else if (curve.retrievability < 80) textStyle = "text-amber-500";

                return (
                  <div key={s.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{s.name}</span>
                      <span className={`${textStyle} font-black`}>{curve.retrievability}% retrievable</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          curve.retrievability >= 80 ? "bg-emerald-400" : curve.retrievability >= 50 ? "bg-amber-400" : "bg-rose-400"
                        }`}
                        style={{ width: `${curve.retrievability}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Spaced Repetion Tips */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-slate-850 dark:to-slate-900 border border-violet-100 dark:border-slate-800/80">
            <h4 className="text-xs font-extrabold text-violet-900 dark:text-violet-300 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-violet-400 text-violet-500 animate-pulse" />
              <span>Interval Best Practices</span>
            </h4>
            <ul className="mt-3 space-y-2 text-[11px] text-violet-800 dark:text-slate-300 list-disc list-inside leading-relaxed">
              <li>Commit 10 minutes to review on Day 1.</li>
              <li>Always perform recall sheets without checking textbooks.</li>
              <li>If you struggle, click <b>Hard</b> immediately to restart intervals.</li>
            </ul>
          </div>
        </div>

      </section>

    </div>
  );
};
