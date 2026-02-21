'use client';

import Link from 'next/link';
import { 
  ArrowLeft, Calendar, MapPin, Clock, ShieldCheck, 
  CheckCircle, CreditCard, User, AlertCircle, FileText
} from "lucide-react";

// In a real app, you would fetch this from your database using the params.id
export default function StageDetailsPage({ params }: { params: { id: string } }) {
  // Mock data for the specific stage
  const stage = {
    id: params.id,
    title: "Stage de Récupération de Points",
    centerName: "Centre de Formation Alpha",
    date: "24 Fév - 25 Fév 2026",
    schedule: "08:00 - 12:00 | 13:00 - 16:00",
    location: "15 Avenue Habib Bourguiba, Tunis Centre 1001",
    price: "150 TND",
    spotsLeft: 3,
    totalSpots: 20,
    instructor: "Karim Ben Ali (Agréé par l'État)",
    description: "Ce stage de deux jours consécutifs vous permet de récupérer jusqu'à 4 points sur votre permis de conduire. La présence est obligatoire sur l'ensemble des horaires pour valider le stage."
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-indigo-500 selection:text-white relative pb-24">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-[10%] w-[50%] h-[40%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation Bar */}
      <nav className="border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <Link href="/stages" className="flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux sessions
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-10 relative z-10">
        
        {/* Stage Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {stage.id}
            </span>
            {stage.spotsLeft <= 5 && (
              <span className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                Dernières places
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {stage.title}
          </h1>
          <p className="text-xl text-slate-400 flex items-center gap-2">
            Organisé par <span className="text-white font-semibold">{stage.centerName}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Details & Schedule */}
          <div className="flex-1 space-y-8">
            
            {/* Quick Info Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-3 bg-slate-900/50 rounded-xl text-indigo-400 border border-slate-700/50">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Dates du stage</p>
                  <p className="text-white font-semibold">{stage.date}</p>
                </div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-3 bg-slate-900/50 rounded-xl text-indigo-400 border border-slate-700/50">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Lieu de formation</p>
                  <p className="text-white font-semibold">{stage.location}</p>
                </div>
              </div>
            </div>

            {/* About the Stage */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4">À propos de ce stage</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                {stage.description}
              </p>
              
              <h3 className="text-lg font-bold text-white mb-4 mt-8">Programme détaillé</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                
                {/* Day 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    1
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-white">Jour 1</h4>
                      <span className="text-xs font-medium text-indigo-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> {stage.schedule}</span>
                    </div>
                    <p className="text-sm text-slate-400">Accueil, présentation des enjeux de la sécurité routière et analyse des données statistiques.</p>
                  </div>
                </div>

                {/* Day 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    2
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-white">Jour 2</h4>
                      <span className="text-xs font-medium text-indigo-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> {stage.schedule}</span>
                    </div>
                    <p className="text-sm text-slate-400">Étude de cas concrets, psychologie du conducteur et évaluation finale d'assiduité.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Instructor Info */}
            <div className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Animé par</p>
                <p className="text-white font-bold">{stage.instructor}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:w-[400px]">
            <div className="sticky top-24 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Prix total</p>
                  <p className="text-4xl font-extrabold text-white">{stage.price}</p>
                </div>
              </div>

              {/* Progress Bar for Spots */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className={stage.spotsLeft <= 5 ? "text-rose-400" : "text-slate-300"}>
                    {stage.spotsLeft} places restantes
                  </span>
                  <span className="text-slate-500">sur {stage.totalSpots}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full ${stage.spotsLeft <= 5 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${((stage.totalSpots - stage.spotsLeft) / stage.totalSpots) * 100}%` }}
                  ></div>
                </div>
              </div>

              <Link 
                href={`/stages/${stage.id}/book`}
                className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 mb-6"
              >
                Réserver ma place
              </Link>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p>Confirmation immédiate par email après paiement.</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                  <p>Vos documents d'identité sont traités conformément au RGPD lors de l'inscription.</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <CreditCard className="w-5 h-5 text-slate-300 shrink-0" />
                  <p>Paiement sécurisé par Stripe.</p>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}