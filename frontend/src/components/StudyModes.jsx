import { useLayoutEffect, useRef, useState } from "react";
import { modes } from "../lib/studyModes";
export default function StudyModes({ mode, setMode }) {
  const panel = useRef(null);
  const [position, setPosition] = useState(null);
  useLayoutEffect(() => {
    const el = panel.current;
    const measure = () => {
      const active = el.querySelector('[aria-pressed="true"]');
      if (active)
        setPosition({ x: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [mode]);
  return (
    <div ref={panel} className="mode-bar" role="group" aria-label="Answer mode">
      {position && (
        <span
          className="mode-indicator"
          aria-hidden="true"
          style={{
            width: position.width,
            transform: `translateX(${position.x}px)`,
          }}
        />
      )}
      {modes.map(([id, label, Icon]) => (
        <button
          key={id}
          className={mode === id ? "mode active" : "mode"}
          aria-pressed={mode === id}
          onClick={() => setMode(id)}
        >
          <Icon size={19} weight={mode === id ? "fill" : "regular"} />
          {label}
        </button>
      ))}
    </div>
  );
}
