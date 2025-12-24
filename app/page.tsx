import { LoginForm } from "@/components/login-form";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 font-sans selection:bg-gray-900 selection:text-white">
      
      {/* HEADER / LOGO (Optionnel, à adapter selon votre marque) */}
      <div className="absolute top-12 left-12">
        <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-gray-900">
          UnBienImmo
        </p>
      </div>

      <div className="w-full max-w-lg flex flex-col items-center">
        
        {/* TITRE ÉDITORIAL */}
        <div className="text-center mb-16 space-y-6">
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400">
            Portail Partenaire
          </p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-gray-900 italic">
            Espace Client
          </h1>
          <div className="w-12 h-[1px] bg-gray-900 mx-auto mt-8"></div>
        </div>

        {/* TEXTE D'INTRODUCTION */}
        <p className="text-sm md:text-base text-gray-500 max-w-sm text-center leading-relaxed font-light mb-12">
          Gérez l'intégralité de votre diffusion immobilière et optimisez vos performances depuis votre interface dédiée.
        </p>

        {/* LOGIN FORM (Le container est épuré) */}
        <div className="w-full border-t border-gray-100 pt-12">
          <LoginForm />
        </div>

        {/* FOOTER DISCRET */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <Link 
            href="https://www.unbienimmo.com" 
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors"
          >
            Retour au site principal
            <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
          
          <p className="text-[9px] text-gray-300 uppercase tracking-widest">
            © 2025 UNBIENIMMO. TOUS DROITS RÉSERVÉS.
          </p>
        </div>
      </div>

      {/* DÉCORATION MINIMALISTE (Lignes de fuite) */}
      <div className="fixed inset-0 pointer-events-none border-[1rem] border-white z-50"></div>
    </div>
  );
}