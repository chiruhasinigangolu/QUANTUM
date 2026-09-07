import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRightLeft, UserCheck, Key, ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react';
import { api, type FileRecord } from '../lib/api.js';

export const TransferFilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [toUsername, setToUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getFile(id)
      .then((res) => setFile(res.file))
      .catch((err) => setError(err.message));
  }, [id]);

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !toUsername) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.transferFile(id, toUsername);
      setGeneratedToken(res.transferToken);
    } catch (err: any) {
      setError(err.message || 'Transfer initiation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-8 font-mono">
      <Link
        to={`/files/${id}`}
        className="inline-flex items-center space-x-1 text-xs text-ops-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO ASSET DETAIL</span>
      </Link>

      <div>
        <div className="flex items-center space-x-2 text-xs text-cyan-400 mb-1">
          <ArrowRightLeft className="w-4 h-4" />
          <span>CRYPTOGRAPHIC CUSTODY HANDOFF</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          TRANSFER ASSET CUSTODY
        </h1>
        <p className="text-xs text-ops-muted mt-1 font-sans">
          Generate a digitally signed custody transfer voucher for <span className="text-white">"{file?.title}"</span>.
          When the recipient accepts, a permanent TRANSFER block is committed to the provenance chain.
        </p>
      </div>

      {!generatedToken ? (
        <form onSubmit={handleInitiateTransfer} className="p-6 rounded-2xl bg-ops-card border border-ops-border space-y-4 text-xs">
          <div>
            <label className="block text-ops-muted mb-1 text-[11px]">RECIPIENT USERNAME</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-ops-dim absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={toUsername}
                onChange={(e) => setToUsername(e.target.value)}
                placeholder="e.g. bob"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-ops-surface border border-ops-border text-white placeholder-ops-dim focus:outline-none focus:border-cyan-400"
              />
            </div>
            <p className="text-[10px] text-ops-dim mt-1">
              Tip: Enter demo user "bob" to test seamless custody handoff between Alice and Bob.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-ops-red/10 border border-ops-red/40 text-ops-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !toUsername}
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{submitting ? 'GENERATING SIGNED TOKEN...' : 'SIGN & GENERATE TRANSFER TOKEN'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="p-6 rounded-2xl bg-ops-card border border-cyan-400/40 space-y-4 text-xs">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <Key className="w-4 h-4" />
            <span>TRANSFER VOUCHER GENERATED</span>
          </div>
          <p className="text-ops-muted text-[11px] font-sans">
            Share this cryptographically signed transfer voucher with <span className="text-white">@{toUsername}</span>.
            They can accept custody by confirming this token in their account.
          </p>

          <div className="p-3 rounded-xl bg-ops-surface border border-ops-border font-mono text-[11px] text-ops-phosphor break-all">
            {generatedToken}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyToken}
              className="flex-1 py-2 rounded-xl bg-ops-surface border border-ops-border hover:border-cyan-400 text-white flex items-center justify-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-ops-phosphor" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY TRANSFER TOKEN'}</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl bg-ops-surface border border-ops-border text-ops-muted hover:text-white transition-colors"
            >
              DONE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
