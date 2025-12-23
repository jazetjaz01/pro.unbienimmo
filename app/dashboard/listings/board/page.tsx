'use client'

import * as React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Eye, 
  Edit3, 
  Loader2, 
  CheckCircle2, 
  Clock,
  MoreHorizontal,
  MapPin,
  Phone,
  Power,
  PowerOff,
  Trash2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ListingItem {
  id: number
  property_type: string
  transaction_type: string
  price: number
  city: string
  is_published: boolean
  owner_name: string | null
  owner_phone: string | null
  created_at: string
}

export default function MyListingsPage() {
  const supabase = createClient()
  const [listings, setListings] = React.useState<ListingItem[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchMyListings = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('listings')
        .select(`id, property_type, transaction_type, price, city, is_published, owner_name, owner_phone, created_at`)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (e: any) {
      toast.error("Erreur de chargement : " + e.message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  React.useEffect(() => {
    fetchMyListings()
  }, [fetchMyListings])

  // --- ACTION : SUPPRIMER L'ANNONCE + RÉPERTOIRE IMAGES ---
  const deleteListing = async (id: number) => {
    const confirmDelete = window.confirm(
      "Supprimer définitivement cette annonce et TOUTES ses photos ? Cette action est irréversible."
    )
    
    if (!confirmDelete) return

    try {
      // 1. Nettoyage du Bucket Storage
      // On suppose que vos images sont dans un dossier nommé par l'ID de l'annonce
      const folderPath = `${id}` 

      // Lister les fichiers présents dans le dossier
      const { data: files, error: listError } = await supabase
        .storage
        .from('listings-images')
        .list(folderPath)

      if (!listError && files && files.length > 0) {
        // Créer la liste des chemins complets à supprimer
        const filesToRemove = files.map((file) => `${folderPath}/${file.name}`)
        
        // Supprimer les fichiers du bucket
        const { error: storageError } = await supabase
          .storage
          .from('listings')
          .remove(filesToRemove)

        if (storageError) console.error("Erreur Storage:", storageError.message)
      }

      // 2. Suppression de la ligne en base de données
      const { error: dbError } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError
      
      toast.success("Annonce et photos supprimées")
      setListings(prev => prev.filter(item => item.id !== id))

    } catch (e: any) {
      toast.error("Erreur lors de la suppression : " + e.message)
    }
  }

  const togglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error
      
      toast.success(currentStatus ? "Diffusion arrêtée" : "Annonce publiée")
      fetchMyListings()
    } catch (e: any) {
      toast.error("Erreur : " + e.message)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      year: '2-digit'
    }).format(new Date(dateString)).replace('.', '')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-none mx-auto space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Mes annonces</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Gérez vos biens et vos mandats en temps réel.</p>
        </div>
        <Link href="/dashboard/listings/new/edit/step-1">
          <Button className="flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-black shadow-xl h-12 px-6 transition-all active:scale-95">
            <Plus className="h-5 w-5" /> Nouvelle annonce
          </Button>
        </Link>
      </div>

      <div className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-20 font-bold text-slate-400 pl-6">Réf.</TableHead>
              <TableHead className="font-bold text-slate-700">Date</TableHead>
              <TableHead className="font-bold text-slate-700">Type de bien</TableHead>
              <TableHead className="font-bold text-slate-700">Propriétaire</TableHead>
              <TableHead className="text-right font-bold text-slate-700">Prix</TableHead>
              <TableHead className="text-center font-bold text-slate-700">Diffusion</TableHead>
              <TableHead className="text-right font-bold text-slate-700 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-slate-400 italic">
                  Aucun bien enregistré.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing.id} className="hover:bg-slate-50/30 transition-colors border-slate-50">
                  <TableCell className="font-medium text-slate-400 text-xs pl-6">#{listing.id}</TableCell>
                  
                  <TableCell className="whitespace-nowrap capitalize text-slate-500 font-bold text-sm">
                    {formatDate(listing.created_at)}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 leading-none uppercase text-sm">{listing.property_type}</span>
                      <span className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-bold">
                        <MapPin size={12} /> {listing.city}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 leading-none">{listing.owner_name || "—"}</span>
                      {listing.owner_phone && (
                        <span className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-bold">
                          <Phone size={12} /> {listing.owner_phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right font-black text-slate-900 whitespace-nowrap">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)}
                  </TableCell>

                  <TableCell className="text-center">
                    {listing.is_published ? (
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-wider">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        En ligne
                      </div>
                    ) : (
                      <span className="text-slate-300 font-bold text-[10px] uppercase tracking-wider">Hors ligne</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreHorizontal className="h-5 w-5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl">
                        <DropdownMenuItem asChild className="rounded-xl py-2.5 font-bold">
                          <Link href={`/listings/${listing.id}`} target="_blank">
                            <Eye className="mr-3 h-4 w-4" /> Voir l'annonce
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl py-2.5 font-bold">
                          <Link href={`/dashboard/listings/${listing.id}/edit/step-1`}>
                            <Edit3 className="mr-3 h-4 w-4" /> Modifier
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="my-1 bg-slate-50" />
                        
                        <DropdownMenuItem 
                          onClick={() => togglePublish(listing.id, listing.is_published)}
                          className={`rounded-xl py-2.5 font-bold ${listing.is_published ? 'text-orange-500' : 'text-emerald-600'}`}
                        >
                          {listing.is_published ? (
                            <><PowerOff className="mr-3 h-4 w-4" /> Suspendre</>
                          ) : (
                            <><Power className="mr-3 h-4 w-4" /> Publier</>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 bg-slate-50" />
                        
                        <DropdownMenuItem 
                          onClick={() => deleteListing(listing.id)}
                          className="rounded-xl py-2.5 font-bold text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                        >
                          <Trash2 className="mr-3 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}