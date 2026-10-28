import LibraryBrowser from "./LibraryBrowser";
import Dropdown from "../components/Dropdown";
import {
  Plus,
  Books,
  FolderOpen,
  ListBullets,
  FileText,
  X,
  UploadSimple,
  CheckCircle,
  MagnifyingGlass,
  ArrowClockwise,
  WifiSlash,
} from "@phosphor-icons/react";
import IconButton from "../components/IconButton";
import { size } from "../lib/utils";
import { types, typeLabel } from "../lib/studyModes";
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
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{focus ? "Document library" : "Your knowledge, collected."}</h1>
          <p>
            {focus
              ? "Manage your study documents and metadata."
              : "Less “where did I save that?” More “I’ve got this.”"}
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setUpload((v) => !v);
            setError("");
          }}
        >
          <Plus size={19} />
          {upload ? "Close upload" : "Add materials"}
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
      {upload && (
        <section className="upload-panel">
          <div className="section-heading">
            <div>
              <h2>
                {focus ? "Upload a document" : "Give your notes a new home."}
              </h2>
              <p>
                {online
                  ? "Upload and index your materials for grounded answers."
                  : "Files are saved in this browser. Connect the backend later to index them for AI."}
              </p>
            </div>
            <IconButton label="Close upload" onClick={() => setUpload(false)}>
              <X size={20} />
            </IconButton>
          </div>
          <form onSubmit={uploadFile}>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.md,.txt"
              hidden
              onChange={(e) => chooseFile(e.target.files[0])}
            />
            <button
              type="button"
              className={"dropzone " + (drag ? "dragging" : "")}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                chooseFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInput.current.click()}
            >
              <UploadSimple size={33} weight="duotone" />
              <strong>
                {file
                  ? file.name
                  : focus
                    ? "Choose a document to upload"
                    : "Drop it like it’s a PDF."}
              </strong>
              <span>
                {file
                  ? `${size(file.size)} · Click to replace`
                  : "Drag a file here or browse files"}
              </span>
              <small>PDF, Markdown, TXT · Up to 50 MB per file</small>
            </button>
            <div className="upload-fields">
              <label>
                Document title
                <input
                  name="title"
                  placeholder="e.g. Operating Systems — Unit 3"
                  maxLength={200}
                />
              </label>
              <label>
                Subject
                <input
                  name="subject"
                  placeholder="e.g. Computer Science"
                  maxLength={100}
                  list="subjects"
                />
                <datalist id="subjects">
                  {subjects.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </datalist>
              </label>
              <label>
                Semester
                <Dropdown name="semester">
                  <option value="">Not specified</option>
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      Semester {i + 1}
                    </option>
                  ))}
                </Dropdown>
              </label>
              <label>
                Document type
                <Dropdown name="doc_type">
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {typeLabel(t)}
                    </option>
                  ))}
                </Dropdown>
              </label>
              <label className="full-field">
                Description <span>(optional)</span>
                <textarea
                  name="description"
                  placeholder="Anything useful to remember about these notes"
                  maxLength={1000}
                />
              </label>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="upload-footer">
              <span>
                <CheckCircle size={17} />
                {online
                  ? "Ready for your study library"
                  : "Saved locally, never presented as AI-indexed"}
              </span>
              <button className="primary" disabled={!file || uploading}>
                {uploading ? (
                  <>
                    <ArrowClockwise className="spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <UploadSimple size={18} />
                    {online ? "Upload & index" : "Save to my library"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}
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
