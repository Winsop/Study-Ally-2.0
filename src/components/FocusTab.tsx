/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Clock, Play, Pause, RotateCcw, Volume2, VolumeX, Shield, Check, 
  HelpCircle, Sparkles, BookOpen, Smile, FileText, ListCollapse, ListTodo
} from "lucide-react";
import { JournalEntry } from "../types";

interface FocusTabProps {
  journals: JournalEntry[];
  onAddJournalEntry: (notes: string, rating: number) => void;
  onLogStudyMinutes: (minutes: number) => void;
}

export const FocusTab: React.FC<FocusTabProps> = ({
  journals,
  onAddJournalEntry,
  onLogStudyMinutes,
}) => {
  // Timer States
  const [minutes, setMinutes] = React.useState(25);
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [mode, setMode] = React.useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timerPresetVal, setTimerPresetVal] = React.useState(25);

  // Synthesizer Binaural Noise State
  const [synthOn, setSynthOn] = React.useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const noiseNodeRef = React.useRef<AudioBufferSourceNode | null>(null);
  const filterNodeRef = React.useRef<BiquadFilterNode | null>(null);

  // Reflection States
  const [journalText, setJournalText] = React.useState("");
  const [rating, setRating] = React.useState(4);

  // Timer Countdown logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer expired! Trigger completions
            handleTimerExpiration();
            if (interval) clearInterval(interval);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerExpiration = () => {
    setIsActive(false);
    // Beep synthesize using browser native audio
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high A
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {}

    alert(mode === 'work' ? "Focus session complete! Log your review minutes." : "Break complete! Ready to start checking off targets?");
    
    if (mode === 'work') {
      onLogStudyMinutes(timerPresetVal);
    }

    // Auto toggle mode
    if (mode === 'work') {
      changeMode('shortBreak');
    } else {
      changeMode('work');
    }
  };

  const changeMode = (newMode: typeof mode) => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'work') {
      setMinutes(25);
      setTimerPresetVal(25);
    } else if (newMode === 'shortBreak') {
      setMinutes(5);
      setTimerPresetVal(5);
    } else {
      setMinutes(15);
      setTimerPresetVal(15);
    }
    setSeconds(0);
  };

  const handleReset = () => {
    setIsActive(false);
    setMinutes(timerPresetVal);
    setSeconds(0);
  };

  const toggleTimerActive = () => {
    setIsActive(!isActive);
  };

  // Web Audio ambient synthesizer (Binaural brownian noise representing steady storm)
  const toggleAmbientSynth = () => {
    if (synthOn) {
      // Turn off
      try {
        if (noiseNodeRef.current) {
          noiseNodeRef.current.stop();
          noiseNodeRef.current.disconnect();
          noiseNodeRef.current = null;
        }
        if (filterNodeRef.current) {
          filterNodeRef.current.disconnect();
          filterNodeRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      } catch (e) {
        console.warn("Synth cleanup failed", e);
      }
      setSynthOn(false);
    } else {
      // Turn on
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;

        const bufferSize = 4 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Brown noise calculation (leaky integration to filter low frequency hum)
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 4.5; // Gain amplification
        }

        const source = audioCtx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        // Biquad Lowpass filter representing calming steady rain
        const lowpass = audioCtx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(320, audioCtx.currentTime);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime); // keeping decibels gentle

        source.connect(lowpass);
        lowpass.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        source.start();
        
        noiseNodeRef.current = source;
        filterNodeRef.current = lowpass;
        setSynthOn(true);
      } catch (e) {
        alert("AudioContext is restricted or blocked in this browser sandbox.");
        console.warn("Synth initialization bound failed", e);
      }
    }
  };

  // Clean ambient audio synth nodes when tab changes or unmounts
  React.useEffect(() => {
    return () => {
      // Turn off synth on unmount
      try {
        if (noiseNodeRef.current) {
          noiseNodeRef.current.stop();
          noiseNodeRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      } catch (e) {}
    };
  }, []);

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    onAddJournalEntry(journalText, rating);
    setJournalText("");
    setRating(4);
    alert("Journal entry recorded successfully! Excellent reflection.");
  };

  // Progress circle mapping helpers
  const totalSecondsAll = timerPresetVal * 60;
  const currentSecondsLeft = minutes * 60 + seconds;
  const progressRatio = totalSecondsAll > 0 ? (totalSecondsAll - currentSecondsLeft) / totalSecondsAll : 0;
  
  // SVG stroke-dash offset for dynamic countdown indicators
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* 1. Pomodoro Control Station Card */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center transition-all duration-200">
        
        <div className="w-full flex justify-between items-center mb-6 select-none">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Pomodoro Focus Timer</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Study with intervals to improve concentration indexes.</p>
          </div>
          
          {/* Preset switch buttons */}
          <div className="flex gap-1.5 p-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border">
            <button
              onClick={() => changeMode('work')}
              className={`px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wide transition duration-150 ${
                mode === 'work' ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Study
            </button>
            <button
              onClick={() => changeMode('shortBreak')}
              className={`px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wide transition duration-150 ${
                mode === 'shortBreak' ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Break
            </button>
            <button
              onClick={() => changeMode('longBreak')}
              className={`px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wide transition duration-150 ${
                mode === 'longBreak' ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Rest
            </button>
          </div>
        </div>

        {/* Visual Glowing ticking loop indicator */}
        <div className="relative flex items-center justify-center mb-6 select-none">
          
          {/* Native SVG ticking circle */}
          <svg className="w-48 h-48 transform -rotate-90">
            {/* track background */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800 fill-transparent"
              strokeWidth="6"
            />
            {/* dynamic ticking progress bar */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              className="stroke-violet-600 dark:stroke-violet-500 fill-transparent transition-all duration-300"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Time text centered Overlay */}
          <div className="absolute text-center">
            <h4 className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </h4>
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mt-1.5 leading-none">
              {mode === 'work' ? "Focus session" : "Pacing rest"}
            </p>
          </div>

        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3 mb-6 select-none">
          <button
            onClick={toggleTimerActive}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-sm transition duration-150 flex items-center gap-1.5 ${
              isActive 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {isActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isActive ? "Pause Study" : "Start Study"}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850/60 text-slate-400 hover:text-slate-700 transition"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Ambient Binaural synths controller */}
          <button
            onClick={toggleAmbientSynth}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
              synthOn
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700"
            }`}
            title="Starts white noise audio synthesis in background"
          >
            {synthOn ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            <span>{synthOn ? "Storm synth On" : "Calming Storm Sound"}</span>
          </button>
        </div>

        {/* Informative advice banner on synthesiser functionality */}
        <div className="flex gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border items-start w-full leading-relaxed">
          <Shield className="w-4.5 h-4.5 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold select-all">
            <b>Audio Synthesis Hint:</b> Continuous Brownian noise creates an unchanging noise landscape, cancelling sudden visual/auditory room triggers to help preserve peak concentration states.
          </p>
        </div>

      </div>

      {/* 2. Daily Reflection journal block */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-200 h-fit space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
            <BookOpen className="w-4.5 h-4.5 text-violet-500" />
            <span>Daily Reflection journal</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-semibold">Track cognitive confidence indices on material studied.</p>
        </div>

        <form onSubmit={handleJournalSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CONCEPTS STUDIED TODAY</label>
            <textarea
              placeholder="e.g. Mastered DFS and calculated stability checks on Mathematics textbook chapter 4."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              rows={3}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500 resize-none font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 flex justify-between">
              <span>UNDERSTANDING RATING</span>
              <span className="text-violet-600 font-black">{rating} / 5</span>
            </label>
            <div className="flex gap-1.5 justify-between select-none">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border text-center transition ${
                    rating === val
                      ? "bg-violet-600 text-white border-transparent"
                      : "border-slate-200 text-slate-400 dark:border-slate-755 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {val === 1 ? "1 (Weak)" : val === 5 ? "5 (High)" : val}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition shadow-sm"
          >
            Log Reflection Entry
          </button>
        </form>

        {/* Reflection index listings history */}
        <div>
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Historical Logs</h4>
          {journals.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">No reflection logs completed yet. Journal entries are persisted in your local sandbox.</p>
          ) : (
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {journals.map((j) => (
                <div key={j.id} className="p-3 bg-slate-50 dark:bg-slate-850/80 rounded-xl border text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-400 font-bold select-none">
                    <span>{j.date}</span>
                    <span className="text-violet-600">Familiarity: {j.understandingRating}/5</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">{j.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
