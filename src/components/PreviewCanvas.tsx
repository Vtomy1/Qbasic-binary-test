import React, { useRef, useEffect, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Tv,
  Grid,
  Download,
  Eye,
  Columns,
} from 'lucide-react';
import { ConversionResult, RGBColor } from '../types/qbasic';

interface PreviewCanvasProps {
  sourceImageData: ImageData | null;
  conversionResult: ConversionResult | null;
  onDownloadPng: () => void;
  aspect43Preferred?: boolean;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  sourceImageData,
  conversionResult,
  onDownloadPng,
  aspect43Preferred = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [zoom, setZoom] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'dithered' | 'split' | 'original'>('dithered');
  const [splitPos, setSplitPos] = useState<number>(0.5); // 0 to 1
  const [crtAspect, setCrtAspect] = useState<boolean>(aspect43Preferred);
  const [scanlines, setScanlines] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Probe tooltip state
  const [hoverPixel, setHoverPixel] = useState<{
    x: number;
    y: number;
    color: RGBColor;
    index: number;
    byteOffset: number;
  } | null>(null);

  // Render onto canvas
  useEffect(() => {
    if (!canvasRef.current || !conversionResult) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, previewImageData } = conversionResult;
    canvas.width = width;
    canvas.height = height;

    if (viewMode === 'dithered') {
      ctx.putImageData(previewImageData, 0, 0);
    } else if (viewMode === 'original' && sourceImageData) {
      ctx.putImageData(sourceImageData, 0, 0);
    } else if (viewMode === 'split' && sourceImageData) {
      // Draw dithered first
      ctx.putImageData(previewImageData, 0, 0);

      // Draw original on the left side up to splitPos
      const splitX = Math.floor(width * splitPos);
      if (splitX > 0) {
        // Create temp canvas for clipping
        const temp = document.createElement('canvas');
        temp.width = width;
        temp.height = height;
        const tempCtx = temp.getContext('2d')!;
        tempCtx.putImageData(sourceImageData, 0, 0);

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, height);
        ctx.clip();
        ctx.drawImage(temp, 0, 0);
        // Draw split divider line
        ctx.restore();
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(splitX - 1, 0, 2, height);
      }
    }
  }, [conversionResult, sourceImageData, viewMode, splitPos]);

  // Handle Mouse Probe
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!conversionResult || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < conversionResult.width && y >= 0 && y < conversionResult.height) {
      const pIdx = y * conversionResult.width + x;
      const index = conversionResult.pixelIndices[pIdx] || 0;
      const data = conversionResult.previewImageData.data;
      const r = data[pIdx * 4];
      const g = data[pIdx * 4 + 1];
      const b = data[pIdx * 4 + 2];

      // Calculate byte offset in binary payload
      let byteOffset = 0;
      const bpp = conversionResult.bitDepth;
      if (bpp === 1) {
        byteOffset = y * Math.ceil(conversionResult.width / 8) + (x >> 3);
      } else if (bpp === 2) {
        byteOffset = y * Math.ceil(conversionResult.width / 4) + (x >> 2);
      } else if (bpp === 3 || bpp === 4) {
        byteOffset = y * Math.ceil(conversionResult.width / 2) + (x >> 1);
      } else if (bpp === 6 || bpp === 8) {
        byteOffset = pIdx;
      } else if (bpp === 16) {
        byteOffset = pIdx * 2;
      } else if (bpp === 24) {
        byteOffset = pIdx * 3;
      } else if (bpp === 32) {
        byteOffset = pIdx * 4;
      }

      setHoverPixel({
        x,
        y,
        color: [r, g, b],
        index,
        byteOffset: conversionResult.headerSizeBytes + conversionResult.paletteSizeBytes + byteOffset,
      });
    } else {
      setHoverPixel(null);
    }
  };

  if (!conversionResult) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-neutral-500 text-sm">
        Processing image...
      </div>
    );
  }

  const { width, height } = conversionResult;
  // Aspect ratio adjustment: If CRT aspect is enabled and original is 320x200 (1.6:1), stretch vertically to 4:3 (scale Y by 1.2)
  const isDos320x200 = width === 320 && height === 200;
  const isDos640x200 = width === 640 && height === 200;
  const isDos640x350 = width === 640 && height === 350;

  const yStretch = crtAspect
    ? isDos320x200
      ? 1.2
      : isDos640x200
      ? 2.4
      : isDos640x350
      ? 1.37
      : 1.0
    : 1.0;

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs">
        {/* View Mode Segmented Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded border border-neutral-800">
          <button
            onClick={() => setViewMode('dithered')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'dithered'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Dithered Binary
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Split Compare
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'original'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Original
          </button>
        </div>

        {/* Display Toggles: CRT 4:3, Scanlines, Pixel Grid */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCrtAspect(!crtAspect)}
            title="Toggle authentic DOS 4:3 CRT monitor aspect ratio correction"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
              crtAspect
                ? 'bg-neutral-800 border-blue-500 text-blue-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>4:3 CRT</span>
          </button>

          <button
            onClick={() => setScanlines(!scanlines)}
            title="Toggle phosphor CRT scanlines"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
              scanlines
                ? 'bg-neutral-800 border-blue-500 text-blue-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>Scanlines</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle pixel grid lines"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
              showGrid
                ? 'bg-neutral-800 border-blue-500 text-blue-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded border border-neutral-800">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 1))}
              className="p-1 hover:text-white text-neutral-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-neutral-300 px-1 tabular-nums">
              {zoom}×
            </span>
            <button
              onClick={() => setZoom(Math.min(8, zoom + 1))}
              className="p-1 hover:text-white text-neutral-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onDownloadPng}
            title="Export rendered retro image as PNG"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PNG</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport Area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto p-4 flex items-center justify-center bg-neutral-950 select-none"
        onMouseLeave={() => setHoverPixel(null)}
      >
        <div
          className="relative inline-block border border-neutral-800 shadow-2xl transition-transform"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            style={{
              imageRendering: 'pixelated',
              width: `${width}px`,
              height: `${Math.round(height * yStretch)}px`,
              display: 'block',
            }}
          />

          {/* CRT Scanline Overlay */}
          {scanlines && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 2px)',
                backgroundSize: '100% 2px',
              }}
            />
          )}

          {/* Pixel Grid Overlay (when enabled) */}
          {showGrid && zoom >= 2 && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
                backgroundSize: `${100 / width}% ${100 / height}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Split Slider Control when in Split Mode */}
      {viewMode === 'split' && (
        <div className="px-4 py-2 bg-neutral-900 border-t border-neutral-800 flex items-center gap-3 text-xs">
          <span className="text-neutral-400">Original</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={splitPos}
            onChange={(e) => setSplitPos(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-neutral-800 rounded appearance-none accent-blue-500 cursor-pointer"
          />
          <span className="text-neutral-400">Dithered</span>
        </div>
      )}

      {/* Bottom Status / Probe Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <span>
            {width} × {height} px
          </span>
          <span aria-hidden="true">·</span>
          <span>{conversionResult.bitDepth}-bit color</span>
          <span aria-hidden="true">·</span>
          <span>{conversionResult.qbasicScreenMode}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {(conversionResult.fileSizeBytes / 1024).toFixed(2)} KB (
            {conversionResult.fileSizeBytes} bytes)
          </span>
        </div>

        {/* Hover Probe Coordinates and Value */}
        {hoverPixel ? (
          <div className="flex items-center gap-2 text-neutral-200">
            <span>
              X: {hoverPixel.x} Y: {hoverPixel.y}
            </span>
            <span aria-hidden="true">·</span>
            <span>Index: {hoverPixel.index}</span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-none border border-white/20 inline-block"
                style={{
                  backgroundColor: `rgb(${hoverPixel.color[0]}, ${hoverPixel.color[1]}, ${hoverPixel.color[2]})`,
                }}
              />
              <span>
                RGB({hoverPixel.color[0]},{hoverPixel.color[1]},{hoverPixel.color[2]})
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-400">
              Offset: &H{hoverPixel.byteOffset.toString(16).toUpperCase()}
            </span>
          </div>
        ) : (
          <span className="text-neutral-500">Hover canvas to inspect pixel byte</span>
        )}
      </div>
    </div>
  );
};
