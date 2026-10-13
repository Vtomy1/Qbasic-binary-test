import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Laptop,
  HelpCircle,
} from 'lucide-react';
import { ConversionResult } from '../types/qbasic';
import {
  generateQBasicDataStatements,
  generateQBasicLoaderCode,
  generateQBasicSaverCode,
} from '../utils/qbasicCodeGenerator';

interface CodeSamplesProps {
  result: ConversionResult | null;
  filename: string;
  onChangeFilename: (fn: string) => void;
  onDownloadBas: (code: string, filename: string) => void;
}

export const CodeSamples: React.FC<CodeSamplesProps> = ({
  result,
  filename,
  onChangeFilename,
  onDownloadBas,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<
    'loader' | 'saver' | 'data'
  >('loader');
  const [retroIdeTheme, setRetroIdeTheme] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!result) {
    return (
      <div className="p-8 text-center text-neutral-500 text-sm">
        Process an image first to generate loader/saver code.
      </div>
    );
  }

  const baseFileName = filename.replace(/\.[^/.]+$/, '').toUpperCase();
  const binName = `${baseFileName}.BIN`;

  let activeCode = '';
  let downloadBasName = 'LOADER.BAS';

  if (activeCodeTab === 'loader') {
    activeCode = generateQBasicLoaderCode({ filename: binName, result });
    downloadBasName = `${baseFileName}_LOAD.BAS`;
  } else if (activeCodeTab === 'saver') {
    activeCode = generateQBasicSaverCode({ filename: binName, result });
    downloadBasName = `${baseFileName}_SAVE.BAS`;
  } else {
    activeCode = generateQBasicDataStatements(result);
    downloadBasName = `${baseFileName}_DATA.BAS`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax highlighter for QBasic
  const renderHighlightedCode = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, lIdx) => {
      // Check if full comment line
      const trimmed = line.trim();
      if (trimmed.startsWith("'") || trimmed.startsWith('REM ')) {
        return (
          <div key={lIdx} className={retroIdeTheme ? 'text-cyan-300' : 'text-neutral-500 italic'}>
            {line}
          </div>
        );
      }

      // Tokenize by string literals and words
      const parts = line.split(/("[^"]*")/g);
      return (
        <div key={lIdx} className="whitespace-pre">
          {parts.map((part, pIdx) => {
            if (part.startsWith('"') && part.endsWith('"')) {
              return (
                <span
                  key={pIdx}
                  className={retroIdeTheme ? 'text-amber-300' : 'text-emerald-400'}
                >
                  {part}
                </span>
              );
            }

            // Highlight words
            const words = part.split(/(\b[A-Za-z0-9_$%&!#]+\b)/g);
            return words.map((word, wIdx) => {
              const upper = word.toUpperCase();
              const keywords = [
                'OPEN', 'FOR', 'BINARY', 'AS', 'SCREEN', 'DEFINT', 'DEF', 'SEG',
                'BLOAD', 'BSAVE', 'GET', 'PUT', 'PSET', 'POKE', 'PEEK', 'OUT',
                'INKEY$', 'WIDTH', 'CLS', 'PRINT', 'DIM', 'NEXT', 'IF', 'THEN',
                'ELSE', 'END', 'LOCATE', 'WHILE', 'WEND', 'FREEFILE', 'SPACE$',
                'CHR$', 'ASC', 'MID$', 'AND', 'OR', 'NOT', 'STEP', 'TO', 'READ',
                'RESTORE', 'DATA', 'COLOR', 'DO', 'LOOP', 'SYSTEM', '_RGB32',
                '_NEWIMAGE', '_LIMIT', '_TITLE', '_RED32', '_GREEN32', '_BLUE32',
                '_SHL', '_SHR', '_UNSIGNED', '_INTEGER',
              ];

              if (keywords.includes(upper)) {
                return (
                  <span
                    key={wIdx}
                    className={
                      retroIdeTheme
                        ? 'text-yellow-300 font-bold'
                        : 'text-blue-400 font-semibold'
                    }
                  >
                    {word}
                  </span>
                );
              }

              if (upper.startsWith('&H') || !isNaN(Number(word))) {
                return (
                  <span
                    key={wIdx}
                    className={
                      retroIdeTheme ? 'text-white' : 'text-amber-400'
                    }
                  >
                    {word}
                  </span>
                );
              }

              return (
                <span
                  key={wIdx}
                  className={retroIdeTheme ? 'text-white' : 'text-neutral-200'}
                >
                  {word}
                </span>
              );
            });
          })}
        </div>
      );
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded flex flex-col h-full text-xs">
      {/* Top Header & Filename config */}
      <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-900">
        <div className="flex items-center gap-3">
          <FileCode className="w-4 h-4 text-blue-400" />
          <div>
            <span className="font-semibold text-neutral-100 text-sm">
              QBasic Loader & Saver Code Samples
            </span>
            <div className="text-[11px] text-neutral-400">
              Generated for {result.width}×{result.height} · {result.bitDepth}-bit · {result.qbasicScreenMode}
            </div>
          </div>
        </div>

        {/* Binary Filename configuration */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-neutral-400 uppercase tracking-wider">
            Binary Filename:
          </label>
          <input
            type="text"
            value={filename}
            onChange={(e) => onChangeFilename(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono uppercase focus:outline-none focus:border-blue-500 w-32"
          />
        </div>
      </div>

      {/* Code Type Tabs & IDE theme toggle */}
      <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveCodeTab('loader')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeCodeTab === 'loader'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Binary Loader (GET / BLOAD)
          </button>
          <button
            onClick={() => setActiveCodeTab('saver')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeCodeTab === 'saver'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Binary Saver (PUT / BSAVE)
          </button>
          <button
            onClick={() => setActiveCodeTab('data')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeCodeTab === 'data'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Embedded DATA Statements
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setRetroIdeTheme(!retroIdeTheme)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] border transition-colors ${
              retroIdeTheme
                ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3 h-3" />
            <span>{retroIdeTheme ? 'DOS QBasic Theme' : 'Modern Dark Theme'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs transition-colors border border-neutral-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          {/* Download .BAS */}
          <button
            onClick={() => onDownloadBas(activeCode, downloadBasName)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {downloadBasName}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div
        className={`flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed selection:bg-neutral-600 ${
          retroIdeTheme
            ? 'bg-[#0000a8] text-white border-y border-neutral-700'
            : 'bg-neutral-950 text-neutral-200'
        }`}
      >
        {retroIdeTheme && (
          <div className="pb-3 mb-3 border-b border-blue-400/30 text-blue-200 text-[11px] flex items-center justify-between">
            <span>Microsoft (R) QuickBASIC / QBasic 1.1 - [{downloadBasName}]</span>
            <span>Shift+F5: Start · F6: Next Window</span>
          </div>
        )}
        <div className="font-mono text-[12px]">
          {renderHighlightedCode(activeCode)}
        </div>
      </div>

      {/* Quick DOSBox / QB64 Quick-Start Instructions */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-neutral-400 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>
            <strong>Running in DOSBox:</strong> Place <code className="text-neutral-200 bg-neutral-950 px-1 py-0.5 rounded">{binName}</code> and <code className="text-neutral-200 bg-neutral-950 px-1 py-0.5 rounded">{downloadBasName}</code> in your mounted DOS directory, then run <code className="text-neutral-200 bg-neutral-950 px-1 py-0.5 rounded">QBASIC /RUN {downloadBasName}</code>.
          </span>
        </div>
        <span className="text-neutral-500 hidden sm:inline">100% genuine QBasic syntax</span>
      </div>
    </div>
  );
};
