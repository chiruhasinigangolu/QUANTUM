import React from 'react';
import { ShieldCheck, RefreshCw, ArrowRightLeft, AlertOctagon } from 'lucide-react';

interface StatusChipProps {
  status: 'verified' | 'modified' | 'transferred' | 'tampered' | string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'verified':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border border-ops-phosphor/30 bg-ops-phosphor/10 text-ops-phosphor">
          <ShieldCheck className="w-3 h-3" />
          <span>VERIFIED</span>
        </span>
      );
    case 'modified':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border border-ops-amber/30 bg-ops-amber/10 text-ops-amber">
          <RefreshCw className="w-3 h-3" />
          <span>MODIFIED</span>
        </span>
      );
    case 'transferred':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
          <ArrowRightLeft className="w-3 h-3" />
          <span>TRANSFERRED</span>
        </span>
      );
    case 'tampered':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border border-ops-red/40 bg-ops-red/10 text-ops-red">
          <AlertOctagon className="w-3 h-3" />
          <span>TAMPERED</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border border-ops-border bg-ops-surface text-ops-muted">
          <span>{status.toUpperCase()}</span>
        </span>
      );
  }
};
