import React from 'react';
import { Sparkles, Check, X, Shield, Zap, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-white max-w-lg w-full overflow-hidden p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Upgrade to MemStudio Pro</h2>
              <p className="text-xs text-neutral-500">Unlimited persistent context, deep research & agent swarms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white space-y-4 shadow-xl">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Pro Annual</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">$19</span>
              <span className="text-xs text-neutral-400">/month</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Unlimited cross-session durable memory shards</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>ClariLayer continuous schema drift reconciliation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Full Deep Research agent & multimodal voice transcription</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>OpenMemory MCP + Python FastAPI server export</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert('Pro features already enabled in your environment!');
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Activate Pro Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
