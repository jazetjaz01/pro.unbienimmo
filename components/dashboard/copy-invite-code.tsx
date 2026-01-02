"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code copié !")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">
        Code d'invitation agents
      </span>
      <Button 
        variant="outline" 
        onClick={handleCopy}
        className="font-mono text-sm tracking-wider border-dashed border-gray-300 hover:border-gray-900 transition-all"
      >
        {code}
        {copied ? <Check className="ml-2 h-3 w-3 text-emerald-500" /> : <Copy className="ml-2 h-3 w-3 text-gray-400" />}
      </Button>
    </div>
  )
}