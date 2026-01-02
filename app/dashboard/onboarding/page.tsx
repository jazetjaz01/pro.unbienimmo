import { CreateProfessionalForm } from "@/components/forms/create-professional-form"

export default function OnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
      <div className="w-full max-w-2xl px-4">
        <h1 className="text-3xl font-bold text-center mb-2">Bienvenue !</h1>
        <p className="text-muted-foreground text-center mb-8">
          Pour commencer à publier des annonces, veuillez configurer votre entité professionnelle.
        </p>
        <CreateProfessionalForm />
      </div>
    </div>
  )
}