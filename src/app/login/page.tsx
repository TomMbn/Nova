import Image from "next/image";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10 px-6 py-10">
      <div className="flex flex-col items-center gap-5 pt-6 text-center">
        <div className="flex size-24 items-center justify-center rounded-3xl border border-border bg-muted">
          <Image
            src="/logo-nova/nova-logo-favicon.png"
            alt="Nova"
            width={56}
            height={56}
            priority
            className="object-contain"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">Nova</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            La communauté qui vous accompagne,
            <br />
            avant, pendant et après.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-base font-bold">Connexion à votre compte</p>
        <LoginForm />
      </div>
    </main>
  );
}
