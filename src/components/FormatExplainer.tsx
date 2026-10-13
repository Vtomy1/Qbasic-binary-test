import React from 'react';
import { BookOpen, Cpu, Layers, HardDrive } from 'lucide-react';

export const FormatExplainer: React.FC = () => {
  return (
    <div className="space-y-6 text-neutral-300 text-xs leading-relaxed max-w-5xl mx-auto p-4">
      {/* Intro */}
      <div className="bg-neutral-900 border border-neutral-800 rounded p-4">
        <div className="flex items-center gap-2 mb-2 text-neutral-100 font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>QBasic Binary Graphics & Memory Architecture Reference</span>
        </div>
        <p className="text-neutral-400">
          In MS-DOS and Microsoft QuickBASIC, files opened with{' '}
          <code className="text-blue-300 bg-neutral-950 px-1 py-0.5 rounded font-mono">
            OPEN "file.bin" FOR BINARY AS #1
          </code>{' '}
          provide unformatted, byte-for-byte stream access using{' '}
          <code className="text-blue-300 bg-neutral-950 px-1 py-0.5 rounded font-mono">
            GET #1, [record], variable
          </code>{' '}
          and{' '}
          <code className="text-blue-300 bg-neutral-950 px-1 py-0.5 rounded font-mono">
            PUT #1, [record], variable
          </code>
          . This makes binary files the fastest and most compact method for storing and blitting images.
        </p>
      </div>

      {/* Bit Depth & Packing Matrix */}
      <div className="bg-neutral-900 border border-neutral-800 rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2 text-neutral-100 font-semibold text-sm">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Bit Depth Packing Specifications</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="px-4 py-2.5">Bit Depth</th>
                <th className="px-4 py-2.5">Max Colors</th>
                <th className="px-4 py-2.5">Pixels / Byte</th>
                <th className="px-4 py-2.5">Packing Formula</th>
                <th className="px-4 py-2.5">QBasic Screen Mode</th>
                <th className="px-4 py-2.5">Memory Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 font-mono text-[11px]">
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">1-bit</td>
                <td className="px-4 py-2 text-neutral-300">2 (Monochrome)</td>
                <td className="px-4 py-2 text-neutral-300">8 pixels / byte</td>
                <td className="px-4 py-2 text-neutral-400">
                  (b% AND 2^(7 - px%)) &lt;&gt; 0
                </td>
                <td className="px-4 py-2 text-blue-400">SCREEN 11 / SCREEN 2</td>
                <td className="px-4 py-2 text-neutral-400">Scanline bitstream</td>
              </tr>
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">2-bit</td>
                <td className="px-4 py-2 text-neutral-300">4 (CGA Palettes)</td>
                <td className="px-4 py-2 text-neutral-300">4 pixels / byte</td>
                <td className="px-4 py-2 text-neutral-400">
                  (b% \ 2^(shift%)) AND 3
                </td>
                <td className="px-4 py-2 text-blue-400">SCREEN 1 (320×200)</td>
                <td className="px-4 py-2 text-neutral-400">Interleaved banks &HB800</td>
              </tr>
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">3-bit</td>
                <td className="px-4 py-2 text-neutral-300">8 (Primaries)</td>
                <td className="px-4 py-2 text-neutral-300">2 pixels / byte</td>
                <td className="px-4 py-2 text-neutral-400">
                  p0 = b% AND 7, p1 = (b% \ 16) AND 7
                </td>
                <td className="px-4 py-2 text-blue-400">SCREEN 7 / SCREEN 13</td>
                <td className="px-4 py-2 text-neutral-400">Nibble packed (RGB)</td>
              </tr>
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">4-bit</td>
                <td className="px-4 py-2 text-neutral-300">16 (EGA/VGA Standard)</td>
                <td className="px-4 py-2 text-neutral-300">2 pixels / byte</td>
                <td className="px-4 py-2 text-neutral-400">
                  p0 = (b% \ 16) AND 15, p1 = b% AND 15
                </td>
                <td className="px-4 py-2 text-blue-400">SCREEN 7 / 9 / 12</td>
                <td className="px-4 py-2 text-neutral-400">Planar EGA / Packed Nibbles</td>
              </tr>
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">6-bit</td>
                <td className="px-4 py-2 text-neutral-300">64 (EGA Hardware)</td>
                <td className="px-4 py-2 text-neutral-300">1 pixel / byte</td>
                <td className="px-4 py-2 text-neutral-400">b% AND 63 (2:2:2 RGB)</td>
                <td className="px-4 py-2 text-blue-400">SCREEN 9 / SCREEN 13</td>
                <td className="px-4 py-2 text-neutral-400">DAC Register Palette</td>
              </tr>
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">8-bit</td>
                <td className="px-4 py-2 text-neutral-300">256 (VGA Colors)</td>
                <td className="px-4 py-2 text-neutral-300">1 pixel / byte</td>
                <td className="px-4 py-2 text-neutral-400">ASC(rowBuffer$) (0..255)</td>
                <td className="px-4 py-2 text-blue-400">SCREEN 13 (320×200)</td>
                <td className="px-4 py-2 text-neutral-400">Linear 64,000 bytes &HA000</td>
              </tr>
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">16-bit</td>
                <td className="px-4 py-2 text-neutral-300">65,536 (HighColor)</td>
                <td className="px-4 py-2 text-neutral-300">2 bytes / pixel</td>
                <td className="px-4 py-2 text-neutral-400">
                  GET #1, , px% (RGB 5:6:5 LE)
                </td>
                <td className="px-4 py-2 text-blue-400">QB64 / VESA HighColor</td>
                <td className="px-4 py-2 text-neutral-400">16-bit Word Stream</td>
              </tr>
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">24-bit</td>
                <td className="px-4 py-2 text-neutral-300">16.7M (TrueColor)</td>
                <td className="px-4 py-2 text-neutral-300">3 bytes / pixel</td>
                <td className="px-4 py-2 text-neutral-400">
                  Blue, Green, Red bytes
                </td>
                <td className="px-4 py-2 text-blue-400">QB64 _NEWIMAGE(,32)</td>
                <td className="px-4 py-2 text-neutral-400">BGR Byte Stream</td>
              </tr>
              <tr className="hover:bg-neutral-800/40">
                <td className="px-4 py-2 font-semibold text-white">32-bit</td>
                <td className="px-4 py-2 text-neutral-300">16.7M + Alpha</td>
                <td className="px-4 py-2 text-neutral-300">4 bytes / pixel</td>
                <td className="px-4 py-2 text-neutral-400">
                  GET #1, , pixel& (LONG)
                </td>
                <td className="px-4 py-2 text-blue-400">QB64 _RGB32 / _MEM</td>
                <td className="px-4 py-2 text-neutral-400">BGRA 32-bit Longs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Hardware Ports and Tips */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* VGA DAC Palette Programming */}
        <div className="bg-neutral-900 border border-neutral-800 rounded p-4">
          <div className="flex items-center gap-2 mb-2 text-neutral-100 font-semibold text-sm">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>VGA Hardware DAC Palette Ports</span>
          </div>
          <p className="text-neutral-400 mb-3">
            In SCREEN 13, the VGA hardware palette has 256 color registers programmed via I/O ports. Unlike 24-bit RGB (0..255), standard VGA hardware DAC registers only accept <strong>6-bit values (0 to 63)</strong>!
          </p>
          <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1">
            <div className="text-cyan-400">' Program Palette Color #i% in QBasic:</div>
            <div>OUT &amp;H3C8, i% <span className="text-neutral-500">' Address register</span></div>
            <div>OUT &amp;H3C9, red% <span className="text-neutral-500">' 0 to 63 (R \ 4)</span></div>
            <div>OUT &amp;H3C9, green% <span className="text-neutral-500">' 0 to 63 (G \ 4)</span></div>
            <div>OUT &amp;H3C9, blue% <span className="text-neutral-500">' 0 to 63 (B \ 4)</span></div>
          </div>
        </div>

        {/* Video RAM Direct Access */}
        <div className="bg-neutral-900 border border-neutral-800 rounded p-4">
          <div className="flex items-center gap-2 mb-2 text-neutral-100 font-semibold text-sm">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>Direct Video RAM (DEF SEG = &amp;HA000)</span>
          </div>
          <p className="text-neutral-400 mb-3">
            In SCREEN 13 (320×200), each pixel directly maps to a memory address starting at segment{' '}
            <code className="text-neutral-200 bg-neutral-950 px-1 py-0.5 rounded font-mono">&amp;HA000</code>.
            Because memory is linearly mapped (320 × 200 = 64,000 bytes, fitting in a single 64KB segment), you can write entire screens instantly using <code className="text-neutral-200 bg-neutral-950 px-1 py-0.5 rounded font-mono">BLOAD</code>:
          </p>
          <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1">
            <div className="text-cyan-400">' Instant BLOAD in QBasic 1.1:</div>
            <div>DEF SEG = &amp;HA000</div>
            <div>BLOAD "IMAGE.BIN", 0</div>
            <div>DEF SEG <span className="text-neutral-500">' Always restore segment!</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
