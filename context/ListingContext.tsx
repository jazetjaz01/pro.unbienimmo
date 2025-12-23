'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface ListingData {
  id?: number
  owner_id?: string
  transaction_type?: 'vente' | 'location' | string
  property_type?: string
  
  // Étape 2 : Vente & Location
  price?: number | null
  price_net?: number | null
  price_fees?: number | null
  fees_paid_by?: string | null
  rent_base?: number | null
  rent_charges?: number | null
  rent_total?: number | null
  
  // Étape 2 : Caractéristiques physiques
  surface_area_m2?: number | null
  room_count?: number | null
  bedroom_count?: number | null
  bathroom_count?: number | null
  
  // Étape 3 : Localisation
  street_address?: string | null
  city?: string | null
  zip_code?: string | null
  region?: string | null 
  country?: string | null
  latitude?: number | null
  longitude?: number | null
  neighborhood?: string | null 
  address_visibility?: 'exact' | '500m' | '1000m' | string | null

  // Étape 4 : Détails financiers et techniques
  property_tax?: number | null
  housing_tax?: number | null
  condo_fees_annual?: number | null
  heating_type?: string | null

  // Étape 5 : Contenu de l'annonce
  title?: string | null
  description?: string | null
  slug?: string | null

  // Étape 6 : Diagnostics Immobiliers (DPE/GES)
  dpe_not_applicable?: boolean
  ademe_number?: string | null
  energy_consumption?: number | null
  energy_class?: string | null
  ghg_emissions?: number | null
  ghg_class?: string | null
  diagnostic_date?: string | null // Stocké en string ISO pour le state
  energy_reference_year?: string | null
  annual_energy_cost_min?: number | null
  annual_energy_cost_max?: number | null

  // Méta-données
  status?: string
  is_published?: boolean
  step_completed?: number
  created_at?: string
  updated_at?: string
}

interface ListingContextType {
  listing: ListingData | null
  updateListing: (data: Partial<ListingData>) => void
  setListing: (data: ListingData | null) => void 
  resetListing: () => void 
  isLoading: boolean
}

const ListingContext = createContext<ListingContextType | undefined>(undefined)

export function ListingProvider({ children }: { children: React.ReactNode }) {
  const [listing, setListingState] = useState<ListingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger le brouillon au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('current_listing_draft')
    if (saved) {
      try {
        setListingState(JSON.parse(saved))
      } catch (error) {
        console.error("Erreur parsing localStorage", error)
      }
    }
    setIsLoading(false)
  }, [])

  const updateListing = (data: Partial<ListingData>) => {
    setListingState((prev) => {
      const newState = prev ? { ...prev, ...data } : (data as ListingData)
      localStorage.setItem('current_listing_draft', JSON.stringify(newState))
      return newState
    })
  }

  const setListing = (data: ListingData | null) => {
    setListingState(data)
    if (data) {
      localStorage.setItem('current_listing_draft', JSON.stringify(data))
    } else {
      localStorage.removeItem('current_listing_draft')
    }
  }

  const resetListing = () => {
    localStorage.removeItem('current_listing_draft')
    setListingState(null)
  }

  return (
    <ListingContext.Provider value={{ listing, updateListing, setListing, resetListing, isLoading }}>
      {children}
    </ListingContext.Provider>
  )
}

export const useListing = () => {
  const context = useContext(ListingContext)
  if (!context) throw new Error("useListing must be used within ListingProvider")
  return context
}