import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ScreenPreset } from '../types/qbasic';
import { SCREEN_PRESETS } from '../utils/palettes';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface ImageControlsProps {
  selectedPreset: ScreenPreset;
  onSelectPreset: (preset: ScreenPreset) => void;
  customWidth: number;
  customHeight: number;
  onChangeCustomDimensions: (w: number, h: number) => void;
  fitMode: 'stretch' | 'contain' | 'cover';
  onChangeFitMode: (mode: 'stretch' | 'contain' | 'cover') => void;
  onImageSelected: (dataUrl: string) => void;
  activeSampleId: string;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  selectedPreset,
  onSelectPreset,
  customWidth,
  customHeight,
  onChangeCustomDimensions,
  fitMode,
  onChangeFitMode,
  onImageSelected,
  activeSampleId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelected(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelected(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 text-xs text-neutral-300">
      {/* Sample Retro Graphics */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
            Retro Sample Graphics
          </span>
          <span className="text-[11px] text-neutral-500">Instant test scenes</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onImageSelected(sample.generate())}
              className={`text-left p-2 rounded border transition-colors ${
                activeSampleId === sample.id
                  ? 'bg-neutral-800 border-blue-500 text-white shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="font-medium text-xs text-neutral-200 truncate">
                {sample.name}
              </div>
              <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                {sample.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload or Drop Area */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="p-3.5 border border-dashed border-neutral-700 hover:border-neutral-500 rounded bg-neutral-900/60 hover:bg-neutral-900 text-center cursor-pointer transition-colors"
        >
          <Upload className="w-4 h-4 mx-auto mb-1.5 text-neutral-400" />
          <div className="font-medium text-neutral-200">
            Click to upload custom image or drag & drop
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            PNG, JPG, WebP, GIF, or paste from clipboard (Ctrl+V)
          </div>
        </div>
      </div>

      {/* Target Resolution & Screen Preset */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
            Target QBasic Resolution
          </span>
          <span className="text-[11px] text-neutral-500 font-mono tabular-nums">
            {customWidth} × {customHeight} px
          </span>
        </div>
        <select
          value={selectedPreset.id}
          onChange={(e) => {
            const preset = SCREEN_PRESETS.find((p) => p.id === e.target.value);
            if (preset) {
              onSelectPreset(preset);
              onChangeCustomDimensions(preset.width, preset.height);
            }
          }}
          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 font-mono"
        >
          {SCREEN_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-neutral-500 mt-1 italic">
          {selectedPreset.description}
        </p>
      </div>

      {/* Custom Dimensions Override & Fit Mode */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/80">
        <div>
          <label className="block text-[10px] uppercase text-neutral-400 mb-1">
            Width
          </label>
          <input
            type="number"
            min="8"
            max="1280"
            step="8"
            value={customWidth}
            onChange={(e) =>
              onChangeCustomDimensions(
                Math.max(8, parseInt(e.target.value) || 8),
                customHeight
              )
            }
            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 font-mono tabular-nums focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-neutral-400 mb-1">
            Height
          </label>
          <input
            type="number"
            min="8"
            max="1024"
            value={customHeight}
            onChange={(e) =>
              onChangeCustomDimensions(
                customWidth,
                Math.max(8, parseInt(e.target.value) || 8)
              )
            }
            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 font-mono tabular-nums focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-neutral-400 mb-1">
            Fit Mode
          </label>
          <select
            value={fitMode}
            onChange={(e) => onChangeFitMode(e.target.value as any)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
          >
            <option value="stretch">Stretch (DOS)</option>
            <option value="contain">Fit (Letterbox)</option>
            <option value="cover">Crop (Fill)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
