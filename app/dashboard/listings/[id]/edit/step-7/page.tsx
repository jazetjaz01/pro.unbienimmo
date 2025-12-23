'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'

export default function Step7Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [files, setFiles] = React.useState<File[]>([])
  const [previews, setPreviews] = React.useState<string[]>([])
  const [existingImages, setExistingImages] = React.useState<{id: string, url: string, path: string}[]>([])
  const [uploading, setUploading] = React.useState(false)
  const [fetching, setFetching] = React.useState(true)

  const MAX_IMAGES = 12

  // Chargement des images existantes au montage
  React.useEffect(() => {
    async function loadImages() {
      try {
        const { data, error } = await supabase
          .from('listing_images')
          .select('id, image_url')
          .eq('listing_id', params.id)
          .order('sort_order', { ascending: true })

        if (error) throw error

        if (data) {
          const loaded = data.map(img => ({
            id: img.id,
            path: img.image_url,
            url: supabase.storage.from('listings').getPublicUrl(img.image_url).data.publicUrl
          }))
          setExistingImages(loaded)
        }
      } catch (e) {
        console.error("Erreur de récupération des images:", e)
      } finally {
        setFetching(false)
      }
    }
    loadImages()
  }, [params.id, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] },
    maxFiles: MAX_IMAGES,
    disabled: (files.length + existingImages.length) >= MAX_IMAGES,
    onDrop: async (acceptedFiles) => {
      if (files.length + existingImages.length + acceptedFiles.length > MAX_IMAGES) {
        toast.error(`Limite de ${MAX_IMAGES} images atteinte.`)
        return
      }

      const newFiles: File[] = []
      const newPreviews: string[] = []

      for (const file of acceptedFiles) {
        try {
          const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true }
          const compressed = await imageCompression(file, options)
          newFiles.push(compressed)
          newPreviews.push(URL.createObjectURL(compressed))
        } catch (e) {
          toast.error("Erreur d'optimisation de l'image")
        }
      }
      setFiles(prev => [...prev, ...newFiles])
      setPreviews(prev => [...prev, ...newPreviews])
    }
  })

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeStoredImage = async (img: {id: string, path: string}) => {
    try {
      // Suppression physique puis en base
      await supabase.storage.from('listings').remove([img.path])
      await supabase.from('listing_images').delete().eq('id', img.id)
      
      setExistingImages(prev => prev.filter(i => i.id !== img.id))
      toast.success("Image supprimée du serveur")
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleFinalUpload = async () => {
    const totalImages = files.length + existingImages.length
    if (totalImages === 0) return toast.error("Ajoutez au moins une photo")

    // Si aucune nouvelle photo à uploader, on met juste à jour l'étape
    if (files.length === 0) {
      await supabase.from('listings').update({ step_completed: 7 }).eq('id', params.id)
      router.push(`/dashboard/listings/${params.id}/edit/step-8`)
      return
    }

    setUploading(true)
    try {
      const uploadResults = []
      let currentOrder = existingImages.length + 1

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = `${Date.now()}-${i}.${file.name.split('.').pop()}`
        const filePath = `${params.id}/${fileName}`

        const { error: storageError } = await supabase.storage.from('listings').upload(filePath, file)
        if (storageError) throw storageError

        uploadResults.push({
          listing_id: params.id,
          image_url: filePath,
          sort_order: currentOrder++
        })
      }

      const { error: dbError } = await supabase.from('listing_images').insert(uploadResults)
      if (dbError) throw dbError

      // Mise à jour de l'étape (on garde status: 'draft' jusqu'à l'étape 8)
      await supabase.from('listings').update({ step_completed: 7 }).eq('id', params.id)

      toast.success("Photos enregistrées")
      router.push(`/dashboard/listings/${params.id}/edit/step-8`)
    } catch (e) {
      console.error(e)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setUploading(false)
    }
  }

  if (fetching) return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      <p className="text-gray-500 font-medium">Chargement de votre galerie...</p>
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto pt-12 pb-20 px-6 font-sans">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Photos</h1>
          <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mt-1">Étape 7 sur 8</p>
        </div>
        <div className="text-sm font-bold bg-gray-100 px-4 py-2 rounded-full text-gray-600">
          {existingImages.length + files.length} / {MAX_IMAGES} images
        </div>
      </div>

      <p className="text-gray-500 mb-8 leading-relaxed">
        Gérez les images de votre annonce. Vous pouvez télécharger jusqu'à {MAX_IMAGES} images. 
        La première image sera celle affichée en couverture.
      </p>

      {/* DROPZONE */}
      {(existingImages.length + files.length) < MAX_IMAGES ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-[32px] p-12 mb-10 transition-all cursor-pointer text-center
            ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black hover:bg-gray-50/50'}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Cliquez ou glissez vos photos ici</p>
          <p className="text-sm text-gray-400 mt-1">Formats acceptés : JPG, PNG (max 5Mo)</p>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-[32px] p-12 mb-10 bg-amber-50 border-amber-200 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-800 font-medium">Limite de {MAX_IMAGES} photos atteinte</p>
          <p className="text-amber-600 text-sm">Supprimez des images pour en ajouter de nouvelles.</p>
        </div>
      )}

      {/* GRILLE D'IMAGES UNIFORME */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Images existantes (en base) */}
        {existingImages.map((img) => (
          <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
            <img src={img.url} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt="Logement" />
            <button 
              onClick={() => removeStoredImage(img)}
              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Nouvelles images (locales) */}
        {previews.map((src, index) => (
          <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-rose-100 shadow-sm group">
            <img src={src} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt="Aperçu" />
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            <button 
              onClick={() => removeNewImage(index)}
              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-rose-500 text-[9px] text-white rounded-md uppercase font-bold tracking-tighter">
              Nouveau
            </div>
          </div>
        ))}
      </div>

      {/* NAVIGATION FOOTER */}
      <div className="pt-12 mt-16 border-t border-gray-100 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="text-sm font-bold underline text-gray-900 hover:text-gray-600 transition-colors"
        >
          Retour
        </button>
        
        <Button 
          onClick={handleFinalUpload} 
          disabled={uploading || (files.length === 0 && existingImages.length === 0)}
          className="h-14 px-12 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-xl font-bold transition-all active:scale-95 disabled:bg-gray-200 min-w-[200px]"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Enregistrement...</span>
            </div>
          ) : (
            "Continuer"
          )}
        </Button>
      </div>
    </div>
  )
}