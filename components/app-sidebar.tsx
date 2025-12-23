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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useListing } from "@/context/ListingContext" // Import du context
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// On garde les données statiques à l'extérieur
const STATIC_DATA = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
    { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
    { name: "Evil Corp.", logo: Command, plan: "Free" },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { listing } = useListing() // Récupération de l'annonce en cours

  // On définit navMain ici pour qu'il puisse utiliser la variable `listing`
  const navMain = [
    {
      title: "Utilisateurs",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Utilisateur principal", url: "/users/main" },
        { title: "Autres utilisateurs", url: "#" },
        { title: "Voir", url: "#" },
      ],
    },
    {
      title: "Société",
      url: "#",
      icon: Bot,
      items: [
        { title: "Fiche", url: "/users/company" },
        { title: "Page publique", url: "/users/company/public" },
        { title: "Voir page publique", url: "#" },
      ],
    },
    {
      title: "Annonces",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Mes annonces",
          url: "/dashboard/listings/board",
        },
        {
          title: "Créer une annonce",
          // CORRECTION : Utilisation de l'ID du contexte
          url: listing?.id 
            ? `/dashboard/listings/${listing.id}/edit/step-1` 
            : "/dashboard/listings/new/edit/step-1",
        },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={STATIC_DATA.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* On passe le navMain dynamique ici */}
        <NavMain items={navMain} />
        <NavProjects projects={STATIC_DATA.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={STATIC_DATA.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}