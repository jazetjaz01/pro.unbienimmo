'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Identifiants invalides'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Style partagé pour les inputs "Minimal Flat"
  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 text-base transition-colors bg-transparent shadow-none"

  return (
    <div className={cn('w-full', className)} {...props}>
      <form onSubmit={handleLogin} className="space-y-10">
        <div className="space-y-8">
          
          {/* EMAIL */}
          <div className="grid gap-2 text-left">
            <Label 
              htmlFor="email" 
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400"
            >
              Adresse e-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              required
              className={minimalInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="grid gap-2 text-left">
            <div className="flex items-center justify-between">
              <Label 
                htmlFor="password" 
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400"
              >
                Mot de passe
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-[10px] uppercase tracking-widest text-gray-300 hover:text-gray-900 transition-colors"
              >
                Oublié ?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              className={minimalInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}

        <div className="pt-4 flex flex-col gap-6">
          <Button 
            type="submit" 
            className="w-full h-14 rounded-none bg-gray-900 hover:bg-black text-white uppercase text-[10px] tracking-[0.3em] font-bold transition-all" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Accéder à l'espace <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="text-center">
            <Link 
              href="/auth/sign-up" 
              className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-gray-900 transition-colors border-b border-transparent hover:border-gray-900 pb-1"
            >
              Créer un compte partenaire
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}