"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "sonner"
import { SidebarProvider } from "@/components/ui/sidebar"

import { Outfit } from "next/font/google"

const outfit = Outfit({ subsets: ["latin"] })

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className={`${outfit.className} flex min-h-screen w-full`}>
        {/* Sidebar fixe à gauche */}
        <AppSidebar />

        {/* Contenu principal */}
        <main className="flex-1 flex justify-center items-start p-4 md:p-10 w-full">
          {/* On laisse le formulaire gérer sa largeur max */}
          <div className="w-full max-w-5xl flex flex-col items-center">
            {children}
          </div>
        </main>

        {/* Toaster pour les notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </SidebarProvider>
  )
}
