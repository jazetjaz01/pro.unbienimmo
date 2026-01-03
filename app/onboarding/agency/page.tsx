"use client"

import { AgencyForm } from "@/components/forms/agency-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OnboardingAgencyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Barre de progression discrète en haut */}
      <div className="w-full h-1 bg-gray-50">
        <div className="w-2/3 h-full bg-black transition-all duration-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto w-full pt-12 px-6 pb-20">
        
        {/* Navigation de retour */}
        <Link 
          href="/onboarding/profile" 
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-black transition-colors mb-16"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Retour au profil
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Colonne de gauche : Titre et Contexte */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-300">Étape 02</p>
              <h1 className="text-4xl font-light italic tracking-tight text-gray-900 leading-tight">
                Votre <br />Structure
              </h1>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed italic border-l border-gray-100 pl-4">
              "Ces détails permettront de personnaliser votre espace de travail et vos futurs documents de vente."
            </p>
          </div>

          {/* Colonne de droite : Le Formulaire réutilisable */}
          <div className="lg:col-span-8 bg-gray-50/30 p-8 md:p-12 border border-gray-50">
            <AgencyForm isOnboarding={true} />
          </div>

        </div>

        {/* Footer informatif */}
        <div className="mt-20 pt-8 border-t border-gray-50 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] text-gray-300">
          <span>UnBien — Plateforme Immobilière</span>
          <span>Configuration de l'entité</span>
        </div>
      </div>
    </div>
  )
}