import { BitDepth, PalettePreset, RGBColor, ScreenPreset } from '../types/qbasic';

// 1-Bit Palettes (2 colors)
export const PALETTES_1BIT: PalettePreset[] = [
  {
    id: 'mono-bw',
    name: 'Classic Monochrome (B&W)',
    bpp: 1,
    colors: [
      [0, 0, 0],
      [255, 255, 255],
    ],
    description: 'Standard 1-bit black and white (QBasic SCREEN 11 / SCREEN 2)',
  },
  {
    id: 'mono-amber',
    name: 'Amber Phosphor CRT',
    bpp: 1,
    colors: [
      [10, 8, 0],
      [255, 176, 0],
    ],
    description: 'Classic MDA/Hercules amber glow monitor',
  },
  {
    id: 'mono-green',
    name: 'Green Phosphor CRT',
    bpp: 1,
    colors: [
      [0, 15, 5],
      [51, 255, 51],
    ],
    description: 'Iconic IBM 5151 green phosphor display',
  },
  {
    id: 'mono-paper',
    name: 'Paper White & Deep Navy',
    bpp: 1,
    colors: [
      [16, 24, 48],
      [240, 244, 248],
    ],
    description: 'Clean editorial high-contrast monochrome',
  },
];

// 2-Bit Palettes (4 colors)
export const PALETTES_2BIT: PalettePreset[] = [
  {
    id: 'cga-1-high',
    name: 'CGA Palette 1 (Cyan/Magenta/White)',
    bpp: 2,
    colors: [
      [0, 0, 0],
      [85, 255, 255],
      [255, 85, 255],
      [255, 255, 255],
    ],
    description: 'Classic high-intensity CGA Mode 1 (SCREEN 1, COLOR 1, 1)',
  },
  {
    id: 'cga-1-low',
    name: 'CGA Palette 1 Low (Dark Cyan/Magenta)',
    bpp: 2,
    colors: [
      [0, 0, 0],
      [0, 170, 170],
      [170, 0, 170],
      [170, 170, 170],
    ],
    description: 'Low-intensity CGA Mode 1 (SCREEN 1, COLOR 1, 0)',
  },
  {
    id: 'cga-0-high',
    name: 'CGA Palette 0 (Green/Red/Yellow)',
    bpp: 2,
    colors: [
      [0, 0, 0],
      [85, 255, 85],
      [255, 85, 85],
      [255, 255, 85],
    ],
    description: 'High-intensity CGA Mode 0 (SCREEN 1, COLOR 0, 1)',
  },
  {
    id: 'cga-0-low',
    name: 'CGA Palette 0 Low (Green/Red/Brown)',
    bpp: 2,
    colors: [
      [0, 0, 0],
      [0, 170, 0],
      [170, 0, 0],
      [170, 85, 0],
    ],
    description: 'Low-intensity CGA Mode 0 (SCREEN 1, COLOR 0, 0)',
  },
  {
    id: 'gameboy-4',
    name: 'Game Boy (4 Shades)',
    bpp: 2,
    colors: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
    description: 'Original handheld 4-shade greenish LCD',
  },
  {
    id: 'gray-4',
    name: '4-Level Grayscale',
    bpp: 2,
    colors: [
      [0, 0, 0],
      [85, 85, 85],
      [170, 170, 170],
      [255, 255, 255],
    ],
    description: 'Uniform 2-bit linear grayscale steps',
  },
];

// 3-Bit Palettes (8 colors)
export const PALETTES_3BIT: PalettePreset[] = [
  {
    id: 'rgb-3bit',
    name: 'Standard 8 RGB Primaries',
    bpp: 3,
    colors: [
      [0, 0, 0],       // 0 Black
      [0, 0, 255],     // 1 Blue
      [0, 255, 0],     // 2 Green
      [0, 255, 255],   // 3 Cyan
      [255, 0, 0],     // 4 Red
      [255, 0, 255],   // 5 Magenta
      [255, 255, 0],   // 6 Yellow
      [255, 255, 255], // 7 White
    ],
    description: '1-bit per channel RGB (8 basic colors)',
  },
  {
    id: 'zx-spectrum-8',
    name: 'ZX Spectrum / Micro 8',
    bpp: 3,
    colors: [
      [0, 0, 0],
      [0, 0, 215],
      [0, 215, 0],
      [0, 215, 215],
      [215, 0, 0],
      [215, 0, 215],
      [215, 215, 0],
      [215, 215, 215],
    ],
    description: 'Classic 8-color vintage computer display colors',
  },
  {
    id: 'gray-8',
    name: '8-Level Grayscale',
    bpp: 3,
    colors: Array.from({ length: 8 }, (_, i) => {
      const v = Math.round((i / 7) * 255);
      return [v, v, v] as RGBColor;
    }),
    description: 'Uniform 3-bit grayscale ramp',
  },
];

// Standard IBM PC / EGA / VGA 16 Colors (QBasic default SCREEN 7 / 9 / 12)
export const IBM_VGA_16_COLORS: RGBColor[] = [
  [0, 0, 0],       // 0: Black
  [0, 0, 170],     // 1: Blue
  [0, 170, 0],     // 2: Green
  [0, 170, 170],   // 3: Cyan
  [170, 0, 0],     // 4: Red
  [170, 0, 170],   // 5: Magenta
  [170, 85, 0],    // 6: Brown
  [170, 170, 170], // 7: Light Gray / White
  [85, 85, 85],    // 8: Dark Gray
  [85, 85, 255],   // 9: Light Blue
  [85, 255, 85],   // 10: Light Green
  [85, 255, 255],  // 11: Light Cyan
  [255, 85, 85],   // 12: Light Red
  [255, 85, 255],  // 13: Light Magenta
  [255, 255, 85],  // 14: Yellow
  [255, 255, 255], // 15: Bright White
];

export const C64_16_COLORS: RGBColor[] = [
  [0, 0, 0],
  [255, 255, 255],
  [136, 0, 0],
  [170, 255, 238],
  [204, 68, 204],
  [0, 204, 85],
  [0, 0, 170],
  [238, 238, 119],
  [221, 136, 85],
  [102, 68, 0],
  [255, 119, 119],
  [51, 51, 51],
  [119, 119, 119],
  [170, 255, 102],
  [0, 136, 255],
  [187, 187, 187],
];

// 4-Bit Palettes (16 colors)
export const PALETTES_4BIT: PalettePreset[] = [
  {
    id: 'vga-16',
    name: 'Standard IBM PC EGA/VGA (16 Colors)',
    bpp: 4,
    colors: IBM_VGA_16_COLORS,
    description: 'Standard QBasic SCREEN 7, SCREEN 9, SCREEN 12 palette',
  },
  {
    id: 'c64-16',
    name: 'Commodore 64 (16 Colors)',
    bpp: 4,
    colors: C64_16_COLORS,
    description: 'Iconic Commodore 64 color scheme',
  },
  {
    id: 'gray-16',
    name: '16-Level Grayscale',
    bpp: 4,
    colors: Array.from({ length: 16 }, (_, i) => {
      const v = Math.round((i / 15) * 255);
      return [v, v, v] as RGBColor;
    }),
    description: 'Even 16-shade monochrome ramp',
  },
];

// 6-Bit Palette (64 colors - EGA 64 colors / 2:2:2 RGB)
export function generateEGA64Palette(): RGBColor[] {
  const colors: RGBColor[] = [];
  const levels = [0, 85, 170, 255];
  for (let r = 0; r < 4; r++) {
    for (let g = 0; g < 4; g++) {
      for (let b = 0; b < 4; b++) {
        colors.push([levels[r], levels[g], levels[b]]);
      }
    }
  }
  return colors;
}

export const PALETTES_6BIT: PalettePreset[] = [
  {
    id: 'ega-64',
    name: 'EGA 64-Color Palette (2:2:2 RGB)',
    bpp: 6,
    colors: generateEGA64Palette(),
    description: 'Full EGA 6-bit hardware palette (2 bits per RGB channel)',
  },
];

// 8-Bit VGA SCREEN 13 Default 256 Palette Generator
export function generateVGA256Palette(): RGBColor[] {
  const palette: RGBColor[] = [];
  // 0-15: standard EGA 16
  for (let i = 0; i < 16; i++) {
    palette.push(IBM_VGA_16_COLORS[i]);
  }
  // 16-31: 16 shades of gray
  for (let i = 0; i < 16; i++) {
    const v = Math.round((i / 15) * 255);
    palette.push([v, v, v]);
  }
  // 32-247: standard VGA hue/intensity groups (216 colors)
  // VGA Screen 13 uses 3 saturations, 24 hues, and intensity ramps
  const hues = 24;
  const groups = [
    { sat: 1.0, val: 1.0 },
    { sat: 0.5, val: 1.0 },
    { sat: 1.0, val: 0.5 },
  ];
  for (const group of groups) {
    for (let h = 0; h < hues; h++) {
      const hueAngle = (h / hues) * 360;
      const rgb = hsvToRgb(hueAngle, group.sat, group.val);
      if (palette.length < 248) {
        palette.push(rgb);
      }
    }
  }
  // Pad remaining to 256
  while (palette.length < 256) {
    const v = Math.round(((palette.length - 248) / 8) * 255);
    palette.push([v, v, v]);
  }
  return palette;
}

// 8-Bit RGB 3:3:2 Palette (uniform 256 color cube)
export function generateRGB332Palette(): RGBColor[] {
  const colors: RGBColor[] = [];
  for (let i = 0; i < 256; i++) {
    const r = Math.round(((i >> 5) & 7) * (255 / 7));
    const g = Math.round(((i >> 2) & 7) * (255 / 7));
    const b = Math.round((i & 3) * (255 / 3));
    colors.push([r, g, b]);
  }
  return colors;
}

export const PALETTES_8BIT: PalettePreset[] = [
  {
    id: 'vga-256',
    name: 'VGA SCREEN 13 Default (256 Colors)',
    bpp: 8,
    colors: generateVGA256Palette(),
    description: 'Iconic MS-DOS / QBasic SCREEN 13 default 256-color palette',
  },
  {
    id: 'rgb-332',
    name: 'RGB 3:3:2 Color Cube (256 Colors)',
    bpp: 8,
    colors: generateRGB332Palette(),
    description: 'Uniform 8-bit true RGB encoding (3 Red, 3 Green, 2 Blue)',
  },
  {
    id: 'vga-adaptive-256',
    name: 'Adaptive Quantized Palette (Custom 256)',
    bpp: 8,
    colors: [], // Generated dynamically from image
    description: 'Optimal 256 colors extracted from your image via Median Cut',
  },
];

// Helper: HSV to RGB
function hsvToRgb(h: number, s: number, v: number): RGBColor {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

// Median Cut color quantizer to create an optimal custom palette from image pixels
export function extractAdaptivePalette(imageData: ImageData, maxColors: number = 256): RGBColor[] {
  const pixels: RGBColor[] = [];
  const data = imageData.data;
  const step = Math.max(1, Math.floor(data.length / (4 * 10000))); // sample up to 10,000 pixels for fast execution

  for (let i = 0; i < data.length; i += 4 * step) {
    if (data[i + 3] > 64) { // ignore mostly transparent pixels
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  if (pixels.length === 0) {
    return generateRGB332Palette();
  }

  // Median Cut recursion
  type Box = { pixels: RGBColor[] };
  let boxes: Box[] = [{ pixels }];

  while (boxes.length < maxColors) {
    // Find box with largest color range
    let bestBoxIndex = -1;
    let maxRange = -1;

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.pixels.length <= 1) continue;

      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      for (const p of box.pixels) {
        if (p[0] < minR) minR = p[0];
        if (p[0] > maxR) maxR = p[0];
        if (p[1] < minG) minG = p[1];
        if (p[1] > maxG) maxG = p[1];
        if (p[2] < minB) minB = p[2];
        if (p[2] > maxB) maxB = p[2];
      }
      const range = Math.max(maxR - minR, maxG - minG, maxB - minB);
      if (range > maxRange) {
        maxRange = range;
        bestBoxIndex = i;
      }
    }

    if (bestBoxIndex === -1 || maxRange <= 0) break;

    const boxToSplit = boxes.splice(bestBoxIndex, 1)[0];
    // Find channel with maximum variance
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    for (const p of boxToSplit.pixels) {
      if (p[0] < minR) minR = p[0];
      if (p[0] > maxR) maxR = p[0];
      if (p[1] < minG) minG = p[1];
      if (p[1] > maxG) maxG = p[1];
      if (p[2] < minB) minB = p[2];
      if (p[2] > maxB) maxB = p[2];
    }

    const rangeR = maxR - minR;
    const rangeG = maxG - minG;
    const rangeB = maxB - minB;
    const channel = rangeR >= rangeG && rangeR >= rangeB ? 0 : rangeG >= rangeB ? 1 : 2;

    boxToSplit.pixels.sort((a, b) => a[channel] - b[channel]);
    const mid = Math.floor(boxToSplit.pixels.length / 2);
    boxes.push({ pixels: boxToSplit.pixels.slice(0, mid) });
    boxes.push({ pixels: boxToSplit.pixels.slice(mid) });
  }

  const result: RGBColor[] = boxes.map(box => {
    let rSum = 0, gSum = 0, bSum = 0;
    for (const p of box.pixels) {
      rSum += p[0];
      gSum += p[1];
      bSum += p[2];
    }
    const count = box.pixels.length || 1;
    return [
      Math.round(rSum / count),
      Math.round(gSum / count),
      Math.round(bSum / count),
    ];
  });

  // Pad to maxColors if needed
  while (result.length < maxColors) {
    result.push([0, 0, 0]);
  }

  return result.slice(0, maxColors);
}

// Find nearest color in palette using Euclidean distance with perceptual weights
export function findNearestColorIndex(rgb: RGBColor, palette: RGBColor[]): number {
  let minDistance = Infinity;
  let bestIndex = 0;

  const [r1, g1, b1] = rgb;

  for (let i = 0; i < palette.length; i++) {
    const [r2, g2, b2] = palette[i];
    // Redmean color difference (fast & perceptually balanced)
    const rMean = (r1 + r2) / 2;
    const dR = r1 - r2;
    const dG = g1 - g2;
    const dB = b1 - b2;
    const dist = (2 + rMean / 256) * dR * dR + 4 * dG * dG + (2 + (255 - rMean) / 256) * dB * dB;

    if (dist < minDistance) {
      minDistance = dist;
      bestIndex = i;
      if (dist === 0) break;
    }
  }

  return bestIndex;
}

// Convert 24-bit RGB to 16-bit RGB 5:6:5 integer
export function rgbTo16BitRGB565(r: number, g: number, b: number): number {
  const r5 = (r >> 3) & 0x1F;
  const g6 = (g >> 2) & 0x3F;
  const b5 = (b >> 3) & 0x1F;
  return (r5 << 11) | (g6 << 5) | b5;
}

// Convert 16-bit RGB 5:6:5 integer back to RGB
export function rgb565ToRgb(val: number): RGBColor {
  const r5 = (val >> 11) & 0x1F;
  const g6 = (val >> 5) & 0x3F;
  const b5 = val & 0x1F;
  return [
    Math.round((r5 * 255) / 31),
    Math.round((g6 * 255) / 63),
    Math.round((b5 * 255) / 31),
  ];
}

// Standard Screen Resolutions for QBasic
export const SCREEN_PRESETS: ScreenPreset[] = [
  {
    id: 'screen-13',
    name: '320 × 200 (SCREEN 13 - VGA 256)',
    width: 320,
    height: 200,
    nativeScreen: 'SCREEN 13',
    recommendedBpp: 8,
    aspect43: true,
    description: 'The golden standard of DOS gaming (320x200, 256 colors, linear memory)',
  },
  {
    id: 'screen-12',
    name: '640 × 480 (SCREEN 12 - VGA 16)',
    width: 640,
    height: 480,
    nativeScreen: 'SCREEN 12',
    recommendedBpp: 4,
    aspect43: true,
    description: 'Full VGA resolution (640x480, 16 EGA/VGA colors)',
  },
  {
    id: 'screen-7',
    name: '320 × 200 (SCREEN 7 - EGA 16)',
    width: 320,
    height: 200,
    nativeScreen: 'SCREEN 7',
    recommendedBpp: 4,
    aspect43: true,
    description: 'EGA 16-color mode with multiple hardware pages',
  },
  {
    id: 'screen-1',
    name: '320 × 200 (SCREEN 1 - CGA 4 Colors)',
    width: 320,
    height: 200,
    nativeScreen: 'SCREEN 1',
    recommendedBpp: 2,
    aspect43: true,
    description: 'CGA 4-color mode with Cyan/Magenta or Green/Red palettes',
  },
  {
    id: 'screen-2',
    name: '640 × 200 (SCREEN 2 - CGA 1-bit Mono)',
    width: 640,
    height: 200,
    nativeScreen: 'SCREEN 2',
    recommendedBpp: 1,
    aspect43: true,
    description: 'High-res monochrome CGA mode (1-bit packed, 80 columns)',
  },
  {
    id: 'screen-11',
    name: '640 × 480 (SCREEN 11 - VGA 1-bit Mono)',
    width: 640,
    height: 480,
    nativeScreen: 'SCREEN 11',
    recommendedBpp: 1,
    aspect43: true,
    description: 'High-res crisp 1-bit monochrome VGA display',
  },
  {
    id: 'screen-9',
    name: '640 × 350 (SCREEN 9 - EGA 16/64)',
    width: 640,
    height: 350,
    nativeScreen: 'SCREEN 9',
    recommendedBpp: 4,
    aspect43: true,
    description: 'EGA high-resolution graphics with 16 colors from 64-color palette',
  },
  {
    id: 'sprite-64',
    name: '64 × 64 (Game Sprite / Icon)',
    width: 64,
    height: 64,
    nativeScreen: 'SCREEN 13 (PUT Sprite)',
    recommendedBpp: 8,
    aspect43: false,
    description: 'Square sprite sheet size for QBasic PUT/GET sprite routines',
  },
  {
    id: 'sprite-32',
    name: '32 × 32 (Small Sprite / Tile)',
    width: 32,
    height: 32,
    nativeScreen: 'SCREEN 13 / 7',
    recommendedBpp: 4,
    aspect43: false,
    description: 'Standard 32x32 retro tile or game character sprite',
  },
  {
    id: 'qb64-320-240',
    name: '320 × 240 (Square Pixel Mode X / QB64)',
    width: 320,
    height: 240,
    nativeScreen: 'QB64 _NEWIMAGE(320, 240, 32)',
    recommendedBpp: 32,
    aspect43: true,
    description: 'Native 4:3 square pixels in QB64 or Mode X',
  },
];
