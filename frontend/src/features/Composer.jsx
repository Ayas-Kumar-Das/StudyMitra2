import { Plus, Stop, ArrowUp } from "@phosphor-icons/react";
import IconButton from "../components/IconButton";
export default function Composer({
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
}) {
  return (
    <div className="composer-area">
      <form className="composer" onSubmit={send}>
        <textarea
          ref={composer}
          aria-label="Ask a study question"
          placeholder={
            focus
              ? "Ask about your documents…"
              : "What’s on your mind? Let’s figure it out…"
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="composer-bottom">
          <button
            type="button"
            className="attach-button"
            onClick={() => {
              navigate("library");
              setUpload(true);
            }}
            aria-label="Attach study materials"
          >
            <Plus size={20} />
          </button>
          <span>
            <span className="composer-mode">{selectedMode[1]}</span>
            <span className="composer-hint">
              {allDocs.length
                ? `${allDocs.length} documents in your library`
                : "Add materials to get started"}
            </span>
          </span>
          {busy ? (
            <IconButton
              label="Stop answer"
              type="button"
              onClick={() => controller.current?.abort()}
            >
              <Stop weight="fill" size={20} />
            </IconButton>
          ) : (
            <button
              className="send-button"
              disabled={!query.trim()}
              aria-label="Send question"
            >
              <ArrowUp size={22} weight="bold" />
            </button>
          )}
        </div>
      </form>
      <div className="composer-foot">
        <span>
          <span className={online ? "status-dot online" : "status-dot"} />
          {online
            ? "Answers grounded in your sources"
            : "AI offline · Explore your space and add materials"}
        </span>
        <span>
          Enter to send <span className="keycap">↵</span>
        </span>
      </div>
    </div>
  );
}
