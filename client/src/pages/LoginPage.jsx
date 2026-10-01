import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setErrorMsg('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Invalid email or password');
    }
    setSubmitting(false);
  };

  const handleFillDemo = () => {
    setEmail('demo@trustlense.dev');
    setPassword('Demo@1234');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent-blue flex items-center justify-center text-white mx-auto shadow-md">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 font-sans tracking-tight">
            Sign in to TrustLense
          </h2>
          <p className="text-xs text-slate-500">
            Access your secure threat dashboard and privacy audit trail
          </p>
        </div>

        {/* 1-Click Demo Account Autofill Button */}
        <div className="p-3 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-between gap-3">
          <div className="text-[11px] text-primary-dark">
            <span className="font-bold block">Hackathon Demo Access</span>
            <span>Preloaded with 25 historical scans</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark shadow-sm transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Use Demo</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full text-xs px-3.5 py-2.5 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
