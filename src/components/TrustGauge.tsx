import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, Info } from 'lucide-react';

interface TrustGaugeProps {
  score: number;
  verdict: 'VERIFIED' | 'LIKELY MODIFIED' | 'SUSPICIOUS' | 'TAMPERED / UNVERIFIED' | string;
  signals?: {
    exactHashMatch?: { points: number; matched: boolean };
    perceptualMatch?: { points: number; similarityPercentage: number; isFuzzyMatch: boolean };
    chainIntegrity?: { points: number; intact: boolean };
    metadataConsistency?: { points: number };
    steganalysisSignal?: { pointsDeducted: number; hasAnomaly: boolean };
  };
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({ score, verdict, signals }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // 1.2s animation
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Color selection based on score
  let primaryColor = '#22c55e'; // green
  let glowClass = 'shadow-glow';
  let badgeBorder = 'border-ops-phosphor/40 bg-ops-phosphor/10 text-ops-phosphor';
  let Icon = ShieldCheck;

  if (score < 30 || verdict.includes('TAMPERED')) {
    primaryColor = '#ef4444'; // red
    glowClass = 'shadow-glowRed';
    badgeBorder = 'border-ops-red/40 bg-ops-red/10 text-ops-red';
    Icon = XCircle;
  } else if (score < 60) {
    primaryColor = '#f59e0b'; // amber
    glowClass = 'shadow-glowAmber';
    badgeBorder = 'border-ops-amber/40 bg-ops-amber/10 text-ops-amber';
    Icon = AlertTriangle;
  } else if (score < 85) {
    primaryColor = '#eab308'; // yellow/amber
    glowClass = 'shadow-glowAmber';
    badgeBorder = 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400';
    Icon = ShieldAlert;
  }

  // Circular gauge calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-ops-card border border-ops-border rounded-2xl relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl -z-0"
        style={{ backgroundColor: primaryColor }}
      />

      {/* SVG Radial Gauge */}
      <div className="relative w-56 h-56 flex items-center justify-center my-2 z-10">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#1a2720"
            strokeWidth="14"
            fill="transparent"
          />
          {/* Active animated progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={primaryColor}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <Icon className="w-7 h-7 mb-1" style={{ color: primaryColor }} />
          <span className="text-5xl font-mono font-bold tracking-tight text-white">
            {animatedScore}
          </span>
          <span className="text-xs font-mono text-ops-muted mt-0.5 tracking-widest">
            TRUST SCORE
          </span>
        </div>
      </div>

      {/* Verdict Chip */}
      <div
        className={`mt-4 px-4 py-1.5 rounded-full border font-mono font-bold text-xs tracking-wider flex items-center space-x-2 ${badgeBorder}`}
      >
        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
        <span>VERDICT: {verdict}</span>
      </div>

      {/* 5-Signal Breakdown Cards */}
      {signals && (
        <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-ops-surface border border-ops-borderSubtle flex flex-col items-center">
            <span className="text-ops-dim text-[10px]">SHA-256 HASH</span>
            <span
              className={`font-bold mt-1 ${
                signals.exactHashMatch?.matched ? 'text-ops-phosphor' : 'text-ops-red'
              }`}
            >
              {signals.exactHashMatch?.points || 0} / 40
            </span>
            <span className="text-[9px] text-ops-muted mt-0.5">
              {signals.exactHashMatch?.matched ? 'Exact Match' : 'Mismatch'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-ops-surface border border-ops-borderSubtle flex flex-col items-center">
            <span className="text-ops-dim text-[10px]">VISUAL SIMILARITY</span>
            <span
              className={`font-bold mt-1 ${
                (signals.perceptualMatch?.similarityPercentage || 0) > 80
                  ? 'text-ops-phosphor'
                  : 'text-ops-muted'
              }`}
            >
              {signals.perceptualMatch?.points || 0} / 20
            </span>
            <span className="text-[9px] text-ops-muted mt-0.5">
              {signals.perceptualMatch?.similarityPercentage || 0}% pHash
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-ops-surface border border-ops-borderSubtle flex flex-col items-center">
            <span className="text-ops-dim text-[10px]">CHAIN INTEGRITY</span>
            <span
              className={`font-bold mt-1 ${
                signals.chainIntegrity?.intact ? 'text-ops-phosphor' : 'text-ops-red'
              }`}
            >
              {signals.chainIntegrity?.points || 0} / 25
            </span>
            <span className="text-[9px] text-ops-muted mt-0.5">
              {signals.chainIntegrity?.intact ? 'Unbroken' : 'Severed'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-ops-surface border border-ops-borderSubtle flex flex-col items-center">
            <span className="text-ops-dim text-[10px]">METADATA DIFF</span>
            <span className="font-bold text-ops-phosphor mt-1">
              {signals.metadataConsistency?.points || 0} / 10
            </span>
            <span className="text-[9px] text-ops-muted mt-0.5">Consistency</span>
          </div>

          <div className="p-2.5 rounded-xl bg-ops-surface border border-ops-borderSubtle flex flex-col items-center col-span-2 sm:col-span-1">
            <span className="text-ops-dim text-[10px]">STEGANALYSIS</span>
            <span
              className={`font-bold mt-1 ${
                signals.steganalysisSignal?.hasAnomaly ? 'text-ops-amber' : 'text-ops-phosphor'
              }`}
            >
              {5 - (signals.steganalysisSignal?.pointsDeducted || 0)} / 5
            </span>
            <span className="text-[9px] text-ops-muted mt-0.5">
              {signals.steganalysisSignal?.hasAnomaly ? 'Anomaly Flag' : 'Clean LSB'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
