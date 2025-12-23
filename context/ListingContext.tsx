'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface ListingData {
  id?: number
  owner_id?: string
  transaction_type?: 'vente' | 'location' | string
  property_type?: string
  
  // Étape 2 : Vente
  price?: number | null
  price_net?: number | null
  price_fees?: number | null
  fees_paid_by?: 'vendeur' | 'acquereur' | string | null
  
  // Étape 2 : Location
  rent_base?: number | null
  rent_charges?: number | null
  rent_total?: number | null
  
  // Étape 2 : Caractéristiques
  surface_area_m2?: number | null
  room_count?: number | null
  bedroom_count?: number | null
  bathroom_count?: number | null
  
  // Étape 3 : Localisation
  street_address?: string | null
  city?: string | null
  zip_code?: string | null
  region?: string | null // Utilisé pour le département
  country?: string | null
  latitude?: number | null
  longitude?: number | null
  
  // Étape 3 : Confidentialité et Quartier
  neighborhood?: string | null // Le quartier ou lieu-dit saisi à la main
  address_visibility?: 'exact' | '500m' | '1000m' | string | null // Le mode de diffusion choisi

  // Étapes suivantes
  title?: string | null
  description?: string | null
  status?: string
  is_published?: boolean
  step_completed?: number
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

  // Charger le brouillon au démarrage (Client side only)
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

  // Fonction pour mettre à jour l'état et persister
  const updateListing = (data: Partial<ListingData>) => {
    setListingState((prev) => {
      const newState = prev ? { ...prev, ...data } : (data as ListingData)
      // Persistance immédiate
      localStorage.setItem('current_listing_draft', JSON.stringify(newState))
      return newState
    })
  }

  // Permet de remplacer complètement le listing (ex: après un fetch Supabase)
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