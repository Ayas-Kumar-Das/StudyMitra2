import UploadPanel from "./UploadPanel";
import LibraryBrowser from "./LibraryBrowser";
import {
  Plus,
  Books,
  FolderOpen,
  ListBullets,
  FileText,
  MagnifyingGlass,
  ArrowClockwise,
  WifiSlash,
} from "@phosphor-icons/react";
import { size } from "../lib/utils";
export default function Library({
  focus,
  allDocs,
  subjects,
  docs,
  upload,
  setUpload,
  setError,
  online,
  uploadFile,
  fileInput,
  chooseFile,
  drag,
  setDrag,
  file,
  uploading,
  error,
  search,
  setSearch,
  filters,
  filtered,
  semester,
  subject,
  docType,
  setSubject,
  setSemester,
  setDocType,
  openDoc,
  setDeleting,
  reindexing,
  reindex,
  check,
  checking,
}) {
  if (upload)
    return (
      <>
        <div className="upload-navigation">
          <button
            className="secondary"
            onClick={() => {
              setUpload(false);
              setError("");
            }}
          >
            <Books size={18} />
            Resources
          </button>
        </div>
        <UploadPanel
          {...{
            online,
            uploadFile,
            fileInput,
            chooseFile,
            drag,
            setDrag,
            file,
            uploading,
            error,
            subjects,
            focus,
          }}
        />
      </>
    );
  return (
    <>
      <div className="page-heading">
        <button
          className="primary"
          onClick={() => {
            setUpload((v) => !v);
            setError("");
          }}
        >
          <Plus size={19} />
          Add materials
        </button>
      </div>
      <div className="library-summary">
        <span>
          <Books size={21} />
          <strong>{allDocs.length}</strong> documents
        </span>
        <span>
          <FolderOpen size={21} />
          <strong>{subjects.length}</strong> subjects
        </span>
        <span>
          <ListBullets size={21} />
          <strong>
            {docs.reduce((n, d) => n + (d.total_chunks || 0), 0)}
          </strong>{" "}
          indexed chunks
        </span>
        <span>
          <FileText size={21} />
          {size(allDocs.reduce((n, d) => n + (d.file_size || 0), 0))} total
        </span>
      </div>
      <div className="library-toolbar">
        <div className="search-field">
          <MagnifyingGlass size={19} />
          <input
            aria-label="Search documents"
            placeholder="Find a document…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filters}
      </div>
      {filtered.length ? (
        <LibraryBrowser
          documents={filtered}
          search={search}
          resetKey={`${semester}|${subject}|${docType}`}
          {...{ openDoc, setDeleting, reindexing, reindex }}
        />
      ) : (
        <div className="empty-library">
          <Books size={46} weight="duotone" />
          <h2>
            {allDocs.length
              ? "No matches. New search?"
              : "Your library starts with one file."}
          </h2>
          <p>
            {allDocs.length
              ? "Try a different search or clear your filters."
              : "Lecture notes, a textbook, that last-minute revision sheet. Bring it all."}
          </p>
          <button
            className="primary"
            onClick={() => {
              if (allDocs.length) {
                setSearch("");
                setSubject("");
                setSemester("");
                setDocType("");
              } else setUpload(true);
            }}
          >
            <Plus size={18} />
            {allDocs.length ? "Clear filters" : "Add your first document"}
          </button>
        </div>
      )}
      {!online && (
        <div className="offline-note">
          <WifiSlash size={19} />
          <p>
            <strong>A little heads-up:</strong> local files stay on this device.
            AI answers and indexing become available when the backend connects.
          </p>
          <button className="text-button" onClick={check} disabled={checking}>
            Reconnect
            <ArrowClockwise size={16} />
          </button>
        </div>
      )}
    </>
  );
}
