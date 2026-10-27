import { useRef, useEffect } from "react";
export default function ConfirmDelete({ doc, cancel, confirm }) {
  const ref = useRef();
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog ref={ref} onCancel={cancel} className="confirm-dialog">
      <h2>Remove this document?</h2>
      <p>
        “{doc.title || doc.original_filename}” will be removed{" "}
        {doc.status === "local"
          ? "from this browser"
          : "along with its indexed data"}
        . This can’t be undone.
      </p>
      <div>
        <button className="secondary" onClick={cancel}>
          Keep document
        </button>
        <button className="danger" onClick={confirm}>
          Remove document
        </button>
      </div>
    </dialog>
  );
}
