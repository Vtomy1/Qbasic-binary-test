import React from 'react';
import {
  BitDepth,
  DitherAlgorithm,
  HeaderMode,
  ImageAdjustments,
  PalettePreset,
  RGBColor,
} from '../types/qbasic';
import { Sliders, RotateCcw } from 'lucide-react';

interface DitherControlsProps {
  bitDepth: BitDepth;
  onSelectBitDepth: (bpp: BitDepth) => void;
  algorithm: DitherAlgorithm;
  onSelectAlgorithm: (algo: DitherAlgorithm) => void;
  strength: number;
  onChangeStrength: (s: number) => void;
  availablePalettes: PalettePreset[];
  activePaletteId: string;
  onSelectPalette: (palette: PalettePreset) => void;
  currentPaletteColors: RGBColor[];
  headerMode: HeaderMode;
  onChangeHeaderMode: (mode: HeaderMode) => void;
  includeCustomPalette: boolean;
  onToggleIncludeCustomPalette: (include: boolean) => void;
  adjustments: ImageAdjustments;
  onChangeAdjustments: (adj: ImageAdjustments) => void;
  onResetAdjustments: () => void;
}

const BIT_DEPTHS: { bpp: BitDepth; label: string; colors: string; desc: string }[] = [
  { bpp: 1, label: '1-bit', colors: '2 colors', desc: 'Monochrome (Screen 11 / 2)' },
  { bpp: 2, label: '2-bit', colors: '4 colors', desc: 'CGA 4 colors (Screen 1)' },
  { bpp: 3, label: '3-bit', colors: '8 colors', desc: '8 RGB Primaries' },
  { bpp: 4, label: '4-bit', colors: '16 colors', desc: 'EGA/VGA (Screen 7 / 9 / 12)' },
  { bpp: 6, label: '6-bit', colors: '64 colors', desc: 'EGA 64-color Hardware Palette' },
  { bpp: 8, label: '8-bit', colors: '256 colors', desc: 'VGA SCREEN 13 standard' },
  { bpp: 16, label: '16-bit', colors: '65,536 colors', desc: 'HighColor RGB 5:6:5' },
  { bpp: 24, label: '24-bit', colors: '16.7M colors', desc: 'TrueColor BGR binary' },
  { bpp: 32, label: '32-bit', colors: 'RGBA TrueColor', desc: '32-bit LONG / QB64' },
];

const DITHER_ALGORITHMS: { id: DitherAlgorithm; name: string; category: string }[] = [
  { id: 'floyd-steinberg', name: 'Floyd-Steinberg', category: 'Error Diffusion' },
  { id: 'atkinson', name: 'Atkinson (Classic Mac/HyperCard)', category: 'Error Diffusion' },
  { id: 'bayer-4x4', name: 'Bayer 4×4 (Ordered Matrix)', category: 'Ordered' },
  { id: 'bayer-8x8', name: 'Bayer 8×8 (Fine Matrix)', category: 'Ordered' },
  { id: 'bayer-2x2', name: 'Bayer 2×2 (Coarse Cross)', category: 'Ordered' },
  { id: 'burkes', name: 'Burkes (Fast Diffusion)', category: 'Error Diffusion' },
  { id: 'sierra-3', name: 'Sierra 3-Line', category: 'Error Diffusion' },
  { id: 'sierra-lite', name: 'Sierra Lite', category: 'Error Diffusion' },
  { id: 'jarvis-judice-ninke', name: 'Jarvis-Judice-Ninke', category: 'Error Diffusion' },
  { id: 'none', name: 'None (Threshold / Direct)', category: 'Nearest' },
];

export const DitherControls: React.FC<DitherControlsProps> = ({
  bitDepth,
  onSelectBitDepth,
  algorithm,
  onSelectAlgorithm,
  strength,
  onChangeStrength,
  availablePalettes,
  activePaletteId,
  onSelectPalette,
  currentPaletteColors,
  headerMode,
  onChangeHeaderMode,
  includeCustomPalette,
  onToggleIncludeCustomPalette,
  adjustments,
  onChangeAdjustments,
  onResetAdjustments,
}) => {
  return (
    <div className="space-y-4 text-xs text-neutral-300">
      {/* 1. Bit Depth Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
            Color Depth (Bit Depth)
          </span>
          <span className="text-[11px] text-blue-400 font-mono">
            {bitDepth}-bit · {BIT_DEPTHS.find((b) => b.bpp === bitDepth)?.colors}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {BIT_DEPTHS.map((item) => (
            <button
              key={item.bpp}
              onClick={() => onSelectBitDepth(item.bpp)}
              className={`p-2 rounded text-left border transition-colors ${
                bitDepth === item.bpp
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="font-semibold text-xs">{item.label}</div>
              <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                {item.colors}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Dithering Algorithm Selector & Strength */}
      <div className="pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
            Dithering Algorithm
          </span>
          <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
            Intensity: {Math.round(strength * 100)}%
          </span>
        </div>
        <select
          value={algorithm}
          onChange={(e) => onSelectAlgorithm(e.target.value as DitherAlgorithm)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
        >
          {DITHER_ALGORITHMS.map((algo) => (
            <option key={algo.id} value={algo.id}>
              {algo.name}
            </option>
          ))}
        </select>

        {algorithm !== 'none' && (
          <div className="mt-2.5">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={strength}
              onChange={(e) => onChangeStrength(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}
      </div>

      {/* 3. Palette Selection (when bitDepth <= 8) */}
      {bitDepth <= 8 && availablePalettes.length > 0 && (
        <div className="pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
              Hardware Palette
            </span>
            <span className="text-[11px] text-neutral-500">
              {currentPaletteColors.length} colors
            </span>
          </div>

          <select
            value={activePaletteId}
            onChange={(e) => {
              const pal = availablePalettes.find((p) => p.id === e.target.value);
              if (pal) onSelectPalette(pal);
            }}
            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 mb-2"
          >
            {availablePalettes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Palette Color Swatches Preview */}
          <div className="flex flex-wrap gap-0.5 p-1.5 bg-neutral-950 rounded border border-neutral-800 max-h-24 overflow-y-auto">
            {currentPaletteColors.slice(0, 256).map((col, idx) => (
              <div
                key={idx}
                title={`#${idx}: RGB(${col[0]}, ${col[1]}, ${col[2]})`}
                className="w-3.5 h-3.5 rounded-none border border-black/40 shrink-0"
                style={{
                  backgroundColor: `rgb(${col[0]}, ${col[1]}, ${col[2]})`,
                }}
              />
            ))}
          </div>

          {bitDepth === 8 && activePaletteId === 'vga-adaptive-256' && (
            <label className="flex items-center gap-2 mt-2 text-[11px] text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCustomPalette}
                onChange={(e) => onToggleIncludeCustomPalette(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-500 focus:ring-0"
              />
              <span>
                Embed 768-byte VGA DAC hardware palette in .BIN header
              </span>
            </label>
          )}
        </div>
      )}

      {/* 4. Binary File Header Format */}
      <div className="pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
            Binary File Header
          </span>
          <span className="text-[11px] text-neutral-500 uppercase font-mono">
            {headerMode}
          </span>
        </div>
        <select
          value={headerMode}
          onChange={(e) => onChangeHeaderMode(e.target.value as HeaderMode)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
        >
          <option value="raw">Raw Binary (No Header - Pure Pixel Stream)</option>
          <option value="qb-header">Structured "QB" Header (8 bytes metadata)</option>
          <option value="qb-put">QBasic PUT Array Header (4 bytes GET/PUT format)</option>
          <option value="dos-bsave">DOS BSAVE Header (7 bytes &HA000 BLOAD format)</option>
        </select>
      </div>

      {/* 5. Pre-Processing Adjustments (Brightness, Contrast, Gamma, Invert) */}
      <div className="pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
              Pre-Dither Adjustments
            </span>
          </div>
          <button
            onClick={onResetAdjustments}
            className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
              <span>Brightness</span>
              <span className="font-mono tabular-nums">{adjustments.brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.brightness}
              onChange={(e) =>
                onChangeAdjustments({
                  ...adjustments,
                  brightness: parseInt(e.target.value),
                })
              }
              className="w-full h-1 bg-neutral-800 rounded appearance-none accent-neutral-300"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
              <span>Contrast</span>
              <span className="font-mono tabular-nums">{adjustments.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.contrast}
              onChange={(e) =>
                onChangeAdjustments({
                  ...adjustments,
                  contrast: parseInt(e.target.value),
                })
              }
              className="w-full h-1 bg-neutral-800 rounded appearance-none accent-neutral-300"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
              <span>Gamma</span>
              <span className="font-mono tabular-nums">{adjustments.gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.05"
              value={adjustments.gamma}
              onChange={(e) =>
                onChangeAdjustments({
                  ...adjustments,
                  gamma: parseFloat(e.target.value),
                })
              }
              className="w-full h-1 bg-neutral-800 rounded appearance-none accent-neutral-300"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={adjustments.invert}
                onChange={(e) =>
                  onChangeAdjustments({ ...adjustments, invert: e.target.checked })
                }
                className="rounded bg-neutral-800 border-neutral-700 text-blue-500"
              />
              <span>Invert</span>
            </label>

            <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={adjustments.grayscaleFirst}
                onChange={(e) =>
                  onChangeAdjustments({
                    ...adjustments,
                    grayscaleFirst: e.target.checked,
                  })
                }
                className="rounded bg-neutral-800 border-neutral-700 text-blue-500"
              />
              <span>Grayscale First</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
