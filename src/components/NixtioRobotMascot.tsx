import React from 'react';

export const NixtioRobotMascot: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Speech bubble */}
      <div className="absolute -top-7 -right-16 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl rounded-bl-xs shadow-md border border-neutral-200/80 text-[11px] font-bold text-neutral-800 whitespace-nowrap z-20 flex items-center gap-1.5 animate-bounce">
        <span>Hey there! 👋</span>
        <span className="text-neutral-500 font-normal">Need a boost?</span>
      </div>

      {/* 3D Ceramic AI Robot SVG */}
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-xl filter"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="headShine" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
          <linearGradient id="visorScreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="bodyShine" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="earCyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="eyeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow under robot */}
        <ellipse cx="80" cy="148" rx="42" ry="7" fill="#0f172a" fillOpacity="0.12" />

        {/* Floating Left Arm */}
        <g className="animate-pulse" style={{ animationDuration: '3s' }}>
          <ellipse cx="34" cy="98" rx="8" ry="14" fill="url(#bodyShine)" stroke="#94a3b8" strokeWidth="1" transform="rotate(22 34 98)" />
          <circle cx="28" cy="108" r="6" fill="#38bdf8" />
        </g>

        {/* Floating Right Waving Arm */}
        <g className="origin-[125px_95px] animate-pulse" style={{ animationDuration: '2s' }}>
          <ellipse cx="126" cy="85" rx="8" ry="15" fill="url(#bodyShine)" stroke="#94a3b8" strokeWidth="1" transform="rotate(-35 126 85)" />
          <circle cx="134" cy="74" r="6" fill="#38bdf8" />
        </g>

        {/* Body Base */}
        <path
          d="M 50 102 C 50 90, 110 90, 110 102 C 110 125, 105 138, 80 138 C 55 138, 50 125, 50 102 Z"
          fill="url(#bodyShine)"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        {/* Chest Accent Ring */}
        <ellipse cx="80" cy="116" rx="14" ry="4" fill="#38bdf8" fillOpacity="0.8" />

        {/* Robot Head */}
        <rect
          x="38"
          y="28"
          width="84"
          height="64"
          rx="32"
          fill="url(#headShine)"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* Ears */}
        <rect x="30" y="46" width="9" height="24" rx="4.5" fill="url(#earCyan)" />
        <rect x="121" y="46" width="9" height="24" rx="4.5" fill="url(#earCyan)" />

        {/* Curved Glass Visor Screen */}
        <rect
          x="47"
          y="36"
          width="66"
          height="48"
          rx="24"
          fill="url(#visorScreen)"
        />

        {/* Friendly Happy Curved Eyes (Cheer Arc) */}
        <path
          d="M 59 58 Q 66 50 73 58"
          stroke="#38bdf8"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter="url(#eyeGlow)"
        />
        <path
          d="M 87 58 Q 94 50 101 58"
          stroke="#38bdf8"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter="url(#eyeGlow)"
        />

        {/* Cheerful Blush Dots */}
        <circle cx="58" cy="68" r="3" fill="#ec4899" fillOpacity="0.45" />
        <circle cx="102" cy="68" r="3" fill="#ec4899" fillOpacity="0.45" />

        {/* Small Smiling Open Mouth */}
        <path
          d="M 75 66 Q 80 72 85 66"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Glass reflection streak on head */}
        <path
          d="M 52 34 Q 80 28 108 34"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </svg>
    </div>
  );
};
