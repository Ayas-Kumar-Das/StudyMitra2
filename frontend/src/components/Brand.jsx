import { BookOpen } from "@phosphor-icons/react";
export default function Brand({ navigate }) {
  return (
    <a
      className="site-brand brand"
      href="#chat"
      onClick={() => navigate("chat")}
      aria-label="StudyMitra study space"
    >
      <span className="brand-mark">
        <BookOpen size={24} weight="bold" />
      </span>
      <span className="brand-name">
        StudyMitra<span className="brand-dot">.</span>
      </span>
    </a>
  );
}
