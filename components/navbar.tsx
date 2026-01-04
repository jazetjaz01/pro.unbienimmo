import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { SunIcon } from "lucide-react";
import { AuthButton } from "./auth-button";

const Navbar = () => {
  return (
    <nav className="h-16 bg-background border-b">
      <div className="h-full flex items-center justify-between  mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Logo />
            <div className="flex gap-0.5 ">
              
            <span className=" text-lg  hidden md:block  font-semibold">pro.</span>
            <span className=" text-lg  hidden md:block font-semibold">unbienimmo</span>
            </div>
          
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />
         <AuthButton />

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
