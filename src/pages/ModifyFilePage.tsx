import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RefreshCw, Upload, ArrowRight, ArrowLeft, Layers } from 'lucide-react';
import { api, type FileRecord, type FileVersion } from '../lib/api.js';
import { HashChip } from '../components/HashChip.js';

export const ModifyFilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [currentVersion, setCurrentVersion] = useState<FileVersion | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [diffResult, setDiffResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getFile(id)
      .then((res) => {
        setFile(res.file);
        setCurrentVersion(res.currentVersion);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedFile) {
      setError('Please select a file to commit as the new version');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.modifyFile(id, formData);
      setDiffResult(res.diff);
      setTimeout(() => {
        navigate(`/files/${id}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to modify file');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center font-mono text-xs text-ops-muted">
        LOADING ASSET CONTEXT...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 font-mono">
      <Link
        to={`/files/${id}`}
        className="inline-flex items-center space-x-1 text-xs text-ops-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO ASSET DETAIL</span>
      </Link>

      <div>
        <div className="flex items-center space-x-2 text-xs text-ops-amber mb-1">
          <RefreshCw className="w-4 h-4" />
          <span>PROVENANCE VERSION ADVANCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          COMMIT MODIFIED ASSET VERSION
        </h1>
        <p className="text-xs text-ops-muted mt-1">
          Upload an updated version of <span className="text-white">"{file?.title}"</span>. The platform
          computes a cryptographic and metadata diff, then appends a signed MODIFY event to the chain.
        </p>
      </div>

      {/* Previous Version Reference Card */}
      {currentVersion && (
        <div className="p-4 rounded-2xl bg-ops-card border border-ops-border text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-ops-borderSubtle pb-2">
            <span className="text-ops-dim text-[11px]">PREVIOUS BASELINE (v{currentVersion.version_number})</span>
            <span className="text-ops-muted">{(currentVersion.file_size / 1024).toFixed(2)} KB</span>
          </div>
          <div>
            <span className="text-ops-dim text-[10px] block">PARENT SHA-256</span>
            <HashChip hash={currentVersion.sha256_hash} length={12} />
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div
          className="p-8 rounded-2xl border-2 border-dashed border-ops-border hover:border-ops-amber/60 ops-card text-center cursor-pointer"
          onClick={() => document.getElementById('modify-file-input')?.click()}
        >
          <input
            id="modify-file-input"
            type="file"
            className="hidden"
            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-6 h-6 text-ops-amber" />
            {selectedFile ? (
              <div>
                <p className="text-sm font-bold text-ops-amber">{selectedFile.name}</p>
                <p className="text-[11px] text-ops-muted">
                  {(selectedFile.size / 1024).toFixed(2)} KB · Ready to commit as v
                  {(currentVersion?.version_number || 1) + 1}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-white">SELECT MODIFIED ASSET FILE</p>
                <p className="text-[11px] text-ops-muted">Drag & drop or click to choose updated copy</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-ops-red/10 border border-ops-red/40 text-ops-red">
            {error}
          </div>
        )}

        {diffResult && (
          <div className="p-4 rounded-xl bg-ops-surface border border-ops-phosphor/40 text-ops-phosphor space-y-1 text-xs">
            <p className="font-bold">DIFF COMPUTED & SIGNED SUCCESSFULLY!</p>
            <p className="text-ops-muted text-[11px]">
              Size delta: {diffResult.sizeChangeBytes > 0 ? `+${diffResult.sizeChangeBytes}` : diffResult.sizeChangeBytes} bytes ·
              New hash committed. Redirecting to timeline...
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !selectedFile}
          className="w-full py-3 rounded-xl bg-ops-amber text-black font-bold hover:bg-yellow-400 shadow-glowAmber transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{submitting ? 'COMPUTING DIFF & SIGNING...' : 'COMMIT VERSION & RECORD MODIFY EVENT'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
