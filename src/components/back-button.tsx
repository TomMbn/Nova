"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex size-8 items-center justify-center rounded-full bg-muted"
      aria-label="Retour"
    >
      <ChevronLeft size={16} strokeWidth={2} />
    </button>
  );
}
