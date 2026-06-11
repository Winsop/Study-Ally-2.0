/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  History, Calendar, Flame, Trophy, Award, TrendingUp, Info, Clock, 
  BookOpen, ChevronRight, BarChart3, Star
} from "lucide-react";
import { Subject, StudySessionLog, JournalEntry } from "../types";

interface AnalyticsTabProps {
  subjects: Subject[];
  logs: StudySessionLog[];
  journals: JournalEntry[];
  streak: number;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  subjects,
  logs,
  journals,
  streak,
}) => {
  // Compute basic stats
  const totalMinutes = logs.reduce((sum, l) => sum + l.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Generate date list for the last 12 weeks (84 days) for our Study Heatmap
  const daysToShow = 84;
  const today = new Date();
  
  const heatmapDates: string[] = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    heatmapDates.push(d.toISOString().split("T")[0]);
  }

  // Create mapping of date -> study minutes
  const logMap: Record<string, number> = {};
  logs.forEach(l => {
    logMap[l.date] = (logMap[l.date] || 0) + l.minutes;
  });

  // Calculate maximum session minutes for scaling heatmap colors
  const maxSessionMinutes = Math.max(...Object.values(logMap), 45);

  // Group heatmapDates into 12 columns of 7 days (weeks starting Sunday-Saturday or relative)
  const columns: string[][] = [];
  let currentColumn: string[] = [];
  
  heatmapDates.forEach((dateStr) => {
    currentColumn.push(dateStr);
    if (currentColumn.length === 7) {
      columns.push(currentColumn);
      currentColumn = [];
    }
  });
  if (currentColumn.length > 0) {
    columns.push(currentColumn);
  }

  // Calculate difficulty ratios
  const diffCounts = { E: 0, M: 0, H: 0 };
  logs.forEach(l => {
    if (diffCounts[l.difficultyRating] !== undefined) {
      diffCounts[l.difficultyRating]++;
    }
  });
  const totalRatings = logs.length || 1;
  const easyPct = Math.round((diffCounts.E / totalRatings) * 100);
  const mediumPct = Math.round((diffCounts.M / totalRatings) * 100);
  const hardPct = Math.round((diffCounts.H / totalRatings) * 100);

  // Focus times
  const totalNotesCount = journals.length;

  return (
    <div className="space-y-6">
      
      {/* 1. Dynamic Streak & Core Analytics Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-indigo-500 text-white shadow-sm shadow-indigo-500/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Total Studying Clocked</p>
              <h3 className="text-2xl font-black mt-2">{totalHours} Hours</h3>
            </div>
            <Clock className="w-5 h-5 text-indigo-200" />
          </div>
          <p className="text-[10px] text-indigo-150 mt-3 font-medium">Logged across {logs.length} sessions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Streak</p>
              <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>{streak} Days</span>
              </h3>
            </div>
            <Award className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-semibold">Keep studying daily to expand milestones</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Journals</p>
              <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white">
                {totalNotesCount} Entries
              </h3>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-semibold">Daily reflections maintain accountability</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Retention Day</p>
              <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white">
                {easyPct >= 50 ? "Solid" : easyPct + mediumPct >= 50 ? "Healthy" : "Weakening"}
              </h3>
            </div>
            <Trophy className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-semibold">Easy reviews: {easyPct}% of tasks</p>
        </div>

      </section>

      {/* 2. Premium GitHub-Style Study Heatmap Grid */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1">Study Heatmap log</h3>
        <p className="text-xs text-slate-400 mb-6 font-semibold">Visual tracking of daily study hours for the last 12 weeks. Darker green blocks represent higher focuses.</p>

        {/* Heatmap Grid Wrapper container */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[650px] flex items-start gap-4">
            
            {/* Days label sidebar */}
            <div className="grid grid-rows-7 h-[112px] text-[10px] font-bold text-slate-400 dark:text-slate-500 pr-1.5 pt-0.5 select-none text-right">
              <span>Sun</span>
              <span className="opacity-0">Mon</span>
              <span>Tue</span>
              <span className="opacity-0">Wed</span>
              <span>Thu</span>
              <span className="opacity-0">Fri</span>
              <span>Sat</span>
            </div>

            {/* Heatmap Columns Grid */}
            <div className="flex gap-1.5">
              {columns.map((columnDates, colIdx) => (
                <div key={colIdx} className="grid grid-rows-7 gap-1.5">
                  {columnDates.map((dateStr) => {
                    const minutes = logMap[dateStr] || 0;
                    
                    // Assign colour thresholds similar to GitHub contributions
                    let colorClass = "bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700";
                    if (minutes > 0) {
                      const ratio = minutes / maxSessionMinutes;
                      if (ratio <= 0.25) colorClass = "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800";
                      else if (ratio <= 0.5) colorClass = "bg-emerald-300 dark:bg-emerald-900/60 text-emerald-900";
                      else if (ratio <= 0.75) colorClass = "bg-emerald-500 dark:bg-emerald-700 text-white";
                      else colorClass = "bg-emerald-700 dark:bg-emerald-500 text-white";
                    }

                    return (
                      <div
                        key={dateStr}
                        className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-pointer ${colorClass}`}
                        title={`${dateStr}: ${minutes} min studied`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Legend descriptor */}
        <div className="mt-4 flex justify-between sm:items-center flex-col sm:flex-row gap-3 text-[10px] text-slate-400 select-none">
          <p className="font-semibold">Grid displays last 84 days (including study times tracked via finished planner checkmarks).</p>
          <div className="flex items-center gap-1.5 self-start sm:self-auto font-bold">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-slate-50 dark:bg-slate-800 border" />
            <span className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-950/40" />
            <span className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-900/60" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-700" />
            <span className="w-3 h-3 rounded-sm bg-emerald-700 dark:bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

      </section>

      {/* 3. Detailed Subject Efficiency Diagnostics */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course Completion breakdown cards */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">Subject Review Breakdown</h3>
          <p className="text-xs text-slate-400 mb-5 font-semibold">Finished modules comparison across your configured courses.</p>

          <div className="space-y-4">
            {subjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No subject data mapped. Add subjects to see performance comparisons.</p>
            ) : (
              subjects.map(s => {
                const pct = s.totalUnits > 0 ? Math.round((s.completedUnits / s.totalUnits) * 100) : 0;
                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{s.name}</span>
                      <span className="font-extrabold text-slate-500 dark:text-slate-400">{s.completedUnits} / {s.totalUnits} units ({pct}%)</span>
                    </div>

                    <div className="h-2.5 w-full bg-slate-50 dark:bg-slate-800/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-violet-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Task Difficulty Metrics breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">Study Task Difficulty Mix</h3>
          <p className="text-xs text-slate-400 mb-6 font-semibold">Self-reported task feedback distributions from study checks.</p>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-300 font-medium">
              No difficulty reviews logged yet. Completed planner tasks prompt feedback loops automatically.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Proportional bars for Easy, Medium, Hard feedback */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Easy Checkpoints</span>
                    <span className="text-emerald-500 font-extrabold">{easyPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${easyPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Medium Checkpoints</span>
                    <span className="text-amber-500 font-extrabold">{mediumPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${mediumPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Hard Checkpoints</span>
                    <span className="text-rose-500 font-extrabold">{hardPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: `${hardPct}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex gap-2.5">
                <Info className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Cognitive science advises focusing on topics where your feedback rate is "Hard" with short 20-minute daily review targets to flatten the retention offset decay.
                </p>
              </div>

            </div>
          )}
        </div>

      </section>

    </div>
  );
};
