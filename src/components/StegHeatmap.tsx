import React, { useState } from 'react';
import { Eye, ShieldAlert, CheckCircle } from 'lucide-react';

interface StegHeatmapProps {
  grid?: number[][]; // 8x8 matrix
  hasAnomaly?: boolean;
  anomalyScore?: number;
  channelEntropy?: {
    overall?: number;
    red?: number;
    green?: number;
    blue?: number;
  };
}

export const StegHeatmap: React.FC<StegHeatmapProps> = ({
  grid,
  hasAnomaly = false,
  anomalyScore = 0.05,
  channelEntropy,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; val: number } | null>(null);

  // Fallback 8x8 grid if not provided
  const displayGrid =
    grid && grid.length > 0
      ? grid
      : Array.from({ length: 8 }, () =>
          Array.from({ length: 8 }, () => (hasAnomaly ? Math.floor(Math.random() * 40 + 60) : Math.floor(Math.random() * 20 + 10)))
        );

  const getCellColor = (val: number) => {
    // Green <= 35: Normal / natural variation
    // Yellow 36-70: Slightly unusual
    // Red > 70: Strong anomaly
    if (val > 70) {
      const alpha = Math.min(1, 0.5 + (val - 70) / 50);
      return `rgba(239, 68, 68, ${alpha})`;
    }
    if (val > 35) {
      const alpha = Math.min(1, 0.4 + (val - 35) / 50);
      return `rgba(245, 158, 11, ${alpha})`;
    }
    const alpha = Math.min(1, 0.25 + val / 100);
    return `rgba(34, 197, 94, ${alpha})`;
  };

  return (
    <div className="p-5 rounded-2xl bg-ops-card border border-ops-border flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 font-mono">
          <Eye className="w-4 h-4 text-ops-phosphor" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            LSB BIT-PLANE STEGANALYSIS HEATMAP
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            hasAnomaly
              ? 'border-ops-red/40 bg-ops-red/10 text-ops-red'
              : 'border-ops-phosphor/40 bg-ops-phosphor/10 text-ops-phosphor'
          }`}
        >
          {hasAnomaly ? 'LSB ANOMALY DETECTED' : 'HOMOGENEOUS NOISE BASELINE'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* 8x8 Grid Canvas */}
        <div className="relative p-2 rounded-xl bg-ops-surface border border-ops-borderSubtle">
          <div className="grid grid-cols-8 gap-1 w-48 h-48 sm:w-56 sm:h-56">
            {displayGrid.map((row, rIdx) =>
              row.map((val, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="rounded-sm transition-transform hover:scale-110 cursor-crosshair border border-white/5"
                  style={{ backgroundColor: getCellColor(val) }}
                  onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx, val })}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              ))
            )}
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="flex-1 w-full space-y-3 font-mono text-xs">
          {/* Cell inspect preview */}
          <div className="p-3 rounded-xl bg-ops-surface border border-ops-borderSubtle">
            <span className="text-[10px] text-ops-dim uppercase block mb-1">SELECTED INSPECTION BLOCK</span>
            {hoveredCell ? (
              <div className="flex items-center justify-between">
                <span className="text-white">Block [{hoveredCell.row}, {hoveredCell.col}]</span>
                <span
                  className={`font-bold ${
                    hoveredCell.val > 70
                      ? 'text-ops-red'
                      : hoveredCell.val > 35
                      ? 'text-ops-amber'
                      : 'text-ops-phosphor'
                  }`}
                >
                  LSB Density: {hoveredCell.val}%
                </span>
              </div>
            ) : (
              <span className="text-ops-muted text-[11px]">Hover over matrix cells to inspect regional entropy.</span>
            )}
          </div>

          {/* Channel Entropy Metrics */}
          {channelEntropy && (
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-ops-surface border border-ops-borderSubtle">
                <span className="text-ops-dim block">R-CHANNEL</span>
                <span className="text-ops-phosphor font-bold">{channelEntropy.red ?? '0.982'}</span>
              </div>
              <div className="p-2 rounded-lg bg-ops-surface border border-ops-borderSubtle">
                <span className="text-ops-dim block">G-CHANNEL</span>
                <span className="text-ops-phosphor font-bold">{channelEntropy.green ?? '0.991'}</span>
              </div>
              <div className="p-2 rounded-lg bg-ops-surface border border-ops-borderSubtle">
                <span className="text-ops-dim block">B-CHANNEL</span>
                <span className="text-ops-phosphor font-bold">{channelEntropy.blue ?? '0.985'}</span>
              </div>
            </div>
          )}

          {/* Matrix Color Key */}
          <div className="flex items-center justify-between text-[10px] text-ops-muted pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-ops-phosphor/60"></span>
              <span>Green: Normal / natural variation</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-ops-amber/70"></span>
              <span>Yellow: Slightly unusual</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-ops-red/80"></span>
              <span>Red: Strong anomaly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
