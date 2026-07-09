import { GraduationCap } from "lucide-react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
          <GraduationCap className="size-9 text-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Nova</h1>
          <p className="text-sm text-muted-foreground">
            La communauté qui vous accompagne, avant, pendant et après.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Connexion à votre compte</h2>
        <LoginForm />
      </div>
    </main>
  );
}
