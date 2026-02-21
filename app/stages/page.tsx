'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Calendar, MapPin, ArrowRight, ShieldCheck, 
  Clock, Filter, AlertCircle 
} from "lucide-react";

export default function PublicStagesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for available stages
  const availableStages = [
    {
      id: "TR-101",
      title: "Stage de Récupération de Points",
      date: "24 Fév - 25 Fév 2026",
      location: "Tunis Centre - Centre de Formation Alpha",
      price: "150 TND",
      spotsLeft: 3,
      isWeekend: true,
      tags: ["Places limitées", "Weekend"]
    },
    {
      id: "TR-102",
      title: "Stage de Sensibilisation",
      date: "28 Fév - 01 Mar 2026",
      location: "Ariana - Auto-École Pro",
      price: "150 TND",
      spotsLeft: 12,
      isWeekend: true,
      tags: ["Weekend"]
    },
    {
      id: "TR-103",
      title: "Stage de Récupération de Points",
      date: "05 Mar - 06 Mar 2026",
      location: "Sousse - Sécurité Routière Plus",
      price: "130 TND",
      spotsLeft: 8,
      isWeekend: false,
      tags: ["Semaine", "Promo"]
    },
    {
      id: "TR-104",
      title: "Stage de Sensibilisation (Accéléré)",
      date: "12 Mar - 13 Mar 2026",
      location: "Sfax Centre",
      price: "160 TND",
      spotsLeft: 1,
      isWeekend: false,
      tags: ["Dernière place !", "Intensif"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-[20%] w-[60%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Public Navbar (Simplified) */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            AutoStage
          </span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <Link href="/stages" className="text-indigo-400">Réserver un stage</Link>
          <Link href="/auth/login" className="hover:text-white transition-colors">Espace Client</Link>
        </div>
        <Link href="/auth/login" className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-700 transition-colors border border-slate-700">
          Connexion
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-16 pb-12 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Trouvez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Stage de Récupération</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10">
          Réservez votre place en ligne en quelques clics. Des sessions disponibles chaque semaine près de chez vous pour récupérer vos points rapidement et légalement.
        </p>

        {/* Search and Filter Bar */}
        <div className="max-w-4xl mx-auto bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-2xl">
          <div className="flex-1 flex items-center bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-700/50 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <MapPin className="w-5 h-5 text-slate-500 mr-3" />
            <input 
              type="text" 
              placeholder="Ville, code postal ou centre..." 
              className="bg-transparent border-none outline-none text-white w-full placeholder-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 flex items-center bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-700/50">
            <Calendar className="w-5 h-5 text-slate-500 mr-3" />
            <select className="bg-transparent border-none outline-none text-slate-300 w-full appearance-none cursor-pointer">
              <option value="">Toutes les dates</option>
              <option value="this-month">Ce mois-ci</option>
              <option value="next-month">Le mois prochain</option>
            </select>
          </div>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Search className="w-5 h-5 mr-2" />
            Rechercher
          </button>
        </div>
      </header>

      {/* Stages Grid */}
      <main className="container mx-auto px-6 pb-24 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Sessions disponibles ({availableStages.length})</h2>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium">
            <Filter className="w-4 h-4" />
            Filtrer par type
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {availableStages.map((stage) => (
            <div 
              key={stage.id} 
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all duration-300 group flex flex-col sm:flex-row gap-6"
            >
              {/* Left Column: Date & Price Flag */}
              <div className="flex flex-col sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-700/50 pb-4 sm:pb-0 sm:pr-6 justify-center">
                <div className="text-indigo-400 font-bold text-lg mb-1">{stage.price}</div>
                <div className="flex items-start gap-2 text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 mt-1 text-slate-500 flex-shrink-0" />
                  <span className="font-medium">{stage.date}</span>
                </div>
                {stage.spotsLeft <= 3 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1.5 rounded-lg mt-2 inline-flex w-fit">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Plus que {stage.spotsLeft} places !
                  </div>
                )}
              </div>

              {/* Right Column: Details & CTA */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {stage.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-slate-700/50 text-slate-300 border border-slate-600/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {stage.title}
                  </h3>
                  <div className="flex items-start gap-2 text-slate-400 text-sm mb-4">
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-500 flex-shrink-0" />
                    <span>{stage.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center text-xs text-slate-500 gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Durée: 2 jours consécutifs
                  </div>
                  {/* Link to the specific dynamic route we created */}
                  <Link 
                    href={`/stages/${stage.id}`}
                    className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition-all text-sm group-hover:shadow-lg group-hover:shadow-indigo-500/20"
                  >
                    Voir & Réserver
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}