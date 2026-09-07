import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, type User } from './lib/api.js';
import { Navbar } from './components/Navbar.js';
import { AuthPage } from './pages/AuthPage.js';
import { FileDetailPage } from './pages/FileDetailPage.js';
import { ModifyFilePage } from './pages/ModifyFilePage.js';
import { TransferFilePage } from './pages/TransferFilePage.js';
import { PublicVerifyPage } from './pages/PublicVerifyPage.js';
import { VerificationReportPage } from './pages/VerificationReportPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMe()
      .then((res) => {
        if (res.user) {
          setUser(res.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ops-bg flex items-center justify-center font-mono text-xs text-ops-muted">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-ops-phosphor animate-ping" />
          <span>INITIALIZING DETECTIVE QUANTUM SUBSYSTEMS...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-ops-bg text-ops-text">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<PublicVerifyPage />} />
            <Route path="/verify" element={<PublicVerifyPage />} />
            <Route path="/verify/:reportId" element={<VerificationReportPage />} />

            {/* Clean MVP Redirects */}
            <Route path="/dashboard" element={<Navigate to="/verify" replace />} />
            <Route path="/custody/builder" element={<Navigate to="/verify" replace />} />
            <Route path="/files/new" element={<Navigate to="/verify" replace />} />
            <Route path="/settings" element={<Navigate to="/verify" replace />} />

            <Route
              path="/auth"
              element={
                user ? <Navigate to="/verify" replace /> : <AuthPage onLoginSuccess={setUser} />
              }
            />

            <Route path="/files/:id" element={<FileDetailPage />} />
            <Route
              path="/files/:id/modify"
              element={user ? <ModifyFilePage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/files/:id/transfer"
              element={user ? <TransferFilePage /> : <Navigate to="/auth" replace />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Global Security Operations Footer */}
        <footer className="border-t border-ops-border py-6 px-4 sm:px-6 lg:px-8 bg-ops-surface text-center font-mono text-xs text-ops-muted space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="text-ops-phosphor font-bold">DETECTIVE QUANTUM // CONTENT PROVENANCE PLATFORM</span>
            <span className="text-ops-dim">|</span>
            <span>VERIFIABLE CHAIN OF CUSTODY</span>
            <span className="text-ops-dim">|</span>
            <span>ECDSA secp256k1 PROOF PACKAGES</span>
            <span className="text-ops-dim">|</span>
            <span>SPATIAL STEGANALYSIS</span>
          </div>
          <p className="text-[10px] text-ops-dim font-sans">
            "When a file looks completely normal, that's exactly when you should be suspicious."
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
