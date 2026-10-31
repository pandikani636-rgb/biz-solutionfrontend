import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Cpu, ArrowRight, CheckCircle2, Sparkles, Activity } from 'lucide-react';
import { GranderBeltPreloader } from './GranderBeltPreloader';

export const TechPreloader = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const loadingSteps = [
    { label: 'Initializing Industrial Architecture', detail: 'Connecting catalog engine' },
    { label: 'Verifying Technical Specifications', detail: 'PIX, SKF, NBC & Fenner MTC standards' },
    { label: 'Calculating B2B Wholesale Pricing', detail: 'Applying contract 45% - 48% MRP discount' },
    { label: 'Syncing Delhivery Insured Logistics', detail: 'Doorstep freight routes active' },
    { label: 'Platform Ready', detail: 'Welcome to BizZolution & Balumuni Associates' },
  ];

  useEffect(() => {
    // 2.8 seconds duration for smooth, snappy, professional experience
    const totalDuration = 2800;
    const intervalMs = 28;
    const increment = 100 / (totalDuration / intervalMs);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    // Step message progression
    const stepInterval = setInterval(() => {
      setStepIdx((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, totalDuration / loadingSteps.length);

    // Auto-dismiss smoothly when done
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsDismissed(true);
        if (onFinish) onFinish();
      }, 650);
    }, totalDuration + 150);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepInterval);
      clearTimeout(exitTimer);
    };
  }, []);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsDismissed(true);
      if (onFinish) onFinish();
    }, 400);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#F8FAFC] via-[#FFFFFF] to-[#EFF6FF] text-darkText select-none transition-all duration-700 ease-out overflow-hidden ${
        isExiting ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Light Theme Atmospheric Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Blue Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-primary/8 rounded-full blur-[140px] animate-pulse" />
        {/* Soft Gold Ambient Glow */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[34rem] h-[26rem] bg-amber-400/10 rounded-full blur-[150px]" />
        
        {/* Fine Engineering Blueprint Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1E3A8A 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Decorative corner light accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-300/15 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Top Header: System Status & Skip Control */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
            <Cpu className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-wider text-navy uppercase">
                BizZolution Core
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Live Engine
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Verified Industrial Stockist • Srivilliputtur
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-navy transition-smooth shadow-xs hover:shadow-sm backdrop-blur-md group"
        >
          <span>Skip to Portal</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-smooth" />
        </button>
      </div>

      {/* Center: Modern Light-Theme Hero Card */}
      <div className="relative z-10 my-auto flex flex-col items-center max-w-md w-full">
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(30,58,138,0.1)] rounded-3xl p-8 sm:p-10 w-full flex flex-col items-center text-center space-y-6">
          
          {/* Custom Animated Grander Belt Preloader */}
          <div className="w-full py-2 flex flex-col items-center justify-center">
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 shadow-inner">
              <GranderBeltPreloader size="lg" text="" />
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              High-Torque Grander Belt Transmission Active
            </span>
          </div>

          {/* Brand Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
              Biz<span className="text-primary">Zolution</span>
              <span className="text-sm font-bold text-slate-500 block mt-0.5">
                Balumuni & Associates
              </span>
            </h1>
            <p className="text-xs text-secondaryText font-medium">
              Industrial Power Transmission & Bearing Solutions
            </p>
          </div>

          {/* Loading Progress & Sleek Bar */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>{loadingSteps[stepIdx].label}</span>
              </span>
              <span className="font-mono font-black text-navy text-sm">
                {Math.min(100, Math.round(progress))}%
              </span>
            </div>

            {/* Progress Bar with Shimmer */}
            <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary via-navy to-accent rounded-full transition-all duration-75 ease-out shadow-xs relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer Light Reflection Sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Step Detail Subtitle */}
            <p className="text-[11px] text-slate-400 font-medium h-5 flex items-center justify-center transition-all duration-300">
              {loadingSteps[stepIdx].detail}
            </p>
          </div>

          {/* Trust Highlights Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 border-t border-slate-100 w-full">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>100% Genuine MTC</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>46% B2B Wholesale</span>
            </span>
          </div>

        </div>
      </div>

      {/* Bottom Footer: Tamil Tagline & Corporate Guarantee */}
      <div className="relative z-10 text-center space-y-1">
        <p className="text-sm sm:text-base font-black text-navy tracking-wide">
          உங்கள் நம்பிக்கையில் எங்கள் பயணம்!
        </p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          Official B2B Guarantee • Srivilliputtur, Virudhunagar Dist, Tamilnadu
        </p>
      </div>
    </div>
  );
};
