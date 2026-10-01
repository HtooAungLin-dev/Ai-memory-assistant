import React from 'react';
import { Plus, Search, Compass, Grid, History, LogOut } from 'lucide-react';

interface NixtioDockSidebarProps {
  activeView: 'home' | 'chat' | 'explore' | 'context' | 'history';
  onSelectView: (view: 'home' | 'chat' | 'explore' | 'context' | 'history') => void;
  onNewChat: () => void;
  memoryCount: number;
}

export const NixtioDockSidebar: React.FC<NixtioDockSidebarProps> = ({
  activeView,
  onSelectView,
  onNewChat,
  memoryCount,
}) => {
  return (
    <div className="w-16 md:w-20 bg-transparent flex flex-col items-center justify-between py-6 px-2 select-none shrink-0 z-30">
      {/* Top Controls */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Black Round Plus Action Button */}
        <button
          onClick={onNewChat}
          className="w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer group"
          title="New Conversation & Context"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Floating Capsule Dock */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-neutral-200/50 rounded-full p-1.5 flex flex-col items-center gap-2">
          {/* Search / Command palette */}
          <button
            onClick={() => onSelectView('home')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeView === 'home'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Assistant Home"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Explore / Feed */}
          <button
            onClick={() => onSelectView('chat')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              activeView === 'chat'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Live Chat & Memory Workspace"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* ClariLayer & Context */}
          <button
            onClick={() => onSelectView('context')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              activeView === 'context'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="ClariLayer Personal Context Layer"
          >
            <Grid className="w-4 h-4" />
            {memoryCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          {/* Sessions & History */}
          <button
            onClick={() => onSelectView('history')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeView === 'history'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Sessions History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Brand Icon */}
      <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md font-black text-sm tracking-tighter cursor-pointer hover:scale-105 transition-transform">
        <span>N</span>
      </div>
    </div>
  );
};
