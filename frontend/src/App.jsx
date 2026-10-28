import ThemeProfile from "./components/ThemeProfile";
import { useControlAlignment } from "./lib/controlAlignment";
import Brand from "./components/Brand";
import StudyModes from "./components/StudyModes";
import Navigation from "./components/Navigation";
import { transitionWorkspace } from "./lib/transitions";
import Dropdown from "./components/Dropdown";
import { useEffect, useState, useRef } from "react";
import {
  Chats,
  Books,
  Plus,
  ArrowUpRight,
  Sun,
  Moon,
  Crosshair,
  Sparkle,
  UploadSimple,
  X,
  Check,
  Trash,
  ArrowClockwise,
  Copy,
  DownloadSimple,
  CheckCircle,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { get, set, del } from "idb-keyval";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { request, stream } from "./lib/api";
import { readSaved, save, size, validateFile } from "./lib/utils";
import { modes, types, typeLabel } from "./lib/studyModes";
import IconButton from "./components/IconButton";
import Modal from "./components/Modal";
import ConfirmDelete from "./components/ConfirmDelete";
import Welcome from "./features/Welcome";
import Composer from "./features/Composer";
import Library from "./features/Library";
export default function App() {
  const [page, setPage] = useState(
      location.hash === "#library" ? "library" : "chat",
    ),
    [theme, setTheme] = useState(readSaved("sm-theme", "light")),
    [focus, setFocus] = useState(readSaved("sm-focus", false)),
    [online, setOnline] = useState(false),
    [checking, setChecking] = useState(true),
    [docs, setDocs] = useState([]),
    [localDocs, setLocalDocs] = useState(readSaved("sm-local-docs", [])),
    [sessions, setSessions] = useState(readSaved("sm-sessions", [])),
    [active, setActive] = useState(null),
    [mode, setMode] = useState("explain"),
    [query, setQuery] = useState(""),
    [subject, setSubject] = useState(""),
    [semester, setSemester] = useState(""),
    [docType, setDocType] = useState(""),
    [search, setSearch] = useState(""),
    [upload, setUpload] = useState(false),
    [file, setFile] = useState(null),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [busy, setBusy] = useState(false),
    [sources, setSources] = useState(null),
    [preview, setPreview] = useState(null),
    [deleting, setDeleting] = useState(null),
    [drag, setDrag] = useState(false),
    [reindexing, setReindexing] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const workspaceRef = useRef(null);
  useControlAlignment(workspaceRef, page);
  const fileInput = useRef(),
    controller = useRef(),
    bottom = useRef(),
    conversation = useRef(),
    stickToBottom = useRef(true),
    composer = useRef();
  const allDocs = [...docs, ...localDocs],
    subjects = [...new Set(allDocs.map((d) => d.subject).filter(Boolean))],
    availableTypes = [
      ...new Set([...types, ...allDocs.map((d) => d.doc_type).filter(Boolean)]),
    ],
    current = sessions.find((s) => s.id === active),
    messages = current?.messages || [],
    selectedMode = modes.find((m) => m[0] === mode);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.focus = focus;
    save("sm-theme", theme);
    save("sm-focus", focus);
  }, [theme, focus]);
  useEffect(() => {
    save("sm-local-docs", localDocs);
  }, [localDocs]);
  useEffect(() => {
    if (!save("sm-sessions", sessions))
      setToast(
        "Browser history is full. Clear an older chat to save new ones.",
      );
  }, [sessions]);
  useEffect(() => {
    check();
    const onHash = () =>
      setPage(location.hash === "#library" ? "library" : "chat");
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    if (stickToBottom.current && conversation.current)
      conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [messages.length, messages.at(-1)?.content, busy, active]);
  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);
  async function check() {
    setChecking(true);
    try {
      await request("/health");
      const data = await request("/documents");
      setDocs(data.documents || []);
      setOnline(true);
    } catch {
      setOnline(false);
      setDocs([]);
    } finally {
      setChecking(false);
    }
  }
  function navigate(p) {
    setPage(p);
    location.hash = p;
    setUpload(false);
    setError("");
  }
  function newChat() {
    if (busy) return;
    setActive(null);
    setSources(null);
    setQuery("");
    navigate("chat");
    composer.current?.focus();
  }
  function chooseFile(f) {
    if (!f) return;
    const problem = validateFile(f);
    setError(problem);
    if (!problem) setFile(f);
  }
  async function uploadFile(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const metadata = Object.fromEntries(form);
    try {
      if (online) {
        form.set("file", file);
        await request("/documents/upload", {
          method: "POST",
          body: form,
          signal: AbortSignal.timeout(300000),
        });
        await check();
      } else {
        const id = crypto.randomUUID();
        await set(id, file);
        const document = {
          ...metadata,
          id,
          title: metadata.title || file.name.replace(/\.[^.]+$/, ""),
          original_filename: file.name,
          file_type: file.name.split(".").pop(),
          file_size: file.size,
          status: "local",
          created_at: new Date().toISOString(),
        };
        setLocalDocs((prev) => [document, ...prev]);
      }
      setToast(
        online
          ? "Document uploaded. You’re ready to study."
          : "Saved in this browser. AI indexing needs the backend.",
      );
      setFile(null);
      setUpload(false);
    } catch {
      setError(
        "Could not save this file. Check available browser storage or your connection and try again.",
      );
    } finally {
      setUploading(false);
    }
  }
  async function removeDoc(d) {
    try {
      if (d.status === "local") {
        await del(d.id);
        setLocalDocs((v) => v.filter((x) => x.id !== d.id));
      } else {
        await request("/documents/" + d.id, { method: "DELETE" });
        await check();
      }
      setDeleting(null);
      setToast("Document removed.");
    } catch {
      setToast("Could not remove the document. Try again.");
    }
  }
  async function reindex(d) {
    setReindexing(d.id);
    try {
      if (d.status === "local") {
        if (!online) {
          setToast("Connect the backend to index this document for AI.");
          return;
        }
        const blob = await get(d.id);
        if (!blob) throw Error();
        const form = new FormData();
        form.append("file", blob, d.original_filename);
        for (const key of [
          "title",
          "subject",
          "semester",
          "doc_type",
          "description",
        ])
          if (d[key]) form.append(key, d[key]);
        await request("/documents/upload", {
          method: "POST",
          body: form,
          signal: AbortSignal.timeout(300000),
        });
        await del(d.id);
        setLocalDocs((v) => v.filter((x) => x.id !== d.id));
      } else
        await request("/documents/" + d.id + "/reindex", {
          method: "POST",
          signal: AbortSignal.timeout(300000),
        });
      await check();
      setToast("Document indexed. Ready for questions.");
    } catch {
      setToast("Indexing failed. Your document is still available; try again.");
    } finally {
      setReindexing(null);
    }
  }
  async function openDoc(d) {
    if (d.status !== "local") {
      setPreview({ doc: d });
      return;
    }
    try {
      const blob = await get(d.id);
      if (!blob) throw Error();
      setPreview({
        doc: d,
        url: URL.createObjectURL(blob),
        text: d.file_type === "pdf" ? null : await blob.text(),
      });
    } catch {
      setToast("This file is no longer in browser storage. Upload it again.");
    }
  }
  async function send(e) {
    e?.preventDefault();
    if (!query.trim() || busy) return;
    if (!online) {
      setToast(
        "AI answers are offline. You can organize documents now; reconnect the backend to ask questions.",
      );
      return;
    }
    let id = active || crypto.randomUUID();
    stickToBottom.current = true;
    const prompt = query.trim();
    const answer = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      sources: [],
      mode,
    };
    const user = { id: crypto.randomUUID(), role: "user", content: prompt };
    if (!active) {
      setActive(id);
      setSessions((v) => [
        { id, title: prompt, created: Date.now(), messages: [user, answer] },
        ...v,
      ]);
    } else
      setSessions((v) =>
        v.map((s) =>
          s.id === id ? { ...s, messages: [...s.messages, user, answer] } : s,
        ),
      );
    setQuery("");
    setBusy(true);
    controller.current = new AbortController();
    let completed = false;
    const patch = (fn) =>
      setSessions((v) =>
        v.map((s) =>
          s.id === id
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === answer.id ? fn(m) : m,
                ),
              }
            : s,
        ),
      );
    try {
      const filters = {};
      if (subject) filters.subject = subject;
      if (semester) filters.semester = semester;
      if (docType) filters.doc_type = docType;
      await stream(
        { query: prompt, mode, filters, top_k: 5 },
        (event) => {
          if (event.type === "token")
            patch((m) => ({ ...m, content: m.content + event.content }));
          if (event.type === "sources")
            patch((m) => ({ ...m, sources: event.sources || [] }));
          if (event.type === "error")
            throw new Error("The answer was interrupted. Please try again.");
          if (event.type === "done") completed = true;
        },
        controller.current.signal,
      );
      if (!completed)
        patch((m) => ({
          ...m,
          error: "Connection ended before the answer was complete. Try again.",
        }));
    } catch (err) {
      patch((m) => ({
        ...m,
        error:
          err.name === "AbortError"
            ? "Answer stopped."
            : err.message || "Could not get an answer. Try again.",
      }));
    } finally {
      setBusy(false);
    }
  }
  const filtered = allDocs.filter(
    (d) =>
      (!subject || d.subject === subject) &&
      (!semester || String(d.semester) === semester) &&
      (!docType || d.doc_type === docType) &&
      `${d.title} ${d.original_filename} ${d.subject}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const filters = (
    <div className="filters">
      <SlidersHorizontal size={17} />
      <Dropdown
        aria-label="Filter by subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      >
        <option value="">All subjects</option>
        {subjects.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </Dropdown>
      <Dropdown
        aria-label="Filter by semester"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
      >
        <option value="">All semesters</option>
        {Array.from({ length: 8 }, (_, i) => (
          <option key={i} value={i + 1}>
            Semester {i + 1}
          </option>
        ))}
      </Dropdown>
      <Dropdown
        aria-label="Filter by document type"
        value={docType}
        onChange={(e) => setDocType(e.target.value)}
      >
        <option value="">All types</option>
        {availableTypes.map((t) => (
          <option key={t} value={t}>
            {typeLabel(t)}
          </option>
        ))}
      </Dropdown>
      {(subject || semester || docType) && (
        <button
          className="text-button"
          onClick={() => {
            setSubject("");
            setSemester("");
            setDocType("");
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
  return (
    <div className={"app-shell" + (focus ? " focus-layout" : "")}>
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <Brand navigate={navigate} />
      <Navigation
        {...{
          page,
          navigate,
          newChat,
          busy,
          focus,
          sessions,
          active,
          setActive,
          setSessions,
          setHistoryOpen,
        }}
      />
      <div className="workspace" ref={workspaceRef}>
        <header className="masthead">
          <button
            className={"focus-toggle glass-panel " + (focus ? "enabled" : "")}
            onClick={() => transitionWorkspace(() => setFocus((v) => !v))}
            aria-pressed={focus}
          >
            <Crosshair size={18} />
            <span>Focus mode</span>
            <span className="switch">
              <i />
            </span>
          </button>
          <div className="masthead-title">
            <h1>
              {page === "library"
                ? upload
                  ? "Add materials"
                  : focus
                    ? "Document library"
                    : "Your knowledge, collected."
                : focus
                  ? "Study workspace"
                  : "Big questions. Clear answers."}
            </h1>
            <p>
              {page === "library"
                ? upload
                  ? "Bring a file. Keep your resources organized."
                  : "Semester by semester. Everything in its place."
                : focus
                  ? "Ask questions grounded in your documents."
                  : "Your notes, untangled. Your next “ohhh, got it”, right here."}
            </p>
          </div>
          <ThemeProfile
            theme={theme}
            toggleTheme={() =>
              transitionWorkspace(() =>
                setTheme((v) => (v === "light" ? "dark" : "light")),
              )
            }
          />
        </header>
        <main
          id="main"
          className={
            "main " +
            (page === "chat"
              ? "chat-main"
              : "library-main" + (upload ? " is-uploading" : ""))
          }
        >
          {page === "chat" ? (
            <>
              <div className="study-toolbar">
                <StudyModes {...{ mode, setMode }} />
                {filters}
              </div>
              {messages.length === 0 ? (
                <Welcome
                  {...{
                    focus,
                    allDocs,
                    navigate,
                    setUpload,
                    setMode,
                    setQuery,
                    composer,
                  }}
                />
              ) : (
                <section
                  ref={conversation}
                  className="conversation"
                  aria-label="Conversation"
                  tabIndex={0}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    stickToBottom.current =
                      el.scrollHeight - el.scrollTop - el.clientHeight < 100;
                  }}
                >
                  {messages.map((m) => (
                    <article key={m.id} className={"message " + m.role}>
                      <div className="message-label">
                        {m.role === "user" ? (
                          <span className="avatar small-avatar">S</span>
                        ) : (
                          <span className="answer-mark">
                            <Sparkle size={18} />
                          </span>
                        )}
                        <strong>
                          {m.role === "user" ? "You" : "StudyMitra"}
                        </strong>
                        {m.mode && (
                          <span className="answer-mode">
                            {modes.find((x) => x[0] === m.mode)?.[1]}
                          </span>
                        )}
                      </div>
                      <div className="prose">
                        {m.role === "user" ? (
                          <p>{m.content}</p>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ children, href }) =>
                                href?.startsWith("#source-") ? (
                                  <button
                                    className="citation"
                                    onClick={() => setSources(m.sources || [])}
                                  >
                                    {children}
                                  </button>
                                ) : (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {children}
                                  </a>
                                ),
                              p: ({ children }) => <p>{children}</p>,
                            }}
                          >
                            {m.content.replace(
                              /\[Source (\d+)\]/g,
                              "[Source $1](#source-$1)",
                            )}
                          </ReactMarkdown>
                        )}
                        {!m.content && busy && (
                          <p className="thinking">
                            Reading between your lines<span>…</span>
                          </p>
                        )}
                        {m.error && (
                          <p className="answer-error" role="alert">
                            {m.error}
                          </p>
                        )}
                      </div>
                      {m.role === "assistant" && m.content && (
                        <div className="answer-actions">
                          <button
                            className="text-button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(m.content);
                                setToast("Answer copied.");
                              } catch {
                                setToast(
                                  "Copy unavailable in this browser. Select the answer text to copy it.",
                                );
                              }
                            }}
                          >
                            <Copy size={15} />
                            Copy
                          </button>
                          {m.sources?.length > 0 && (
                            <button
                              className="text-button"
                              onClick={() => setSources(m.sources)}
                            >
                              <Books size={15} />
                              {m.sources.length} sources
                              <ArrowUpRight size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                  <div ref={bottom} />
                </section>
              )}
              <Composer
                {...{
                  send,
                  composer,
                  focus,
                  query,
                  setQuery,
                  navigate,
                  setUpload,
                  selectedMode,
                  allDocs,
                  busy,
                  controller,
                  online,
                }}
              />
            </>
          ) : (
            <Library
              {...{
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
                subject,
                semester,
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
              }}
            />
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle size={20} />
          <span>{toast}</span>
          <IconButton label="Dismiss notification" onClick={() => setToast("")}>
            <X size={17} />
          </IconButton>
        </div>
      )}
      {sources && (
        <Modal
          className="sources-drawer"
          label="Answer sources"
          close={() => setSources(null)}
        >
          <div className="section-heading">
            <h2>Go to the source</h2>
            <IconButton label="Close sources" onClick={() => setSources(null)}>
              <X size={21} />
            </IconButton>
          </div>
          <p className="muted">The documents behind this answer.</p>
          {sources.map((s, i) => (
            <details key={i} open={sources.length === 1}>
              <summary>
                <span>Source {i + 1}</span>
                <strong>{s.document_name || "Study document"}</strong>
                <small>
                  {[
                    s.subject,
                    s.page_number && `Page ${s.page_number}`,
                    s.chapter,
                    s.section,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </summary>
              <p>{s.chunk_text || "No excerpt provided."}</p>
              {s.relevance_score != null && (
                <small>Relevance {Number(s.relevance_score).toFixed(3)}</small>
              )}
            </details>
          ))}
        </Modal>
      )}
      {preview && (
        <Modal
          className="preview-panel"
          label="Document preview"
          close={() => setPreview(null)}
        >
          <div className="section-heading">
            <h2>{preview.doc.title || preview.doc.original_filename}</h2>
            <div className="preview-controls">
              {preview.url && (
                <a
                  className="secondary"
                  href={preview.url}
                  download={preview.doc.original_filename}
                >
                  <DownloadSimple size={18} />
                  Download
                </a>
              )}
              <IconButton
                label="Close preview"
                onClick={() => setPreview(null)}
              >
                <X size={21} />
              </IconButton>
            </div>
          </div>
          {preview.url ? (
            preview.text != null ? (
              <pre className="text-preview">{preview.text}</pre>
            ) : (
              <iframe
                title={preview.doc.title || "PDF preview"}
                src={preview.url}
              />
            )
          ) : (
            <div className="prose">
              <p>{preview.doc.description || "No description provided."}</p>
              <p>
                {preview.doc.total_pages || 0} pages ·{" "}
                {preview.doc.total_chunks || 0} indexed chunks
              </p>
              <p className="muted">
                The existing backend provides document metadata and cited
                excerpts. Full file downloads require a download endpoint.
              </p>
            </div>
          )}
        </Modal>
      )}
      {historyOpen && (
        <Modal
          className="history-dialog"
          label="Chat history"
          close={() => setHistoryOpen(false)}
        >
          <div className="section-heading">
            <h2>Chat history</h2>
            <IconButton
              label="Close history"
              onClick={() => setHistoryOpen(false)}
            >
              <X size={20} />
            </IconButton>
          </div>
          <button
            className="primary"
            disabled={busy}
            onClick={() => {
              newChat();
              setHistoryOpen(false);
            }}
          >
            <Plus size={18} />
            New study chat
          </button>
          {!sessions.length && <p className="muted">No saved chats yet.</p>}
          {sessions.map((s) => (
            <div className="history-row" key={s.id}>
              <button
                disabled={busy}
                onClick={() => {
                  setActive(s.id);
                  navigate("chat");
                  setHistoryOpen(false);
                }}
              >
                <Chats size={17} />
                <span>{s.title}</span>
              </button>
              <IconButton
                label="Delete chat"
                disabled={busy}
                onClick={() => {
                  setSessions((v) => v.filter((x) => x.id !== s.id));
                  if (active === s.id) setActive(null);
                }}
              >
                <Trash size={17} />
              </IconButton>
            </div>
          ))}
        </Modal>
      )}
      {deleting && (
        <ConfirmDelete
          doc={deleting}
          cancel={() => setDeleting(null)}
          confirm={() => removeDoc(deleting)}
        />
      )}
    </div>
  );
}
