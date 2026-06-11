/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sparkles, Send, Brain, RotateCcw, MessageSquare, AlertCircle, 
  HelpCircle, ShieldAlert, HeartHandshake, User, RefreshCw
} from "lucide-react";
import { Subject, SemesterItem } from "../types";

interface Message {
  sender: "user" | "coach";
  text: string;
  note?: string;
}

interface CoachTabProps {
  subjects: Subject[];
  semesters: SemesterItem[];
  streak: number;
}

export const CoachTab: React.FC<CoachTabProps> = ({
  subjects,
  semesters,
  streak,
}) => {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      sender: "coach",
      text: "Hello! I am Study Ally's educational coach. Need explanations for a difficult subject, a recovery plan for missed study blocks, or tactical advice to optimize retention?",
    }
  ]);
  const [inputText, setInputText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Suggested quick prompts cards
  const suggestedPrompts = [
    {
      title: "Recovery Plan 🗓",
      prompt: "I missed my study sessions this week. Draft a tactical 4-day recovery plan."
    },
    {
      title: "Consolidation Help 🧠",
      prompt: "Explain how memory consolidation works and rewrite a sample spaced interval study timetable."
    },
    {
      title: "Explaining Concepts 🔍",
      prompt: "I am struggling with complex textbook chapters. Summarize 3 core steps of Feynman's technique."
    },
    {
      title: "Preventing Burnout ⚡",
      prompt: "I have multiple exams nearing. Give me 3 tips to balance anxiety and maintain maximum intensity."
    }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Gather context to help LLM personalize response automatically
      const context = {
        streak,
        activeSubjectsCount: subjects.length,
        subjectsStatus: subjects.map(s => ({
          name: s.name,
          progress: `${s.completedUnits}/${s.totalUnits} chapters`,
          examDate: s.examDate || "No date",
          weak: s.weak
        })),
        incompleteSemesters: semesters
          .filter(sem => !sem.completed)
          .map(sem => ({ title: sem.title, dLine: sem.deadline, priority: sem.priority }))
      };

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          context,
        }),
      });

      if (!response.ok) throw new Error("API Offline");
      const data = await response.json();
      
      const coachMsg: Message = { 
        sender: "coach", 
        text: data.text || "I was unable to assemble advice right now. Let's try restructuring our prompt.",
        note: data.note
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.warn("AI Chat fell back to automated advisory assistance:", err);
      // Helpful automated fallback responses depending on query matches
      const lower = textToSend.toLowerCase();
      let fallbackText = "I encountered a sync boundary. Here is Study Ally's local coach recommendation:\n\n";
      
      if (lower.includes("miss") || lower.includes("recover")) {
        fallbackText += "<b>Study Recovery Strategy:</b>\n1. Do NOT try to double study tomorrow. It leads to quick fatigue.\n2. Add exactly 30 minutes of targeted review to your next 4 active study blocks.\n3. Complete the most critical unit first before revising older notes.";
      } else if (lower.includes("consolid") || lower.includes("memory")) {
        fallbackText += "<b>Consolidation Optimization:</b>\n1. Review notes 10 minutes prior to heading to sleep.\n2. Revisit memory triggers 1 day, 3 days, and 7 days after the initial study session.\n3. Make flashcards with simple single-sentence answers.";
      } else if (lower.includes("anxiety") || lower.includes("burnout")) {
        fallbackText += "<b>Burnout Mitigation:</b>\n1. Divide days into 25-minute Pomodoro sprints.\n2. Do zero study work during breaks. Step away from study screens completely.\n3. Track clear completed checkboxes to maintain positive visual reinforcement.";
      } else {
        fallbackText += "Consistency is academic key. Spread out your core modules, rating tough topics as 'Hard' in your spaced repetition dashboard, to auto-prioritize review checklists.";
      }

      setMessages((prev) => [...prev, { sender: "coach", text: fallbackText }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "coach",
        text: "Dialogue restarted freshly. How can I help you strategize your targets today?",
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Dialogue Stream Container */}
      <div className="lg:col-span-2 flex flex-col h-[520px] rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        
        {/* Chat Ribbon Line */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-violet-600 animate-pulse" />
            <span className="text-xs font-black text-slate-800 dark:text-white">AI Study Coach Office</span>
          </div>
          <button
            onClick={clearChat}
            className="p-1 px-2.5 text-[10px] font-bold text-slate-500 rounded bg-white dark:bg-slate-800 hover:text-rose-500 dark:hover:bg-slate-700/65 border transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restart dialogue</span>
          </button>
        </div>

        {/* Message Bubble Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${
                m.sender === "user" 
                  ? "bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300" 
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}>
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              </div>

              <div className="space-y-1 max-w-[80%]">
                <div 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-violet-600 text-white font-semibold"
                      : "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300"
                  }`}
                  dangerouslySetInnerHTML={{ __html: m.text }}
                />
                
                {/* Note badges on missing API keys */}
                {m.note && (
                  <p className="text-[9px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wide flex items-center gap-1 pl-1">
                    <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                    <span>{m.note}</span>
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-xs font-semibold pl-2 py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-500" />
              <span>Analyzing cognitive load context...</span>
            </div>
          )}
        </div>

        {/* User Input Ribbon */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex gap-2.5"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a query (e.g. 'feynman technique', 'missed sessions plan')..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white outline-none focus:border-violet-500 font-semibold"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Suggested Coach Assistant Queries Sidebar */}
      <div className="space-y-6">
        
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5 flex items-center gap-1">
            <HeartHandshake className="w-4.5 h-4.5 text-violet-500" />
            <span>Suggested Coach Prompts</span>
          </h3>
          <p className="text-xs text-slate-400 mb-5 font-semibold">Click any card below to launch immediate advice scenarios.</p>

          <div className="space-y-3">
            {suggestedPrompts.map((sp, idx) => (
              <div
                key={idx}
                onClick={() => handleSendMessage(sp.prompt)}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-600 cursor-pointer text-left bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850/60 transition"
              >
                <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1">
                  {sp.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2">
                  {sp.prompt}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
