import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, Hash, Database } from 'lucide-react';
import { ConversionResult } from '../types/qbasic';

interface HexViewerProps {
  result: ConversionResult | null;
  filename: string;
  onDownloadBin: () => void;
}

export const HexViewer: React.FC<HexViewerProps> = ({
  result,
  filename,
  onDownloadBin,
}) => {
  const [page, setPage] = useState<number>(0);
  const rowsPerPage = 32; // 32 rows * 16 bytes = 512 bytes per page

  if (!result) {
    return (
      <div className="p-8 text-center text-neutral-500 text-sm">
        No binary data generated yet.
      </div>
    );
  }

  const {
    binaryData,
    fileSizeBytes,
    headerSizeBytes,
    paletteSizeBytes,
    payloadSizeBytes,
    headerMode,
    bitDepth,
  } = result;

  const totalPages = Math.max(1, Math.ceil(fileSizeBytes / (rowsPerPage * 16)));
  const currentPage = Math.min(page, totalPages - 1);
  const startByte = currentPage * rowsPerPage * 16;
  const endByte = Math.min(fileSizeBytes, startByte + rowsPerPage * 16);

  // Generate rows
  const rows: {
    offset: number;
    hexBytes: { byte: number; type: 'header' | 'palette' | 'payload' }[];
    ascii: string;
  }[] = [];

  for (let offset = startByte; offset < endByte; offset += 16) {
    const rowBytes: { byte: number; type: 'header' | 'palette' | 'payload' }[] = [];
    let asciiStr = '';

    for (let i = 0; i < 16; i++) {
      const idx = offset + i;
      if (idx < fileSizeBytes) {
        const b = binaryData[idx];
        let type: 'header' | 'palette' | 'payload' = 'payload';
        if (idx < headerSizeBytes) {
          type = 'header';
        } else if (idx < headerSizeBytes + paletteSizeBytes) {
          type = 'palette';
        }

        rowBytes.push({ byte: b, type });
        // ASCII printable character
        asciiStr += b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
      }
    }

    rows.push({ offset, hexBytes: rowBytes, ascii: asciiStr });
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded flex flex-col h-full text-xs">
      {/* Top Bar with Metrics & Download */}
      <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-900">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-neutral-100 text-sm">
              Binary Stream Inspector
            </span>
            <span className="text-neutral-500 font-mono text-xs">
              {filename.toUpperCase().endsWith('.BIN')
                ? filename.toUpperCase()
                : `${filename.toUpperCase()}.BIN`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400 text-xs mt-1">
            <span>
              Total: <strong className="text-neutral-200 tabular-nums font-mono">{fileSizeBytes}</strong> bytes
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Header: <strong className="text-blue-400 tabular-nums font-mono">{headerSizeBytes}</strong> B ({headerMode})
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Palette: <strong className="text-emerald-400 tabular-nums font-mono">{paletteSizeBytes}</strong> B
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Pixels: <strong className="text-amber-400 tabular-nums font-mono">{payloadSizeBytes}</strong> B ({bitDepth}-bit)
            </span>
          </div>
        </div>

        <button
          onClick={onDownloadBin}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .BIN File</span>
        </button>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-800/80 flex items-center gap-4 text-[11px] text-neutral-400">
        <span className="text-neutral-500">Color Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-none bg-blue-500/30 border border-blue-500 inline-block" />
          <span className="text-blue-300">Header Bytes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-none bg-emerald-500/30 border border-emerald-500 inline-block" />
          <span className="text-emerald-300">Palette Bytes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-none bg-neutral-700 border border-neutral-600 inline-block" />
          <span className="text-neutral-300">Pixel Payload</span>
        </div>
      </div>

      {/* Hex Dump Table */}
      <div className="flex-1 overflow-auto p-4 font-mono text-[12px] bg-neutral-950 selection:bg-blue-900 leading-relaxed">
        <div className="min-w-[640px]">
          {/* Header Row */}
          <div className="text-neutral-600 pb-1.5 border-b border-neutral-800/60 flex items-center">
            <span className="w-24 shrink-0 font-semibold">OFFSET</span>
            <div className="flex-1 flex gap-2">
              <span className="w-80">
                00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F
              </span>
              <span className="text-neutral-500 font-semibold pl-4">ASCII DECODE</span>
            </div>
          </div>

          {/* Data Rows */}
          {rows.map((row) => (
            <div
              key={row.offset}
              className="flex items-center py-0.5 hover:bg-neutral-900/60 transition-colors"
            >
              {/* Offset */}
              <span className="w-24 shrink-0 text-neutral-500 select-none">
                {row.offset.toString(16).padStart(8, '0').toUpperCase()}:
              </span>

              {/* Hex Bytes */}
              <div className="w-80 flex flex-wrap gap-x-1.5 gap-y-0.5">
                {row.hexBytes.map((item, bIdx) => {
                  let colorClass = 'text-neutral-300';
                  if (item.type === 'header') colorClass = 'text-blue-400 font-semibold';
                  if (item.type === 'palette') colorClass = 'text-emerald-400 font-semibold';

                  return (
                    <span
                      key={bIdx}
                      className={`${colorClass} ${bIdx === 7 ? 'mr-2' : ''}`}
                    >
                      {item.byte.toString(16).padStart(2, '0').toUpperCase()}
                    </span>
                  );
                })}
                {/* Pad empty bytes if last line */}
                {Array.from({ length: 16 - row.hexBytes.length }).map((_, padIdx) => (
                  <span key={`pad-${padIdx}`} className="text-neutral-800">
                    ..
                  </span>
                ))}
              </div>

              {/* ASCII view */}
              <span className="text-neutral-400 pl-4 border-l border-neutral-800/80 font-mono tracking-widest">
                {row.ascii}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="px-4 py-2.5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <div>
          Showing bytes{' '}
          <strong className="text-neutral-200 tabular-nums">
            {startByte} - {endByte}
          </strong>{' '}
          of <strong className="text-neutral-200 tabular-nums">{fileSizeBytes}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-300 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <span className="font-mono text-neutral-300 tabular-nums px-1">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-300 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
