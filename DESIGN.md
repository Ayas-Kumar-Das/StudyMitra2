---
name: StudyMitra
description: A blue-hour study desk for document-grounded learning.
colors:
  accent: "#315dec"
  accent-hover: "#244bd0"
  bg: "#f3f6fc"
  surface: "#fff"
  surface-2: "#edf3ff"
  sidebar: "#f8faff"
  text: "#172b50"
  muted: "#425b7b"
  line: "#dfe7f4"
  selected: "#e8efff"
  blue-1: "#1d3ea4"
  blue-2: "#315dec"
  blue-3: "#447cf2"
  blue-4: "#5aa4f0"
  blue-5: "#8fcff6"
  blue-6: "#d8ecff"
  dark-bg: "#10192b"
  dark-surface: "#172238"
  dark-surface-2: "#1c2c47"
  dark-sidebar: "#111d31"
  dark-text: "#e8efff"
  dark-muted: "#afc2df"
  dark-line: "#2a3b57"
  dark-accent: "#8aabff"
  dark-accent-hover: "#a2bcff"
  dark-selected: "#253b62"
  dark-blue-1: "#14295d"
  dark-blue-2: "#1e3d8c"
  dark-blue-3: "#2851a7"
  dark-blue-4: "#3468b7"
  dark-blue-5: "#508ecc"
  dark-blue-6: "#7eb2df"
  focus-ring: "#739af5"
  danger: "#b53549"
  dark-error: "#ffadbc"
  glass: "rgba(244, 250, 255, 0.28)"
  glass-highlight: "rgba(255, 255, 255, 0.44)"
  glass-card: "rgba(249, 252, 255, 0.34)"
  dark-glass-highlight: "rgba(130, 176, 241, 0.12)"
  dark-glass-card: "rgba(26, 46, 76, 0.4)"
  glass-edge: "rgba(255, 255, 255, 0.74)"
  dark-glass: "rgba(21, 38, 64, 0.32)"
  dark-glass-edge: "rgba(181, 211, 255, 0.25)"
typography:
  headline:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  title:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "22px"
    fontWeight: 800
    letterSpacing: "-0.035em"
  body:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "14px"
    lineHeight: 1.8
  label:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "12px"
    fontWeight: 750
rounded:
  field: "7px"
  control: "8px"
  document: "16px"
  panel: "14px"
  hero: "18px"
  floating-panel: "30px"
  collapsed-nav: "36px"
  modes: "24px"
  mode: "20px"
spacing:
  compact: "8px"
  control-x: "15px"
  card: "20px"
  shell-inset: "16px"
  shell-gap: "18px"
  mobile-inset: "10px"
components:
  workspace-focus:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.text}"
    rounded: "{rounded.modes}"
    padding: "10px 14px"
  workspace-theme:
    backgroundColor: "{colors.glass}"
    width: "43px"
    height: "43px"
  workspace-navigation:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.floating-panel}"
    width: "224px"
    padding: "26px 14px"
  study-modes:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.modes}"
    padding: "4px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    typography: "{typography.label}"
    padding: "11px 15px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "11px 15px"
  document-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.document}"
    padding: "17px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "10px"
---

# Design System: StudyMitra

## Overview

**Creative North Star: “Blue-hour study desk”**

StudyMitra pairs an orderly study workspace with the warmth of a helpful classmate. Pale blue paper, dark ink, rounded controls, Phosphor icons and a luminous blue upload card make personal materials feel approachable. The interface is compact and organized, with floating glass navigation and an anchored place to ask a question.

Focus mode quiets the personality through direct language, fewer decorative elements and a tonal upload card. Light and dark themes preserve the same spatial hierarchy. The React application and its styles are the implementation source of truth; these guidelines describe the current code. workspace.css is imported after app.css and owns the structural overrides.

**Key Characteristics:**

- A five-to-six-color blue family gradient as the signature visual.
- Strong ink, visible borders and restrained shadows on quiet surfaces.
- Friendly student language that becomes professional and direct in focus mode.
- Phosphor icons with regular, fill, bold and duotone weights used in context.

## Colors

### Primary

The accent is confident study blue: use it for primary actions, selected navigation, citations and small icon containers. The six blue tokens form the underlying family. The light-theme upload card uses a literal six-stop gradient (`120deg`, stops at `0`, `30%`, `57%`, `78%`, `108%`, `140%`) whose first stop is `#2345b0`; subsequent stops follow blue-2 through blue-6. Preserve its legible dark blue text zone and protected action label.

### Neutral

Background is cool paper; surface is the clean card plane; surface-2 supports grouped controls and quiet panels. Sidebar is a subtly distinct navigation plane. Text is deep blue ink, muted supports metadata, line separates regions, and selected identifies active or contextual blue surfaces.

Dark theme substitutes the dark-prefixed semantic colors using the root `data-theme` attribute. Primary action text becomes dark ink (`#102141`) against the brighter accent. Errors use the lighter dark-error color. The dark upload card uses the six dark-blue tokens through the blue-1 to blue-6 CSS variables, with the same angle and stop positions as the light gradient. Focus mode replaces the gradient with surface-2 in both themes.

**The Readable Blue Rule.** Keep running text on solid semantic surfaces. Preserve the upload card's text width and dark action background rather than allowing bright gradient stops behind its labels.

## Typography

**Display and Body Font:** Manrope Variable, with sans-serif fallback. There is no separate decorative display family.

The rounded humanist letterforms carry friendliness; heavy, tightly spaced headings provide structure. Use the frontmatter roles as representative observed styles, not a claim of a universal type scale. Spacious desktop headings and welcome copy follow the layout conditions below; compact and short-height overrides remain intact.

- **Headline:** centered masthead title, (28px) by default, (24px) on compact desktop and (20px) on mobile before short-height overrides.
- **Title:** section headings; the welcome title is (25px) on desktop and (22px) on mobile.
- **Body:** answer prose, limited to (76ch) in conversation. Supporting UI copy commonly uses (12px); mobile tool descriptions use (9px) and disappear in short-height layouts.
- **Label:** primary and secondary actions. Uppercase section labels use (10px), weight (800), tracking (.1em). Footnotes use (10px), reducing to (9px) on mobile. Tables, library summaries and document footers use tabular numerals. The brand wordmark comes from the approved artwork rather than live font styling.

## Layout

The workspace owns the viewport (100dvh); body and root do not scroll. A two-column grid places floating navigation beside the workspace. Default navigation width is (224px), with shell-inset and shell-gap from the tokens. Expanded desktop navigation is vertically centered and (70dvh) tall, with (26px 14px) padding. Focus-collapsed navigation remains centered, uses automatic height with (300px) minimum, caps at (70dvh), and has (20px 10px) padding. Branding is separate at the upper left, directly on the same blue gradient backdrop. It uses the user-approved transparent S/M book-and-handshake logo in `frontend/public/branding/studymitra-approved.png`. Both emblem and wordmark preserve the approved artwork through SVG viewports. Dark mode lightens only the rendered wordmark; the blue emblem stays unchanged. The browser favicon uses the emblem alone.

A (76px) masthead replaces the long glass topbar. It places an independent Focus pill left, the full heading/subtitle centered, and a separate circular theme control right. Desktop masthead width caps at (1040px), with (176px / flexible / 176px) columns and (20px) gaps. Controls align inward toward the heading; both are (42px) tall. Between (651px) and (1100px), columns become (135px / flexible / 55px), gaps (14px), and heading (23px). Workspace row gap is (14px). There is no header upload action, connection label or breadcrumb. Upload remains in the library and composer attachment flow; the composer retains its truthful offline status.

Chat has three rows: modes/filters, flexible welcome/conversation region, anchored composer, with (16px) gaps. Modes and filters share a desktop toolbar capped at (1280px), with (16px) gap and matched (44px) outer control height. Mode buttons are (36px) tall with (3px) container padding. At (1100px) and below desktop controls stack: modes are (42px), buttons (34px), and centered filters (36px). On mobile the modes container is (41px), buttons (33px), and centered filters (34px). Conversation scrolls independently with contained overscroll; welcome and library regions retain their own scrolling. User messages remain right aligned; assistant messages remain left aligned. Keep the composer and navigation clear of scrolling content.

At widths (651px+) and heights (700px+), welcome caps at (1040px), with (20px) gap. The starter grid caps at (960px), uses `min(43dvh, 420px)` height, (17px) gaps and a (0.9:1.4) upload-to-tools ratio. Its two-by-two tools approach square tiles, using (24px) padding, (20px) corners, (38px) icons, (16px) titles and (12px) descriptions. Upload card uses (27px) padding and (28px) heading. Below (1250px) desktop tool padding/titles become (17px)/(14px); below (1050px) the starter grid caps at (850px). Width-specific navigation remains (238px) at 1700px+, (200px) at 1250px and below, and a (72px) icon rail at 1050px and below. Focus uses (74px), or (72px) in compact layouts. Branding hides its wordmark in desktop compact/focus layouts.

Desktop heights (760px) and below use a (62px) masthead, (24px) heading, (11px) subtitle, (38px) theme control, (10px) row gaps and starter height `min(37dvh, 290px)`. Existing narrower and shorter content compaction remains in force.

At (650px) and below branding sits at the upper left with (16px) wordmark and (29px) mark. Masthead becomes a two-row (102px) region: compact controls beside branding, then centered title/subtitle. The title is (20px), subtitle (10px). The bottom navigation pill is (52px) tall and respects the safe area. Starter cards retain their compact horizontal upload/two-column tools composition. Library grids become one column; conversation and composer remain independently contained. Starter cards have no corner arrows. The blue upload card has no upload-icon header or “Start here” badge; its entire area is the action. On mobile the extra action label is hidden and its heading/copy use the full card width.

At mobile height (700px) and below masthead becomes (87px), heading (18px), and starter grid (192px); the welcome heading disappears. At (600px) and below masthead becomes (72px), subtitle disappears and starter grid becomes (164px). At width (370px) and below branding and masthead type shrink further and the focus label hides visually while retaining its accessible name. Preserve compact mobile and short-height reachability.

## Elevation & Depth

Floating navigation and masthead controls use translucent glass, a glass-edge border, inset highlight and diffuse depth. Glass backdrop blur is (24px) with saturation (140%); modes use (22px)/(165%). Visible blue radial backdrop fields show through the translucent panels. Diagonal glass-highlight reflection layers cross navigation, focus/theme controls, modes and starter tool cards; tool cards use glass-card fill with (20px)/(150%) blur/saturation. Composer uses a (62%) surface mix over transparency with (22px)/(145%) blur/saturation. Theme-specific glass preserves the blue palette; muted text is deliberately darker in light theme and lighter in dark theme for readability. Content depth otherwise comes primarily from surface tone and fine borders. The shell backdrop is fixed and continuous; workspace overflow is visible so soft glass shadows are not clipped. Library background stays transparent. Scrollbar tracks are transparent, with (6px) thumbs tinted from muted at (34%) rather than opaque gutters. Shadows support interaction and small overlays rather than making every card float. A shared shadow variable exists in the stylesheet, but current components use their own subtle shadows.

- Composer at rest: `inset 0 1px 0 #ffffff70, 0 8px 26px #2443740d`; focused: `0 5px 25px #315dec12`.
- Primary action hover: `0 5px 15px #315dec25`.
- Toast: `0 8px 32px #10203a25`.
- Dialog backdrop: `#10234066`.

**The Quiet Desk Rule.** Retain tonal separation and borders for document and tool cards; reserve strong depth for overlays and the small paper illustration.

## Shapes

Controls have gently curved corners, cards slightly broader curves, and the upload hero the broadest shared card silhouette. Avatar and status indicators are circular. Document tags use (5px) corners; the composer uses hero-radius corners. Borders are generally (1px), and upload affordances use a dashed stroke. The decorative paper stack tilts within an overflow-clipped hero.

## Components

### Buttons

Primary actions use accent, the control radius and compact horizontal padding from the tokens. Hover darkens the accent with a small blue shadow. Secondary actions use surface and line borders, switching to selected on hover. Icon buttons are (32px) squares with (7px) corners and selected hover backgrounds. Disabled controls lower opacity and use a non-interactive cursor.

Keyboard focus uses a (3px) focus-ring outline offset by (3px). Preserve accessible labels on icon-only buttons. The composer textarea instead delegates visible focus to its containing border and shadow.

### Cards / Containers

Tool cards have document-radius corners, a glass-edge border, reflected translucent glass-card fill, and responsive padding described in Layout. Hover lifts the card (2px), strengthens the reflection and shadow, without any corner arrow. Document cards use the frontmatter component token and offer distinct preview, index and delete controls. Do not turn metadata tags into actions.

### Inputs / Fields

Upload fields use a line border, background fill and field radius. Labels remain visible above controls. The dashed dropzone opens the native file chooser and also accepts drag-and-drop; hover and dragging use selected fill and accent border. Search is a compact bordered container. Errors remain textual, with the theme-specific error color.

### Navigation

Branding is a separate upper-left link rather than an item inside the sidebar. The expanded sidebar deliberately occupies (70dvh); focus mode retains a compact automatic-height rail.

Floating glass panels use floating-panel corners; the collapsed icon rail uses collapsed-nav corners. Actions have (14px) corners and at least (44px) height. Selected navigation combines a selected-color gradient, inset highlight and accent text with a filled Phosphor icon. Hover shifts an item (2px) right. Preserve accessible names, titles and aria-current when labels collapse. Recent chats have no trailing action icons. View all chats opens the history dialog for selection, new chats and deletion; compact navigation offers its history shortcut.

Modes use modes-radius corners and (4px) container padding. A single measured glass indicator sits behind the active button, with (22px) corners and (4px) vertical inset, or (3px) on mobile. Its position and width are measured from the selected button after mode changes, ResizeObserver updates and font readiness. It slides/resizes over (.34s) with `cubic-bezier(.22,1,.36,1)`. Buttons have no separate active background or shadow; hover changes text and a faint translucent fill. Light and dark themes use the same glass selection structure with theme-specific reflection and border colors. Preserve aria-pressed and the active filled Phosphor icon. Reduced motion removes indicator transitions.

### Library Folders

Browse semester → subject → category → documents. Folder cards use (16px) corners, (22px 18px) padding and (100px) minimum height; icon blocks are (46px × 48px). Hover changes the border to accent, lifts (2px), and rotates the icon (-4deg). Local library breadcrumbs and a back control navigate the hierarchy; the topbar stays breadcrumb-free.

Missing metadata displays “Unassigned semester”, “Unassigned subject” and “Uncategorized”. Grouping trims/stringifies values for comparison and naturally sorts folders without rewriting raw document metadata or backend values. Search displays matching documents directly and resets the folder path; filters also reset the path. Friendly category display labels preserve the raw document type.

### Study Composer and Sources

The anchored composer uses (18px) corners and (12px 15px 10px) padding, keeping attachment, answer mode and send/stop controls together. Its textarea starts at (33px) and caps at (80px), scrolling internally. A labelled Expand/Shrink icon button toggles a larger writing area and exposes aria-pressed: expanded desktop height is `clamp(70px, 16dvh, 150px)`; mobile expanded height is (80px). Height changes use (.24s) with `cubic-bezier(.16,1,.3,1)`, disabled for reduced motion. User messages align right, with selected-fill bubbles, (78%) maximum width capped at (780px), and asymmetric (16px 5px 16px 16px) corners. Assistant messages align left, cap at (1000px) and use readable prose width. Long tables and code scroll inside their content regions. Sending is disabled for an empty question. Inline citation buttons use selected fill and open the source drawer. The drawer is a native modal dialog on the right, (440px) wide and at most (95vw); document previews are centered dialogs with scrollable content. Toasts use inverse text/surface colors and a dismiss control.

### Dedicated Upload

Upload replaces the resource view through an early return: show only a Resources return control and the upload panel. Keep summary, search, filters and the resource browser out of this screen. The main masthead reads “Add materials” during upload and “Resources” for the normal library; normal resources retain their summary and browser.

The centered panel caps at (1080px), uses (24px) padding, (20px) corners, a (67%) surface mix and (20px) backdrop blur. Desktop body splits left dropzone and right metadata at (0.85:1.5), with (24px) gap and (220px) minimum dropzone column. The dropzone has (248px) minimum height. Metadata remains a two-column grid with (16px) gaps and (39px) fields. An optional description is a collapsed details disclosure; preserve its native summary control and explicit textarea label.

Mobile stacks dropzone above metadata while retaining the two-column metadata grid: panel padding (16px), dropzone minimum (86px), fields (36px). At heights (700px) and below panel padding becomes (12px), dropzone minimum (65px), fields (32px); the dropzone icon hides. The footer stacks status above the full-width submit action. At mobile heights (600px) and below, opening description hides the intro and reduces the dropzone to (45px), keeping the additional field reachable. The default form is designed to fit the viewport across the checked (320px × 568px) to (1920px × 900px) sizes without scrolling; retain that compact composition. Connection-dependent copy distinguishes local save from upload/indexing.

### Theme, Focus and Motion

Theme and focus preferences persist in browser storage. Focus mode switches headings and prompts to direct language, removes the note, sparkle, paper stack, grounding note and welcome emblem, and replaces the gradient with surface-2. It preserves tools and document actions. Desktop navigation collapses to (74px), or (72px) in compact layouts, replacing inline history with the dialog shortcut.

Theme and focus use a bounded whole-workspace View Transition when supported: outgoing content fades, blurs to (2px) and scales to (.995) over (.22s); incoming content resolves from (3px) blur and (1.006) scale over (.36s) with `cubic-bezier(.16,1,.3,1)`. Unsupported browsers and reduced-motion preference update state directly. Shell column changes use (.35s) with the same easing. Normal controls use short (.18s) color, shadow and transform transitions. The paper stack uses (.3s) with `cubic-bezier(.16,1,.3,1)`; the tool arrow uses (.2s ease). Focus suppresses decorative paper and arrow motion while retaining the requested mode transition. The `prefers-reduced-motion: reduce` setting disables all animation, transitions and smooth scrolling. Maintain this behavior for new elements.

## Do's and Don'ts

### Do:

- **Do** use semantic colors so new surfaces adapt to both themes.
- **Do** preserve visible focus, text labels, source citations and readable answer width.
- **Do** use Phosphor icons and keep decorative flourishes removable in focus mode.
- **Do** keep playful language concise and provide a direct focus-mode equivalent.

### Don't:

- **Don't** replace the blue family with unrelated decorative accent colors.
- **Don't** use the gradient as a general text-reading surface.
- **Don't** remove study features when quieting the visual personality.
- **Don't** introduce essential motion or encode connection and document state with color alone.



### Dropdowns

Shared Radix Select menus use themed surfaces, selected checkmarks, arrow-key navigation, typeahead, Escape dismissal, portal positioning and a short reveal. The same component serves filters and upload metadata while preserving form values. Focus mode and reduced-motion preferences suppress the reveal.
