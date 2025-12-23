import { LoginForm } from "@/components/login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Table } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Badge
        variant="secondary"
        className="rounded-full py-1 border-border"
        asChild
      >
        <Link href="#">
          Just released v1.0.0 <ArrowUpRight className="ml-1 size-4" />
        </Link>
      </Badge>

      <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter">
        Bienvenue à votre espace client
      </h1>

      <p className="mt-6 md:text-lg text-foreground/80 max-w-xl">
       Vous pouvez de cette espage gérér l'ensemble de votre diffusion sur unbienimmo.com
      </p>

      <div className="mt-8 flex gap-4">
        <Button size="lg" className="rounded-full">
          Je souhaite m'abonner <ArrowUpRight className="size-5" />
        </Button>
       <Button
  asChild
  variant="outline"
  size="lg"
  className="rounded-full"
>
  <Link
    href="https://www.unbienimmo.com"
    className="flex items-center gap-2"
  >
    <Table className="size-5" />
    <span>Vos annonces</span>
  </Link>
</Button>

      </div>

      {/* LOGIN FORM CENTRÉ */}
      <div className="mt-12 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
