// API Client for Detective Quantum

export interface User {
  id: string;
  username: string;
  email: string;
  public_key: string;
  api_key: string;
  created_at: string;
}

export interface FileRecord {
  id: string;
  owner_id: string;
  title: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'binary';
  current_version_id: string;
  status: 'verified' | 'modified' | 'transferred' | 'tampered';
  created_at: string;
  currentVersion?: FileVersion;
  eventCount?: number;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  storage_path: string;
  mime_type: string;
  file_size: number;
  sha256_hash: string;
  perceptual_hash: string;
  metadata_json: string;
  modification_type: string;
  modified_by_user_id: string;
  parent_version_id: string | null;
  signature: string;
  created_at: string;
}

export interface ProvenanceEvent {
  id: string;
  file_id: string;
  version_id: string;
  event_type: 'CREATE' | 'UPLOAD' | 'MODIFY' | 'TRANSFER' | 'VERIFY';
  actor_user_id: string;
  details_json: string;
  prev_event_hash: string;
  event_hash: string;
  created_at: string;
}

export interface VerificationReport {
  id: string;
  file_id: string | null;
  version_id: string | null;
  requested_by: string | null;
  trust_score: number;
  hash_match: boolean;
  metadata_diff_json: string;
  steganalysis_json: string;
  chain_integrity_ok: boolean;
  verdict: 'VERIFIED' | 'LIKELY MODIFIED' | 'SUSPICIOUS' | 'TAMPERED / UNVERIFIED';
  report_pdf_path: string | null;
  created_at: string;
}

export const api = {
  // Auth
  async signup(data: { username: string; email: string; password: string }) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Signup failed');
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  async getMe(): Promise<{ user: User | null }> {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return { user: null };
      return res.json();
    } catch {
      return { user: null };
    }
  },

  // Files
  async getFiles(): Promise<{ files: FileRecord[] }> {
    const res = await fetch('/api/files');
    if (!res.ok) throw new Error('Failed to fetch files');
    return res.json();
  },

  async getFile(id: string): Promise<{
    file: FileRecord;
    currentVersion: FileVersion;
    versions: FileVersion[];
    events: ProvenanceEvent[];
    owner: { id: string; username: string; public_key: string } | null;
  }> {
    const res = await fetch(`/api/files/${id}`);
    if (!res.ok) throw new Error('File not found');
    return res.json();
  },

  async uploadFile(formData: FormData) {
    const res = await fetch('/api/files', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to upload file');
    return res.json();
  },

  async modifyFile(fileId: string, formData: FormData) {
    const res = await fetch(`/api/files/${fileId}/modify`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to modify file');
    return res.json();
  },

  async transferFile(fileId: string, toUsername: string) {
    const res = await fetch(`/api/files/${fileId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUsername }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to initiate transfer');
    return res.json();
  },

  async acceptTransfer(token: string) {
    const res = await fetch(`/api/files/transfers/${token}/accept`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to accept transfer');
    return res.json();
  },

  // Verification
  async verifyFile(formData: FormData) {
    const res = await fetch('/api/verify', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Verification failed');
    return res.json();
  },

  async lookupCode(code: string) {
    const res = await fetch(`/api/verify/code/${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Lookup failed');
    return res.json();
  },

  async getReport(reportId: string) {
    const res = await fetch(`/api/verify/reports/${reportId}`);
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  },

  // Demo samples
  async getDemoSamples() {
    const res = await fetch('/api/demo/samples');
    return res.json();
  },

  // Settings
  async getKeys() {
    const res = await fetch('/api/settings/keys');
    if (!res.ok) throw new Error('Failed to fetch keys');
    return res.json();
  },

  async regenerateApiKey() {
    const res = await fetch('/api/settings/keys/regenerate', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to regenerate API key');
    return res.json();
  },

  async regenerateEcdsa() {
    const res = await fetch('/api/settings/keys/regenerate-ecdsa', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to regenerate keypair');
    return res.json();
  },
};
