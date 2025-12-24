'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, AlertCircle, ArrowRight, Image as ImageIcon } from 'lucide-react'

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
        console.error("Erreur images:", e)
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
          toast.error("Erreur d'optimisation")
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
      await supabase.storage.from('listings').remove([img.path])
      await supabase.from('listing_images').delete().eq('id', img.id)
      setExistingImages(prev => prev.filter(i => i.id !== img.id))
      toast.success("Image supprimée")
    } catch (e) {
      toast.error("Erreur de suppression")
    }
  }

  const handleFinalUpload = async () => {
    const totalImages = files.length + existingImages.length
    if (totalImages === 0) return toast.error("Ajoutez au moins une photo")

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

      await supabase.from('listings').update({ step_completed: 7 }).eq('id', params.id)
      router.push(`/dashboard/listings/${params.id}/edit/step-8`)
    } catch (e) {
      toast.error("Erreur d'enregistrement")
    } finally {
      setUploading(false)
    }
  }

  if (fetching) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-6xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-20 border-b border-gray-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Étape 07 / 08</p>
          <h1 className="text-4xl font-light tracking-tight text-gray-900 italic">Galerie Visuelle</h1>
        </div>
        <div className="flex items-center gap-4 text-[10px] tracking-[0.2em] font-bold uppercase text-gray-400 border border-gray-100 px-4 py-2">
          <ImageIcon className="h-3 w-3" />
          <span>{existingImages.length + files.length} / {MAX_IMAGES}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* LEFT COLUMN: GUIDELINES & DROPZONE */}
        <div className="lg:col-span-1 space-y-12">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Directives</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              "La première image sera votre couverture. Privilégiez des photos lumineuses, horizontales et épurées pour maximiser l'intérêt des acquéreurs."
            </p>
          </section>

          {(existingImages.length + files.length) < MAX_IMAGES ? (
            <div 
              {...getRootProps()} 
              className={`group aspect-square flex flex-col items-center justify-center border transition-all duration-500 cursor-pointer p-8
                ${isDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-900'}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-6 w-6 text-gray-300 group-hover:text-gray-900 mb-4 transition-colors" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-gray-900 transition-colors text-center leading-loose">
                Glisser-déposer<br/>ou cliquer pour ajouter
              </p>
              <p className="text-[9px] text-gray-300 mt-4 font-mono">JPG, PNG (MAX 5MB)</p>
            </div>
          ) : (
            <div className="aspect-square flex flex-col items-center justify-center border border-gray-100 bg-gray-50 p-8 text-center">
              <AlertCircle className="h-5 w-5 text-gray-400 mb-3" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Limite atteinte</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: GALLERY GRID */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* EXISTING IMAGES */}
            {existingImages.map((img) => (
              <div key={img.id} className="relative aspect-[4/5] overflow-hidden bg-gray-50 group border border-gray-50">
                <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Logement" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <button 
                  onClick={() => removeStoredImage(img)}
                  className="absolute top-4 right-4 p-2 bg-white text-gray-900 hover:bg-black hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 duration-300"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-tighter font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  Publié
                </div>
              </div>
            ))}

            {/* NEW PREVIEWS */}
            {previews.map((src, index) => (
              <div key={index} className="relative aspect-[4/5] overflow-hidden bg-gray-50 group border border-gray-100">
                <img src={src} className="w-full h-full object-cover saturate-[0.8]" alt="Aperçu" />
                <div className="absolute inset-0 bg-white/40" />
                <button 
                  onClick={() => removeNewImage(index)}
                  className="absolute top-4 right-4 p-2 bg-black text-white hover:bg-rose-600 transition-all shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                   <div className="bg-gray-900 text-white text-[8px] uppercase tracking-widest font-bold px-2 py-1 inline-block">
                    En attente
                  </div>
                </div>
              </div>
            ))}

            {/* PLACEHOLDER SLOTS IF GALLERY IS EMPTY */}
            {existingImages.length === 0 && files.length === 0 && (
              Array.from({length: 3}).map((_, i) => (
                <div key={i} className="aspect-[4/5] border border-gray-50 bg-gray-50/50 flex items-center justify-center">
                   <ImageIcon className="h-4 w-4 text-gray-200" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-20 mt-20 border-t border-gray-900 border-opacity-10 flex items-center justify-between pb-20">
        <button 
          onClick={() => router.back()} 
          className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors"
        >
          Retour
        </button>
        
        <Button 
          onClick={handleFinalUpload} 
          disabled={uploading || (files.length === 0 && existingImages.length === 0)}
          className="rounded-none bg-gray-900 hover:bg-black text-white h-14 px-12 transition-all uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-20"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Continuer <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}