const approvedLogo = "/branding/studymitra-approved.png";
/** Viewports preserve the approved pixels while allowing a readable dark wordmark. */
export default function Brand({ navigate }) {
  return (
    <a
      className="site-brand brand"
      href="#chat"
      onClick={() => navigate("chat")}
      aria-label="StudyMitra study space"
    >
      <span className="brand-mark">
        <svg viewBox="90 110 580 490" aria-hidden="true" focusable="false">
          <image href={approvedLogo} width="2172" height="724" />
        </svg>
      </span>
      <span className="brand-name">
        <svg
          viewBox="690 282 1460 311"
          className="brand-wordmark"
          aria-hidden="true"
          focusable="false"
        >
          <image href={approvedLogo} width="2172" height="724" />
        </svg>
      </span>
    </a>
  );
}
