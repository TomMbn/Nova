"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nom complet</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Prénom Nom"
            autoComplete="name"
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Requis uniquement si vous n&apos;avez pas encore de compte.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Adresse e-mail</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="votre@email.com"
            autoComplete="email"
            required
            className="h-11 rounded-xl pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Votre mot de passe"
            autoComplete="current-password"
            required
            className="h-11 rounded-xl pl-9 pr-9"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" name="remember" className="size-4 rounded border-input" />
          Se souvenir de moi
        </label>
        <a href="#" className="text-foreground underline-offset-4 hover:underline">
          Mot de passe oublié ?
        </a>
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Pas encore de compte ? Il sera créé automatiquement avec ces
        informations lors de votre première connexion.
      </p>
    </form>
  );
}
