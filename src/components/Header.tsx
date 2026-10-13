import React from 'react';
import { Download, Monitor, Terminal, FileCode2 } from 'lucide-react';

interface HeaderProps {
  onExportAll: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportAll,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-900 border-b border-neutral-800 text-neutral-200">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-mono font-bold text-white text-sm shadow-sm border border-blue-500">
          QB
        </div>
        <span className="font-semibold text-base text-white tracking-tight">
          QBasic Binary Studio
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
        <button
          onClick={() => setActiveTab('studio')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'studio'
              ? 'text-white border-blue-500'
              : 'border-transparent'
          }`}
        >
          Image Converter
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'code'
              ? 'text-white border-blue-500'
              : 'border-transparent'
          }`}
        >
          QBasic Loader & Saver
        </button>
        <button
          onClick={() => setActiveTab('hex')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'hex'
              ? 'text-white border-blue-500'
              : 'border-transparent'
          }`}
        >
          Binary Hex Inspector
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'specs'
              ? 'text-white border-blue-500'
              : 'border-transparent'
          }`}
        >
          Memory & Format Specs
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onExportAll}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 border border-blue-400 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export .BIN & .BAS Bundle</span>
        </button>
      </div>
    </header>
  );
};
