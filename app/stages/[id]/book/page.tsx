'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ShieldCheck, Lock, CreditCard, UploadCloud, 
  CheckCircle, AlertCircle, FileText, User, Mail, Phone, Calendar
} from "lucide-react";

export default function BookStagePage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for the order summary
  const stage = {
    id: params.id || "TR-101",
    title: "Stage de Récupération de Points",
    date: "24 Fév - 25 Fév 2026",
    location: "Tunis Centre",
    price: "150 TND",
    fee: "5 TND",
    total: "155 TND"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, this would trigger Stripe elements and your NextJS server actions
    setTimeout(() => setIsSubmitting(false), 2000); 
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-indigo-500 selection:text-white relative pb-24">
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Simplified Checkout Navbar */}
      <nav className="border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/stages/${stage.id}`} className="flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>
          <div className="flex items-center gap-2 text-white font-bold">
            <Lock className="w-4 h-4 text-emerald-400" />
            Paiement Sécurisé
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-10 relative z-10 max-w-6xl">
        
        {/* Checkout Steps Indicator */}
        <div className="flex items-center justify-center mb-10 text-sm font-medium">
          <div className="flex items-center text-indigo-400">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center mr-2">1</div>
            Sélection
          </div>
          <div className="w-12 h-px bg-indigo-500/30 mx-4"></div>
          <div className="flex items-center text-white">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2 shadow-[0_0_10px_rgba(79,70,229,0.5)]">2</div>
            Informations & Paiement
          </div>
          <div className="w-12 h-px bg-slate-700 mx-4"></div>
          <div className="flex items-center text-slate-500">
            <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center mr-2">3</div>
            Confirmation
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Form Details */}
          <div className="flex-1 space-y-8">
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Personal Info */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Vos informations
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Prénom</label>
                    <input type="text" required placeholder="Jean" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Nom</label>
                    <input type="text" required placeholder="Dupont" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                      <input type="email" required placeholder="jean@exemple.com" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                      <input type="tel" required placeholder="+216 20 000 000" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Document Upload (GDPR Compliant) */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Documents requis
                  </h2>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Conformité INPDP
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 mb-5">
                  Veuillez télécharger une copie recto-verso de votre permis de conduire. Ces documents sont chiffrés et supprimés automatiquement après validation de votre dossier.
                </p>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Numéro de permis</label>
                  <input type="text" required placeholder="Ex: 12/345678" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600 mb-5" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload Recto */}
                  <div className="border-2 border-dashed border-slate-600 hover:border-indigo-500 bg-slate-900/30 rounded-2xl p-6 text-center transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/20 transition-colors">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Permis (Recto)</p>
                    <p className="text-xs text-slate-500">PNG, JPG ou PDF (Max 5MB)</p>
                  </div>
                  
                  {/* Upload Verso */}
                  <div className="border-2 border-dashed border-slate-600 hover:border-indigo-500 bg-slate-900/30 rounded-2xl p-6 text-center transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/20 transition-colors">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Permis (Verso)</p>
                    <p className="text-xs text-slate-500">PNG, JPG ou PDF (Max 5MB)</p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="lg:w-[420px]">
            <div className="sticky top-24 space-y-6">
              
              {/* Summary Card */}
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Résumé de la commande</h3>
                
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-white">{stage.title}</p>
                    <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{stage.id}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-400 gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    {stage.date}
                  </div>
                </div>

                <div className="space-y-3 text-sm border-b border-slate-700/50 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prix du stage</span>
                    <span className="text-white font-medium">{stage.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Frais de dossier</span>
                    <span className="text-white font-medium">{stage.fee}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-slate-300 font-medium">Total à payer</span>
                  <span className="text-3xl font-extrabold text-white">{stage.total}</span>
                </div>

                {/* Simulated Stripe Element container */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 mb-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" /> Carte Bancaire
                    </span>
                    {/* Simulated card logos */}
                    <div className="flex gap-1">
                      <div className="w-8 h-5 bg-slate-800 rounded border border-slate-600"></div>
                      <div className="w-8 h-5 bg-slate-800 rounded border border-slate-600"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 bg-slate-800 rounded border border-slate-700 w-full"></div>
                    <div className="flex gap-3">
                      <div className="h-10 bg-slate-800 rounded border border-slate-700 w-1/2"></div>
                      <div className="h-10 bg-slate-800 rounded border border-slate-700 w-1/2"></div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'Traitement en cours...' : `Payer ${stage.total}`}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" /> SSL 256-bit</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Paiement Stripe</span>
              </div>
              
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}