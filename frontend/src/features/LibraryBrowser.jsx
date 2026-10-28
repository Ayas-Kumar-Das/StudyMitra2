import { useEffect, useState } from "react";
import {
  Folder,
  FolderOpen,
  CaretRight,
  ArrowLeft,
  GraduationCap,
  Books,
  Files,
} from "@phosphor-icons/react";
import { groupsAtPath, documentsAtPath } from "../lib/library";
import { typeLabel } from "../lib/studyModes";
import DocumentCard from "./DocumentCard";
const names = ["Semesters", "Subjects", "Categories", "Documents"];
function label(value, level) {
  if (!value)
    return ["Unassigned semester", "Unassigned subject", "Uncategorized"][
      level
    ];
  return level === 0
    ? `Semester ${value}`
    : level === 2
      ? typeLabel(value)
      : value;
}
export default function LibraryBrowser({
  documents,
  search,
  resetKey,
  ...actions
}) {
  const [path, setPath] = useState([]);
  useEffect(() => setPath([]), [resetKey, search]);
  const scoped = documentsAtPath(documents, path),
    groups = groupsAtPath(documents, path),
    showDocuments = path.length === 3 || Boolean(search.trim());
  const Icon = [GraduationCap, Books, Files][path.length] || Folder;
  return (
    <section className="library-browser" aria-label="Browse study materials">
      <div className="library-breadcrumbs">
        <button
          onClick={() => setPath([])}
          aria-current={!path.length ? "page" : undefined}
        >
          <FolderOpen size={17} />
          All semesters
        </button>
        {path.map((value, i) => (
          <span key={i}>
            <CaretRight size={13} />
            <button
              onClick={() => setPath(path.slice(0, i + 1))}
              aria-current={i === path.length - 1 ? "page" : undefined}
            >
              {label(value, i)}
            </button>
          </span>
        ))}
      </div>
      <div className="browser-heading">
        <div>
          {path.length > 0 && (
            <button
              className="icon-button"
              aria-label="Back one library level"
              onClick={() => setPath(path.slice(0, -1))}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2>
            {search.trim() ? "Search results" : names[path.length]}
            <span>{showDocuments ? scoped.length : groups.length}</span>
          </h2>
        </div>
        <p>
          {search.trim()
            ? "Matching materials across your library"
            : path.length === 0
              ? "Choose a semester to get started"
              : path.length === 1
                ? "Choose a subject"
                : path.length === 2
                  ? "Choose a document category"
                  : `${scoped.length} study ${scoped.length === 1 ? "document" : "documents"}`}
        </p>
      </div>
      {showDocuments ? (
        <div className="document-grid">
          {scoped.map((document) => (
            <DocumentCard key={document.id} document={document} {...actions} />
          ))}
        </div>
      ) : (
        <div className="folder-grid">
          {groups.map((group) => (
            <button
              className="folder-card"
              key={group.value}
              onClick={() => setPath([...path, group.value])}
            >
              <span className="folder-icon">
                <Icon size={26} weight="duotone" />
              </span>
              <div>
                <h3>{label(group.value, path.length)}</h3>
                <p>
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "document" : "documents"}
                  {path.length === 0
                    ? ` · ${new Set(group.items.map((d) => d.subject || "")).size} subjects`
                    : path.length === 1
                      ? ` · ${new Set(group.items.map((d) => d.doc_type || "")).size} categories`
                      : ""}
                </p>
              </div>
              <CaretRight size={18} />
            </button>
          ))}
        </div>
      )}
      {scoped.length === 0 && (
        <p className="browser-empty">
          No documents in this folder match your filters.{" "}
          <button className="text-button" onClick={() => setPath([])}>
            Back to semesters
          </button>
        </p>
      )}
    </section>
  );
}
