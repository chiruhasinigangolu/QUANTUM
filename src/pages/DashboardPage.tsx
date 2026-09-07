import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  ArrowRightLeft,
  AlertOctagon,
  ExternalLink,
  Clock,
  Layers,
} from 'lucide-react';
import { api, type FileRecord, type User } from '../lib/api.js';
import { StatusChip } from '../components/StatusChip.js';
import { HashChip } from '../components/HashChip.js';

interface DashboardPageProps {
  user: User;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [globalGraph, setGlobalGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await api.getFiles();
      setFiles(res.files);

      const graphRes = await fetch('/api/verify/graph/global');
      if (graphRes.ok) {
        const gData = await graphRes.json();
        setGlobalGraph(gData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.currentVersion?.sha256_hash?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || f.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const verifiedCount = files.filter((f) => f.status === 'verified').length;
  const modifiedCount = files.filter((f) => f.status === 'modified').length;
  const transferredCount = files.filter((f) => f.status === 'transferred').length;
  const tamperedCount = files.filter((f) => f.status === 'tampered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 font-mono text-xs text-ops-phosphor mb-1">
            <span className="w-2 h-2 rounded-full bg-ops-phosphor animate-pulse"></span>
            <span>PROVENANCE LEDGER // CUSTODY IDENTITY: @{user.username}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
            REGISTERED FORENSIC ASSETS
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/files/new"
            className="px-4 py-2 rounded-xl bg-ops-phosphor text-black font-mono font-bold text-xs hover:bg-ops-phosphorBright shadow-glow transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>REGISTER NEW ASSET</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-2xl bg-ops-card border border-ops-border">
          <div className="flex items-center justify-between text-xs text-ops-muted mb-1">
            <span>TOTAL ASSETS</span>
            <Layers className="w-4 h-4 text-ops-dim" />
          </div>
          <div className="text-2xl font-bold text-white">{files.length}</div>
          <div className="text-[10px] text-ops-dim mt-1">Under Cryptographic Custody</div>
        </div>

        <div className="p-4 rounded-2xl bg-ops-card border border-ops-border">
          <div className="flex items-center justify-between text-xs text-ops-phosphor mb-1">
            <span>VERIFIED INTACT</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-ops-phosphor">{verifiedCount}</div>
          <div className="text-[10px] text-ops-muted mt-1">Hash-Chain Validated</div>
        </div>

        <div className="p-4 rounded-2xl bg-ops-card border border-ops-border">
          <div className="flex items-center justify-between text-xs text-cyan-400 mb-1">
            <span>TRANSFERRED</span>
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{transferredCount}</div>
          <div className="text-[10px] text-ops-muted mt-1">Custody Handoffs Signed</div>
        </div>

        <div className="p-4 rounded-2xl bg-ops-card border border-ops-border">
          <div className="flex items-center justify-between text-xs text-ops-red mb-1">
            <span>ANOMALIES / TAMPER</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-ops-red">{tamperedCount}</div>
          <div className="text-[10px] text-ops-muted mt-1">Integrity Alerts Raised</div>
        </div>
      </div>


      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-ops-surface border border-ops-border font-mono text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-ops-dim absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by asset title or SHA-256 hash..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-ops-card border border-ops-border text-white placeholder-ops-dim focus:outline-none focus:border-ops-phosphor"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {['ALL', 'VERIFIED', 'MODIFIED', 'TRANSFERRED', 'TAMPERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors text-[11px] ${
                statusFilter === st
                  ? 'bg-ops-phosphor text-black font-bold'
                  : 'bg-ops-card text-ops-muted hover:text-white border border-ops-borderSubtle'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid / List */}
      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-ops-muted flex flex-col items-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-ops-phosphor border-t-transparent animate-spin" />
          <span>QUERYING CRYPTOGRAPHIC LEDGER...</span>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-ops-card border border-ops-border font-mono space-y-3">
          <FileText className="w-10 h-10 text-ops-dim mx-auto" />
          <p className="text-white text-sm">NO FORENSIC ASSETS FOUND MATCHING QUERY</p>
          <p className="text-xs text-ops-muted">Register a new file or adjust your search filters.</p>
          <Link
            to="/files/new"
            className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-ops-surface border border-ops-phosphor/40 text-ops-phosphor text-xs hover:bg-ops-phosphor/10 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register First Asset</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-5 rounded-2xl ops-card flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusChip status={file.status} />
                  <span className="text-[10px] font-mono text-ops-dim flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-mono font-bold text-sm text-white group-hover:text-ops-phosphor transition-colors truncate">
                    {file.title}
                  </h3>
                  <p className="text-[11px] font-mono text-ops-muted mt-0.5 uppercase">
                    TYPE: {file.file_type} · {file.eventCount || 1} EVENT CHAIN
                  </p>
                </div>

                {/* Fingerprint Chips */}
                {file.currentVersion && (
                  <div className="pt-2 border-t border-ops-borderSubtle space-y-1.5">
                    <div>
                      <span className="text-[10px] font-mono text-ops-dim block">LATEST SHA-256</span>
                      <HashChip hash={file.currentVersion.sha256_hash} length={8} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-ops-dim block">PERCEPTUAL HASH</span>
                      <HashChip hash={file.currentVersion.perceptual_hash} length={8} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-ops-borderSubtle flex items-center justify-between font-mono text-xs">
                <Link
                  to={`/files/${file.id}`}
                  className="text-ops-phosphor hover:underline flex items-center space-x-1"
                >
                  <span>INSPECT LINEAGE</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/files/${file.id}/modify`}
                    className="px-2 py-1 rounded bg-ops-surface border border-ops-borderSubtle hover:border-ops-amber/40 text-ops-muted hover:text-ops-amber text-[10px] transition-colors"
                  >
                    MODIFY
                  </Link>
                  <Link
                    to={`/files/${file.id}/transfer`}
                    className="px-2 py-1 rounded bg-ops-surface border border-ops-borderSubtle hover:border-cyan-400/40 text-ops-muted hover:text-cyan-400 text-[10px] transition-colors"
                  >
                    TRANSFER
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
