import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PlusCircle, CheckCircle2, Shield, Cpu, ArrowRight } from 'lucide-react';
import { api } from '../lib/api.js';

export const NewFilePage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'create' | 'upload'>('create');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pipelineStages = [
    'Computing SHA-256 cryptographic digest...',
    'Generating 64-bit perceptual visual hash (pHash)...',
    'Extracting EXIF headers and container metadata...',
    'Performing LSB spatial steganalysis heuristic scan...',
    'Signing canonical fingerprint with user ECDSA secp256k1 key...',
    'Committing provenance block to ledger hash-chain...',
  ];

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setSelectedFile(f);
    if (!title) {
      setTitle(f.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to register');
      return;
    }

    setProcessing(true);
    setError(null);
    setPipelineStep(0);

    // Animate HUD stages
    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => {
        if (prev < pipelineStages.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title || selectedFile.name);
    formData.append('mode', mode);

    try {
      const res = await api.uploadFile(formData);
      clearInterval(stepInterval);
      setPipelineStep(pipelineStages.length);
      setTimeout(() => {
        navigate(`/files/${res.file.id}`);
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Failed to process file');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 font-mono text-xs text-ops-phosphor mb-1">
          <Cpu className="w-4 h-4" />
          <span>CRYPTOGRAPHIC ASSET REGISTRATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
          INGEST NEW DIGITAL ASSET
        </h1>
        <p className="text-xs font-mono text-ops-muted mt-1">
          Register a file into the cryptographic custody ledger with ECDSA provenance proofs.
        </p>
      </div>

      {/* Mode selection tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-ops-surface border border-ops-border font-mono text-xs">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`p-3 rounded-xl text-left transition-all ${
            mode === 'create'
              ? 'bg-ops-card border border-ops-phosphor/40 text-white shadow-glow'
              : 'text-ops-muted hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2 font-bold text-ops-phosphor mb-1">
            <PlusCircle className="w-4 h-4" />
            <span>ORIGINAL CREATION</span>
          </div>
          <p className="text-[10px] text-ops-dim font-sans">
            You are the primary author/creator (e.g. your lab photo, raw dataset, master report).
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`p-3 rounded-xl text-left transition-all ${
            mode === 'upload'
              ? 'bg-ops-card border border-cyan-400/40 text-white shadow-glow'
              : 'text-ops-muted hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2 font-bold text-cyan-400 mb-1">
            <Upload className="w-4 h-4" />
            <span>UPLOAD EXISTING</span>
          </div>
          <p className="text-[10px] text-ops-dim font-sans">
            File was handed to you externally. Honestly marked as received in historical ledger.
          </p>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        {/* Dropzone */}
        <div
          className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer relative overflow-hidden ops-card text-center ${
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
            handleFileChange(e.dataTransfer.files);
          }}
          onClick={() => document.getElementById('new-file-input')?.click()}
        >
          <input
            id="new-file-input"
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />

          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-ops-surface border border-ops-border flex items-center justify-center text-ops-phosphor shadow-glow">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-ops-phosphor">{selectedFile.name}</p>
                  <p className="text-xs text-ops-muted mt-0.5">
                    {(selectedFile.size / 1024).toFixed(2)} KB · Ready to ingest
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-white">DRAG & DROP FILE HERE</p>
                  <p className="text-xs text-ops-muted mt-0.5">Images, Documents, Video, or Audio</p>
                </div>
              )}
            </div>
            <span className="text-[11px] px-3 py-1 rounded-md bg-ops-surface border border-ops-borderSubtle text-ops-dim">
              {selectedFile ? 'CLICK TO CHOOSE DIFFERENT FILE' : 'BROWSE FILESYSTEM'}
            </span>
          </div>
        </div>

        {/* Title input */}
        <div>
          <label className="block text-ops-muted mb-1 text-[11px]">LEDGER ASSET TITLE</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. quantum_interferometer_calibration_2026.png"
            className="w-full px-3 py-2.5 rounded-xl bg-ops-card border border-ops-border text-white placeholder-ops-dim focus:outline-none focus:border-ops-phosphor"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-ops-red/10 border border-ops-red/40 text-ops-red text-xs">
            {error}
          </div>
        )}

        {/* Animated Ingestion HUD Modal/Banner */}
        {processing && (
          <div className="p-5 rounded-2xl bg-ops-surface border border-ops-phosphor/40 shadow-glow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-ops-phosphor font-bold text-xs uppercase tracking-wider">
                EXECUTION IN PROGRESS
              </span>
              <span className="text-[10px] text-ops-muted">
                STAGE {pipelineStep + 1} OF {pipelineStages.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {pipelineStages.map((stage, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-2 text-[11px] transition-colors ${
                    idx === pipelineStep
                      ? 'text-ops-phosphor font-bold'
                      : idx < pipelineStep
                      ? 'text-ops-muted line-through opacity-75'
                      : 'text-ops-dim opacity-40'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={processing || !selectedFile}
          className="w-full py-3 rounded-xl bg-ops-phosphor text-black font-mono font-bold hover:bg-ops-phosphorBright shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{processing ? 'PROCESSING PIPELINE...' : 'EXECUTE INGESTION & COMMIT TO CHAIN'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
