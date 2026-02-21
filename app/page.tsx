'use client';

import { useState } from 'react';
import { ShieldCheck, Lock, Activity, ChevronRight, X, FileCheck, Globe } from "lucide-react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-[#F0F7F8] text-[#30547B] font-sans selection:bg-[#88CEF0] selection:text-[#30547B] relative">
      
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-[#5A84C4]" />
          <span className="text-2xl font-bold tracking-tight text-[#30547B]">
            No Breach
          </span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-[#5A84C4]">
          <a href="#solutions" className="hover:text-[#30547B] transition-colors">Solutions</a>
          <a href="#compliance" className="hover:text-[#30547B] transition-colors">Compliance</a>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#30547B] text-[#F0F7F8] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A84C4] transition-colors shadow-[0_4px_14px_0_#CFDFEC]"
        >
          Get a Demo
        </button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-block mb-4 px-4 py-1.5 bg-[#CFDFEC] rounded-full text-[#30547B] font-semibold text-sm border border-[#88CEF0]">
          Secure your enterprise in 2026 and beyond
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Zero Vulnerabilities. <br />
          <span className="text-[#5A84C4]">Infinite Trust.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#5A84C4] mb-10 leading-relaxed">
          At No Breach, we provide military-grade cyber defense tailored for the modern web. Protect your assets, secure your customer data, and sleep soundly.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#30547B] text-[#F0F7F8] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#5A84C4] transition-all shadow-[0_8px_30px_rgb(90,132,196,0.3)] hover:shadow-[0_8px_30px_rgb(48,84,123,0.4)] hover:-translate-y-1"
          >
            Start Free Trial
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Features Section */}
      <section id="solutions" className="bg-white py-24 border-t border-[#CFDFEC]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Proactive Defense Systems</h2>
            <p className="text-[#5A84C4] max-w-xl mx-auto">Our platform integrates seamlessly with your infrastructure to neutralize threats before they materialize.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#F0F7F8] border border-[#CFDFEC] hover:border-[#88CEF0] hover:shadow-[0_10px_40px_-10px_#CFDFEC] transition-all group">
              <div className="w-14 h-14 bg-[#CFDFEC] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#88CEF0] transition-colors">
                <ShieldCheck className="w-7 h-7 text-[#30547B]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#30547B]">Threat Prevention</h3>
              <p className="text-[#5A84C4] leading-relaxed">
                Automated malware and ransomware blocking using predictive algorithms to keep your network impenetrable.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F0F7F8] border border-[#CFDFEC] hover:border-[#88CEF0] hover:shadow-[0_10px_40px_-10px_#CFDFEC] transition-all group">
              <div className="w-14 h-14 bg-[#CFDFEC] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#88CEF0] transition-colors">
                <Lock className="w-7 h-7 text-[#30547B]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#30547B]">Data Encryption</h3>
              <p className="text-[#5A84C4] leading-relaxed">
                End-to-end encryption for data at rest and in transit, ensuring your sensitive information remains yours.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F0F7F8] border border-[#CFDFEC] hover:border-[#88CEF0] hover:shadow-[0_10px_40px_-10px_#CFDFEC] transition-all group">
              <div className="w-14 h-14 bg-[#CFDFEC] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#88CEF0] transition-colors">
                <Activity className="w-7 h-7 text-[#30547B]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#30547B]">24/7 Monitoring</h3>
              <p className="text-[#5A84C4] leading-relaxed">
                Real-time activity logs and instant anomaly alerts so your security team is never caught off guard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section id="compliance" className="bg-[#F0F7F8] py-24 border-t border-[#CFDFEC]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Legally Bulletproof. <br/>Globally Compliant.</h2>
            <p className="text-[#5A84C4] text-lg mb-6 leading-relaxed">
              Security isn't just about stopping hackers; it's about protecting user privacy and meeting strict legal frameworks. We build compliance into the core of your infrastructure.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 font-semibold text-[#30547B]">
                <Globe className="w-5 h-5 text-[#88CEF0]" /> Fully GDPR Compliant architecture
              </li>
              <li className="flex items-center gap-3 font-semibold text-[#30547B]">
                <FileCheck className="w-5 h-5 text-[#88CEF0]" /> Local INPDP standards integrated
              </li>
              <li className="flex items-center gap-3 font-semibold text-[#30547B]">
                <Lock className="w-5 h-5 text-[#88CEF0]" /> Zero-knowledge data storage
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-white p-8 rounded-2xl border border-[#CFDFEC] shadow-xl">
            <div className="bg-[#CFDFEC] h-48 rounded-lg flex items-center justify-center mb-6">
              <ShieldCheck className="w-20 h-20 text-[#5A84C4] opacity-50" />
            </div>
            <p className="text-sm text-[#5A84C4] text-center font-medium">
              Enterprise-grade privacy controls built for modern startups and institutions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#30547B] text-[#CFDFEC] py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#88CEF0]" />
            <span className="text-xl font-bold text-[#F0F7F8]">No Breach</span>
          </div>
          <p className="text-[#5A84C4] text-sm text-center md:text-left">
            &copy; 2026 No Breach Security. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Demo Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#30547B]/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#CFDFEC] flex justify-between items-center bg-[#F0F7F8]">
              <h3 className="text-2xl font-bold text-[#30547B]">Request a Demo</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#5A84C4] hover:text-[#30547B] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-[#30547B] mb-1">Work Email</label>
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  className="w-full px-4 py-2 rounded-lg border border-[#CFDFEC] focus:outline-none focus:ring-2 focus:ring-[#88CEF0] bg-white text-[#30547B]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#30547B] mb-1">Company Name</label>
                <input 
                  type="text" 
                  placeholder="Acme Corp" 
                  className="w-full px-4 py-2 rounded-lg border border-[#CFDFEC] focus:outline-none focus:ring-2 focus:ring-[#88CEF0] bg-white text-[#30547B]"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#30547B] text-[#F0F7F8] py-3 rounded-lg font-bold mt-2 hover:bg-[#5A84C4] transition-colors"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Compliance/Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#CFDFEC] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#5A84C4] max-w-3xl">
              We use strictly necessary cookies to ensure the security of our platform. By continuing to use No Breach, you agree to our <a href="#" className="text-[#30547B] underline font-medium">Privacy Policy</a> (compliant with GDPR & INPDP standards).
            </p>
            <button 
              onClick={() => setShowBanner(false)}
              className="whitespace-nowrap bg-[#CFDFEC] text-[#30547B] px-6 py-2 rounded-lg font-semibold hover:bg-[#88CEF0] transition-colors"
            >
              I Accept
            </button>
          </div>
        </div>
      )}

    </div>
  );
}