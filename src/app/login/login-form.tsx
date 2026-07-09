"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginOrSignup, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginOrSignup,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
        >
          Adresse e-mail <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="votre@email.com"
            autoComplete="email"
            required
            className="h-11 rounded-xl border-none bg-muted pl-10 text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
        >
          Mot de passe <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Votre mot de passe"
            autoComplete="current-password"
            required
            className="h-11 rounded-xl border-none bg-muted pr-10 pl-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" name="remember" className="size-4 rounded border-input" />
          Se souvenir de moi
        </label>
        <a href="#" className="font-semibold text-primary">
          Mot de passe oublié ?
        </a>
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-11 rounded-xl text-sm font-bold"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Pas encore de compte ? Vous serez guidé pour en créer un avec cette
        adresse e-mail et ce mot de passe.
      </p>
    </form>
  );
}
