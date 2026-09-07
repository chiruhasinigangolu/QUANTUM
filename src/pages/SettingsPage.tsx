import React, { useEffect, useState } from 'react';
import { Key, RefreshCw, Copy, Check, Terminal, Shield, Code2 } from 'lucide-react';
import { api, type User } from '../lib/api.js';
import { HashChip } from '../components/HashChip.js';

interface SettingsPageProps {
  user: User;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [keysData, setKeysData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedApi, setCopiedApi] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await api.getKeys();
      setKeysData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleRegenerateApiKey = async () => {
    setRegenerating(true);
    try {
      const res = await api.regenerateApiKey();
      setMessage(res.message);
      fetchKeys();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRegenerateEcdsa = async () => {
    if (!window.confirm('Rotate your ECDSA secp256k1 cryptographic keypair? Past signatures will remain historically valid.')) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await api.regenerateEcdsa();
      setMessage(res.message);
      fetchKeys();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 font-mono">
      <div>
        <div className="flex items-center space-x-2 text-xs text-ops-phosphor mb-1">
          <Key className="w-4 h-4" />
          <span>CRYPTOGRAPHIC IDENTITY & INTEGRATION CENTER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          KEYRING & DEVELOPER API
        </h1>
        <p className="text-xs text-ops-muted mt-1 font-sans">
          Manage your personal secp256k1 signing keypair, identity fingerprints, and CI/CD verification bearer tokens.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-ops-phosphor/10 border border-ops-phosphor/40 text-ops-phosphor text-xs">
          {message}
        </div>
      )}

      {/* User Cryptographic Keypair */}
      <div className="p-6 rounded-2xl bg-ops-card border border-ops-border space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-ops-borderSubtle pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-ops-phosphor" />
            <span className="font-bold text-white text-sm">PERSONAL ECDSA SIGNING KEYPAIR</span>
          </div>
          <button
            onClick={handleRegenerateEcdsa}
            disabled={regenerating}
            className="px-3 py-1.5 rounded-lg bg-ops-surface border border-ops-border hover:border-ops-amber/40 text-ops-muted hover:text-ops-amber text-[11px] transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Rotate Keypair</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-ops-dim text-[11px] block mb-1">KEY FINGERPRINT (SHA-256)</span>
            <div className="p-2.5 rounded-xl bg-ops-surface border border-ops-border text-ops-phosphor font-bold text-xs">
              {keysData?.fingerprint || 'GENERATING...'}
            </div>
          </div>

          <div>
            <span className="text-ops-dim text-[11px] block mb-1">PUBLIC KEY (PEM ENCODED / secp256k1)</span>
            <pre className="p-3 rounded-xl bg-ops-surface border border-ops-border text-[10px] text-ops-muted overflow-x-auto font-mono whitespace-pre-wrap">
              {keysData?.publicKey || user.public_key}
            </pre>
          </div>

          <p className="text-[11px] text-ops-dim font-sans">
            Your private key is protected at rest using AES-256-GCM authenticated encryption. It never leaves
            the secure runtime boundary.
          </p>
        </div>
      </div>

      {/* Developer API Key */}
      <div className="p-6 rounded-2xl bg-ops-card border border-ops-border space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-ops-borderSubtle pb-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-sm">EXTERNAL DEVELOPER API ACCESS</span>
          </div>
          <button
            onClick={handleRegenerateApiKey}
            disabled={regenerating}
            className="px-3 py-1.5 rounded-lg bg-ops-surface border border-ops-border hover:border-cyan-400 text-ops-muted hover:text-cyan-400 text-[11px] transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Roll API Key</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-ops-dim text-[11px] block mb-1">BEARER API TOKEN</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={keysData?.apiKey || user.api_key}
                className="flex-1 px-3 py-2 rounded-xl bg-ops-surface border border-ops-border text-white text-xs select-all"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(keysData?.apiKey || user.api_key);
                  setCopiedApi(true);
                  setTimeout(() => setCopiedApi(false), 2000);
                }}
                className="px-4 py-2 rounded-xl bg-ops-surface border border-ops-border hover:border-cyan-400 text-white flex items-center space-x-1 transition-colors"
              >
                {copiedApi ? <Check className="w-3.5 h-3.5 text-ops-phosphor" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedApi ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* cURL Usage snippet */}
          <div>
            <span className="text-ops-dim text-[11px] block mb-1">CI/CD & PIPELINE INTEGRATION (cURL)</span>
            <pre className="p-3.5 rounded-xl bg-ops-surface border border-ops-border text-[11px] text-ops-phosphor overflow-x-auto whitespace-pre-wrap">
{`curl -X POST http://localhost:3001/api/verify \\
  -H "Authorization: Bearer ${keysData?.apiKey || user.api_key}" \\
  -F "file=@/path/to/suspect_document.pdf"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
