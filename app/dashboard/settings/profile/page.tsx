import { ProfileForm } from "@/components/forms/profile-form"

export default function DashboardProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Mon Profil</h1>
      <ProfileForm isOnboarding={false} />
    </div>
  )
}