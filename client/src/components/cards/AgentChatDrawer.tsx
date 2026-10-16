import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';
import { Role, ChatMessage } from '../../types';
import { apiService } from '../../services/api';
import { useAssessment } from '../../context/AssessmentContext';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  userId: string;
  initialPrompt?: string;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  role,
  userId,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: role === 'student'
        ? "Hello Dhruv! I am your HireX Autonomous Co-Pilot. I am equipped with live tools: AST Code Complexity Auditor, ATS Resume Scanner, TPO Eligibility Checker, and AI Mock Interviewer. How can I assist your placement preparation today?"
        : role === 'recruiter'
        ? "Welcome, Priya! I have vetted all applicant submissions. Ask me to shortlist top verified candidates from Indian engineering colleges or filter by minimum coding benchmark."
        : "Welcome, Dr. Kulkarni! I have cross-audited the 3rd Year Computer Engineering syllabus with 500,000+ live Pan-India tech vacancies. Ask me for critical curriculum updates.",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-send initial prompt if passed
  React.useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const quickPrompts = role === 'student'
    ? [
        "Audit my code AST complexity",
        "Scan my resume for Barclays",
        "Check my TPO eligibility",
        "Generate 7-day Barclays prep plan",
        "Start a mock technical interview"
      ]
    : role === 'recruiter'
    ? ["Find students with score >85% in Python", "Shortlist top 3 Pan-India candidates", "Check candidate assessment integrity"]
    : ["What is missing in Semester 6 Web Tech?", "How do we boost placement rate by 20%?", "Suggest NEP 2020 1-credit elective"];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await apiService.sendAgentChat(role, userId, query);
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: response.reply,
        timestamp: 'Just now',
        actionData: response.action_data
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      // Fallback handled in apiService
    } finally {
      setLoading(false);
    }
  };

  const { isAssessmentActive } = useAssessment();

  if (!isOpen || isAssessmentActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full bg-white dark:bg-card-dark shadow-2xl flex flex-col justify-between border-l border-slate-100 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 text-white dark:text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">HireX Co-Pilot</h3>
                <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                  Agentic AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Autonomous Career & Placement Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs md:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-xs shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                {/* Agent Tool Execution Badge if agent message */}
                {m.sender === 'agent' && (
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>AGENTIC TOOL PIPELINE EXECUTED</span>
                  </div>
                )}

                <p className="whitespace-pre-line">{m.text}</p>

                {/* Optional action payload rendered inline */}
                {m.actionData && m.actionData.potential_score_jump && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>Projected Score Surge:</span>
                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
                      {m.actionData.potential_score_jump}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl w-fit border border-slate-200/60 dark:border-slate-700/60">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Analyzing ML models & knowledge graph...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition shadow-2xs text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 rounded-xl px-3.5 py-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-slate-400 dark:focus-within:ring-slate-600 transition"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask HireX Co-Pilot anything..."
              className="flex-1 bg-transparent text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-black text-white flex items-center justify-center disabled:opacity-40 transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
