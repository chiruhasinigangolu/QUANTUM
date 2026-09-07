import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center font-mono space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-ops-card border border-ops-red/40 flex items-center justify-center text-ops-red mx-auto shadow-glowRed">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white">404 // UNKNOWN ROUTE</h1>
        <p className="text-xs text-ops-muted mt-1 font-sans">
          The requested forensic resource or ledger record does not exist on this node.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-ops-surface border border-ops-border hover:border-ops-phosphor text-ops-phosphor text-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Forensics Core</span>
      </Link>
    </div>
  );
};
