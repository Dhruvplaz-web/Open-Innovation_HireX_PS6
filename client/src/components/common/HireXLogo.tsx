import React from 'react';

interface HireXLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export const HireXLogo: React.FC<HireXLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  textClassName = ''
}) => {
  const sizeMap = {
    sm: {
      box: 'w-7 h-7 rounded-lg',
      svg: 'w-4 h-4',
      text: 'text-base font-extrabold',
      xSize: 'text-lg font-black'
    },
    md: {
      box: 'w-9 h-9 rounded-xl',
      svg: 'w-5 h-5',
      text: 'text-lg md:text-xl font-extrabold',
      xSize: 'text-xl md:text-2xl font-black'
    },
    lg: {
      box: 'w-11 h-11 rounded-2xl',
      svg: 'w-6 h-6',
      text: 'text-2xl font-black',
      xSize: 'text-2xl font-black'
    },
    xl: {
      box: 'w-14 h-14 rounded-2xl',
      svg: 'w-8 h-8',
      text: 'text-3xl font-black',
      xSize: 'text-3xl font-black'
    }
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Geometric HireX Emblem Icon */}
      <div 
        className={`${current.box} bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-[1.5px] shadow-sm shadow-indigo-500/20 relative group transition-transform duration-200 hover:scale-105 border border-indigo-500/30 flex items-center justify-center shrink-0`}
      >
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${current.svg} drop-shadow-sm`}
        >
          <defs>
            <linearGradient id="hx-grad-1" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="0.5" stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="hx-grad-2" x1="34" y1="6" x2="6" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="0.5" stopColor="#A855F7" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          
          {/* Futuristic geometric intersected 'X' stroke */}
          <path 
            d="M9 8L31 32" 
            stroke="url(#hx-grad-1)" 
            strokeWidth="5" 
            strokeLinecap="round" 
          />
          <path 
            d="M31 8L9 32" 
            stroke="url(#hx-grad-2)" 
            strokeWidth="5" 
            strokeLinecap="round" 
          />
          {/* Central Target Focal Point */}
          <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="5" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.7" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span className={`tracking-tight text-slate-900 dark:text-white flex items-center ${current.text} ${textClassName}`}>
          Hire
          <span className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent ml-0.5 ${current.xSize}`}>
            X
          </span>
        </span>
      )}
    </div>
  );
};
