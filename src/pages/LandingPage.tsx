import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Upload,
  Search,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  Cpu,
  Layers,
  FileCheck,
  FileCode,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsVerifying(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.verifyFile(formData);
      navigate(`/verify/${res.reportId}`);
    } catch (err: any) {
      setError(err.message || 'Verification audit failed');
      setIsVerifying(false);
    }
  };

  const handleTestDemoSample = async (sampleName: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      // Fetch sample file blob from server uploads
      const sampleRes = await fetch(`/uploads/samples/${sampleName}`);
      if (!sampleRes.ok) throw new Error('Could not load sample file');
      const blob = await sampleRes.blob();
      const testFile = new File([blob], sampleName, { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', testFile);

      const res = await api.verifyFile(formData);
      navigate(`/verify/${res.reportId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to run demo file verification');
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-6 pb-12">
        {/* Forensics badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-ops-phosphor/30 bg-ops-surface text-ops-phosphor font-mono text-xs shadow-glow">
          <span className="w-2 h-2 rounded-full bg-ops-phosphor animate-ping"></span>
          <span>PS 03 // CRYPTOGRAPHIC CONTENT PROVENANCE ENGINE</span>
        </div>

        {/* Main Title & Tagline */}
        <h1 className="text-4xl sm:text-6xl font-bold font-mono tracking-tight text-white max-w-4xl mx-auto leading-tight">
          "When a file looks completely normal, that's exactly when you should be suspicious."
        </h1>

        <p className="text-base sm:text-lg text-ops-muted max-w-2xl mx-auto font-sans leading-relaxed">
          Detective Quantum investigates any digital file — even a lone, isolated copy with zero context —
          and reconstructs whether it can be trusted using an immutable, tamper-evident chain of custody.
        </p>

        {/* Quick Verification Dropzone in Hero */}
        <div className="max-w-xl mx-auto mt-8">
          <div
            className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer relative overflow-hidden ops-card ${
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
            onClick={() => document.getElementById('hero-file-input')?.click()}
          >
            <input
              id="hero-file-input"
              type="file"
              className="hidden"
              onChange={(e) => handleFileDrop(e.target.files)}
            />

            {isVerifying ? (
              <div className="flex flex-col items-center space-y-3 font-mono py-4">
                <div className="w-12 h-12 rounded-full border-2 border-ops-phosphor border-t-transparent animate-spin" />
                <span className="text-ops-phosphor font-bold text-sm">
                  RUNNING FORENSIC INGESTION PIPELINE...
                </span>
                <span className="text-xs text-ops-muted">
                  SHA-256 Digest → pHash → Steganalysis → Chain Walk
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 font-mono">
                <div className="w-12 h-12 rounded-xl bg-ops-surface border border-ops-border flex items-center justify-center text-ops-phosphor shadow-glow">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">DROP ANY FILE HERE TO VERIFY LIVE</p>
                  <p className="text-xs text-ops-muted mt-0.5">
                    No account required · Zero byte data retention
                  </p>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-md bg-ops-surface border border-ops-borderSubtle text-ops-phosphor">
                  OR CLICK TO BROWSE LOCAL FILES
                </span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs font-mono text-ops-red mt-2 text-center bg-ops-red/10 py-1 rounded">
              {error}
            </p>
          )}

          {/* Quick Demo Test Files */}
          <div className="mt-4 pt-4 border-t border-ops-borderSubtle">
            <p className="text-[11px] font-mono text-ops-dim mb-2 uppercase tracking-wider text-center">
              OR TEST WITH PRE-CONFIGURED BENCHMARK ARTIFACTS:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
              <button
                onClick={() => handleTestDemoSample('quantum_lab_findings_v1.png')}
                disabled={isVerifying}
                className="px-3 py-1.5 rounded-lg bg-ops-surface border border-ops-phosphor/40 text-ops-phosphor hover:bg-ops-phosphor/10 transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Original Untampered (v1)</span>
              </button>

              <button
                onClick={() => handleTestDemoSample('quantum_lab_findings_v2.png')}
                disabled={isVerifying}
                className="px-3 py-1.5 rounded-lg bg-ops-surface border border-ops-amber/40 text-ops-amber hover:bg-ops-amber/10 transition-colors flex items-center space-x-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Modified & Transferred (v2)</span>
              </button>

              <button
                onClick={() => handleTestDemoSample('classified_briefing_tampered.png')}
                disabled={isVerifying}
                className="px-3 py-1.5 rounded-lg bg-ops-surface border border-ops-red/40 text-ops-red hover:bg-ops-red/10 transition-colors flex items-center space-x-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Seeded "Gotcha" Tampered File</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Forensic Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-ops-card border border-ops-border hover:border-ops-phosphor/40 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-lg bg-ops-surface border border-ops-border flex items-center justify-center text-ops-phosphor shadow-glow">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-mono font-bold text-sm uppercase text-white">
            1. Individual User ECDSA Keys
          </h3>
          <p className="text-xs text-ops-muted leading-relaxed font-sans">
            Every user receives a personal secp256k1 ECDSA cryptographic keypair on signup. Files and modifications
            are signed by the authenticating author, not just stamped by a central server.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-ops-card border border-ops-border hover:border-ops-phosphor/40 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-lg bg-ops-surface border border-ops-border flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-mono font-bold text-sm uppercase text-white">
            2. Dual Cryptographic & Perceptual Hashing
          </h3>
          <p className="text-xs text-ops-muted leading-relaxed font-sans">
            SHA-256 catches even a single byte change. Perceptual pHash survives re-compression and format conversions,
            detecting when an asset is 94% visually identical to an earlier registered release.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-ops-card border border-ops-border hover:border-ops-phosphor/40 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-lg bg-ops-surface border border-ops-border flex items-center justify-center text-ops-amber">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-mono font-bold text-sm uppercase text-white">
            3. LSB Steganalysis & Blockchain Anchors
          </h3>
          <p className="text-xs text-ops-muted leading-relaxed font-sans">
            Spatial LSB entropy scans expose hidden payloads or injected bit anomalies. OpenTimestamps Merkle proofs
            anchor hashes to the Bitcoin blockchain for independent, serverless verification.
          </p>
        </div>
      </div>

      {/* How It Solves the Problem */}
      <div className="p-8 rounded-2xl bg-ops-surface border border-ops-border space-y-6">
        <div className="max-w-3xl">
          <span className="text-[11px] font-mono text-ops-phosphor uppercase tracking-wider">
            THE DIGITAL CUSTODY DILEMMA
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
            How Detective Quantum Proves Custody With Only The Latest File
          </h2>
          <p className="text-sm text-ops-muted mt-2">
            In traditional systems, if you only receive "version 3," you have no way to prove what version 1 looked like.
            Detective Quantum maintains an append-only provenance hash-chain:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-ops-card border border-ops-borderSubtle">
            <span className="text-ops-phosphor font-bold block mb-1">STAGE 01: CREATE</span>
            <p className="text-ops-muted text-[11px]">
              Alice captures and registers original asset. ECDSA signed with genesis hash block.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ops-card border border-ops-borderSubtle">
            <span className="text-ops-amber font-bold block mb-1">STAGE 02: MODIFY</span>
            <p className="text-ops-muted text-[11px]">
              Alice edits asset. Platform computes metadata diff and appends a cryptographically linked MODIFY block.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ops-card border border-ops-borderSubtle">
            <span className="text-cyan-400 font-bold block mb-1">STAGE 03: TRANSFER</span>
            <p className="text-ops-muted text-[11px]">
              Alice signs transfer token to Bob. Recipient acceptance commits signed TRANSFER block.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ops-card border border-ops-borderSubtle">
            <span className="text-purple-400 font-bold block mb-1">STAGE 04: VERIFY</span>
            <p className="text-ops-muted text-[11px]">
              Anyone drops the file into public verify. Complete lineage and Trust Score recomputes instantly.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-ops-borderSubtle">
          <div className="text-xs font-mono text-ops-muted">
            Ready to secure your institution's digital media and research findings?
          </div>
          <div className="flex items-center space-x-3 font-mono text-xs">
            <Link
              to="/verify"
              className="px-4 py-2 rounded-lg border border-ops-border bg-ops-card hover:border-ops-phosphor/40 text-white transition-colors"
            >
              Public Verify Portal
            </Link>
            <Link
              to="/auth?tab=register"
              className="px-4 py-2 rounded-lg bg-ops-phosphor text-black font-semibold hover:bg-ops-phosphorBright shadow-glow transition-colors flex items-center space-x-1"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
