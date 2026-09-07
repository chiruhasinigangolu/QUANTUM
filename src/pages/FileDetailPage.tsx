import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  RefreshCw,
  ArrowRightLeft,
  Download,
  FileCheck,
  CheckCircle,
  Clock,
  Layers,
  Search,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { api, type FileRecord, type FileVersion, type ProvenanceEvent } from '../lib/api.js';
import { StatusChip } from '../components/StatusChip.js';
import { HashChip } from '../components/HashChip.js';
import { Timeline } from '../components/Timeline.js';
import { StegHeatmap } from '../components/StegHeatmap.js';

export const FileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [currentVersion, setCurrentVersion] = useState<FileVersion | null>(null);
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [events, setEvents] = useState<ProvenanceEvent[]>([]);
  const [owner, setOwner] = useState<{ id: string; username: string; public_key: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFileDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getFile(id);
      setFile(res.file);
      setCurrentVersion(res.currentVersion);
      setVersions(res.versions);
      setEvents(res.events);
      setOwner(res.owner);
    } catch (err: any) {
      setError(err.message || 'Error fetching file details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileDetails();
  }, [id]);

  const handleRunVerifyNow = async () => {
    if (!currentVersion) return;
    setVerifying(true);
    try {
      // Check if report already exists via version sha
      const res = await api.lookupCode(currentVersion.sha256_hash);
      if (res.report) {
        navigate(`/verify/${res.report.id}`);
      }
    } catch {
      navigate(`/verify`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center font-mono text-xs text-ops-muted flex flex-col items-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-ops-phosphor border-t-transparent animate-spin" />
        <span>RECONSTRUCTING PROVENANCE GRAPH...</span>
      </div>
    );
  }

  if (error || !file || !currentVersion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center font-mono space-y-4">
        <p className="text-ops-red text-sm">{error || 'Asset record could not be loaded.'}</p>
        <Link to="/dashboard" className="text-xs text-ops-phosphor hover:underline">
          Return to Ledger
        </Link>
      </div>
    );
  }

  let metadata: any = {};
  try {
    metadata = JSON.parse(currentVersion.metadata_json);
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-ops-card border border-ops-border">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <StatusChip status={file.status} />
            <span className="text-xs font-mono text-ops-dim">
              FILE ID: {file.id.substring(0, 16)}...
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {file.title}
          </h1>
          <p className="text-xs font-mono text-ops-muted">
            REGISTERED BY: <span className="text-white">@{owner?.username || 'unknown'}</span> ·{' '}
            {new Date(file.created_at).toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <button
            onClick={handleRunVerifyNow}
            disabled={verifying}
            className="px-3.5 py-2 rounded-xl bg-ops-phosphor text-black font-bold hover:bg-ops-phosphorBright shadow-glow transition-all flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{verifying ? 'AUDITING...' : 'VERIFY ASSET NOW'}</span>
          </button>

          <Link
            to={`/files/${file.id}/modify`}
            className="px-3.5 py-2 rounded-xl bg-ops-surface border border-ops-border hover:border-ops-amber/40 text-ops-muted hover:text-ops-amber transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>MODIFY (v+{versions.length})</span>
          </Link>

          <Link
            to={`/files/${file.id}/transfer`}
            className="px-3.5 py-2 rounded-xl bg-ops-surface border border-ops-border hover:border-cyan-400/40 text-ops-muted hover:text-cyan-400 transition-colors flex items-center space-x-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>TRANSFER</span>
          </Link>
        </div>
      </div>

      {/* Grid: Fingerprints & Steganalysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Version Fingerprint Details */}
        <div className="p-6 rounded-2xl bg-ops-card border border-ops-border space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-ops-borderSubtle pb-3">
            <span className="font-bold text-ops-phosphor text-sm">
              LATEST CANONICAL VERSION (v{currentVersion.version_number})
            </span>
            <span className="text-[10px] text-ops-dim">
              {(currentVersion.file_size / 1024).toFixed(2)} KB
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-ops-dim text-[11px] block mb-1">SHA-256 EXACT CRYPTOGRAPHIC HASH</span>
              <HashChip hash={currentVersion.sha256_hash} length={14} />
            </div>

            <div>
              <span className="text-ops-dim text-[11px] block mb-1">PERCEPTUAL VISUAL HASH (pHASH-64)</span>
              <HashChip hash={currentVersion.perceptual_hash} length={10} />
            </div>

            <div>
              <span className="text-ops-dim text-[11px] block mb-1">AUTHOR ECDSA secp256k1 SIGNATURE</span>
              <HashChip hash={currentVersion.signature} length={14} />
            </div>

            <div className="pt-2 border-t border-ops-borderSubtle grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-ops-dim block">MIME TYPE</span>
                <span className="text-white">{currentVersion.mime_type || 'application/octet-stream'}</span>
              </div>
              <div>
                <span className="text-ops-dim block">VERSION COMMITTED</span>
                <span className="text-white">
                  {new Date(currentVersion.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Extracted EXIF / Hardware info if available */}
            {metadata.exif && (
              <div className="p-3 rounded-xl bg-ops-surface border border-ops-borderSubtle text-[11px] space-y-1">
                <span className="text-ops-dim block text-[10px] uppercase">EXTRACTED EXIF TELEMETRY</span>
                {metadata.exif.dimensions && (
                  <div className="text-ops-muted">
                    Resolution: <span className="text-white">{metadata.exif.dimensions.width} x {metadata.exif.dimensions.height} px</span>
                  </div>
                )}
                {metadata.exif.software && (
                  <div className="text-ops-muted">
                    Software: <span className="text-white">{metadata.exif.software}</span>
                  </div>
                )}
                {metadata.exif.make && (
                  <div className="text-ops-muted">
                    Device: <span className="text-white">{metadata.exif.make} {metadata.exif.model}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Steganalysis Visual Heatmap */}
        <StegHeatmap hasAnomaly={file.status === 'tampered'} />
      </div>

      {/* Provenance Hash-Chain Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              IMMUTABLE CHAIN-OF-CUSTODY TIMELINE
            </h2>
            <p className="text-xs text-ops-muted">
              Every creation, modification, transfer, and audit is cryptographically linked via hash-chain.
            </p>
          </div>
          <span className="text-xs text-ops-phosphor px-3 py-1 rounded-lg bg-ops-surface border border-ops-border">
            {events.length} TOTAL AUDIT EVENTS
          </span>
        </div>

        <Timeline events={events} chainIntact={file.status !== 'tampered'} />
      </div>
    </div>
  );
};
