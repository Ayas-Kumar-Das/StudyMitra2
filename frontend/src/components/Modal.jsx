import { useRef, useEffect } from "react";
export default function Modal({ children, className, label, close }) {
  const ref = useRef();
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      }}
    >
      {children}
    </dialog>
  );
}
