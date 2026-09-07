import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertOctagon, RefreshCw, Download, FileCode } from 'lucide-react';
import { HashChip } from './HashChip.js';

interface LedgerRecord {
  file_name: string;
  file_hash: string;
  version_node: string;
  timestamp: string;
  previous_record_hash: string | null;
  record_hash: string;
}

export const LedgerJsonViewer: React.FC = () => {
  const [ledger, setLedger] = useState<LedgerRecord[]>([]);
  const [status, setStatus] = useState<{ valid: boolean; records: number; problem?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/verify/ledger');
      const data = await res.json();
      setLedger(data.ledger || []);
      setStatus(data.status || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleDownloadLedger = () => {
    const blob = new Blob([JSON.stringify(ledger, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ledger.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 rounded-2xl bg-ops-card border border-ops-border space-y-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ops-borderSubtle pb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white text-sm">LEDGER.JSON // IMMUTABLE APPEND-ONLY CHAIN</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLedger}
            className="px-2.5 py-1 rounded bg-ops-surface border border-ops-border hover:border-ops-phosphor text-ops-muted hover:text-white transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync</span>
          </button>
          <button
            onClick={handleDownloadLedger}
            className="px-2.5 py-1 rounded bg-ops-surface border border-ops-border hover:border-cyan-400 text-cyan-400 transition-colors flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>ledger.json</span>
          </button>
        </div>
      </div>

      {/* Ledger Chain Status Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-ops-surface border border-ops-borderSubtle">
        <div className="flex items-center space-x-2">
          {status?.valid ? (
            <CheckCircle2 className="w-4 h-4 text-ops-phosphor" />
          ) : (
            <AlertOctagon className="w-4 h-4 text-ops-red" />
          )}
          <span className="text-white font-bold text-xs">
            {status?.valid ? 'CRYPTOGRAPHIC LEDGER CHAIN INTACT' : 'CHAIN COMPROMISED'}
          </span>
        </div>
        <span className="text-[11px] text-ops-muted">{status?.records || ledger.length} COMMITTED BLOCKS</span>
      </div>

      {/* Ledger Records Table */}
      {loading ? (
        <div className="py-8 text-center text-ops-muted">READING LEDGER.JSON...</div>
      ) : ledger.length === 0 ? (
        <div className="py-8 text-center text-ops-muted">NO RECORDS IN LEDGER.JSON YET</div>
      ) : (
        <div className="space-y-3">
          {ledger.map((record, index) => (
            <div
              key={record.record_hash || index}
              className="p-4 rounded-xl bg-ops-surface border border-ops-borderSubtle space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ops-borderSubtle pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-ops-card text-ops-phosphor font-bold text-[10px]">
                    ENTRY #{index + 1}
                  </span>
                  <span className="text-white font-bold text-xs truncate max-w-[280px]">
                    {record.file_name}
                  </span>
                </div>
                <span className="text-[10px] text-ops-dim">
                  {new Date(record.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-ops-dim block">FILE SHA-256</span>
                  <HashChip hash={record.file_hash} length={8} />
                </div>
                <div>
                  <span className="text-[10px] text-ops-dim block">VERSION MERKLE NODE</span>
                  <HashChip hash={record.version_node} length={8} />
                </div>
              </div>

              <div className="pt-2 border-t border-ops-borderSubtle grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-ops-dim block">PREVIOUS RECORD HASH</span>
                  <HashChip hash={record.previous_record_hash || 'GENESIS (null)'} length={8} />
                </div>
                <div>
                  <span className="text-[10px] text-ops-dim block">CURRENT RECORD HASH</span>
                  <HashChip hash={record.record_hash} length={8} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
