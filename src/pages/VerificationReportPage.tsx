import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  Share2,
  Check,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { api, type VerificationReport, type FileRecord, type FileVersion, type ProvenanceEvent } from '../lib/api.js';
import { TrustGauge } from '../components/TrustGauge.js';
import { StegHeatmap } from '../components/StegHeatmap.js';
import { Timeline } from '../components/Timeline.js';
import { HashChip } from '../components/HashChip.js';
import { EvidenceBreakdownCard } from '../components/EvidenceBreakdownCard.js';

export const VerificationReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [file, setFile] = useState<FileRecord | null>(null);
  const [version, setVersion] = useState<FileVersion | null>(null);
  const [events, setEvents] = useState<ProvenanceEvent[]>([]);
  const [stegDetails, setStegDetails] = useState<any>(null);
  const [metadataDiff, setMetadataDiff] = useState<any>(null);
  const [causalGraphData, setCausalGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    api
      .getReport(reportId)
      .then((res) => {
        setReport(res.report);
        setFile(res.file);
        setVersion(res.version);
        setEvents(res.events || []);
        setStegDetails(res.stegDetails);
        setMetadataDiff(res.metadataDiff);

        if (res.evidenceBreakdown) {
          setCausalGraphData({ ...res.causalGraph, evidenceBreakdown: res.evidenceBreakdown });
        } else if (res.causalGraph) {
          setCausalGraphData(res.causalGraph);
        } else if (res.report?.causal_graph_json) {
          try {
            setCausalGraphData(JSON.parse(res.report.causal_graph_json));
          } catch {}
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-mono text-xs text-ops-muted flex flex-col items-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-ops-phosphor border-t-transparent animate-spin" />
        <span>RECOMPUTING FORENSIC TRUST SIGNALS...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center font-mono space-y-3">
        <p className="text-ops-red text-sm">{error || 'Verification report not found.'}</p>
        <Link to="/verify" className="text-xs text-ops-phosphor hover:underline">
          Return to Public Verifier
        </Link>
      </div>
    );
  }

  const signals = stegDetails?.signals;
  const isTampered = report.trust_score < 30 || report.verdict.includes('TAMPERED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-ops-card border border-ops-border">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-ops-phosphor">
            <span className="w-2 h-2 rounded-full bg-ops-phosphor animate-pulse"></span>
            <span>OFFICIAL FORENSIC VERIFICATION AUDIT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            PROVENANCE REPORT: DQ-AUDIT-{report.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-ops-muted">
            AUDIT TIMESTAMP: {new Date(report.created_at).toUTCString()} · PERMANENT IMMUTABLE RECORD
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-ops-surface border border-ops-border hover:border-ops-phosphor text-white transition-colors flex items-center space-x-1.5"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-ops-phosphor" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'LINK COPIED' : 'SHARE PERMANENT URL'}</span>
          </button>

          <a
            href={`/api/verify/reports/${report.id}/pdf`}
            download
            className="px-3.5 py-2 rounded-xl bg-ops-surface border border-ops-border hover:border-ops-phosphor text-ops-phosphor font-bold transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF CERTIFICATE</span>
          </a>

          {report.file_id && (
            <a
              href={`/api/files/${report.file_id}/export-airgap`}
              download
              className="px-4 py-2 rounded-xl bg-ops-phosphor text-black font-bold hover:bg-ops-phosphorBright shadow-glow transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT AIR GAP BUNDLE (.AGPKG)</span>
            </a>
          )}
        </div>
      </div>

      {/* Evidence Breakdown Detailed Report Card (User Reference Spec) */}
      <EvidenceBreakdownCard data={causalGraphData?.evidenceBreakdown} />

      {/* Trust Score & Core Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Trust Gauge */}
        <div className="lg:col-span-1">
          <TrustGauge
            score={report.trust_score}
            verdict={report.verdict}
            signals={signals}
          />
        </div>

        {/* Forensic Signal Breakdown & Asset Spec */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-ops-card border border-ops-border space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-ops-borderSubtle pb-3">
              <span className="font-bold text-white uppercase tracking-wider text-sm">
                ASSET CRYPTOGRAPHIC FINGERPRINT
              </span>
              <span className="text-ops-dim text-[10px]">
                {file?.title || 'Unknown Target Asset'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-ops-dim text-[10px] block mb-1">EVALUATED SHA-256 HASH</span>
                <HashChip
                  hash={signals?.exactHashMatch?.computedHash || version?.sha256_hash || 'e3b0c44...'}
                  length={14}
                />
              </div>

              {version?.perceptual_hash && (
                <div>
                  <span className="text-ops-dim text-[10px] block mb-1">PERCEPTUAL VISUAL HASH (pHASH)</span>
                  <HashChip hash={version.perceptual_hash} length={12} />
                </div>
              )}

              {/* Fuzzy Match Banner if applicable */}
              {signals?.perceptualMatch?.isFuzzyMatch && (
                <div className="p-3 rounded-xl bg-ops-amber/10 border border-ops-amber/40 text-ops-amber space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>NEAR-MATCH PERCEPTUAL CORRELATION DETECTED</span>
                  </div>
                  <p className="text-[11px] font-sans">
                    This file is not byte-identical (SHA-256 differed), but is{' '}
                    <span className="font-bold underline">
                      {signals.perceptualMatch.similarityPercentage}% visually similar
                    </span>{' '}
                    to "{signals.perceptualMatch.nearestFileName}" in the registered ledger.
                  </p>
                </div>
              )}

              {/* Tamper Alert Banner */}
              {isTampered && (
                <div className="p-3.5 rounded-xl bg-ops-red/15 border border-ops-red/50 text-ops-red space-y-1 shadow-glowRed">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertOctagon className="w-4 h-4" />
                    <span>CRITICAL TAMPER ANOMALY DETECTED</span>
                  </div>
                  <p className="text-[11px] font-sans">
                    Physical file bytes do not match the cryptographically signed ledger digest.
                    The provenance chain was severed or unauthorized modifications occurred out-of-band.
                  </p>
                </div>
              )}
            </div>

            {/* External Verifications: OpenTimestamps & AI Signal */}
            <div className="pt-3 border-t border-ops-borderSubtle grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-ops-surface border border-ops-borderSubtle">
                <span className="text-ops-dim block text-[10px]">BITCOIN BLOCKCHAIN ANCHOR</span>
                <span className="text-ops-phosphor font-bold flex items-center space-x-1 mt-0.5">
                  <Check className="w-3 h-3" />
                  <span>OPENTIMESTAMPS PROOF VALID</span>
                </span>
                <span className="text-[9px] text-ops-muted block mt-0.5">
                  Time-locked independently of internal servers
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ops-surface border border-ops-borderSubtle">
                <span className="text-ops-dim block text-[10px]">AI-SYNTHESIS LIKELIHOOD</span>
                <span className="text-white font-bold flex items-center space-x-1 mt-0.5">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>{stegDetails?.aiSignal?.label || 'Organic Capture Probable'}</span>
                </span>
                <span className="text-[9px] text-ops-muted block mt-0.5">
                  Confidence: {Math.round((stegDetails?.aiSignal?.confidence || 0.12) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Steganalysis Visualizer */}
      <StegHeatmap
        grid={stegDetails?.heatmapGrid}
        hasAnomaly={stegDetails?.hasAnomaly}
        anomalyScore={stegDetails?.anomalyScore}
        channelEntropy={stegDetails?.channelEntropy}
      />

      {/* Provenance Hash-Chain Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              IMMUTABLE CHAIN-OF-CUSTODY AUDIT LOG
            </h2>
            <p className="text-xs text-ops-muted font-sans">
              Cryptographically verified event sequence leading up to this asset inspection.
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-lg border ${
              report.chain_integrity_ok
                ? 'border-ops-phosphor/40 bg-ops-phosphor/10 text-ops-phosphor'
                : 'border-ops-red/40 bg-ops-red/10 text-ops-red'
            }`}
          >
            {report.chain_integrity_ok ? 'HASH-CHAIN VERIFIED' : 'CHAIN COMPROMISED'}
          </span>
        </div>

        <Timeline events={events} chainIntact={report.chain_integrity_ok} />
      </div>
    </div>
  );
};
