import { flushSync } from "react-dom";
/** One bounded, whole-workspace transition. Reduced motion changes state instantly. */
export function transitionWorkspace(update) {
  if (
    !document.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return;
  }
  const transition = document.startViewTransition(() => flushSync(update));
  transition.finished.catch(() => {});
}
