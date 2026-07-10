type PostResult = { success: true } | { success: false; error: string };

// Module-level singleton : persiste pendant la navigation client-side (même bundle JS).
// Réinitialisé à chaque rechargement de page complet.
let pendingPromise: Promise<PostResult> | null = null;
let cancelledFlag = false;

export function setPendingPost(p: Promise<PostResult>) {
  pendingPromise = p;
  cancelledFlag = false;
}

export function getPendingPost() {
  return pendingPromise;
}

export function cancelPendingPost() {
  cancelledFlag = true;
  pendingPromise = null;
}

export function isCancelled() {
  return cancelledFlag;
}

export function clearPendingPost() {
  pendingPromise = null;
  cancelledFlag = false;
}
