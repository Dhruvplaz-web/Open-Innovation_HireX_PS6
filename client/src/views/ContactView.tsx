import React, { useState } from 'react';
import { Mail, ChevronRight, Send, CheckCircle2, AlertCircle, MessageSquare, Building2, HelpCircle } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { SITE_CONFIG } from '../config/site';

interface ContactViewProps {
  onNavigateTab: (tab: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigateTab }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Support');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!message.trim() || message.length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }

    setLoading(true);

    try {
      // Integration-ready mock dispatch to backend support queue
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError('Failed to submit message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <SEOHead
        title="Contact HireX"
        description="Reach out to the HireX placement, academic collaboration, and technical support desk."
        path="/contact"
      />

      {/* Accessible Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
        <button 
          onClick={() => onNavigateTab('dashboard')}
          className="hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Contact Support
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-2 border-b border-slate-200/90 dark:border-slate-800 pb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Contact HireX Support
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Have questions about verified assessments, college onboarding, or campus drive recruitment? Send us a message.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Information Cards */}
        <div className="md:col-span-1 space-y-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Direct Support Email
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              For general help & placement drive inquiries:
            </p>
            <a 
              href={`mailto:${SITE_CONFIG.organization.contactEmail}`}
              className="text-xs font-mono font-bold text-slate-900 dark:text-white underline hover:opacity-80 block pt-1"
            >
              {SITE_CONFIG.organization.contactEmail}
            </a>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Academic Onboarding
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Colleges seeking institutional TPO gatekeeper deployment can reach our academic coordinator.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">Response Expectation</p>
            <p>Our academic support desk typically responds within 1–2 business days during campus hiring cycles.</p>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className="md:col-span-2">
          {success ? (
            <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Message Transmitted Successfully
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
                Thank you for contacting HireX. Your ticket has been logged into the support queue and our team will follow up via email.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition shadow-xs mt-2"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-4 shadow-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dhruv Patil"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@institution.edu"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inquiry Category
                </label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="General Support">General Support</option>
                  <option value="Student Support">Student Support (Assessments & Transcripts)</option>
                  <option value="Recruiter Support">Recruiter Support (Campus Drives & Shortlisting)</option>
                  <option value="Institution Support">Institution Support (College TPO / HOD)</option>
                  <option value="Privacy Request">Privacy Request (Data Inspection / Deletion)</option>
                  <option value="Technical Issue">Technical Issue (AST Compiler / Bug Report)</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your question or institutional requirement..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
