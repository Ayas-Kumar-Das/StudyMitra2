import {
  FileText,
  Trash,
  ArrowUpRight,
  CheckCircle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import IconButton from "../components/IconButton";
import { typeLabel } from "../lib/studyModes";
import { size } from "../lib/utils";
export default function DocumentCard({
  document: d,
  openDoc,
  setDeleting,
  reindexing,
  reindex,
}) {
  return (
    <article className="document-card" key={d.id}>
      <div className="document-top">
        <span className="doc-icon">
          <FileText size={28} weight="duotone" />
        </span>
        <span className="file-type">{d.file_type || "DOC"}</span>
        <IconButton
          label={"Delete " + (d.title || d.original_filename)}
          onClick={() => setDeleting(d)}
        >
          <Trash size={18} />
        </IconButton>
      </div>
      <button className="document-title" onClick={() => openDoc(d)}>
        {d.title || d.original_filename}
        <ArrowUpRight size={17} />
      </button>
      <p className="doc-filename">{d.original_filename}</p>
      <div className="doc-tags">
        {d.subject && <span>{d.subject}</span>}
        {d.semester && <span>Sem {d.semester}</span>}
        {d.doc_type && <span>{typeLabel(d.doc_type)}</span>}
      </div>
      <div className="document-footer">
        <span className="doc-state">
          {d.status === "local" ? (
            <>
              <span className="status-dot" />
              Local only
            </>
          ) : (
            <>
              <CheckCircle size={15} />
              {d.status || "Indexed"}
            </>
          )}
        </span>
        <span>{size(d.file_size || 0)}</span>
      </div>
      <div className="doc-actions">
        <button className="text-button" onClick={() => openDoc(d)}>
          View document
          <ArrowUpRight size={15} />
        </button>
        <button
          className="text-button"
          disabled={reindexing === d.id}
          onClick={() => reindex(d)}
        >
          <ArrowClockwise
            size={15}
            className={reindexing === d.id ? "spin" : ""}
          />
          {d.status === "local" ? "Index for AI" : "Re-index"}
        </button>
      </div>
    </article>
  );
}
