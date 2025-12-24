"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutGrid,
  FileText,
  Building2,
  Users2
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useListing } from "@/context/ListingContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const STATIC_DATA = {
  user: {
    name: "Espace Partenaire",
    email: "agence@unbienimmo.com",
    avatar: "/avatars/pro.jpg",
  },
  teams: [
    { name: "UnBienImmo", logo: Command, plan: "Pro" },
  ],
  projects: [
    { name: "Statistiques", url: "#", icon: PieChart },
    { name: "Aide & Support", url: "#", icon: Map },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { listing } = useListing()

  const navMain = [
    {
      title: "Utilisateurs",
      url: "#",
      icon: Users2,
      isActive: false,
      items: [
        { title: "Profil principal", url: "/users/main" },
        { title: "Collaborateurs", url: "#" },
      ],
    },
    {
      title: "Société",
      url: "#",
      icon: Building2,
      items: [
        { title: "Fiche Agence", url: "/users/company" },
        { title: "Page publique", url: "/users/company/public" },
      ],
    },
    {
      title: "Annonces",
      url: "#",
      icon: FileText,
      isActive: true,
      items: [
        {
          title: "Mes annonces",
          url: "/dashboard/listings/board",
        },
        {
          title: "Créer une annonce",
          url: listing?.id 
            ? `/dashboard/listings/${listing.id}/edit/step-1` 
            : "/dashboard/listings/new/edit/step-1",
        },
      ],
    },
    {
      title: "Paramètres",
      url: "#",
      icon: Settings2,
      items: [
        { title: "Général", url: "#" },
        { title: "Facturation", url: "#" },
      ],
    },
  ]

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-gray-100 bg-white" 
      {...props}
    >
      {/* HEADER : Plus sobre, sans fonds colorés inutiles */}
      <SidebarHeader className="h-16 border-b border-gray-50 flex justify-center px-4">
        <TeamSwitcher teams={STATIC_DATA.teams} />
      </SidebarHeader>

      <SidebarContent className="py-6 px-2">
        {/* NavMain gère la typographie des liens */}
        <div className="mb-4 px-4">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-300 mb-6">
                Navigation
            </p>
            <NavMain items={navMain} />
        </div>
        
        <div className="mt-10 px-4 border-t border-gray-50 pt-8">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-300 mb-6">
                Outils
            </p>
            <NavProjects projects={STATIC_DATA.projects} />
        </div>
      </SidebarContent>

      {/* FOOTER : Très épuré */}
      <SidebarFooter className="border-t border-gray-50 p-4">
        <NavUser user={STATIC_DATA.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}