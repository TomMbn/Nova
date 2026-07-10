"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, X, Loader2 } from "lucide-react";
import {
  getPendingPost,
  cancelPendingPost,
  clearPendingPost,
  isCancelled,
} from "@/lib/pending-post";

type ToastState = "publishing" | "published" | "hidden";

export function PublishToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<ToastState>("hidden");
  const [visible, setVisible] = useState(false);
  // progress : 0→100 pendant "publishing"
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolvedRef = useRef(false);

  function cleanUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("publishing");
    url.searchParams.delete("published");
    router.replace(url.pathname + url.search, { scroll: false });
  }

  function startProgress() {
    setProgress(0);
    resolvedRef.current = false;
    // Avance jusqu'à ~90% rapidement, puis ralentit en attendant la Promise
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (resolvedRef.current) {
          // Promise résolue : fonce vers 100%
          if (prev >= 100) {
            if (progressInterval.current) clearInterval(progressInterval.current);
            return 100;
          }
          return Math.min(prev + 8, 100);
        }
        // Pas encore résolu : s'approche de 90% mais ne dépasse pas
        if (prev >= 90) return prev;
        return prev + 1.5;
      });
    }, 50);
  }

  function stopProgress() {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }

  useEffect(() => {
    const isPublishing = searchParams.get("publishing") === "1";
    const isPublished = searchParams.get("published") === "1";

    if (!isPublishing && !isPublished) return;

    if (isPublished) {
      setState("published");
      setVisible(true);
      const hide = setTimeout(() => setVisible(false), 4000);
      const remove = setTimeout(() => { setState("hidden"); cleanUrl(); }, 4400);
      return () => { clearTimeout(hide); clearTimeout(remove); };
    }

    const promise = getPendingPost();
    if (!promise) { cleanUrl(); return; }

    setState("publishing");
    setVisible(true);
    startProgress();

    promise.then((result) => {
      if (isCancelled()) return;
      clearPendingPost();

      if (!result.success) {
        stopProgress();
        setVisible(false);
        setTimeout(() => setState("hidden"), 300);
        cleanUrl();
        return;
      }

      // Marque résolu → la barre file vers 100%
      resolvedRef.current = true;

      // Attend que la barre atteigne 100 avant de basculer
      const waitForFull = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(waitForFull);
            stopProgress();
            // Transition vers "publiée" + refresh du feed au même moment
            setTimeout(() => {
              router.refresh();
              setState("published");
              const hide = setTimeout(() => setVisible(false), 4000);
              const remove = setTimeout(() => { setState("hidden"); cleanUrl(); }, 4400);
              return () => { clearTimeout(hide); clearTimeout(remove); };
            }, 200);
            return 100;
          }
          return prev;
        });
      }, 50);
    });

    return () => stopProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCancel() {
    cancelPendingPost();
    stopProgress();
    setVisible(false);
    setTimeout(() => setState("hidden"), 300);
    cleanUrl();
  }

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => setState("hidden"), 300);
  }

  if (state === "hidden") return null;

  return (
    <div
      className="mx-3 mt-3 transition-all duration-300 ease-out overflow-hidden"
      style={{ opacity: visible ? 1 : 0, maxHeight: visible ? "100px" : "0px" }}
    >
      {state === "publishing" ? (
        <div className="relative rounded-[14px] border border-border bg-background shadow-sm overflow-hidden">
          {/* Barre de progression */}
          <div
            className="absolute top-0 left-0 h-[3px] bg-primary transition-none rounded-t-[14px]"
            style={{ width: `${progress}%`, transition: progress === 0 ? "none" : "width 50ms linear" }}
          />
          <div className="flex items-center gap-3 px-4 py-3">
            <Loader2 size={20} className="shrink-0 animate-spin text-muted-foreground" strokeWidth={2} />
            <span className="flex-1 text-[14px] font-medium text-foreground">
              Publication en cours...
            </span>
            <button
              onClick={handleCancel}
              className="shrink-0 rounded-full bg-red-100 px-4 py-1.5 text-[13px] font-semibold text-red-500 hover:bg-red-200 transition-colors dark:bg-red-950 dark:text-red-400"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 shadow-sm dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-green-900 dark:text-green-100">Publication publiée !</p>
            <p className="text-[12px] text-green-700 dark:text-green-300 mt-0.5">
              Votre post est maintenant visible par la communauté.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Fermer"
            className="shrink-0 flex items-center justify-center size-6 rounded-full text-green-600 hover:bg-green-100 transition-colors dark:text-green-400"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
