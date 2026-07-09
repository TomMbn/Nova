"use client";

import { useState, useEffect } from "react";
import { registerForSession, cancelRegistration, getMyRegistration } from "@/actions/registrations";

type Props = {
  sessionId: string;
  cpfUrl: string;
};

export function SessionCTA({ sessionId, cpfUrl }: Props) {
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getMyRegistration(sessionId).then((reg) => {
      setRegistrationId(reg?.id ?? null);
      setChecked(true);
    });
  }, [sessionId]);

  async function handleRegister() {
    setIsPending(true);
    const result = await registerForSession(sessionId);
    if (result.success) {
      setRegistrationId(result.data.id);
      window.open(result.data.cpfUrl, "_blank", "noopener,noreferrer");
    }
    setIsPending(false);
  }

  async function handleCancel() {
    if (!registrationId) return;
    setIsPending(true);
    const result = await cancelRegistration(registrationId);
    if (result.success) {
      setRegistrationId(null);
    }
    setIsPending(false);
  }

  if (!checked) {
    return (
      <div className="flex items-center justify-center w-full h-[56px] rounded-[10px] bg-muted" />
    );
  }

  if (registrationId) {
    return (
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="flex items-center justify-center w-full h-[56px] rounded-[10px] bg-muted text-foreground disabled:opacity-60"
      >
        <span className="text-[14px] font-bold">
          {isPending ? "En cours…" : "Annuler mon inscription"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleRegister}
      disabled={isPending}
      className="flex items-center justify-center w-full h-[56px] rounded-[10px] bg-primary text-primary-foreground disabled:opacity-60"
    >
      <span className="text-[14px] font-bold">
        {isPending ? "En cours…" : "S'inscrire"}
      </span>
    </button>
  );
}
