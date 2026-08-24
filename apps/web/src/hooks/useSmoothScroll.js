import { useEffect } from "react";
import Lenis from "lenis";

export function useSmoothScroll() {
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let lenis;
    try {
      lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
        prevent: (node) =>
          node?.nodeType === 1 &&
          (node.hasAttribute?.("data-lenis-prevent") ||
            Boolean(node.closest?.("[data-lenis-prevent]")) ||
            Boolean(node.closest?.(".judgo-ide-tab-content")) ||
            Boolean(node.closest?.(".judgo-ide-right-pane")) ||
            Boolean(node.closest?.(".judgo-ide-exec-body")) ||
            Boolean(node.closest?.(".sidebar")) ||
            node.classList?.contains("code-editor") ||
            Boolean(node.closest?.(".code-editor")) ||
            Boolean(node.closest?.(".problem-detail-page-container")) ||
            Boolean(node.closest?.(".problem-workspace-pane")) ||
            Boolean(node.closest?.(".console-results-panel")) ||
            Boolean(node.closest?.(".ai-mentor-chat-scroll")) ||
            Boolean(node.closest?.(".ai-coach-page-container")) ||
            Boolean(node.closest?.(".company-sheets-container")) ||
            Boolean(node.closest?.(".company-sheet-page")) ||
            Boolean(node.closest?.(".mock-studio-root")) ||
            Boolean(node.closest?.(".mock-launcher-card")) ||
            Boolean(node.closest?.(".mock-chat-scroll")) ||
            Boolean(node.closest?.(".responsive-table-scroll")) ||
            Boolean(node.closest?.(".table-shell")) ||
            Boolean(node.closest?.(".prof-modal-card")) ||
            Boolean(node.closest?.(".admin-table-container")))
      });

      let animationFrameId;
      function raf(time) {
        lenis.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }

      animationFrameId = requestAnimationFrame(raf);

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        lenis.destroy();
      };
    } catch (e) {
      console.warn("[SmoothScroll] Lenis initialization error:", e);
    }
  }, []);
}
