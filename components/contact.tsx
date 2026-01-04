import { MailIcon, MapPinIcon, PhoneIcon, ChevronRight } from "lucide-react";
import Link from "next/link";

const Contact = () => (
  <div className="min-h-screen bg-white font-sans">
    <div className="max-w-5xl mx-auto px-6 py-20 md:py-32">
      
      {/* HEADER ÉPURÉ */}
      <div className="mb-20 space-y-6">
        <h1 className="text-4xl md:text-[56px] font-semibold tracking-tight text-[#222222] leading-[1.1]">
          Contactez-nous
        </h1>
        <p className="text-xl md:text-2xl text-[#717171] font-normal max-w-2xl leading-relaxed">
          Notre équipe dédiée aux professionnels est là pour vous accompagner. Posez-nous vos questions, nous vous répondrons avec plaisir.
        </p>
      </div>

      {/* SECTION CONTACT SANS CADRES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
        
        {/* EMAIL */}
        <div className="space-y-4">
          <div className="h-10 w-10 flex items-center justify-center">
            <MailIcon className="h-6 w-6 text-[#222222]" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#222222]">Écrivez-nous</h3>
            <p className="text-[15px] text-[#717171] leading-relaxed">
              Pour toute demande d'assistance ou d'information générale.
            </p>
            <Link
              className="block text-[16px] font-medium text-[#222222] underline underline-offset-4 hover:opacity-70 transition-opacity"
              href="mailto:contact@unbienimmo.com"
            >
              contact@unbienimmo.com
            </Link>
          </div>
        </div>

        {/* SIÈGE SOCIAL */}
        <div className="space-y-4">
          <div className="h-10 w-10 flex items-center justify-center">
            <MapPinIcon className="h-6 w-6 text-[#222222]" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#222222]">Notre siège</h3>
            <p className="text-[15px] text-[#717171] leading-relaxed">
              Nos bureaux sont situés au cœur de Perpignan et ouverts du lundi au samedi.
            </p>
            <Link
              className="block text-[16px] font-medium text-[#222222] leading-snug hover:opacity-70 transition-opacity"
              href="https://maps.google.com"
              target="_blank"
            >
              7 Avenue de Banyuls sur Mer,<br /> 66100 Perpignan
            </Link>
          </div>
        </div>

        {/* TÉLÉPHONE */}
        <div className="space-y-4">
          <div className="h-10 w-10 flex items-center justify-center">
            <PhoneIcon className="h-6 w-6 text-[#222222]" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#222222]">Téléphone</h3>
            <p className="text-[15px] text-[#717171] leading-relaxed">
              Nous sommes disponibles de 08h00 à 20h00 pour vous accompagner.
            </p>
            <Link
              className="block text-[16px] font-medium text-[#222222] underline underline-offset-4 hover:opacity-70 transition-opacity"
              href="tel:0616224682"
            >
              06 16 22 46 82
            </Link>
          </div>
        </div>

      </div>

    </div>
  </div>
);

export default Contact;