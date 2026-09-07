import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Upload,
  CheckCircle,
  Shield,
  FileCheck,
  PlusCircle,
  FileCode,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { api } from '../lib/api.js';

export const PublicVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedManifest, setSelectedManifest] = useState<File | null>(null);
  const [codeQuery, setCodeQuery] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    let mainFile: File | null = null;
    let manifestFile: File | null = null;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.name.endsWith('.quantum-manifest.json') || f.name.endsWith('.json')) {
        manifestFile = f;
      } else {
        mainFile = f;
      }
    }

    if (mainFile) setSelectedFile(mainFile);
    if (manifestFile) setSelectedManifest(manifestFile);

    const targetFile = mainFile || (selectedFile as File);
    const targetManifest = manifestFile || selectedManifest;

    if (targetFile) {
      runVerification(targetFile, targetManifest);
    }
  };

  const runVerification = async (fileToVerify: File, manifestToAttach: File | null = null) => {
    setVerifying(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', fileToVerify);
    if (manifestToAttach) {
      formData.append('manifest', manifestToAttach);
    }

    try {
      const res = await api.verifyFile(formData);
      navigate(`/verify/${res.reportId}`);
    } catch (err: any) {
      setError(err.message || 'Verification audit failed');
      setVerifying(false);
    }
  };

  const handleLookupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeQuery.trim()) return;

    setVerifying(true);
    setError(null);

    try {
      const res = await api.lookupCode(codeQuery.trim());
      navigate(`/verify/${res.report.id}`);
    } catch (err: any) {
      setError(err.message || 'No report found matching that identifier or hash');
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10 font-mono">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-ops-phosphor/40 bg-ops-surface text-ops-phosphor text-xs shadow-glow">
          <Shield className="w-3.5 h-3.5" />
          <span>ZERO-KNOWLEDGE CHAIN OF CUSTODY VERIFIER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          PROVENANCE & INTEGRITY AUDITOR
        </h1>
        <p className="text-xs text-ops-muted max-w-xl mx-auto font-sans">
          Upload any file (or latest version) alongside its optional <code className="text-ops-phosphor">.quantum-manifest.json</code> proof package to verify origin, audit parent version digests, and mathematically prove the unbroken chain of custody.
        </p>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        className={`p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer relative overflow-hidden ops-card text-center ${
          dragActive
            ? 'border-ops-phosphor bg-ops-phosphor/5'
            : 'border-ops-border hover:border-ops-phosphor/60'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFileDrop(e.dataTransfer.files);
        }}
        onClick={() => !verifying && document.getElementById('public-verify-input')?.click()}
      >
        <input
          id="public-verify-input"
          type="file"
          multiple
          className="hidden"
          disabled={verifying}
          onChange={(e) => handleFileDrop(e.target.files)}
        />

        {verifying ? (
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="w-12 h-12 rounded-full border-2 border-ops-phosphor border-t-transparent animate-spin" />
            <div className="space-y-1">
              <p className="text-ops-phosphor font-bold text-sm">
                EXECUTING CHAIN OF CUSTODY AUDIT...
              </p>
              <p className="text-xs text-ops-muted">
                Checking live SHA-256 digest · Auditing parent version links · Verifying signatures
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-ops-surface border border-ops-border flex items-center justify-center text-ops-phosphor shadow-glow">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-bold text-white">DRAG & DROP FILE OR LATEST VERSION</p>
              <p className="text-xs text-ops-muted mt-1 font-sans">
                Drop your file alone, or drop both the file and <code className="text-ops-phosphor">.quantum-manifest.json</code> together
              </p>
            </div>

            {selectedFile && (
              <div className="mt-2 text-xs text-ops-phosphor bg-ops-surface px-3 py-1.5 rounded-lg border border-ops-border font-bold">
                Selected File: {selectedFile.name}
                {selectedManifest && ` + Manifest: ${selectedManifest.name}`}
              </div>
            )}

            <span className="text-[11px] px-3.5 py-1.5 rounded-lg bg-ops-surface border border-ops-borderSubtle text-ops-phosphor hover:bg-ops-phosphor/10 transition-colors mt-2">
              OR CLICK TO BROWSE LOCAL FILES
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-ops-red/10 border border-ops-red/40 text-ops-red text-xs text-center">
          {error}
        </div>
      )}

      {/* Lookup by code / hash */}
      <div className="p-6 rounded-2xl bg-ops-card border border-ops-border space-y-3 text-xs">
        <label className="block text-ops-muted text-[11px]">
          LOOKUP BY VERIFICATION REPORT ID OR SHA-256 DIGEST
        </label>
        <form onSubmit={handleLookupCode} className="flex gap-2">
          <input
            type="text"
            value={codeQuery}
            onChange={(e) => setCodeQuery(e.target.value)}
            placeholder="e.g. report ID or SHA-256 hash"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-ops-surface border border-ops-border text-white placeholder-ops-dim focus:outline-none focus:border-ops-phosphor"
          />
          <button
            type="submit"
            disabled={verifying || !codeQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-ops-surface border border-ops-border hover:border-ops-phosphor text-ops-phosphor font-bold transition-colors disabled:opacity-50"
          >
            LOOKUP
          </button>
        </form>
      </div>

      {/* How Automatic Chain of Custody Works */}
      <div className="p-6 rounded-2xl bg-ops-surface border border-ops-border space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-ops-border pb-3">
          <div className="flex items-center space-x-2 text-ops-phosphor font-bold">
            <GitBranch className="w-4 h-4" />
            <span>AUTOMATED BACKEND CHAIN OF CUSTODY (CoC) TRACKING</span>
          </div>
          <span className="text-[10px] text-ops-dim font-mono uppercase">ZERO USER INPUT REQUIRED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-ops-muted font-sans text-xs">
          <div className="p-4 rounded-xl bg-ops-card border border-ops-border space-y-2">
            <h4 className="font-bold text-white flex items-center space-x-1.5 font-mono">
              <FileCheck className="w-4 h-4 text-ops-phosphor" />
              <span>Automatic Evidence Collection</span>
            </h4>
            <p>
              When an evidence file is uploaded, the backend automatically extracts physical SHA-256 digests,
              computes visual pHash metrics, and signs the genesis record using ECDSA secp256k1 keys.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ops-card border border-ops-border space-y-2">
            <h4 className="font-bold text-white flex items-center space-x-1.5 font-mono">
              <FileCode className="w-4 h-4 text-ops-phosphor" />
              <span>Court-Admissible Provenance Audit</span>
            </h4>
            <p>
              Every inspection automatically appends a cryptographically linked event block to the evidence history,
              guaranteeing authentic, unbroken Chain of Custody tracking from collection to presentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
