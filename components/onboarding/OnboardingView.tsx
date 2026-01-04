import { OnboardingTracker } from "@/components/onboarding/onboarding-tracker";
import { PhoneIcon } from "lucide-react";
import Link from "next/link";

interface OnboardingViewProps {
  step: number;
}

export function OnboardingView({ step }: OnboardingViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
      
      {/* Conteneur du Tracker pour lui donner de l'espace */}
      <div className="w-full mb-12">
        <OnboardingTracker currentStep={step} />
      </div>
      
      {/* Section Support & Légal - Style Minimaliste Airbnb */}
      <div className="mt-16 w-full max-w-2xl text-center space-y-8">
        
        {/* Support Client - Épuré */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F7F7F7] rounded-full border border-[#DDDDDD]">
            <PhoneIcon size={14} className="text-[#222222]" />
            <span className="text-sm font-medium text-[#222222]">
              Besoin d'aide ? 06 16 22 46 82
            </span>
          </div>
          <p className="text-[15px] text-[#717171]">
            Notre équipe est à votre disposition pour vous accompagner dans votre configuration.
          </p>
        </div>

        {/* Légal - Discret et propre */}
        <div className="pt-8 border-t border-[#EBEBEB]">
          <p className="text-[13px] text-[#717171] leading-relaxed">
            En continuant, vous acceptez nos{" "}
            <Link 
              href="/footer/cgu" 
              className="text-[#222222] font-semibold underline underline-offset-4 hover:text-black transition-colors"
            >
              conditions générales d'utilisation
            </Link>
            {" "}ainsi que notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
}