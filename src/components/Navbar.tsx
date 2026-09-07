import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Key, PlusCircle, Search, LogIn, LogOut, Terminal, Activity } from 'lucide-react';
import type { User } from '../lib/api.js';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-ops-bg/90 backdrop-blur-md border-b border-ops-border">
      {/* Top telemetry bar */}
      <div className="bg-ops-surface border-b border-ops-borderSubtle px-4 py-1 text-[11px] font-mono flex items-center justify-between text-ops-muted">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-ops-phosphor">
            <span className="w-2 h-2 rounded-full bg-ops-phosphor animate-pulse mr-1.5 shadow-glow"></span>
            SYS.NODE: ONLINE
          </span>
          <span className="hidden sm:inline text-ops-dim">|</span>
          <span className="hidden sm:inline text-ops-dim">ENGINE: ECDSA-secp256k1 // SHA-256 // pHASH-64</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-ops-dim hidden md:inline">CHAIN INTEGRITY: 100% UNBROKEN</span>
          <span className="text-ops-phosphor font-semibold">PS 03 // FORENSICS CORE</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-ops-surface border border-ops-border group-hover:border-ops-phosphor/60 flex items-center justify-center text-ops-phosphor shadow-glow transition-colors">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono font-bold tracking-widest text-base sm:text-lg flex items-center space-x-1.5 text-white">
              <span>DETECTIVE</span>
              <span className="text-ops-phosphor">QUANTUM</span>
            </div>
            <p className="text-[10px] font-mono text-ops-muted tracking-tight">CONTENT PROVENANCE & CUSTODY</p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center space-x-2 font-mono text-xs">
          <Link
            to="/verify"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              isActive('/verify') || isActive('/')
                ? 'bg-ops-phosphor/10 text-ops-phosphor border border-ops-phosphor/30'
                : 'text-ops-muted hover:text-white hover:bg-ops-surface'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>VERIFY EVIDENCE</span>
          </Link>
        </nav>

        {/* User Action CTAs */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-white font-medium">@{user.username}</span>
                <span className="text-[10px] text-ops-muted">
                  KEY: {user.public_key.substring(27, 39)}...
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-ops-surface border border-ops-border text-ops-muted hover:text-ops-red hover:border-ops-red/40 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/auth"
                className="px-3.5 py-1.5 rounded-lg border border-ops-border bg-ops-surface hover:border-ops-phosphor/40 text-ops-muted hover:text-white transition-colors"
              >
                LOG IN
              </Link>
              <Link
                to="/auth?tab=register"
                className="px-3.5 py-1.5 rounded-lg bg-ops-phosphor text-black font-semibold hover:bg-ops-phosphorBright shadow-glow transition-colors"
              >
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
