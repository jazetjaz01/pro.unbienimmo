// components/OnboardingView.tsx
import { OnboardingTracker } from "@/components/onboarding/onboarding-tracker";
import Link from "next/link";

interface OnboardingViewProps {
  step: number;
}

export function OnboardingView({ step }: OnboardingViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 min-h-[calc(100vh-64px)] flex flex-col justify-center">
      {/* Le tracker central qui affiche les 3 ou 4 étapes */}
      <OnboardingTracker currentStep={step} />
      
      {/* Section Support & Légal - Style Statutaire */}
      <div className="mt-24 text-center space-y-6 max-w-2xl mx-auto border-t border-gray-100 pt-12">
        <p className="text-sm tracking-widest font-medium text-gray-500 italic">
          "Notre Service Client est disponible au <span className="text-gray-900 font-black not-italic">06 16 22 46 82</span> si vous avez des questions"
        </p>
        
        <p className="text-[11px] tracking-widest uppercase font-bold text-gray-400">
          L'inscription implique l'acceptation des{" "}
          <Link 
            href="/footer/cgu" 
            className="text-gray-900 underline decoration-orange-600 underline-offset-8 hover:text-orange-600 transition-colors"
          >
            Conditions Générales d'Utilisation
          </Link>
        </p>
      </div>
    </div>
  );
}