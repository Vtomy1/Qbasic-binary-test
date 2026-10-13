export type BitDepth = 1 | 2 | 3 | 4 | 6 | 8 | 16 | 24 | 32;

export type DitherAlgorithm =
  | 'none'
  | 'floyd-steinberg'
  | 'atkinson'
  | 'bayer-2x2'
  | 'bayer-4x4'
  | 'bayer-8x8'
  | 'burkes'
  | 'sierra-3'
  | 'sierra-lite'
  | 'jarvis-judice-ninke';

export type HeaderMode = 'raw' | 'qb-header' | 'qb-put' | 'dos-bsave';

export type ScreenPreset = {
  id: string;
  name: string;
  width: number;
  height: number;
  nativeScreen: string;
  recommendedBpp: BitDepth;
  aspect43: boolean;
  description: string;
};

export type RGBColor = [number, number, number];

export interface PalettePreset {
  id: string;
  name: string;
  bpp: BitDepth;
  colors: RGBColor[];
  description: string;
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  gamma: number;      // 0.2 to 3.0
  invert: boolean;
  grayscaleFirst: boolean;
}

export interface ConversionResult {
  width: number;
  height: number;
  bitDepth: BitDepth;
  headerMode: HeaderMode;
  binaryData: Uint8Array;
  pixelIndices: Uint8Array | Uint16Array | Uint32Array;
  palette: RGBColor[];
  previewImageData: ImageData;
  fileSizeBytes: number;
  headerSizeBytes: number;
  paletteSizeBytes: number;
  payloadSizeBytes: number;
  qbasicScreenMode: string;
}
