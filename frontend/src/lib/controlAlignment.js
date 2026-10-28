import { useLayoutEffect } from "react";
/** Tie masthead tools to the rendered controls below, including live resize/focus changes. */
export function useControlAlignment(workspace, page) {
  useLayoutEffect(() => {
    const el = workspace.current;
    if (!el) return;
    let live = true;
    const measure = () => {
      if (!live) return;
      const first = el.querySelector(".study-toolbar .mode"),
        last = el.querySelector(
          '.study-toolbar [aria-label="Filter by document type"]',
        );
      if (!first || !last) {
        el.style.setProperty("--focus-anchor-x", "4px");
        el.style.setProperty("--profile-anchor-right", "4px");
        el.style.setProperty("--profile-anchor-width", "96px");
        return;
      }
      const box = el.getBoundingClientRect(),
        a = first.getBoundingClientRect(),
        b = last.getBoundingClientRect();
      el.style.setProperty("--focus-anchor-x", `${a.left - box.left}px`);
      el.style.setProperty(
        "--profile-anchor-right",
        `${box.right - b.right}px`,
      );
      el.style.setProperty("--profile-anchor-width", `${b.width}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.querySelectorAll(
      ".study-toolbar,.study-toolbar .mode-bar,.study-toolbar .dropdown-trigger",
    ).forEach((node) => observer.observe(node));
    document.fonts.ready.then(measure);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [workspace, page]);
}
