import {
  Sparkle,
  FileText,
  ListBullets,
  CheckCircle,
} from "@phosphor-icons/react";
import { modes } from "../lib/studyModes";
export default function Welcome({
  focus,
  allDocs,
  navigate,
  setUpload,
  setMode,
  setQuery,
  composer,
}) {
  return (
    <div className="welcome">
      <div className="welcome-top">
        <span className="welcome-symbol">
          <Sparkle size={32} weight="duotone" />
        </span>
        <h2>
          {focus
            ? "What would you like to study?"
            : "Okay, let’s make it click."}
        </h2>
        <p>
          {focus
            ? "Select a study tool or ask a question."
            : allDocs.length
              ? "Pick a study tool or ask your own question."
              : "Bring your materials. We’ll bring the clarity."}
        </p>
      </div>
      <div className="bento">
        <button
          className="start-card"
          onClick={() => {
            navigate("library");
            setUpload(true);
          }}
        >
          <h3>
            {focus ? (
              "Add your study materials"
            ) : (
              <>
                Drop the notes.
                <br /> Unlock the knowledge.
              </>
            )}
          </h3>
          <p>
            PDFs, lecture notes, textbooks.
            <br /> Your whole syllabus, one space.
          </p>
          <span className="card-link">Add materials</span>
          <div className="file-stack" aria-hidden="true">
            <div className="paper paper-back">
              <ListBullets size={22} />
              <span>LECTURE NOTES</span>
              <i />
              <i />
            </div>
            <div className="paper paper-front">
              <FileText size={25} />
              <span>THE GOOD STUFF</span>
              <i />
              <i />
              <i />
            </div>
          </div>
        </button>
        <div className="tool-cards">
          {[modes[0], modes[1], modes[5], modes[2]].map(
            ([id, label, Icon, title, description, prompt], i) => (
              <button
                key={id}
                className={"tool-card tone-" + i}
                onClick={() => {
                  setMode(id);
                  setQuery(prompt);
                  composer.current?.focus();
                }}
              >
                <span className="tool-icon">
                  <Icon size={23} weight="duotone" />
                </span>
                <h3>{focus ? label : title}</h3>
                <p>
                  {focus
                    ? {
                        explain: "Understand concepts step by step.",
                        exam_answer: "Generate structured exam answers.",
                        quiz: "Test your understanding.",
                        summarize: "Extract the key points.",
                      }[id]
                    : description}
                </p>
              </button>
            ),
          )}
        </div>
      </div>
      <div className="grounding-note">
        <CheckCircle size={17} />
        <span>Built around your documents. Backed by sources.</span>
        <span className="note-separator">/</span>
        <span>No random internet rabbit holes.</span>
      </div>
    </div>
  );
}
