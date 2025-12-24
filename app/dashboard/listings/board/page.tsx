'use client'

import * as React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Eye, 
  Edit3, 
  Loader2, 
  MoreHorizontal,
  MapPin,
  Phone,
  Power,
  PowerOff,
  Trash2,
  ExternalLink 
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  const PUBLIC_SITE_URL = "https://www.unbienimmo.com"

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
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  React.useEffect(() => {
    fetchMyListings()
  }, [fetchMyListings])

  const deleteListing = async (id: number) => {
    if (!window.confirm("Supprimer définitivement cette annonce ?")) return

    try {
      const { error: dbError } = await supabase.from('listings').delete().eq('id', id)
      if (dbError) throw dbError
      
      toast.success("Annonce supprimée")
      setListings(prev => prev.filter(item => item.id !== id))
    } catch (e: any) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const togglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('listings').update({ is_published: !currentStatus }).eq('id', id)
      if (error) throw error
      toast.success(currentStatus ? "Hors ligne" : "En ligne")
      fetchMyListings()
    } catch (e: any) {
      toast.error("Erreur de mise à jour")
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(new Date(dateString))
  }

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-7xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER MINIMALISTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">Mes Annonces</h1>
          <p className="text-gray-400 text-sm tracking-wide uppercase">Gestion de parc immobilier</p>
        </div>
        <Link href="/dashboard/listings/edit/step-1">
          <Button className="rounded-none bg-gray-900 hover:bg-black text-white h-14 px-8 transition-all uppercase text-xs tracking-[0.2em] font-bold">
            <Plus className="h-4 w-4 mr-2" /> Ajouter un bien
          </Button>
        </Link>
      </div>

      {/* TABLEAU EPURÉ */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-900 border-opacity-10">
              <TableHead className="w-[80px] font-bold text-gray-400 text-[10px] uppercase tracking-widest px-0">Ref.</TableHead>
              <TableHead className="font-bold text-gray-900 text-[10px] uppercase tracking-widest px-0">Détails du bien</TableHead>
              <TableHead className="font-bold text-gray-900 text-[10px] uppercase tracking-widest px-0">Propriétaire</TableHead>
              <TableHead className="text-right font-bold text-gray-900 text-[10px] uppercase tracking-widest px-0">Prix</TableHead>
              <TableHead className="text-center font-bold text-gray-900 text-[10px] uppercase tracking-widest px-0">Statut</TableHead>
              <TableHead className="text-right px-0"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-60 text-center text-gray-400 font-light">
                  Aucun listing disponible actuellement.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                  <TableCell className="text-gray-400 text-xs font-light px-0 py-6">
                    {listing.id}
                  </TableCell>
                  
                  <TableCell className="px-0 py-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-base">{listing.property_type}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-gray-300" /> {listing.city} — {formatDate(listing.created_at)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-0 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">{listing.owner_name || "—"}</span>
                      {listing.owner_phone && (
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                          <Phone size={10} /> {listing.owner_phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right font-medium text-gray-900 px-0 py-6">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)}
                  </TableCell>

                  <TableCell className="text-center px-0 py-6">
                    <div className="inline-flex items-center justify-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${listing.is_published ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${listing.is_published ? 'text-gray-900' : 'text-gray-300'}`}>
                        {listing.is_published ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right px-0 py-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-900 hover:text-white rounded-none transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-none border-gray-100 shadow-xl p-0">
                        <DropdownMenuItem asChild className="rounded-none py-3 cursor-pointer">
                          <a href={`${PUBLIC_SITE_URL}/listings/${listing.id}`} target="_blank" className="flex items-center">
                            <ExternalLink className="mr-2 h-4 w-4 text-gray-400" /> Voir l'annonce
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-none py-3 cursor-pointer">
                          <Link href={`/dashboard/listings/${listing.id}/edit/step-1`} className="flex items-center">
                            <Edit3 className="mr-2 h-4 w-4 text-gray-400" /> Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="m-0" />
                        <DropdownMenuItem 
                          onClick={() => togglePublish(listing.id, listing.is_published)}
                          className="rounded-none py-3 cursor-pointer"
                        >
                          {listing.is_published ? (
                            <><PowerOff className="mr-2 h-4 w-4 text-orange-400" /> Suspendre</>
                          ) : (
                            <><Power className="mr-2 h-4 w-4 text-green-500" /> Publier</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="m-0" />
                        <DropdownMenuItem 
                          onClick={() => deleteListing(listing.id)}
                          className="rounded-none py-3 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
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