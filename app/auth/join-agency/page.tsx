import { JoinAgencyForm } from "@/components/auth/join-agency-form"

export default function JoinAgencyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <JoinAgencyForm />
      </div>
    </div>
  )
}