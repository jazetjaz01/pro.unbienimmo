import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { Suspense } from 'react'
import Link from "next/link";
import { AuthButton } from "./auth-button";

const Navbar = () => {
  return (
    <nav className="h-16 bg-background border-b">
      <div className="h-full flex items-center justify-between  mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-sarina text-lg  hidden md:block">unbienimmo</span>
          </Link>
        

        <div className="flex items-center gap-3">
          <NavMenu className="hidden md:block" />
     
          <Suspense>
            <AuthButton />
            </Suspense>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
