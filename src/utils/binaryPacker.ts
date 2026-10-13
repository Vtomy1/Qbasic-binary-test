import {
  BitDepth,
  ConversionResult,
  HeaderMode,
  RGBColor,
} from '../types/qbasic';

export interface BinaryPackOptions {
  width: number;
  height: number;
  bitDepth: BitDepth;
  headerMode: HeaderMode;
  pixelIndices: Uint8Array | Uint16Array | Uint32Array;
  pixelColors: RGBColor[];
  palette: RGBColor[];
  includeCustomPalette?: boolean;
}

export function packToQBasicBinary(options: BinaryPackOptions): ConversionResult {
  const {
    width,
    height,
    bitDepth,
    headerMode,
    pixelIndices,
    pixelColors,
    palette,
    includeCustomPalette = false,
  } = options;

  const totalPixels = width * height;

  // 1. Pack the pixel payload based on bit depth
  let payloadBytes: Uint8Array;

  switch (bitDepth) {
    case 1: {
      // 8 pixels per byte (1 bit each, MSB first)
      // Scanline aligned
      const bytesPerLine = Math.ceil(width / 8);
      payloadBytes = new Uint8Array(bytesPerLine * height);

      for (let y = 0; y < height; y++) {
        const lineOffset = y * bytesPerLine;
        for (let x = 0; x < width; x++) {
          const pIdx = y * width + x;
          const bitVal = pixelIndices[pIdx] > 0 ? 1 : 0;
          const byteIdx = lineOffset + (x >> 3);
          const bitPos = 7 - (x & 7);
          if (bitVal) {
            payloadBytes[byteIdx] |= 1 << bitPos;
          }
        }
      }
      break;
    }

    case 2: {
      // 4 pixels per byte (2 bits each: 0..3)
      const bytesPerLine = Math.ceil(width / 4);
      payloadBytes = new Uint8Array(bytesPerLine * height);

      for (let y = 0; y < height; y++) {
        const lineOffset = y * bytesPerLine;
        for (let x = 0; x < width; x++) {
          const pIdx = y * width + x;
          const val = pixelIndices[pIdx] & 0x03;
          const byteIdx = lineOffset + (x >> 2);
          const shift = (3 - (x & 3)) * 2;
          payloadBytes[byteIdx] |= val << shift;
        }
      }
      break;
    }

    case 3: {
      // 3-bit: 2 pixels per byte (low nibble 3 bits, high nibble 3 bits)
      // Pixel 0: bits 0..2, Pixel 1: bits 4..6 (very convenient for QBasic AND 7)
      const bytesPerLine = Math.ceil(width / 2);
      payloadBytes = new Uint8Array(bytesPerLine * height);

      for (let y = 0; y < height; y++) {
        const lineOffset = y * bytesPerLine;
        for (let x = 0; x < width; x++) {
          const pIdx = y * width + x;
          const val = pixelIndices[pIdx] & 0x07;
          const byteIdx = lineOffset + (x >> 1);
          if ((x & 1) === 0) {
            payloadBytes[byteIdx] |= val; // low 3 bits
          } else {
            payloadBytes[byteIdx] |= val << 4; // upper nibble
          }
        }
      }
      break;
    }

    case 4: {
      // 4-bit: 2 pixels per byte (nibbles: high nibble left pixel, low nibble right pixel)
      const bytesPerLine = Math.ceil(width / 2);
      payloadBytes = new Uint8Array(bytesPerLine * height);

      for (let y = 0; y < height; y++) {
        const lineOffset = y * bytesPerLine;
        for (let x = 0; x < width; x++) {
          const pIdx = y * width + x;
          const val = pixelIndices[pIdx] & 0x0f;
          const byteIdx = lineOffset + (x >> 1);
          if ((x & 1) === 0) {
            payloadBytes[byteIdx] |= val << 4; // high nibble
          } else {
            payloadBytes[byteIdx] |= val; // low nibble
          }
        }
      }
      break;
    }

    case 6: {
      // 6-bit: 1 byte per pixel (0..63)
      payloadBytes = new Uint8Array(totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        payloadBytes[i] = pixelIndices[i] & 0x3f;
      }
      break;
    }

    case 8: {
      // 8-bit: 1 byte per pixel (0..255)
      payloadBytes = new Uint8Array(totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        payloadBytes[i] = pixelIndices[i] & 0xff;
      }
      break;
    }

    case 16: {
      // 16-bit: 2 bytes per pixel (Little Endian integer, RGB 5:6:5)
      payloadBytes = new Uint8Array(totalPixels * 2);
      for (let i = 0; i < totalPixels; i++) {
        const val = pixelIndices[i] as number;
        payloadBytes[i * 2] = val & 0xff; // Low byte
        payloadBytes[i * 2 + 1] = (val >> 8) & 0xff; // High byte
      }
      break;
    }

    case 24: {
      // 24-bit: 3 bytes per pixel (BGR order, standard DOS/Windows binary)
      payloadBytes = new Uint8Array(totalPixels * 3);
      for (let i = 0; i < totalPixels; i++) {
        const col = pixelColors[i];
        payloadBytes[i * 3] = col[2]; // Blue
        payloadBytes[i * 3 + 1] = col[1]; // Green
        payloadBytes[i * 3 + 2] = col[0]; // Red
      }
      break;
    }

    case 32: {
      // 32-bit: 4 bytes per pixel (BGRA order, little-endian LONG integer)
      payloadBytes = new Uint8Array(totalPixels * 4);
      for (let i = 0; i < totalPixels; i++) {
        const col = pixelColors[i];
        payloadBytes[i * 4] = col[2]; // Blue
        payloadBytes[i * 4 + 1] = col[1]; // Green
        payloadBytes[i * 4 + 2] = col[0]; // Red
        payloadBytes[i * 4 + 3] = 255; // Alpha
      }
      break;
    }
  }

  // 2. Prepare optional palette block
  // For VGA 8-bit custom palette, VGA hardware DAC uses 6-bit per channel (0..63)
  // 256 colors * 3 = 768 bytes
  let paletteBytes: Uint8Array = new Uint8Array(0);
  const shouldIncludePalette =
    includeCustomPalette &&
    (bitDepth === 8 || bitDepth === 4) &&
    (headerMode === 'qb-header' || headerMode === 'raw');

  if (shouldIncludePalette) {
    const palCount = bitDepth === 8 ? 256 : 16;
    paletteBytes = new Uint8Array(palCount * 3);
    for (let i = 0; i < palCount; i++) {
      const col = palette[i] || [0, 0, 0];
      // Convert 0..255 to 0..63 for VGA hardware DAC
      paletteBytes[i * 3] = Math.min(63, Math.floor(col[0] / 4)); // R (0..63)
      paletteBytes[i * 3 + 1] = Math.min(63, Math.floor(col[1] / 4)); // G (0..63)
      paletteBytes[i * 3 + 2] = Math.min(63, Math.floor(col[2] / 4)); // B (0..63)
    }
  }

  // 3. Assemble Header
  let headerBytes: Uint8Array = new Uint8Array(0);

  if (headerMode === 'qb-header') {
    // 8-byte structured header:
    // 0-1: "QB" (0x51, 0x42)
    // 2-3: Width (16-bit uint LE)
    // 4-5: Height (16-bit uint LE)
    // 6: Bit Depth (1, 2, 3, 4, 6, 8, 16, 24, 32)
    // 7: Flags (Bit 0: has 6-bit DAC palette appended after header)
    headerBytes = new Uint8Array(8);
    headerBytes[0] = 0x51; // 'Q'
    headerBytes[1] = 0x42; // 'B'
    headerBytes[2] = width & 0xff;
    headerBytes[3] = (width >> 8) & 0xff;
    headerBytes[4] = height & 0xff;
    headerBytes[5] = (height >> 8) & 0xff;
    headerBytes[6] = bitDepth;
    headerBytes[7] = shouldIncludePalette ? 1 : 0;
  } else if (headerMode === 'qb-put') {
    // 4-byte QBasic GET/PUT array header:
    // Word 0: Width in bits (width * bitDepth)
    // Word 1: Height in scanlines
    headerBytes = new Uint8Array(4);
    const widthInBits = width * bitDepth;
    headerBytes[0] = widthInBits & 0xff;
    headerBytes[1] = (widthInBits >> 8) & 0xff;
    headerBytes[2] = height & 0xff;
    headerBytes[3] = (height >> 8) & 0xff;
  } else if (headerMode === 'dos-bsave') {
    // 7-byte DOS BSAVE Header:
    // 0: 0xFD
    // 1-2: Segment (&HA000 for VGA, &HB800 for CGA, or &H0000)
    // 3-4: Offset (0x0000)
    // 5-6: Total Payload Length in bytes
    headerBytes = new Uint8Array(7);
    headerBytes[0] = 0xfd;
    const segment = bitDepth === 8 ? 0xa000 : 0x0000;
    headerBytes[1] = segment & 0xff;
    headerBytes[2] = (segment >> 8) & 0xff;
    headerBytes[3] = 0x00;
    headerBytes[4] = 0x00;
    const length = payloadBytes.length;
    headerBytes[5] = length & 0xff;
    headerBytes[6] = (length >> 8) & 0xff;
  }

  // 4. Combine into final binary buffer
  const totalLength = headerBytes.length + paletteBytes.length + payloadBytes.length;
  const binaryData = new Uint8Array(totalLength);

  let offset = 0;
  if (headerBytes.length > 0) {
    binaryData.set(headerBytes, offset);
    offset += headerBytes.length;
  }
  if (paletteBytes.length > 0) {
    binaryData.set(paletteBytes, offset);
    offset += paletteBytes.length;
  }
  binaryData.set(payloadBytes, offset);

  // Generate preview ImageData
  const previewImageData = new ImageData(width, height);
  for (let i = 0; i < totalPixels; i++) {
    const col = pixelColors[i];
    previewImageData.data[i * 4] = col[0];
    previewImageData.data[i * 4 + 1] = col[1];
    previewImageData.data[i * 4 + 2] = col[2];
    previewImageData.data[i * 4 + 3] = 255;
  }

  // Determine native screen mode string
  let screenMode = 'SCREEN 13';
  if (bitDepth === 1) screenMode = width > 320 ? 'SCREEN 11' : 'SCREEN 2';
  else if (bitDepth === 2) screenMode = 'SCREEN 1';
  else if (bitDepth === 3) screenMode = 'SCREEN 7 / SCREEN 13';
  else if (bitDepth === 4) screenMode = width > 320 ? 'SCREEN 12' : 'SCREEN 7';
  else if (bitDepth === 6) screenMode = 'SCREEN 9 / SCREEN 13';
  else if (bitDepth === 8) screenMode = 'SCREEN 13';
  else if (bitDepth >= 16) screenMode = 'QB64 _NEWIMAGE(w, h, 32)';

  return {
    width,
    height,
    bitDepth,
    headerMode,
    binaryData,
    pixelIndices,
    palette,
    previewImageData,
    fileSizeBytes: totalLength,
    headerSizeBytes: headerBytes.length,
    paletteSizeBytes: paletteBytes.length,
    payloadSizeBytes: payloadBytes.length,
    qbasicScreenMode: screenMode,
  };
}
