import React from 'react';
import { Shield, Lock, Cpu, Eye, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-white shadow">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Trust<span className="text-primary-light font-serif italic">Lense</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              <span className="font-semibold text-white">"See the risk before it sees you."</span><br />
              TrustLense is an explainable AI security and privacy intelligence platform designed to protect users from fraudulent scams, sensitive data leaks, deceptive policies, and AI hallucinations.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-emerald-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero Raw Data Persisted — Privacy by Design</span>
            </div>
          </div>

          {/* Col 2: Security Modules */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 font-mono">
              Analysis Modes
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/scan?mode=leak-guard" className="hover:text-primary-light transition-colors flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary-light" />
                  <span>Leak Guard (PII & Keys)</span>
                </Link>
              </li>
              <li>
                <Link to="/scan?mode=scam-analyzer" className="hover:text-primary-light transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scam Analyzer (UPI / SMS)</span>
                </Link>
              </li>
              <li>
                <Link to="/scan?mode=policy-decoder" className="hover:text-primary-light transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Policy Decoder</span>
                </Link>
              </li>
              <li>
                <Link to="/scan?mode=trust-auditor" className="hover:text-primary-light transition-colors flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Trust Auditor (AI Safety)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust & Governance */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 font-mono">
              Platform & Trust
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-primary-light transition-colors">
                  Threat Analytics
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-primary-light transition-colors">
                  Audit History
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary-light transition-colors">
                  Privacy Architecture
                </Link>
              </li>
              <li>
                <Link to="/privacy#ticket" className="hover:text-primary-light transition-colors">
                  Support & Escalations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} TrustLense. Built for the AI Security, Privacy & Trust Hackathon.</p>
          <div className="flex items-center space-x-6">
            <span className="text-slate-400">Security should be understandable. Privacy should be visible.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
