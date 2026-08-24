import { lazy } from "react";

/**
 * Wraps React.lazy with automatic chunk-load retry and cache-busting reload.
 * Handles new deployments on Vercel/Vite where old chunk hashes return 404.
 */
export function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      const component = await factory();
      // Clear force-refresh flag on successful import
      try {
        sessionStorage.removeItem("judgo-chunk-retry");
      } catch {}
      return component;
    } catch (error) {
      const errMsg = error?.message || String(error || "");
      const isChunkError =
        errMsg.includes("Failed to fetch dynamically imported module") ||
        errMsg.includes("Importing a module script failed") ||
        errMsg.includes("Loading chunk") ||
        errMsg.includes("error loading dynamically imported module");

      if (isChunkError) {
        const retried = sessionStorage.getItem("judgo-chunk-retry");
        if (!retried) {
          sessionStorage.setItem("judgo-chunk-retry", "true");
          console.warn("[Chunk Load Error] New app deployment detected. Reloading page to load latest version...");
          window.location.reload();
          // Return a promise that never resolves while the page is reloading
          return new Promise(() => {});
        }
      }

      // If we already retried or it's a non-chunk error, rethrow
      try {
        sessionStorage.removeItem("judgo-chunk-retry");
      } catch {}
      throw error;
    }
  });
}
