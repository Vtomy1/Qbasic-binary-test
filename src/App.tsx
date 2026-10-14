/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import {
  BitDepth,
  ConversionResult,
  DitherAlgorithm,
  HeaderMode,
  ImageAdjustments,
  PalettePreset,
  RGBColor,
  ScreenPreset,
} from './types/qbasic';
import {
  PALETTES_1BIT,
  PALETTES_2BIT,
  PALETTES_3BIT,
  PALETTES_4BIT,
  PALETTES_6BIT,
  PALETTES_8BIT,
  SCREEN_PRESETS,
  extractAdaptivePalette,
} from './utils/palettes';
import { processAndDitherImage } from './utils/dithering';
import { packToQBasicBinary } from './utils/binaryPacker';
import {
  generateQBasicLoaderCode,
  generateQBasicSaverCode,
} from './utils/qbasicCodeGenerator';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { Header } from './components/Header';
import { ImageControls } from './components/ImageControls';
import { DitherControls } from './components/DitherControls';
import { PreviewCanvas } from './components/PreviewCanvas';
import { HexViewer } from './components/HexViewer';
import { CodeSamples } from './components/CodeSamples';
import { FormatExplainer } from './components/FormatExplainer';
import { Image, SlidersHorizontal, Terminal, Binary, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('studio');

  // Image source state
  const [sourceDataUrl, setSourceDataUrl] = useState<string>('');
  const [activeSampleId, setActiveSampleId] = useState<string>('cyber-sunset');

  // Screen resolution presets
  const [selectedPreset, setSelectedPreset] = useState<ScreenPreset>(
    SCREEN_PRESETS[0] // 320x200 SCREEN 13
  );
  const [customWidth, setCustomWidth] = useState<number>(320);
  const [customHeight, setCustomHeight] = useState<number>(200);
  const [fitMode, setFitMode] = useState<'stretch' | 'contain' | 'cover'>('stretch');

  // Dithering & color depth
  const [bitDepth, setBitDepth] = useState<BitDepth>(8);
  const [ditherAlgorithm, setDitherAlgorithm] = useState<DitherAlgorithm>('floyd-steinberg');
  const [ditherStrength, setDitherStrength] = useState<number>(0.85);

  // Palettes
  const [activePaletteId, setActivePaletteId] = useState<string>('vga-256');
  const [includeCustomPalette, setIncludeCustomPalette] = useState<boolean>(false);

  // Header & Output
  const [headerMode, setHeaderMode] = useState<HeaderMode>('qb-header');
  const [filename, setFilename] = useState<string>('IMAGE.BIN');

  // Pre-adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    gamma: 1.0,
    invert: false,
    grayscaleFirst: false,
  });

  // Active conversion result & processed data
  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // Initialize with first sample image
  useEffect(() => {
    const defaultSample = SAMPLE_IMAGES[0];
    if (defaultSample) {
      setSourceDataUrl(defaultSample.generate());
      setActiveSampleId(defaultSample.id);
    }
  }, []);

  // Listen for paste event anywhere on page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setSourceDataUrl(event.target.result as string);
                setActiveSampleId('');
              }
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Get available palettes for the current bit depth
  const getAvailablePalettesForBpp = useCallback((bpp: BitDepth): PalettePreset[] => {
    switch (bpp) {
      case 1:
        return PALETTES_1BIT;
      case 2:
        return PALETTES_2BIT;
      case 3:
        return PALETTES_3BIT;
      case 4:
        return PALETTES_4BIT;
      case 6:
        return PALETTES_6BIT;
      case 8:
        return PALETTES_8BIT;
      default:
        return [];
    }
  }, []);

  // Sync palette ID when bit depth changes
  const handleSelectBitDepth = (newBpp: BitDepth) => {
    setBitDepth(newBpp);
    const pals = getAvailablePalettesForBpp(newBpp);
    if (pals.length > 0) {
      setActivePaletteId(pals[0].id);
    }
  };

  // Find active palette colors
  const getActivePaletteColors = useCallback((): RGBColor[] => {
    if (bitDepth > 8) return [];
    const available = getAvailablePalettesForBpp(bitDepth);
    const selected = available.find((p) => p.id === activePaletteId);
    return selected ? selected.colors : available[0]?.colors || [];
  }, [bitDepth, activePaletteId, getAvailablePalettesForBpp]);

  // Main Conversion Pipeline effect
  useEffect(() => {
    if (!sourceDataUrl) return;

    let isCurrent = true;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!isCurrent) return;

      // 1. Render onto offscreen canvas with target dimensions
      const offCanvas = document.createElement('canvas');
      offCanvas.width = customWidth;
      offCanvas.height = customHeight;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) return;

      // Handle fit modes
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, customWidth, customHeight);

      if (fitMode === 'stretch') {
        ctx.drawImage(img, 0, 0, customWidth, customHeight);
      } else if (fitMode === 'contain') {
        const hRatio = customWidth / img.width;
        const vRatio = customHeight / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (customWidth - img.width * ratio) / 2;
        const centerShiftY = (customHeight - img.height * ratio) / 2;
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
      } else {
        // cover
        const hRatio = customWidth / img.width;
        const vRatio = customHeight / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (customWidth - img.width * ratio) / 2;
        const centerShiftY = (customHeight - img.height * ratio) / 2;
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
      }

      const rawImageData = ctx.getImageData(0, 0, customWidth, customHeight);

      // 2. Compute palette if 8-bit adaptive
      let currentPalette: RGBColor[] = [];
      if (bitDepth <= 8) {
        if (bitDepth === 8 && activePaletteId === 'vga-adaptive-256') {
          currentPalette = extractAdaptivePalette(rawImageData, 256);
        } else {
          const available = getAvailablePalettesForBpp(bitDepth);
          const selected = available.find((p) => p.id === activePaletteId);
          currentPalette = selected ? selected.colors : (available[0]?.colors || []);
        }
      }

      // 3. Process image and apply dithering
      const ditherResult = processAndDitherImage(rawImageData, {
        algorithm: ditherAlgorithm,
        strength: ditherStrength,
        adjustments,
        palette: currentPalette,
        bitDepth,
      });

      // 4. Pack into target QBasic binary
      const packResult = packToQBasicBinary({
        width: customWidth,
        height: customHeight,
        bitDepth,
        headerMode,
        pixelIndices: ditherResult.pixelIndices,
        pixelColors: ditherResult.pixelColors,
        palette: currentPalette,
        includeCustomPalette:
          includeCustomPalette && activePaletteId === 'vga-adaptive-256',
      });

      if (isCurrent) {
        setSourceImageData(rawImageData);
        setConversionResult(packResult);
      }
    };

    img.src = sourceDataUrl;

    return () => {
      isCurrent = false;
    };
  }, [
    sourceDataUrl,
    customWidth,
    customHeight,
    fitMode,
    bitDepth,
    ditherAlgorithm,
    ditherStrength,
    adjustments,
    activePaletteId,
    includeCustomPalette,
    headerMode,
    getAvailablePalettesForBpp,
  ]);

  // Download helpers
  const handleDownloadBin = () => {
    if (!conversionResult) return;
    const blob = new Blob([conversionResult.binaryData as BlobPart], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.toUpperCase().endsWith('.BIN')
      ? filename.toUpperCase()
      : `${filename.toUpperCase()}.BIN`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBas = (code: string, basName: string) => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = basName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!conversionResult) return;
    const canvas = document.createElement('canvas');
    canvas.width = conversionResult.width;
    canvas.height = conversionResult.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(conversionResult.previewImageData, 0, 0);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${filename.replace(/\.[^/.]+$/, '')}_retro.png`;
    a.click();
  };

  // Export full ZIP package
  const handleExportAll = async () => {
    if (!conversionResult) return;
    const zip = new JSZip();

    const baseName = filename.replace(/\.[^/.]+$/, '').toUpperCase();
    const binName = `${baseName}.BIN`;
    const loaderName = `${baseName}_LOAD.BAS`;
    const saverName = `${baseName}_SAVE.BAS`;

    // 1. Binary file
    zip.file(binName, conversionResult.binaryData);

    // 2. QBasic Loader BAS
    const loaderCode = generateQBasicLoaderCode({
      filename: binName,
      result: conversionResult,
    });
    zip.file(loaderName, loaderCode);

    // 3. QBasic Saver BAS
    const saverCode = generateQBasicSaverCode({
      filename: binName,
      result: conversionResult,
    });
    zip.file(saverName, saverCode);

    // 4. README with DOSBox setup instructions
    const readme = `===================================================================
QBasic Binary Image Studio - Quick Start Guide
===================================================================
Files included:
- ${binName} : Packed binary image (${conversionResult.width}x${conversionResult.height}, ${conversionResult.bitDepth}-bit)
- ${loaderName} : QuickBASIC 4.5 / QBasic 1.1 Loader program
- ${saverName} : QuickBASIC 4.5 / QBasic 1.1 Saver program

HOW TO RUN IN DOSBOX:
1. Copy ${binName} and ${loaderName} into your DOSBox folder (e.g. C:\\DOSGAMES).
2. Start DOSBox and mount the directory:
     mount c c:\\dosgames
     c:
3. Run with Microsoft QBasic:
     qbasic /run ${loaderName}
   Or open QBasic, press Alt+F, O to Open, and select ${loaderName}.

TARGET SCREEN MODE:
${conversionResult.qbasicScreenMode} (${conversionResult.width}x${conversionResult.height})
FILE SIZE:
${conversionResult.fileSizeBytes} bytes (${(conversionResult.fileSizeBytes / 1024).toFixed(2)} KB)

Generated by QBasic Binary Image Studio
`;
    zip.file('README.TXT', readme);

    // Generate ZIP and trigger download
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_QBASIC_PACKAGE.ZIP`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportAll={handleExportAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'studio' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-57px)]">
            {/* Left Sidebar: Controls & Inputs */}
            <div className="lg:col-span-4 xl:col-span-4 border-r border-neutral-800 bg-neutral-900/60 overflow-y-auto p-4 space-y-6">
              {/* Image Input Section */}
              <section className="bg-neutral-900 p-3.5 rounded border border-neutral-800">
                <div className="flex items-center gap-1.5 mb-3 text-neutral-200 font-semibold text-xs border-b border-neutral-800 pb-2">
                  <Image className="w-3.5 h-3.5 text-blue-400" />
                  <span>Image Source & Resolution</span>
                </div>
                <ImageControls
                  selectedPreset={selectedPreset}
                  onSelectPreset={setSelectedPreset}
                  customWidth={customWidth}
                  customHeight={customHeight}
                  onChangeCustomDimensions={(w, h) => {
                    setCustomWidth(w);
                    setCustomHeight(h);
                  }}
                  fitMode={fitMode}
                  onChangeFitMode={setFitMode}
                  onSelectSample={(id, url) => {
                    setActiveSampleId(id);
                    setSourceDataUrl(url);
                  }}
                  onUploadImage={(url) => {
                    setActiveSampleId('');
                    setSourceDataUrl(url);
                  }}
                  activeSampleId={activeSampleId}
                />
              </section>

              {/* Dither & Palette Section */}
              <section className="bg-neutral-900 p-3.5 rounded border border-neutral-800">
                <div className="flex items-center gap-1.5 mb-3 text-neutral-200 font-semibold text-xs border-b border-neutral-800 pb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Color Depth & Dithering Engine</span>
                </div>
                <DitherControls
                  bitDepth={bitDepth}
                  onSelectBitDepth={handleSelectBitDepth}
                  algorithm={ditherAlgorithm}
                  onSelectAlgorithm={setDitherAlgorithm}
                  strength={ditherStrength}
                  onChangeStrength={setDitherStrength}
                  availablePalettes={getAvailablePalettesForBpp(bitDepth)}
                  activePaletteId={activePaletteId}
                  onSelectPalette={(p) => setActivePaletteId(p.id)}
                  currentPaletteColors={
                    conversionResult?.palette && conversionResult.palette.length > 0
                      ? conversionResult.palette
                      : getActivePaletteColors()
                  }
                  headerMode={headerMode}
                  onChangeHeaderMode={setHeaderMode}
                  includeCustomPalette={includeCustomPalette}
                  onToggleIncludeCustomPalette={setIncludeCustomPalette}
                  adjustments={adjustments}
                  onChangeAdjustments={setAdjustments}
                  onResetAdjustments={() =>
                    setAdjustments({
                      brightness: 0,
                      contrast: 0,
                      gamma: 1.0,
                      invert: false,
                      grayscaleFirst: false,
                    })
                  }
                />
              </section>
            </div>

            {/* Right Main Canvas: Interactive Visual Viewport */}
            <div className="lg:col-span-8 xl:col-span-8 p-4 flex flex-col h-full overflow-hidden bg-neutral-950">
              <PreviewCanvas
                sourceImageData={sourceImageData}
                conversionResult={conversionResult}
                onDownloadPng={handleDownloadPng}
                aspect43Preferred={selectedPreset.aspect43}
              />
            </div>
          </div>
        )}

        {/* Tab 2: QBasic Loader & Saver Code Samples */}
        {activeTab === 'code' && (
          <div className="flex-1 p-4 overflow-hidden h-[calc(100vh-57px)]">
            <CodeSamples
              result={conversionResult}
              filename={filename}
              onChangeFilename={setFilename}
              onDownloadBas={handleDownloadBas}
            />
          </div>
        )}

        {/* Tab 3: Binary Hex Inspector */}
        {activeTab === 'hex' && (
          <div className="flex-1 p-4 overflow-hidden h-[calc(100vh-57px)]">
            <HexViewer
              result={conversionResult}
              filename={filename}
              onDownloadBin={handleDownloadBin}
            />
          </div>
        )}

        {/* Tab 4: Memory & Format Specs */}
        {activeTab === 'specs' && (
          <div className="flex-1 p-4 overflow-y-auto h-[calc(100vh-57px)]">
            <FormatExplainer />
          </div>
        )}
      </main>
    </div>
  );
}
