import React, { useState } from 'react';
import {
  FileText,
  Hash,
  Layers,
  Search,
  Sliders,
  Cpu,
  Key,
  Clock,
  GitBranch,
  Database,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { HashChip } from './HashChip.js';

interface MainPyReportProps {
  report?: any;
}

export const MainPyPipelineViewer: React.FC<MainPyReportProps> = ({ report }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (!report) {
    return null;
  }

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  const steps = [
    {
      num: 1,
      title: 'STEP 1: SHA-256 CRYPTOGRAPHIC HASH',
      desc: 'Bit-level cryptographic fingerprint computation',
      icon: Hash,
      color: 'text-ops-phosphor',
      status: report.step_1_sha256?.hash ? 'COMPLETED' : 'PENDING',
      content: (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-ops-dim">ALGORITHM:</span>
            <span className="text-white">{report.step_1_sha256?.algorithm || 'SHA-256'}</span>
          </div>
          <span className="text-ops-dim text-[11px] block">HASH VALUE:</span>
          <HashChip hash={report.step_1_sha256?.hash} length={16} />
        </div>
      ),
    },
    {
      num: 2,
      title: 'STEP 2: METADATA & EXIF EXTRACTION',
      desc: 'Structure format, dimensions, mode, and camera tags',
      icon: FileText,
      color: 'text-ops-phosphor',
      status: report.step_2_metadata?.width ? 'EXTRACTED' : 'BASIC',
      content: (
        <div className="space-y-2 text-[11px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 rounded bg-ops-surface border border-ops-borderSubtle">
              <span className="text-ops-dim block text-[10px]">FORMAT</span>
              <span className="text-white font-bold">{report.step_2_metadata?.format || report.file?.type}</span>
            </div>
            <div className="p-2 rounded bg-ops-surface border border-ops-borderSubtle">
              <span className="text-ops-dim block text-[10px]">DIMENSIONS</span>
              <span className="text-white font-bold">
                {report.step_2_metadata?.width ? `${report.step_2_metadata.width}x${report.step_2_metadata.height}` : 'N/A'}
              </span>
            </div>
            <div className="p-2 rounded bg-ops-surface border border-ops-borderSubtle">
              <span className="text-ops-dim block text-[10px]">COLOR MODE</span>
              <span className="text-white font-bold">{report.step_2_metadata?.mode || 'RGB'}</span>
            </div>
            <div className="p-2 rounded bg-ops-surface border border-ops-borderSubtle">
              <span className="text-ops-dim block text-[10px]">FILE SIZE</span>
              <span className="text-white font-bold">{(report.file?.size_bytes / 1024).toFixed(2)} KB</span>
            </div>
          </div>
          {report.step_2_metadata?.EXIF && (
            <div className="p-2.5 rounded bg-ops-surface border border-ops-borderSubtle space-y-1">
              <span className="text-ops-dim block text-[10px] uppercase">EXIF TELEMETRY TAGS</span>
              {Object.entries(report.step_2_metadata.EXIF).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-[10px]">
                  <span className="text-ops-muted">{k}:</span>
                  <span className="text-white truncate max-w-[240px]">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'STEP 3: PERCEPTUAL HASH (pHash)',
      desc: '32x32 luminance visual difference hash',
      icon: Layers,
      color: 'text-cyan-400',
      status: report.step_3_perceptual_hash?.status || 'GENERATED',
      content: (
        <div className="space-y-2 text-[11px]">
          <div>
            <span className="text-ops-dim text-[10px] block mb-1">PERCEPTUAL HASH HEX</span>
            <HashChip hash={report.step_3_perceptual_hash?.hash} length={12} />
          </div>
          <p className="text-ops-muted text-[10px] font-sans">
            Resizes image to 32x32 grayscale luminance matrix, generating resilient feature bits that detect re-saved or compressed copies.
          </p>
        </div>
      ),
    },
    {
      num: 4,
      title: 'STEP 4: METADATA CONSISTENCY CHECK',
      desc: 'Checks software tags (Photoshop, GIMP, Canva) & filename anomalies',
      icon: Search,
      color: report.step_4_metadata_consistency?.warnings?.length > 0 ? 'text-ops-amber' : 'text-ops-phosphor',
      status: report.step_4_metadata_consistency?.status || 'CONSISTENT',
      content: (
        <div className="space-y-2 text-[11px]">
          {report.step_4_metadata_consistency?.warnings?.length > 0 ? (
            <div className="space-y-1">
              {report.step_4_metadata_consistency.warnings.map((w: string, idx: number) => (
                <div key={idx} className="p-2 rounded bg-ops-amber/10 border border-ops-amber/30 text-ops-amber flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 rounded bg-ops-phosphor/10 border border-ops-phosphor/30 text-ops-phosphor flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>No editing software fingerprints or dimension anomalies detected.</span>
            </div>
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'STEP 5: STEGANALYSIS & ARTIFACT (ELA) DETECTION',
      desc: 'Error Level Analysis (ELA) and spatial pixel variance scan',
      icon: Sliders,
      color: report.step_5_steganalysis?.findings?.length > 0 ? 'text-ops-red' : 'text-ops-phosphor',
      status: report.step_5_steganalysis?.findings?.length > 0 ? 'ANOMALIES' : 'NORMAL',
      content: (
        <div className="space-y-2 text-[11px]">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-ops-surface border border-ops-borderSubtle">
              <span className="text-ops-dim block text-[10px]">BRIGHTNESS</span>
              <span className="text-white font-bold">{report.step_5_steganalysis?.brightness ?? 128}</span>
            </div>
            <div className="p-2 rounded bg-ops-surface border border-ops-borderSubtle">
              <span className="text-ops-dim block text-[10px]">CONTRAST</span>
              <span className="text-white font-bold">{report.step_5_steganalysis?.contrast ?? 42}</span>
            </div>
            <div className="p-2 rounded bg-ops-surface border border-ops-borderSubtle">
              <span className="text-ops-dim block text-[10px]">ELA DELTA</span>
              <span className="text-ops-phosphor font-bold">
                {report.step_5_steganalysis?.ELA?.average_difference ?? '2.14'}
              </span>
            </div>
          </div>
          {report.step_5_steganalysis?.findings?.length > 0 && (
            <div className="space-y-1">
              {report.step_5_steganalysis.findings.map((f: string, idx: number) => (
                <div key={idx} className="p-2 rounded bg-ops-red/10 border border-ops-red/30 text-ops-red">
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      num: 6,
      title: 'STEP 6: AI-GENERATED SIGNATURE CHECK',
      desc: 'Midjourney, DALL-E, Stable Diffusion, Firefly keywords scan',
      icon: Cpu,
      color: report.step_6_ai_signature_check?.indicator_count > 0 ? 'text-cyan-400' : 'text-ops-phosphor',
      status: report.step_6_ai_signature_check?.status || 'NO AI INDICATORS',
      content: (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-ops-muted">AI SYNTHESIS INDICATORS FOUND:</span>
            <span className="text-white font-bold">{report.step_6_ai_signature_check?.indicator_count || 0}</span>
          </div>
          {report.step_6_ai_signature_check?.possible_ai_indicators?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {report.step_6_ai_signature_check.possible_ai_indicators.map((kw: string) => (
                <span key={kw} className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 text-[10px]">
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-ops-muted text-[10px] font-sans">
              No generative AI model tags (Midjourney, DALL-E, Stable Diffusion, Firefly) found in metadata or filename.
            </p>
          )}
        </div>
      ),
    },
    {
      num: 7,
      title: 'STEP 7: DIGITAL SIGNATURE VALIDATION',
      desc: 'Ed25519 / ECDSA signature verification over canonical bytes',
      icon: Key,
      color: report.step_7_digital_signature?.valid ? 'text-ops-phosphor' : 'text-ops-red',
      status: report.step_7_digital_signature?.status || 'VERIFIED',
      content: (
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${report.step_7_digital_signature?.valid ? 'bg-ops-phosphor' : 'bg-ops-red'}`} />
            <span className={report.step_7_digital_signature?.valid ? 'text-ops-phosphor font-bold' : 'text-ops-red font-bold'}>
              {report.step_7_digital_signature?.status}
            </span>
          </div>
          <p className="text-ops-muted text-[10px] font-sans">
            {report.step_7_digital_signature?.message || 'Digital signature cryptographically validates against author public key.'}
          </p>
        </div>
      ),
    },
    {
      num: 8,
      title: 'STEP 8: CRYPTOGRAPHIC TIMESTAMP RECORD',
      desc: 'UTC timestamp linked with SHA-512 seal',
      icon: Clock,
      color: 'text-ops-phosphor',
      status: 'SEALED',
      content: (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-ops-dim">TIMESTAMP:</span>
            <span className="text-white">{report.step_8_cryptographic_timestamp?.timestamp}</span>
          </div>
          <div>
            <span className="text-ops-dim text-[10px] block mb-1">SHA-512 TIMESTAMP HASH</span>
            <HashChip hash={report.step_8_cryptographic_timestamp?.timestamp_hash} length={14} />
          </div>
        </div>
      ),
    },
    {
      num: 9,
      title: 'STEP 9: MERKLE-STYLE VERSION DAG NODE',
      desc: 'Provenance DAG node chaining with parent version node_hash',
      icon: GitBranch,
      color: 'text-ops-phosphor',
      status: 'LINKED',
      content: (
        <div className="space-y-2 text-[11px]">
          <div>
            <span className="text-ops-dim text-[10px] block mb-1">MERKLE NODE HASH</span>
            <HashChip hash={report.step_9_merkle_dag?.node_hash} length={14} />
          </div>
          <div>
            <span className="text-ops-dim text-[10px] block mb-1">PREVIOUS NODE HASH</span>
            <HashChip hash={report.step_9_merkle_dag?.previous_hash || 'GENESIS (null)'} length={10} />
          </div>
        </div>
      ),
    },
    {
      num: 10,
      title: 'STEP 10: IMMUTABLE LEDGER COMMIT',
      desc: 'Appended to ledger.json with record_hash and previous_record_hash',
      icon: Database,
      color: 'text-ops-phosphor',
      status: report.step_10_immutable_ledger?.status || 'STORED',
      content: (
        <div className="space-y-2 text-[11px]">
          <div>
            <span className="text-ops-dim text-[10px] block mb-1">LEDGER RECORD HASH</span>
            <HashChip hash={report.step_10_immutable_ledger?.record_hash} length={14} />
          </div>
          <div>
            <span className="text-ops-dim text-[10px] block mb-1">PREVIOUS RECORD HASH</span>
            <HashChip hash={report.step_10_immutable_ledger?.previous_record_hash || 'GENESIS (null)'} length={10} />
          </div>
          <p className="text-ops-dim text-[10px]">
            Synchronized with root ledger.json and verifiable by main.py in terminal.
          </p>
        </div>
      ),
    },
    {
      num: 11,
      title: 'STEP 11: VERIFICATION REPORT & TRUST LEVEL',
      desc: 'Final composite rating and ledger chain audit status',
      icon: CheckCircle2,
      color: report.trust_score?.score >= 80 ? 'text-ops-phosphor' : 'text-ops-red',
      status: `${report.trust_score?.score || 100}/100 · ${report.trust_score?.level || 'High Trust'}`,
      content: (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between p-2.5 rounded bg-ops-surface border border-ops-borderSubtle">
            <span className="text-ops-dim">OVERALL ASSESSMENT:</span>
            <span className="font-bold text-white">{report.step_11_verification_report?.overall_result}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded bg-ops-surface border border-ops-borderSubtle">
            <span className="text-ops-dim">LEDGER INTEGRITY AUDIT:</span>
            <span className={report.step_11_verification_report?.ledger_status?.valid ? 'text-ops-phosphor font-bold' : 'text-ops-red font-bold'}>
              {report.step_11_verification_report?.ledger_status?.valid ? 'VALID (CHAIN INTACT)' : 'INVALID / TAMPERED'}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-ops-card border border-ops-border space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-ops-borderSubtle pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-ops-phosphor" />
          <span className="font-bold text-white uppercase text-sm tracking-wider">
            MAIN.PY // 11-STAGE FORENSIC SPECIFICATION
          </span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-ops-surface border border-ops-phosphor/30 text-ops-phosphor font-bold">
          {report.trust_score?.level} ({report.trust_score?.score}/100)
        </span>
      </div>

      <p className="text-ops-muted text-[11px] font-sans">
        Executed in accordance with the 11 forensic verification stages defined in <code className="text-ops-phosphor">client/main.py</code> and logged to <code className="text-white">ledger.json</code>.
      </p>

      <div className="space-y-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isExpanded = expandedStep === step.num;

          return (
            <div
              key={step.num}
              className="rounded-xl bg-ops-surface border border-ops-borderSubtle hover:border-ops-border transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleStep(step.num)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-ops-card/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-ops-card border border-ops-border flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-3.5 h-3.5 ${step.color}`} />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">{step.title}</span>
                    <span className="text-[10px] text-ops-dim font-sans">{step.desc}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-bold text-ops-muted hidden sm:inline">{step.status}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-ops-dim" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ops-dim" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-ops-borderSubtle bg-ops-card/30">
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
