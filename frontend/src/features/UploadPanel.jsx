import Dropdown from "../components/Dropdown";
import {
  UploadSimple,
  CheckCircle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { size } from "../lib/utils";
import { types, typeLabel } from "../lib/studyModes";
export default function UploadPanel({
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
}) {
  return (
    <section className="upload-panel" aria-label="Upload study material">
      <p className="upload-intro">
        {online
          ? "Choose a file and add its study details."
          : "Files stay in this browser. Connect the backend later for AI indexing."}
      </p>
      <form onSubmit={uploadFile}>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.md,.txt"
          hidden
          onChange={(e) => chooseFile(e.target.files[0])}
        />
        <div className="upload-body">
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
          <div className="upload-details">
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
            </div>
            <details className="upload-description">
              <summary>
                Add a description <span>(optional)</span>
              </summary>
              <label className="full-field">
                Description <span>(optional)</span>
                <textarea
                  name="description"
                  placeholder="Anything useful to remember about these notes"
                  maxLength={1000}
                />
              </label>
            </details>
          </div>
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
  );
}
