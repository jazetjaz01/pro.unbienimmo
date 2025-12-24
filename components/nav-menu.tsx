"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => {
  // Style personnalisé pour remplacer le style par défaut de shadcn
  const minimalTriggerStyle = "group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-gray-900 transition-colors bg-transparent";

  return (
    <NavigationMenu {...props} className={cn("max-w-max", props.className)}>
      <NavigationMenuList className="flex-row gap-4 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:gap-2">
        
        {/* ESPACE CLIENT */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={minimalTriggerStyle}>
            <Link href="/dashboard" className="relative after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-gray-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              Espace client
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* S'ABONNER */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={minimalTriggerStyle}>
            <Link href="https://solutionspro.unbienimmo.com" className="relative after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-gray-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              S'abonner
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* CONTACT */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={minimalTriggerStyle}>
            <Link href="/contact" className="relative after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-gray-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              Contact
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  );
};