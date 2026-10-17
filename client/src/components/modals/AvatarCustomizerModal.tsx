import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Link as LinkIcon, 
  Check, 
  Camera, 
  RefreshCw, 
  User, 
  AlertCircle,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

export interface AvatarPreset {
  id: string;
  name: string;
  role: string;
  url: string;
  category: 'Modern Tech' | 'AI & Bot' | 'Minimalist' | 'Illustrative';
}

export const CURATED_AVATAR_PRESETS: AvatarPreset[] = [
  // Modern Tech Avatars
  {
    id: 'dhruv',
    name: 'Dhruv',
    role: 'Full-Stack AI Developer',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv&backgroundColor=b6e3f4,c0aede,d1d4f9',
    category: 'Modern Tech'
  },
  {
    id: 'aarav',
    name: 'Aarav',
    role: 'Algorithmic Systems Engineer',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&backgroundColor=b6e3f4,c0aede,d1d4f9',
    category: 'Modern Tech'
  },
  {
    id: 'priya',
    name: 'Priya',
    role: 'Campus Talent Partner',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc,ffdfbf',
    category: 'Modern Tech'
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Machine Learning Specialist',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=d1d4f9,c0aede',
    category: 'Modern Tech'
  },
  {
    id: 'rohan',
    name: 'Rohan',
    role: 'Backend Microservices Lead',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan&backgroundColor=c0aede,b6e3f4',
    category: 'Modern Tech'
  },
  {
    id: 'sneha',
    name: 'Sneha',
    role: 'Cloud & DevOps Architect',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha&backgroundColor=ffdfbf,ffd5dc',
    category: 'Modern Tech'
  },
  {
    id: 'vikram',
    name: 'Vikram',
    role: 'Staff Software Engineer',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram&backgroundColor=b6e3f4,d1d4f9',
    category: 'Modern Tech'
  },
  {
    id: 'rajesh',
    name: 'Dr. Rajesh',
    role: 'Academician & TPO Chair',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh&backgroundColor=c0aede,ffdfbf',
    category: 'Modern Tech'
  },

  // AI & Bot Avatars
  {
    id: 'bot_prime',
    name: 'Cyber Sentinel',
    role: 'DevProof AST Auditor',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberSentinel&backgroundColor=b6e3f4,c0aede',
    category: 'AI & Bot'
  },
  {
    id: 'bot_alpha',
    name: 'Neural Agent',
    role: 'Counterfactual Co-Pilot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeuralAgent&backgroundColor=d1d4f9,ffd5dc',
    category: 'AI & Bot'
  },
  {
    id: 'bot_omega',
    name: 'Matrix Core',
    role: 'High-Frequency Quant',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MatrixCore&backgroundColor=c0aede,b6e3f4',
    category: 'AI & Bot'
  },
  {
    id: 'bot_pulse',
    name: 'Quantum Byte',
    role: 'Distributed Systems Bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumByte&backgroundColor=ffdfbf,c0aede',
    category: 'AI & Bot'
  },

  // Minimalist / Notionists
  {
    id: 'notion_1',
    name: 'Kai',
    role: 'Systems Architect',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kai&backgroundColor=e0e7ff,f1f5f9',
    category: 'Minimalist'
  },
  {
    id: 'notion_2',
    name: 'Maya',
    role: 'Frontend Systems Trainee',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Maya&backgroundColor=fce7f3,f1f5f9',
    category: 'Minimalist'
  },
  {
    id: 'notion_3',
    name: 'Arjun',
    role: 'Data Platform Engineer',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Arjun&backgroundColor=fef3c7,f1f5f9',
    category: 'Minimalist'
  },
  {
    id: 'notion_4',
    name: 'Chloe',
    role: 'Product Security Trainee',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=ccfbf1,f1f5f9',
    category: 'Minimalist'
  }
];

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  userName: string;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void> | void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  onSaveAvatar
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress & crop user-uploaded image to a 256x256 WebP/JPEG data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // Center-crop squaring
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;

            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            const dataUrl = canvas.toDataURL('image/webp', 0.88);
            setSelectedAvatar(dataUrl);
          } else {
            setSelectedAvatar(event.target?.result as string);
          }
        } catch {
          setSelectedAvatar(event.target?.result as string);
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setUploadError('Failed to parse image file. Please try another image.');
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    setUrlError('');
    if (!customUrl.trim()) {
      setUrlError('Please enter an image URL.');
      return;
    }

    // Test image validity
    setIsProcessing(true);
    const testImg = new Image();
    testImg.onload = () => {
      setSelectedAvatar(customUrl.trim());
      setIsProcessing(false);
    };
    testImg.onerror = () => {
      setUrlError('Could not load image from this URL. Verify CORS permissions or direct image link.');
      setIsProcessing(false);
    };
    testImg.src = customUrl.trim();
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      await onSaveAvatar(selectedAvatar);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to update avatar.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPresets = activeCategory === 'All' 
    ? CURATED_AVATAR_PRESETS 
    : CURATED_AVATAR_PRESETS.filter(p => p.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-[#121829] w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <img
              src={selectedAvatar}
              alt={userName}
              className="w-16 h-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border-2 border-indigo-500 shadow-md p-0.5"
            />
            <span className="absolute -bottom-1 -right-1 p-1 rounded-md bg-emerald-500 text-white shadow-xs" title="Verified Campus Identity">
              <ShieldCheck className="w-3 h-3" />
            </span>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Personalize Profile Photo</span>
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose a sovereign developer avatar or upload your verified campus photo.
            </p>
          </div>
        </div>

        {/* Method Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {/* TAB 1: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Modern Tech', 'AI & Bot', 'Minimalist'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.url)}
                    className={`p-2 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 group relative ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-12 h-12 rounded-xl object-cover bg-white dark:bg-slate-800"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD PHOTO */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-indigo-400/60 dark:border-indigo-600/60 rounded-3xl text-center cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition flex flex-col items-center justify-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Click to select photo or drag & drop here
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Supports PNG, JPG, or WebP (Max 5MB). Automatically auto-crops to avatar square.
                </p>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOM IMAGE URL */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Image Web Address (Direct Link)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="e.g. https://avatars.githubusercontent.com/u/12345678"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Preview</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Use direct image links from GitHub, LinkedIn, or personal portfolio.
              </p>
            </div>

            {urlError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedAvatar(currentAvatar)}
            className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            Reset
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Saving Avatar...' : 'Set as Profile Photo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
