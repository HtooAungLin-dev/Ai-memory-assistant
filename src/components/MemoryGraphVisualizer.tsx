import React from 'react';

export const MemoryGraphVisualizer: React.FC<{ className?: string }> = ({ className = 'w-36 h-36' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Dynamic Context Speech Bubble */}
      <div className="absolute -top-7 -right-12 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl rounded-bl-xs shadow-lg border border-indigo-200 text-[11px] font-bold text-neutral-800 whitespace-nowrap z-20 flex items-center gap-1.5 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Context Synced!</span>
        <span className="text-indigo-600 font-mono text-[10px]">Mem0 + ClariLayer</span>
      </div>

      {/* Futuristic 3D Vector Memory Core Graphic */}
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-2xl filter"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orbGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="ringNeon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="80" cy="80" r="60" fill="url(#coreGlow)" />

        {/* Outer Orbit Ring 1 */}
        <ellipse
          cx="80"
          cy="80"
          rx="68"
          ry="26"
          stroke="url(#ringNeon)"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
          transform="rotate(-25 80 80)"
          className="animate-spin"
          style={{ animationDuration: '18s' }}
        />

        {/* Outer Orbit Ring 2 */}
        <ellipse
          cx="80"
          cy="80"
          rx="64"
          ry="24"
          stroke="#a5b4fc"
          strokeWidth="1.5"
          fill="none"
          transform="rotate(35 80 80)"
          opacity="0.75"
        />

        {/* Orbiting Context Node - Decisions */}
        <g transform="translate(130, 60)">
          <circle cx="0" cy="0" r="9" fill="#10b981" className="shadow-md" />
          <path d="M-3 0 L-1 2 L3 -2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Orbiting Context Node - Architecture Rules */}
        <g transform="translate(28, 96)">
          <circle cx="0" cy="0" r="9" fill="#6366f1" />
          <circle cx="0" cy="0" r="4" fill="#ffffff" />
        </g>

        {/* Orbiting Context Node - MCP */}
        <g transform="translate(118, 115)">
          <circle cx="0" cy="0" r="7" fill="#38bdf8" />
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
        </g>

        {/* Central Vector Neural Sphere (Mem0 Brain) */}
        <circle cx="80" cy="80" r="32" fill="url(#orbGradient)" stroke="#818cf8" strokeWidth="2" />

        {/* Synaptic Brain Waves / Circuit Lines */}
        <path
          d="M 64 74 Q 80 62 96 74"
          stroke="#4f46e5"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 62 84 Q 80 94 98 84"
          stroke="#4f46e5"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 72 70 L 72 90"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 88 70 L 88 90"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="80" cy="80" r="4" fill="#10b981" />

        {/* Glass reflection highlight */}
        <ellipse cx="72" cy="65" rx="14" ry="7" fill="#ffffff" fillOpacity="0.6" transform="rotate(-20 72 65)" />
      </svg>
    </div>
  );
};
