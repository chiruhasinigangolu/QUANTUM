import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface HashChipProps {
  hash: string;
  label?: string;
  length?: number;
}

export const HashChip: React.FC<HashChipProps> = ({ hash, label, length = 10 }) => {
  const [copied, setCopied] = useState(false);

  if (!hash) {
    return <span className="text-ops-dim font-mono text-xs">--</span>;
  }

  const truncated =
    hash.length > length * 2
      ? `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`
      : hash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-ops-surface border border-ops-borderSubtle text-ops-muted hover:border-ops-phosphor/40 hover:text-white transition-colors cursor-pointer group text-xs font-mono"
      onClick={handleCopy}
      title={`Click to copy full hash:\n${hash}`}
    >
      {label && <span className="text-ops-dim text-[10px]">{label}:</span>}
      <span className="text-ops-phosphor font-medium">{truncated}</span>
      <button className="text-ops-dim group-hover:text-ops-phosphor transition-colors">
        {copied ? <Check className="w-3 h-3 text-ops-phosphor" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
};
