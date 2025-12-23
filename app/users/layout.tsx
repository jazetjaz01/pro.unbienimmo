'use client'

import * as React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface UsersLayoutProps {
  children: React.ReactNode
}

export default function UsersLayout({ children }: UsersLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar à gauche */}
        <AppSidebar />

        {/* Contenu principal :
          - flex-1 : occupe tout l'espace horizontal restant
          - flex : devient un conteneur flex pour centrer son enfant
          - items-center : centrage vertical
          - justify-center : centrage horizontal
        */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-10 ">
          {/* On ne met pas de div "w-full" ici pour laisser le max-w-md 
             de ta page UserProfile décider de la largeur du formulaire.
          */}
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}