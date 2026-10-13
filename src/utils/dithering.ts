import {
  BitDepth,
  DitherAlgorithm,
  ImageAdjustments,
  RGBColor,
} from '../types/qbasic';
import {
  findNearestColorIndex,
  rgb565ToRgb,
  rgbTo16BitRGB565,
} from './palettes';

// Bayer Matrices for ordered dithering
const BAYER_2X2 = [
  [0, 2],
  [3, 1],
];

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export interface DitherOptions {
  algorithm: DitherAlgorithm;
  strength: number; // 0.0 to 1.0
  adjustments: ImageAdjustments;
  palette: RGBColor[];
  bitDepth: BitDepth;
}

export interface DitherResult {
  outputImageData: ImageData;
  pixelIndices: Uint8Array | Uint16Array | Uint32Array;
  pixelColors: RGBColor[];
}

// Applies image adjustments (brightness, contrast, gamma, invert, grayscale)
function applyAdjustments(
  srcData: Uint8ClampedArray,
  adjustments: ImageAdjustments
): Float32Array {
  const len = srcData.length;
  const floatBuffer = new Float32Array(len);

  const bFactor = adjustments.brightness; // -100 to 100
  const cFactor = adjustments.contrast;   // -100 to 100
  // Contrast curve factor
  const contrastMultiplier = (259 * (cFactor + 255)) / (255 * (259 - cFactor));
  const gammaExp = 1 / Math.max(0.01, adjustments.gamma);

  for (let i = 0; i < len; i += 4) {
    let r = srcData[i];
    let g = srcData[i + 1];
    let b = srcData[i + 2];
    const a = srcData[i + 3];

    // Grayscale first if enabled
    if (adjustments.grayscaleFirst) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    // Brightness
    r += bFactor;
    g += bFactor;
    b += bFactor;

    // Contrast
    r = contrastMultiplier * (r - 128) + 128;
    g = contrastMultiplier * (g - 128) + 128;
    b = contrastMultiplier * (b - 128) + 128;

    // Clamp 0..255
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Gamma
    if (adjustments.gamma !== 1.0) {
      r = Math.pow(r / 255, gammaExp) * 255;
      g = Math.pow(g / 255, gammaExp) * 255;
      b = Math.pow(b / 255, gammaExp) * 255;
    }

    // Invert
    if (adjustments.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    floatBuffer[i] = r;
    floatBuffer[i + 1] = g;
    floatBuffer[i + 2] = b;
    floatBuffer[i + 3] = a;
  }

  return floatBuffer;
}

export function processAndDitherImage(
  sourceImageData: ImageData,
  options: DitherOptions
): DitherResult {
  const { width, height } = sourceImageData;
  const totalPixels = width * height;
  const floatBuffer = applyAdjustments(sourceImageData.data, options.adjustments);
  const outImageData = new ImageData(width, height);
  const outData = outImageData.data;

  // Pixel indices array allocation depending on bit depth
  let pixelIndices: Uint8Array | Uint16Array | Uint32Array;
  if (options.bitDepth <= 8) {
    pixelIndices = new Uint8Array(totalPixels);
  } else if (options.bitDepth === 16) {
    pixelIndices = new Uint16Array(totalPixels);
  } else {
    pixelIndices = new Uint32Array(totalPixels);
  }

  const pixelColors: RGBColor[] = new Array(totalPixels);

  const { algorithm, strength, palette, bitDepth } = options;

  // Helper to quantize an RGB triple according to the current mode
  const quantizePixel = (
    r: number,
    g: number,
    b: number
  ): { index: number; color: RGBColor } => {
    const clampedR = Math.max(0, Math.min(255, r));
    const clampedG = Math.max(0, Math.min(255, g));
    const clampedB = Math.max(0, Math.min(255, b));

    if (bitDepth <= 8) {
      const idx = findNearestColorIndex([clampedR, clampedG, clampedB], palette);
      return { index: idx, color: palette[idx] };
    } else if (bitDepth === 16) {
      // 16-bit RGB 5:6:5
      const rgb565 = rgbTo16BitRGB565(clampedR, clampedG, clampedB);
      const color = rgb565ToRgb(rgb565);
      return { index: rgb565, color };
    } else if (bitDepth === 24) {
      // 24-bit TrueColor
      const color: RGBColor = [
        Math.round(clampedR),
        Math.round(clampedG),
        Math.round(clampedB),
      ];
      const index = (color[0] << 16) | (color[1] << 8) | color[2];
      return { index, color };
    } else {
      // 32-bit RGBA
      const color: RGBColor = [
        Math.round(clampedR),
        Math.round(clampedG),
        Math.round(clampedB),
      ];
      const index = (0xff << 24) | (color[0] << 16) | (color[1] << 8) | color[2];
      return { index, color };
    }
  };

  // 1. Ordered Dithering (Bayer)
  if (algorithm.startsWith('bayer')) {
    let bayerMatrix: number[][];
    let matrixSize: number;
    if (algorithm === 'bayer-2x2') {
      bayerMatrix = BAYER_2X2;
      matrixSize = 2;
    } else if (algorithm === 'bayer-4x4') {
      bayerMatrix = BAYER_4X4;
      matrixSize = 4;
    } else {
      bayerMatrix = BAYER_8X8;
      matrixSize = 8;
    }

    const scale = (255 / (matrixSize * matrixSize)) * strength;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const bayerVal = bayerMatrix[y % matrixSize][x % matrixSize];
        const offset = (bayerVal - matrixSize * matrixSize * 0.5) * (scale / 16);

        const r = floatBuffer[idx] + offset;
        const g = floatBuffer[idx + 1] + offset;
        const b = floatBuffer[idx + 2] + offset;

        const { index, color } = quantizePixel(r, g, b);
        const pIndex = y * width + x;
        pixelIndices[pIndex] = index;
        pixelColors[pIndex] = color;

        outData[idx] = color[0];
        outData[idx + 1] = color[1];
        outData[idx + 2] = color[2];
        outData[idx + 3] = 255;
      }
    }

    return { outputImageData: outImageData, pixelIndices, pixelColors };
  }

  // 2. Error Diffusion Dithering (Floyd-Steinberg, Atkinson, Burkes, Sierra, etc.)
  // Or None (strength = 0 or algorithm = 'none')
  if (algorithm === 'none' || strength === 0) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const { index, color } = quantizePixel(
          floatBuffer[idx],
          floatBuffer[idx + 1],
          floatBuffer[idx + 2]
        );
        const pIndex = y * width + x;
        pixelIndices[pIndex] = index;
        pixelColors[pIndex] = color;

        outData[idx] = color[0];
        outData[idx + 1] = color[1];
        outData[idx + 2] = color[2];
        outData[idx + 3] = 255;
      }
    }

    return { outputImageData: outImageData, pixelIndices, pixelColors };
  }

  // Define error diffusion kernel distributions
  type KernelOffset = { dx: number; dy: number; weight: number };
  let kernel: KernelOffset[] = [];
  let kernelDivisor = 1;

  if (algorithm === 'floyd-steinberg') {
    kernel = [
      { dx: 1, dy: 0, weight: 7 },
      { dx: -1, dy: 1, weight: 3 },
      { dx: 0, dy: 1, weight: 5 },
      { dx: 1, dy: 1, weight: 1 },
    ];
    kernelDivisor = 16;
  } else if (algorithm === 'atkinson') {
    // Classic Atkinson diffuses 3/4 (6/8) of the error to preserve high-contrast edges
    kernel = [
      { dx: 1, dy: 0, weight: 1 },
      { dx: 2, dy: 0, weight: 1 },
      { dx: -1, dy: 1, weight: 1 },
      { dx: 0, dy: 1, weight: 1 },
      { dx: 1, dy: 1, weight: 1 },
      { dx: 0, dy: 2, weight: 1 },
    ];
    kernelDivisor = 8;
  } else if (algorithm === 'burkes') {
    kernel = [
      { dx: 1, dy: 0, weight: 8 },
      { dx: 2, dy: 0, weight: 4 },
      { dx: -2, dy: 1, weight: 2 },
      { dx: -1, dy: 1, weight: 4 },
      { dx: 0, dy: 1, weight: 8 },
      { dx: 1, dy: 1, weight: 4 },
      { dx: 2, dy: 1, weight: 2 },
    ];
    kernelDivisor = 32;
  } else if (algorithm === 'sierra-3') {
    kernel = [
      { dx: 1, dy: 0, weight: 5 },
      { dx: 2, dy: 0, weight: 4 },
      { dx: -2, dy: 1, weight: 2 },
      { dx: -1, dy: 1, weight: 4 },
      { dx: 0, dy: 1, weight: 5 },
      { dx: 1, dy: 1, weight: 4 },
      { dx: 2, dy: 1, weight: 2 },
      { dx: -1, dy: 2, weight: 2 },
      { dx: 0, dy: 2, weight: 3 },
      { dx: 1, dy: 2, weight: 2 },
    ];
    kernelDivisor = 32;
  } else if (algorithm === 'sierra-lite') {
    kernel = [
      { dx: 1, dy: 0, weight: 2 },
      { dx: -1, dy: 1, weight: 1 },
      { dx: 0, dy: 1, weight: 1 },
    ];
    kernelDivisor = 4;
  } else if (algorithm === 'jarvis-judice-ninke') {
    kernel = [
      { dx: 1, dy: 0, weight: 7 },
      { dx: 2, dy: 0, weight: 5 },
      { dx: -2, dy: 1, weight: 3 },
      { dx: -1, dy: 1, weight: 5 },
      { dx: 0, dy: 1, weight: 7 },
      { dx: 1, dy: 1, weight: 5 },
      { dx: 2, dy: 1, weight: 3 },
      { dx: -2, dy: 2, weight: 1 },
      { dx: -1, dy: 2, weight: 3 },
      { dx: 0, dy: 2, weight: 5 },
      { dx: 1, dy: 2, weight: 3 },
      { dx: 2, dy: 2, weight: 1 },
    ];
    kernelDivisor = 48;
  }

  // Iterate scanlines
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const curR = floatBuffer[idx];
      const curG = floatBuffer[idx + 1];
      const curB = floatBuffer[idx + 2];

      const { index, color } = quantizePixel(curR, curG, curB);
      const pIndex = y * width + x;
      pixelIndices[pIndex] = index;
      pixelColors[pIndex] = color;

      outData[idx] = color[0];
      outData[idx + 1] = color[1];
      outData[idx + 2] = color[2];
      outData[idx + 3] = 255;

      // Error calculation scaled by strength
      const errR = (curR - color[0]) * strength;
      const errG = (curG - color[1]) * strength;
      const errB = (curB - color[2]) * strength;

      // Distribute error to neighboring pixels
      for (const k of kernel) {
        const nx = x + k.dx;
        const ny = y + k.dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = (ny * width + nx) * 4;
          const factor = k.weight / kernelDivisor;
          floatBuffer[nIdx] += errR * factor;
          floatBuffer[nIdx + 1] += errG * factor;
          floatBuffer[nIdx + 2] += errB * factor;
        }
      }
    }
  }

  return { outputImageData: outImageData, pixelIndices, pixelColors };
}
