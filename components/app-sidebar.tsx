"use client"

import * as React from "react"
import {
  Building2,
  Home,
  Users,
  Map as MapIcon,
  Settings2,
  BarChart3,
  PlusCircle,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Données de navigation pour UnBienImmo Pro
const data = {
  user: {
    name: "Agent Immobilier",
    email: "contact@agence.com",
    avatar: "",
  },
  teams: [
    {
      name: "Mon Agence",
      logo: Building2,
      plan: "Professionnel",
    },
  ],
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Annonces",
      url: "#",
      icon: Home,
      items: [
        {
          title: "Toutes les annonces",
          url: "/dashboard/listings",
        },
        {
          title: "Publier une annonce",
          url: "/dashboard/listings/create",
        },
      ],
    },
    {
      title: "Mon Équipe",
      url: "/dashboard/team",
      icon: Users,
    },
    {
      title: "Carte Immo",
      url: "/dashboard/map",
      icon: MapIcon,
    },
  ],
  secondaryNav: [
    {
      name: "Paramètres Agence",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      name: "Abonnement",
      url: "/dashboard/billing",
      icon: Building2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* On réutilise NavProjects pour le menu secondaire */}
        <NavProjects projects={data.secondaryNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}