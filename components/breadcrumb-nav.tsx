'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function BreadcrumbNav() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(path => path)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
            <Home className="h-3 w-3" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join('/')}`
          const isLast = index === paths.length - 1
          
          // Formattage du texte (ex: step-1 -> Step 1)
          const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')

          return (
            <div key={path} className="flex items-center gap-2">
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}