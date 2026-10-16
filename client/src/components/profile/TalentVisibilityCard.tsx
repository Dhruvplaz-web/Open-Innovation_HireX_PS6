import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, EyeOff, Eye, Lock, Unlock, Mail, CheckCircle2, 
  XCircle, AlertCircle, ArrowRight, Sparkles, Building, Briefcase,
  HelpCircle, RefreshCw, Check, Send
} from 'lucide-react';
import { TalentVisibilitySettings, TalentInvitation } from '../../types';
import { apiService } from '../../services/api';

interface TalentVisibilityCardProps {
  studentId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const TalentVisibilityCard: React.FC<TalentVisibilityCardProps> = ({
  studentId = 'std_1',
  onNavigateTab
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<TalentVisibilitySettings>({
    student_id: studentId,
    mode: 'INCOGNITO',
    talent_id: 'SB-TALENT-10482',
    allow_recruiter_discovery: true,
    hide_identity_until_accepted: true,
    allow_recruiter_invitations: true,
    show_projects_anonymously: true,
    show_research_anonymously: true,
    research_interests: ['Machine Learning', 'Computer Vision'],
    availability: 'Immediate Internship (6 Months)',
    achievements: ['Verified Proctored Score: 88%']
  });
  const [invitations, setInvitations] = useState<TalentInvitation[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [visRes, invRes] = await Promise.all([
        apiService.getTalentVisibility(studentId),
        apiService.getStudentIncognitoInvitations(studentId)
      ]);

      if (visRes.status === 'success' && visRes.settings) {
        setSettings(visRes.settings);
      }
      if (invRes.status === 'success' && invRes.invitations) {
        setInvitations(invRes.invitations);
      }
    } catch (err) {
      console.error('Failed to load talent visibility settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleSaveSettings = async (newSettings: Partial<TalentVisibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setSaving(true);
    try {
      const res = await apiService.updateTalentVisibility(updated, studentId);
      if (res.status === 'success') {
        showToast('Talent visibility preferences updated and synced across HireX!', 'success');
      } else {
        showToast(res.message || 'Failed to update settings', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const res = await apiService.acceptTalentInvitation(invitationId);
      if (res.status === 'success') {
        showToast('Invitation accepted! Your verified contact details have been safely revealed to the recruiter.', 'success');
        loadData();
      } else {
        showToast(res.message || 'Failed to accept invitation', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to accept invitation', 'error');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const res = await apiService.declineTalentInvitation(invitationId);
      if (res.status === 'success') {
        showToast('Invitation declined. Your identity remains strictly confidential.', 'success');
        loadData();
      } else {
        showToast(res.message || 'Failed to decline invitation', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to decline invitation', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-75 hover:opacity-100 underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Main Talent Discovery Settings Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                Privacy-Preserving Talent Discovery
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                Backend Enforced DPDP 2023
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Talent Visibility & Incognito Matching</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Make your verified skills, projects, and assessment scores discoverable to Tier-1 recruiters without initially revealing your name, email, phone, or Aadhaar.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Recruiter View</span>
            </button>
          </div>
        </div>

        {/* Visibility Mode Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Talent Discovery Mode
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode 1: Incognito Profile (Default & Recommended) */}
            <div 
              onClick={() => handleSaveSettings({ mode: 'INCOGNITO', hide_identity_until_accepted: true, allow_recruiter_discovery: true })}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                settings.mode === 'INCOGNITO'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Incognito Profile</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Recruiters discover your verified skills under public ID <strong className="font-mono text-indigo-600">{settings.talent_id}</strong>. Your identity is revealed ONLY after you accept an invitation.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                <span>{settings.mode === 'INCOGNITO' ? '✓ Active Mode' : 'Select Incognito'}</span>
              </div>
            </div>

            {/* Mode 2: Normal Profile */}
            <div 
              onClick={() => handleSaveSettings({ mode: 'NORMAL', hide_identity_until_accepted: false, allow_recruiter_discovery: true })}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                settings.mode === 'NORMAL'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Unlock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Normal Profile</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Verified campus recruiters can view your full profile and credentials directly in campus placement drives.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500">
                <span>{settings.mode === 'NORMAL' ? '✓ Active Mode' : 'Select Normal'}</span>
              </div>
            </div>

            {/* Mode 3: Hidden from Recruiters */}
            <div 
              onClick={() => handleSaveSettings({ mode: 'HIDDEN', allow_recruiter_discovery: false })}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                settings.mode === 'HIDDEN'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hidden Profile</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Completely unlisted from talent discovery search. Only applications you submit directly will be visible.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500">
                <span>{settings.mode === 'HIDDEN' ? '✓ Active Mode' : 'Select Hidden'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Public Talent ID Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Your Public Cryptographic Talent Identifier
            </span>
            <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
              {settings.talent_id || 'SB-TALENT-10482'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Non-guessable randomized ID. Masks database primary keys and personal metadata.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Skill Record Connected
            </span>
          </div>
        </div>

        {/* Granular Privacy Controls */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Granular Talent Discovery Permissions
          </label>

          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_recruiter_discovery}
                onChange={(e) => handleSaveSettings({ allow_recruiter_discovery: e.target.checked })}
                className="mt-0.5 rounded accent-indigo-600"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Allow enterprise recruiters to discover my verified technical skills
                </span>
                <span className="text-slate-500">
                  Enables AI matching algorithms to index your proctored assessment scores and AST coding benchmarks.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.hide_identity_until_accepted}
                onChange={(e) => handleSaveSettings({ hide_identity_until_accepted: e.target.checked })}
                className="mt-0.5 rounded accent-indigo-600"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Keep my name and contact identity hidden until I explicitly accept an invitation
                </span>
                <span className="text-slate-500">
                  Recruiters will only see your talent ID, verified skills, and match explanation until you click "Accept & Reveal".
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_recruiter_invitations}
                onChange={(e) => handleSaveSettings({ allow_recruiter_invitations: e.target.checked })}
                className="mt-0.5 rounded accent-indigo-600"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Allow verified recruiters to send "Invite to Apply" opportunities
                </span>
                <span className="text-slate-500">
                  Receive personalized hiring invitations directly to your HireX inbox with guaranteed stipend and role details.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_projects_anonymously}
                onChange={(e) => handleSaveSettings({ show_projects_anonymously: e.target.checked })}
                className="mt-0.5 rounded accent-indigo-600"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Show my capstone & collaboration projects anonymously
                </span>
                <span className="text-slate-500">
                  Displays verified project contributions from the Collaboration Hub to boost recruiter confidence.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Recruiter Invitations Inbox Section */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Recruiter Invitations Inbox</span>
            </h3>
            <p className="text-xs text-slate-500">
              Invitations received based on your verified skills. Accepting an invitation safely reveals your identity for that specific opportunity.
            </p>
          </div>

          <button
            onClick={loadData}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {invitations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-2xl space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No pending recruiter invitations right now.</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              As recruiters search Incognito Talent and scout projects, invitations with custom messages and AI match scores will arrive here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div 
                key={inv.id} 
                className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {inv.opportunity_title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {inv.match_percentage}% Match
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'DECLINED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Company: <strong>{inv.company}</strong> • Recruiter Message: <span className="italic">"{inv.message}"</span>
                    </p>
                  </div>

                  {inv.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeclineInvitation(inv.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-xs font-bold transition"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleAcceptInvitation(inv.id)}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Reveal Identity</span>
                      </button>
                    </div>
                  )}

                  {inv.status === 'ACCEPTED' && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Identity Shared with {inv.company}</span>
                    </span>
                  )}
                </div>

                {/* Matched Skills Pill Row */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 self-center mr-1">Matched:</span>
                  {inv.matched_skills?.map((s, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200/50">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Preview Modal: How Recruiters See You */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recruiter-Facing Anonymous Profile Preview
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 font-sans">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                    Verified Candidate
                  </span>
                  <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-1">
                    {settings.talent_id || 'SB-TALENT-10482'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    3rd Year • Computer Engineering • Pune Region
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  91% AI Fit
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Skills & Proficiency</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700">
                    <span className="font-bold">Python</span>: 92%
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700">
                    <span className="font-bold">Machine Learning</span>: 88%
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700">
                    <span className="font-bold">FastAPI</span>: 84%
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700">
                    <span className="font-bold">React</span>: 76%
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
                <p><strong>Assessment Overall Score:</strong> 86%</p>
                <p><strong>Verified Projects:</strong> ML-based prediction project, FastAPI REST API, React dashboard</p>
                <p><strong>Availability:</strong> Immediate Summer / 6-Month Internship</p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Protected: Full name, personal email, phone, Aadhaar & address are completely masked.</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
