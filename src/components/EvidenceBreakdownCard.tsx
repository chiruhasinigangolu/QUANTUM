import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface EvidenceBreakdownItem {
  name: string;
  score: number;
  passed: boolean;
}

export interface EvidenceRelationshipMetrics {
  temporalConsistency: { score: number; passed: boolean };
  locationConsistency: { score: number; passed: boolean };
  sourceIndependence: { score: number; passed: boolean };
  provenanceCompleteness: { score: number; passed: boolean };
}

export interface EvidenceBreakdownData {
  fileAuthenticity?: EvidenceBreakdownItem[];
  evidenceRelationship?: EvidenceRelationshipMetrics;
  overallCaseTrust?: number;
}

interface Props {
  data?: EvidenceBreakdownData;
}

export const EvidenceBreakdownCard: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const authenticityList = data.fileAuthenticity || [];
  const rel = data.evidenceRelationship || {
    temporalConsistency: { score: 98, passed: true },
    locationConsistency: { score: 92, passed: true },
    sourceIndependence: { score: 85, passed: true },
    provenanceCompleteness: { score: 95, passed: true },
  };

  const caseTrust = data.overallCaseTrust ?? 90;
  const isMalicious = caseTrust < 50;
  const isGenuine = caseTrust >= 80;

  const renderStatus = (passed: boolean, score: number) => {
    return (
      <span className="font-mono flex items-center gap-1.5 justify-end">
        {passed ? (
          <span className="text-emerald-400 font-bold">✓</span>
        ) : (
          <span className="text-red-400 font-bold">⚠️</span>
        )}
        <span
          className={`font-semibold ${
            score >= 80 ? 'text-emerald-300' : score >= 50 ? 'text-amber-300' : 'text-red-400 font-bold'
          }`}
        >
          {score}%
        </span>
      </span>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 font-mono">
      {/* Header Banner */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
            <span>📊</span> Evidence Breakdown
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isGenuine
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isMalicious
                ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-glowRed animate-pulse'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {isGenuine ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED GENUINE (&gt;80)
              </>
            ) : isMalicious ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" /> MALICIOUS / TAMPERED (&lt;50)
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" /> MODIFIED / SUSPICIOUS
              </>
            )}
          </span>
        </div>
        <p className="text-sm text-slate-400 font-sans">
          Dynamic Forensic Evidence Analysis & Signal Breakdown:
        </p>
      </div>

      {/* Main Reference Design Card */}
      <div
        className={`p-6 rounded-3xl bg-[#14161a] border shadow-2xl space-y-6 text-slate-200 transition-all ${
          isMalicious ? 'border-red-500/40 shadow-red-950/40' : 'border-slate-800/80'
        }`}
      >
        {/* MALICIOUS WARNING BANNER IF APPLICABLE */}
        {isMalicious && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-sans space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>DEFACEMENT / MALICIOUS TAMPERING CONFIRMED</span>
            </div>
            <p className="text-[11px] text-red-200/90 leading-relaxed">
              Forensic signal checks failed. The cryptographic hash, steganography baseline, or provenance timeline was compromised.
            </p>
          </div>
        )}

        {/* FILE AUTHENTICITY Section */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-400">
            FILE AUTHENTICITY
          </div>
          <div className="h-[1px] bg-slate-800/80 w-full" />
          <div className="space-y-2.5 pt-1 text-sm">
            {authenticityList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-300 font-mono">{item.name}</span>
                {renderStatus(item.passed, item.score)}
              </div>
            ))}
          </div>
        </div>

        {/* EVIDENCE RELATIONSHIP Section */}
        <div className="space-y-3 pt-2">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-400">
            EVIDENCE RELATIONSHIP
          </div>
          <div className="h-[1px] bg-slate-800/80 w-full" />
          <div className="space-y-3 pt-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-mono">Temporal consistency</span>
              {renderStatus(rel.temporalConsistency.passed, rel.temporalConsistency.score)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-mono">Location consistency</span>
              {renderStatus(rel.locationConsistency.passed, rel.locationConsistency.score)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-mono">Source independence</span>
              {renderStatus(rel.sourceIndependence.passed, rel.sourceIndependence.score)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-mono">Provenance completeness</span>
              {renderStatus(rel.provenanceCompleteness.passed, rel.provenanceCompleteness.score)}
            </div>
          </div>
        </div>

        {/* OVERALL CASE TRUST Footer */}
        <div className="pt-3">
          <div className="h-[1px] bg-slate-800/80 w-full mb-5" />
          <div className="flex items-center justify-between text-sm font-bold tracking-wider">
            <span className="uppercase text-slate-300">OVERALL CASE TRUST</span>
            <span
              className={`text-base font-mono font-extrabold ${
                isGenuine
                  ? 'text-emerald-400'
                  : isMalicious
                  ? 'text-red-400 font-black tracking-widest animate-pulse'
                  : 'text-amber-400'
              }`}
            >
              {caseTrust}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
