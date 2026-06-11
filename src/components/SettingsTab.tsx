/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Trophy, Award, Download, Upload, Trash2, ArrowRightCircle, Sparkles, 
  HelpCircle, Info, RefreshCw, Database, ShieldCheck
} from "lucide-react";
import { Subject, SemesterItem, StudyNote, Flashcard, JournalEntry, StudySessionLog } from "../types";

interface SettingsTabProps {
  subjects: Subject[];
  semesters: SemesterItem[];
  notes: StudyNote[];
  flashcards: Flashcard[];
  journals: JournalEntry[];
  logs: StudySessionLog[];
  streak: number;
  onImportData: (payload: string) => void;
  onClearAllData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  subjects,
  semesters,
  notes,
  flashcards,
  journals,
  logs,
  streak,
  onImportData,
  onClearAllData,
}) => {
  const [jsonInput, setJsonInput] = React.useState("");

  // Define achievements checklist
  const milestones = [
    {
      id: "m1",
      title: "Master Scholar",
      desc: "Configure 4 or more subjects inside the course checkpoint registry.",
      icon: Trophy,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
      unlocked: subjects.length >= 4
    },
    {
      id: "m2",
      title: "Study Habit Starter",
      desc: "Maintain an active study habit streak of 3 or more days.",
      icon: Award,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30",
      unlocked: streak >= 3
    },
    {
      id: "m3",
      title: "Knowledge Architect",
      desc: "Synthesize 3 or more detailed explanation study notes.",
      icon: Database,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30",
      unlocked: notes.length >= 3
    },
    {
      id: "m4",
      title: "Reflectionist",
      desc: "Complete 2 or more reflection journal records.",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
      unlocked: journals.length >= 2
    }
  ];

  const handleExport = () => {
    const data = {
      subjects,
      semesters,
      notes,
      flashcards,
      journals,
      logs,
      streak,
      version: "2.5"
    };
    const jsonStr = JSON.stringify(data, null, 2);
    setJsonInput(jsonStr);

    // Dynamic browser file download
    try {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `study_ally_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("JSON generated successfully in text block below. Copy and save manually.");
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;
    if (confirm("Importing JSON payload overrides active subjects and tasks completely. Continue?")) {
      onImportData(jsonInput);
      setJsonInput("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* Visual Achievements & Milestones List */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
            <span>Academic Milestones</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-semibold">Unlocked milestones signify cognitive habit consistency.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {milestones.map((m) => {
            const Icon = m.icon;
            return (
              <div 
                key={m.id}
                className={`p-4 rounded-xl border flex gap-4 transition duration-150 relative overflow-hidden select-none ${
                  m.unlocked 
                    ? "border-amber-100 bg-amber-50/10 dark:border-amber-950/20" 
                    : "border-slate-100 bg-slate-50/10 opacity-50"
                }`}
              >
                <div className={`p-3 rounded-lg flex-shrink-0 self-center ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>{m.title}</span>
                    {m.unlocked && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 rounded-full uppercase leading-none">
                        Unlocked
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON Backup import mechanisms */}
      <div className="space-y-6">
        
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5 flex items-center gap-1">
            <Database className="w-4.5 h-4.5 text-violet-500" />
            <span>Data Management</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-semibold">Export JSON checkpoints to keep secure offline copies of study records.</p>

          <form onSubmit={handleImport} className="space-y-4 select-text">
            
            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 rounded-xl text-xs font-extrabold text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/20 dark:text-violet-400 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download study records JSON</span>
            </button>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">REPLICATE CHECKPOINT JSON</label>
              <textarea
                placeholder="Paste backup JSON payload string here to rehydrate checklist states..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={3}
                className="w-full text-[10px] font-mono leading-relaxed p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500 resize-none font-semibold"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!jsonInput.trim()}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:opacity-40 transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset current studies sandbox? This removes all milestones and tasks permanently.")) {
                    onClearAllData();
                    alert("Sandbox resets completed.");
                  }
                }}
                className="p-1 px-3 border border-rose-200 hover:border-transparent hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition flex items-center gap-1.5"
                title="Wipe sandbox"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Wipe</span>
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};
