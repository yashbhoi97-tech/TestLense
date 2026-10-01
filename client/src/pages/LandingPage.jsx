import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Eye,
  Lock,
  Cpu,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Zap,
  Sparkles,
  Server,
  Layers,
  ChevronRight
} from 'lucide-react';
import Shield3D from '../components/common/Shield3D';
import RiskBadge from '../components/common/RiskBadge';

export default function LandingPage() {
  const modes = [
    {
      id: 'leak-guard',
      title: 'Leak Guard',
      subtitle: 'PII & Secrets Redaction',
      description: 'Scans text for Aadhaar, PAN, phone numbers, payment cards, AWS tokens, and private keys. Generates clean, zero-exposure redacted versions instantly.',
      icon: Eye,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600',
      badge: 'Zero Data Storage',
      path: '/scan?mode=leak-guard'
    },
    {
      id: 'scam-analyzer',
      title: 'Scam Analyzer',
      subtitle: 'Fraud & Phishing Defense',
      description: 'Detects fraudulent SMS, deceptive UPI PIN collect traps, urgent KYC threats, job scams, and shortened phishing links targeting Indian digital users.',
      icon: ShieldAlert,
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600',
      badge: 'UPI & Phishing Shield',
      path: '/scan?mode=scam-analyzer'
    },
    {
      id: 'policy-decoder',
      title: 'Policy Decoder',
      subtitle: 'Transparent Privacy Analysis',
      description: 'Decodes confusing legal agreements to highlight third-party data broker sharing, infinite data retention clauses, and unilateral terms changes.',
      icon: Lock,
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-accent-blue',
      badge: 'Privacy Rights Audit',
      path: '/scan?mode=policy-decoder'
    },
    {
      id: 'trust-auditor',
      title: 'Trust Auditor',
      subtitle: 'AI Safety & Hallucination Guard',
      description: 'Audits AI-generated outputs for invented citations, prompt injection attempts, overconfidence bias, and unintended PII disclosure in responses.',
      icon: Cpu,
      color: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-600',
      badge: 'Explainable AI Trust',
      path: '/scan?mode=trust-auditor'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Paste Digital Content',
      desc: 'Submit any suspicious SMS, UPI request, configuration snippet, privacy policy, or AI output.'
    },
    {
      number: '02',
      title: 'Multi-Layer AI & Rule Audit',
      desc: 'Deterministic pattern matching plus contextual AI models detect threats, validate formats, and calculate explainable risk scores.'
    },
    {
      number: '03',
      title: 'Actionable & Redacted Output',
      desc: 'Receive clear recommended next steps and a sanitized copy-ready version with zero raw data persisted in our databases.'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] hero-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI Security, Privacy & Trust Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
              See the risk <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent font-serif italic">
                before it sees you.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              TrustLense empowers individuals and teams to analyze suspicious digital messages, redact sensitive PII & credentials, decode complex privacy policies, and audit AI hallucination risks — all with verifiable privacy guarantees.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Link
                to="/scan"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Start Free Security Scan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-navy-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
              >
                <span>Live Threat Dashboard</span>
              </Link>
            </div>

            {/* Core Principle Callout */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Never Stores Raw Content
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Deterministic Rules + AI Hybrid
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                24/7 AI Assistant Lense
              </span>
            </div>
          </div>

          {/* Right 3D Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-md">
              <Shield3D />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Analysis Modes */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
              Unified Security Architecture
            </div>
            <h2 className="text-3xl font-bold text-navy-900 font-sans tracking-tight">
              Four Specialized Analysis Engines
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              From everyday SMS phishing and UPI traps to enterprise API token leakage and AI model auditing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center border shadow-sm`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {m.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-navy-900 group-hover:text-primary transition-colors">
                        {m.title}
                      </h3>
                      <div className="text-xs font-medium text-slate-400 mb-2">{m.subtitle}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <Link
                      to={m.path}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark group-hover:translate-x-1 transition-all"
                    >
                      <span>Launch Mode</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
            Simple, Transparent Workflow
          </div>
          <h2 className="text-3xl font-bold text-navy-900 font-sans tracking-tight">
            How TrustLense Protects You in Seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-soft space-y-4">
              <div className="text-3xl font-bold font-mono text-primary/40">
                {step.number}
              </div>
              <h3 className="text-lg font-bold text-navy-900">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy by Design Guarantee */}
      <section className="py-16 bg-navy-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>PRIVACY GUARANTEE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-sans">
                We Never Store Your Raw Input. Period.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                Unlike general AI chatbots that retain your prompts for model training, TrustLense sanitizes sensitive numbers on the fly and stores only masked previews and risk metadata. You maintain complete sovereignty over your data with 1-click permanent data erasure.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <Link
                to="/privacy"
                className="px-6 py-3.5 rounded-xl font-semibold bg-white text-navy-900 hover:bg-slate-100 shadow-lg transition-all text-sm flex items-center gap-2"
              >
                <span>Read Privacy Architecture</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Ready to inspect your digital content safely?
          </h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Try our live scanner without any setup or explore sample threats in our interactive sandbox.
          </p>
          <div className="pt-2">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark shadow-xl shadow-primary/25 transition-all transform hover:-translate-y-0.5 text-base"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Launch TrustLense Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
