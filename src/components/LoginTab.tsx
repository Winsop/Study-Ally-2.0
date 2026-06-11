import React, { useState } from "react";
import { LogIn } from "lucide-react";

interface LoginTabProps {
  onLoginSuccess: (user: { name: string; rollNo: string }) => void;
}

export function LoginTab({ onLoginSuccess }: LoginTabProps) {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), rollNo: rollNo.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Invalid roll number");
      }
    } catch (err) {
      setError("Login failed - check your connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-800">
        <div className="flex justify-center mb-6">
          <div className="bg-violet-600 p-3 rounded-xl">
            <LogIn className="w-6 h-6 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">
          Study Ally
        </h1>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6">
          Sign in to access your study dashboard
        </p>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            ℹ️ <span className="font-semibold">Session Limit:</span> After login, you can refresh the page 2 times. Then you'll need to login again for security.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Roll Number
            </label>
            <input
              type="text"
              placeholder="e.g., CSE-001"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-2.5 rounded-lg transition duration-150 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
          Demo: Use roll number like CSE-001, ECE-001, etc.
        </p>
      </div>
    </div>
  );
}
