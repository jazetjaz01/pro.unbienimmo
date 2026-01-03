import { ProfileForm } from "@/components/forms/profile-form"

export default function OnboardingProfilePage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-3xl font-light italic mb-12">Complétez votre profil de gérant</h1>
      <ProfileForm isOnboarding={true} />
    </div>
  )
}