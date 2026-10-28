import { BookOpen, Chats, Books, Plus, Clock } from "@phosphor-icons/react";
export default function Navigation({
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
}) {
  return (
    <aside
      className={"sidebar glass-panel" + (focus ? " is-collapsed" : "")}
      aria-label="Workspace navigation"
    >
      <a
        className="brand"
        href="#chat"
        onClick={() => navigate("chat")}
        aria-label="StudyMitra study space"
      >
        <span className="brand-mark">
          <BookOpen size={24} weight="bold" />
        </span>
        <span className="nav-label">
          StudyMitra<span className="brand-dot">.</span>
        </span>
      </a>
      <button
        className="new-chat"
        aria-label="New study chat"
        title="New study chat"
        onClick={newChat}
        disabled={busy}
      >
        <Plus size={20} />
        <span className="nav-label">New study chat</span>
      </button>
      <nav aria-label="Main navigation">
        <button
          className={"nav-item" + (page === "chat" ? " active" : "")}
          aria-label="Study space"
          aria-current={page === "chat" ? "page" : undefined}
          title="Study space"
          onClick={() => navigate("chat")}
        >
          <Chats size={22} weight={page === "chat" ? "fill" : "regular"} />
          <span className="nav-label">Study space</span>
        </button>
        <button
          className={"nav-item" + (page === "library" ? " active" : "")}
          aria-label="My library"
          aria-current={page === "library" ? "page" : undefined}
          title="My library"
          onClick={() => navigate("library")}
        >
          <Books size={22} weight={page === "library" ? "fill" : "regular"} />
          <span className="nav-label">My library</span>
        </button>
      </nav>
      <div className="history">
        <div className="section-label">Recent chats</div>
        {sessions.length === 0 ? (
          <p className="muted small">Your next good question starts here.</p>
        ) : (
          sessions.slice(0, 8).map((session) => (
            <div className="history-row" key={session.id}>
              <button
                disabled={busy}
                className={active === session.id ? "selected" : ""}
                onClick={() => {
                  setActive(session.id);
                  navigate("chat");
                }}
              >
                <Chats size={16} />
                <span>{session.title}</span>
              </button>
            </div>
          ))
        )}
        {sessions.length > 0 && (
          <button className="text-button" onClick={() => setHistoryOpen(true)}>
            View all chats
          </button>
        )}
      </div>
      <button
        className="history-shortcut nav-item"
        aria-label="Open chat history"
        title="Chat history"
        onClick={() => setHistoryOpen(true)}
      >
        <Clock size={21} />
        <span className="nav-label">Chat history</span>
      </button>
    </aside>
  );
}
