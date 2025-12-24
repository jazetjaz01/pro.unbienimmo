import { Separator } from "@/components/ui/separator";
import {
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  LinkedinIcon
} from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

const footerLinks = [
  { title: "Nos offres", href: "https://solutionspro.unbienimmo.com" },
  { title: "Faq", href: "/faq" },
  { title: "Cgv", href: "/cgv" },
  { title: "Mentions légales", href: "/mentions_legales" },
  { title: "Qui sommes nous", href: "/qui-sommes-nous" },
  { title: "Contact", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* SECTION PRINCIPALE */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 items-start">
          
          {/* LOGO & TAGLINE */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo />
              <div className="flex flex-col -gap-1">
                <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-gray-900">
                  Solutions Pro
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-light text-gray-400">
                  unbienimmo
                </span>
              </div>
            </Link>
            <p className="text-[11px] leading-relaxed text-gray-400 uppercase tracking-widest max-w-xs">
              Plateforme d'annonces immobilières géolocalisées pour professionnels exigeants.
            </p>
          </div>

          {/* LIENS DE NAVIGATION */}
          <div className="lg:col-span-2">
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-50" />

        {/* BOTTOM BAR */}
        <div className="py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* COPYRIGHT */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-[9px] uppercase tracking-[0.3em] font-medium text-gray-300">
            <span>
              &copy; {new Date().getFullYear()} UNBIENIMMO.COM
            </span>
            <span className="hidden md:block text-gray-100">|</span>
            <span className="text-center md:text-left">
              Propulsé par l'excellence immobilière
            </span>
          </div>

          {/* RÉSEAUX SOCIAUX */}
          <div className="flex items-center gap-8 text-gray-300">
            <Link href="#" className="hover:text-gray-900 transition-colors">
              <InstagramIcon className="h-4 w-4" />
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              <TwitterIcon className="h-4 w-4" />
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              <LinkedinIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;