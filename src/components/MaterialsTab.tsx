/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sparkles, FileText, CheckCircle2, ChevronLeft, ChevronRight, FlipHorizontal, 
  HelpCircle, Trash2, Plus, Info, UploadCloud, FileSpreadsheet, PlayCircle 
} from "lucide-react";
import { Subject, Flashcard, StudyNote } from "../types";

interface MaterialsTabProps {
  subjects: Subject[];
  flashcards: Flashcard[];
  notes: StudyNote[];
  onAddFlashcard: (subjectId: string, question: string, answer: string) => void;
  onDeleteFlashcard: (id: string) => void;
  onAddNote: (subjectId: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onEvaluateFlashcard: (subjectId: string, difficulty: 'E' | 'M' | 'H') => void;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({
  subjects,
  flashcards,
  notes,
  onAddFlashcard,
  onDeleteFlashcard,
  onAddNote,
  onDeleteNote,
  onEvaluateFlashcard,
}) => {
  // Navigation tabs of materials
  const [activeSubTab, setActiveSubTab] = React.useState<'flashcards' | 'notes' | 'quizzes' | 'pdf'>('flashcards');

  // --- Flashcard deck states ---
  const [showAddCard, setShowAddCard] = React.useState(false);
  const [cardSubjectId, setCardSubjectId] = React.useState("");
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  // --- Notes states ---
  const [showAddNote, setShowAddNote] = React.useState(false);
  const [noteSubjectId, setNoteSubjectId] = React.useState("");
  const [noteTitle, setNoteTitle] = React.useState("");
  const [noteContent, setNoteContent] = React.useState("");

  // --- Quiz Generator States ---
  const [quizSubjectId, setQuizSubjectId] = React.useState("");
  const [quizStarted, setQuizStarted] = React.useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [quizScore, setQuizScore] = React.useState(0);
  const [quizCompleted, setQuizCompleted] = React.useState(false);

  // Mock static quiz dataset for simulations
  const mockQuizQuestions = [
    {
      q: "Which active revision system focuses on the Ebbinghaus Forgetting Curve intervals?",
      options: ["A) Cramming sessions", "B) Spaced Repetition (1, 3, 7 days)", "C) Passive slide scanning", "D) Highlighter review"],
      correct: 1
    },
    {
      q: "What does an 'Urgency dot' indicating color code Red mean inside Study Ally?",
      options: ["A) Completed curriculum checkpoints", "B) Less than 4 days remaining until exam deadline", "C) General small win completed", "D) Daily available hours are empty"],
      correct: 1
    },
    {
      q: "How does rating a topic 'Hard' affect the smart scheduler?",
      options: ["A) Deletes the card from backup rosters", "B) Lowers priority score indexing", "C) Resetsstability intervals and raises daily target volume", "D) Prevents notes upload triggers"],
      correct: 2
    }
  ];

  // --- Drag and Drop PDF States ---
  const [dragActive, setDragActive] = React.useState(false);
  const [extractedPdfText, setExtractedPdfText] = React.useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = React.useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulatePdfExtraction(file.name);
    }
  };

  const fileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulatePdfExtraction(e.target.files[0].name);
    }
  };

  const simulatePdfExtraction = (fileName: string) => {
    setSelectedFileName(fileName);
    setExtractedPdfText("Analyzing PDF document architecture... \nExtracting text segments...\n\nFound 3 primary topics linked to study targets:\n- Review of Unit proofs \n- Active mock test schedules \n- Core textbook reference formulas.");
    
    // Auto populate custom study task for user immediately!
    const matchingSubjectId = subjects[0]?.id;
    if (matchingSubjectId) {
      onAddFlashcard(matchingSubjectId, `What is the key extracted topic of ${fileName}?`, "Core textbook reference formulas.");
    }
  };

  // --- Flashcard handlers ---
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    const subId = cardSubjectId || subjects[0]?.id || "";
    if (!subId) { alert("Please add a subject first."); return; }
    onAddFlashcard(subId, question, answer);
    setQuestion("");
    setAnswer("");
    setShowAddCard(false);
  };

  const handleEvaluateType = (difficulty: 'E' | 'M' | 'H') => {
    const currentCard = flashcards[currentCardIndex];
    if (currentCard) {
      onEvaluateFlashcard(currentCard.subjectId, difficulty);
      // Advance card index
      if (currentCardIndex < flashcards.length - 1) {
        setFlipped(false);
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        alert("Completed learning all cards in this active roster deck!");
        setFlipped(false);
        setCurrentCardIndex(0);
      }
    }
  };

  // --- Note handlers ---
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const subId = noteSubjectId || subjects[0]?.id || "";
    if (!subId) { alert("Please create a subject first."); return; }
    onAddNote(subId, noteTitle, noteContent);
    setNoteTitle("");
    setNoteContent("");
    setShowAddNote(false);
  };

  // --- Quiz handlers ---
  const startQuiz = () => {
    if (subjects.length === 0) {
      alert("Please configure subjects on the Dashboard first!");
      return;
    }
    setQuizStarted(true);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const selectOption = (optIdx: number) => {
    if (selectedAnswer !== null) return; // Answer locked
    setSelectedAnswer(optIdx);
    if (optIdx === mockQuizQuestions[currentQuizIndex].correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < mockQuizQuestions.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      // Sync focus recovery back to the first subject
      const matching = subjects[0];
      if (matching) {
        onEvaluateFlashcard(matching.id, quizScore >= 2 ? 'E' : 'H');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Sub Navigation Ribbons */}
      <section className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 select-none overflow-x-auto">
        {(["flashcards", "notes", "quizzes", "pdf"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveSubTab(tab);
              setFlipped(false);
            }}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition duration-150 capitalize flex-shrink-0 ${
              activeSubTab === tab
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {tab === "flashcards" ? "Flashcard trainer" : tab === "notes" ? "Markdown study notes" : tab === "quizzes" ? "Practice quizzes" : "PDF study uploader"}
          </button>
        ))}
      </section>

      {/* --- FLASHCARDS TAB --- */}
      {activeSubTab === "flashcards" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Deck Flashcard trainer card display */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Active recall study deck</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Test your immediate retrieval index. Do not scan notes until evaluated.</p>
              </div>
              <span className="text-xs font-black text-slate-400">
                {flashcards.length > 0 ? `${currentCardIndex + 1} / ${flashcards.length}` : "0 / 0"}
              </span>
            </div>

            {flashcards.length === 0 ? (
              <div 
                onClick={() => setShowAddCard(true)}
                className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer"
              >
                <FlipHorizontal className="w-8 h-8 text-slate-300 mb-2" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Deck empty</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Click here to insert your study flashcards.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 3D Flashcard mock flip body */}
                <div 
                  onClick={() => setFlipped(!flipped)}
                  className={`relative p-8 min-h-[180px] rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none ${
                    flipped 
                      ? "border-violet-300 bg-violet-50/20 dark:border-violet-900 dark:bg-violet-950/10 shadow-sm"
                      : "border-slate-100 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <span className="absolute top-3 left-3 text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-black text-slate-400 uppercase tracking-widest leading-none">
                    {flipped ? "Concept definition" : "Recall Query"}
                  </span>

                  <p className={`text-sm tracking-tight leading-relaxed select-text font-semibold ${
                    flipped ? "text-violet-900 dark:text-violet-300" : "text-slate-800 dark:text-slate-100"
                  }`}>
                    {flipped 
                      ? flashcards[currentCardIndex].answer 
                      : flashcards[currentCardIndex].question}
                  </p>

                  <span className="absolute bottom-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <FlipHorizontal className="w-3 h-3 text-slate-300" />
                    <span>Click card to check answer</span>
                  </span>
                </div>

                {/* Navigation and Evaluations triggers */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  
                  {/* Previous, next buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFlipped(false);
                        setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
                      disabled={currentCardIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setFlipped(false);
                        setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1));
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
                      disabled={currentCardIndex === flashcards.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Feedback selection evaluations */}
                  {flipped && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">HOW REASONS RECOLLECTION?</span>
                      <button
                        onClick={() => handleEvaluateType('E')}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 hover:bg-emerald-100 transition"
                      >
                        Easy (Retained)
                      </button>
                      <button
                        onClick={() => handleEvaluateType('H')}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/35 text-rose-600 hover:bg-rose-100 transition"
                      >
                        Hard (Forgot)
                      </button>
                    </div>
                  )}

                  {/* Trash cards */}
                  <button
                    onClick={() => {
                      if (confirm("Delete this flashcard?")) {
                        onDeleteFlashcard(flashcards[currentCardIndex].id);
                        setCurrentCardIndex(0);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition border"
                    title="Remove card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>
            )}
          </div>

          {/* Add flashcard inline forms */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">Add study flashcard</h3>
            <p className="text-xs text-slate-400 mb-4 font-semibold">Keep questions dense and study answers simplified.</p>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">LINK COURSE</label>
                <select
                  value={cardSubjectId}
                  onChange={(e) => setCardSubjectId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                  required
                >
                  <option value="">-- Choose Course Subject --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">RECALL QUESTION</label>
                <input
                  type="text"
                  placeholder="e.g. What is the Big-O of QuickSort?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">RECALL ANSWER</label>
                <textarea
                  placeholder="e.g. O(N^2) in worst case dynamic balancing, O(N log N) on average base."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition"
              >
                Insert Flashcard
              </button>
            </form>
          </div>

        </div>
      )}

      {/* --- NOTES TAB --- */}
      {activeSubTab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Notes summary panel list */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">Your study notes roster</h3>

            {notes.length === 0 ? (
              <div 
                onClick={() => setShowAddNote(true)}
                className="py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer"
              >
                <FileText className="w-8 h-8 text-slate-300 mb-2 mx-auto" />
                <p className="text-xs text-slate-400 mb-1 font-semibold">Note directory empty</p>
                <span className="text-[10px] text-slate-400">Click to start writing markdown summaries</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map(n => {
                  const sName = subjects.find(s => s.id === n.subjectId)?.name || "General";
                  return (
                    <div 
                      key={n.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 hover:border-violet-400 flex flex-col justify-between min-h-[140px] hover:-translate-y-0.5 transition"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5 select-none">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-violet-50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400 truncate max-w-[120px]">
                            {sName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">{n.updatedAt}</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1">{n.title}</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-3 whitespace-pre-wrap">{n.content}</p>
                      </div>

                      <div className="flex justify-end gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            if (confirm("Delete this study note?")) onDeleteNote(n.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                          title="Delete note"
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

          {/* Add Study summaries inline notes */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">Draft new summaries</h3>
            <p className="text-xs text-slate-400 mb-4 font-semibold">Write core explanations following active recall structures.</p>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">LINK COURSE MODULE</label>
                <select
                  value={noteSubjectId}
                  onChange={(e) => setNoteSubjectId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                  required
                >
                  <option value="">-- Choose Course Subject --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">NOTE HEADLINE</label>
                <input
                  type="text"
                  placeholder="e.g. Graph traversal algorithms"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">EXPLANATION CONTENT</label>
                <textarea
                  placeholder="e.g. BFS uses queue structures. DFS utilizes recursive stacks and performs backtracking."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition"
              >
                Log Summary Note
              </button>
            </form>
          </div>

        </div>
      )}

      {/* --- PRACTICE QUIZZES TAB --- */}
      {activeSubTab === "quizzes" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1">Active feedback quiz generator</h3>
          <p className="text-xs text-slate-400 mb-6 font-semibold">Test your topic comprehension. Correct checks raise cognitive ratings across subject priorities.</p>

          {!quizStarted ? (
            <div className="py-12 text-center max-w-sm mx-auto flex flex-col items-center">
              <PlayCircle className="w-10 h-10 text-violet-500 mb-3 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Start active retrieval quiz</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 mb-4">Quiz evaluates cognitive familiarity and adapts study targets automatically.</p>
              
              <button
                onClick={startQuiz}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition"
              >
                Bootstrap Custom Quiz
              </button>
            </div>
          ) : quizCompleted ? (
            <div className="py-12 text-center max-w-sm mx-auto flex flex-col items-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white">Diagnostics Complete!</h4>
                <p className="text-xs text-emerald-600 font-extrabold mt-1">Quiz Score: {quizScore} / {mockQuizQuestions.length} correct</p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Cognitive stability metrics synced. Recommended study pacing modified for linked courses.
                </p>
              </div>

              <button
                onClick={() => setQuizStarted(false)}
                className="px-5 py-2 hover:bg-slate-50 border text-xs font-bold rounded-xl text-slate-600 transition"
              >
                Start Another Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Question card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850">
                <span className="text-[9px] font-black uppercase text-slate-400">
                  QUESTION {currentQuizIndex + 1} OF {mockQuizQuestions.length}
                </span>
                <h4 className="text-xs font-black text-slate-800 dark:text-white mt-1 leading-relaxed">
                  {mockQuizQuestions[currentQuizIndex].q}
                </h4>
              </div>

              {/* Option buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockQuizQuestions[currentQuizIndex].options.map((opt, optIdx) => {
                  let optStyle = "border-slate-100 hover:border-violet-400 text-slate-700 bg-white dark:border-slate-800 dark:bg-slate-900";
                  if (selectedAnswer !== null) {
                    if (optIdx === mockQuizQuestions[currentQuizIndex].correct) {
                      optStyle = "border-emerald-500 bg-emerald-50/30 text-emerald-700 font-bold dark:bg-emerald-950/20";
                    } else if (optIdx === selectedAnswer) {
                      optStyle = "border-rose-500 bg-rose-50/35 text-rose-700 dark:bg-rose-950/25";
                    } else {
                      optStyle = "border-slate-100 bg-slate-50/10 opacity-40";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectOption(optIdx)}
                      className={`p-4 text-xs font-semibold rounded-xl border text-left transition duration-150 ${optStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              {selectedAnswer !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={nextQuizQuestion}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition"
                  >
                    <span>
                      {currentQuizIndex < mockQuizQuestions.length - 1 ? "Next question" : "Complete Diagnostics"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* --- PDF study UPLOADER --- */}
      {activeSubTab === "pdf" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Active PDF syllabus extractor</h3>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Simulate syllabus reading drafts. Study Ally extracts checkpoints to create flashcard concepts instantly.</p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
              dragActive 
                ? "border-violet-500 bg-violet-50/10" 
                : "border-slate-150 dark:border-slate-800 hover:border-violet-400"
            }`}
          >
            <UploadCloud className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2.5" />
            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Drag or click to choose PDF file</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 mb-4">Supported simulated size: up to 15MB PDF</p>

            <input
              type="file"
              accept=".pdf"
              onChange={fileChange}
              className="hidden"
              id="pdf-picker"
            />
            <label
              htmlFor="pdf-picker"
              className="px-4 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 transition"
            >
              Choose PDF syllabus
            </label>
          </div>

          {selectedFileName && (
            <div className="p-4 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/30">
              <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400">Successfully locked "{selectedFileName}"</h4>
              {extractedPdfText && (
                <pre className="text-[11px] text-slate-600 dark:text-slate-300 font-sans mt-2.5 leading-relaxed bg-white dark:bg-slate-900 border p-3.5 rounded-xl whitespace-pre-wrap">
                  {extractedPdfText}
                </pre>
              )}
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 flex gap-2.5 border">
            <Info className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              PDF syllabus upload handles visual text extraction to feed questions automatically into active recall slide decks. Extra simulated questions are mapped beneath your first dashboard subject instantly.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
