// lib/validations/professional.ts
import * as z from "zod"

export const professionalFormSchema = z.object({
  name: z.string().min(2, "Le nom commercial est requis"),
  legal_name: z.string().min(2, "La raison sociale est requise"),
  type: z.enum(['agence', 'syndic', 'notaire', 'promoteur', 'amenageur', 'lotisseur']),
  siret: z.string().length(14, "Le SIRET doit contenir 14 chiffres"),
  email: z.string().email("Email professionnel invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  street_address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  zip_code: z.string().min(5, "Code postal requis"),
})