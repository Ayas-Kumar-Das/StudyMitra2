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
  muted: "#62718a"
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
  dark-muted: "#a5b5d0"
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
  glass: "rgba(249, 252, 255, 0.74)"
  glass-edge: "rgba(255, 255, 255, 0.9)"
  dark-glass: "rgba(24, 38, 62, 0.78)"
  dark-glass-edge: "rgba(158, 192, 242, 0.16)"
typography:
  headline:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "25px"
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
  workspace-topbar:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.text}"
    rounded: "{rounded.floating-panel}"
    height: "46px"
    padding: "0 12px 0 17px"
  workspace-navigation:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.floating-panel}"
    width: "224px"
    padding: "20px 14px"
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

The rounded humanist letterforms carry friendliness; heavy, tightly spaced headings provide structure. Use the frontmatter roles as representative observed styles, not a claim of a universal type scale.

- **Headline:** page heading; (29px) on wide screens, (25px) by default, (24px) below 1250px, (23px) below 900px, and (21px) on mobile before short-height compaction.
- **Title:** section headings; the welcome title is (25px) on desktop and (22px) on mobile.
- **Body:** answer prose, limited to (76ch) in conversation. Supporting UI copy commonly uses (12px); mobile tool descriptions use (9px) and disappear in short-height layouts.
- **Label:** primary and secondary actions. Uppercase section labels use (10px), weight (800), tracking (.1em). Footnotes use (10px), reducing to (9px) on mobile. Tables, library summaries and document footers use tabular numerals. Brand tracking is (-.04em).

## Layout

The workspace owns the viewport (100dvh); document, body and root do not scroll. A two-column grid places floating navigation beside the workspace. Default navigation width is (224px), with shell-inset and shell-gap from the tokens. Navigation sizes to content with a viewport cap. The workspace uses a (46px) topbar row and flexible content row separated by (16px). Focus sits on the left of this thin bar; connection/theme actions sit on the right. There is no topbar breadcrumb.

Chat uses four rows: heading, tools, flexible welcome/conversation region, composer. Modes and filters share the desktop row. Modes cap at (680px); filters stay compact. The toolbar can wrap below (1250px), returns to one compact row below (1050px), and stacks modes above filters below (900px). The composer anchors at the grid bottom. Conversation alone scrolls, with contained overscroll and a stable scrollbar gutter. Welcome can scroll independently when necessary. Library content owns its vertical scrolling region.

Welcome caps at (1260px). Its upload/tool grid uses a (0.9:1.4) ratio and `clamp(190px, 28dvh, 285px)` height. Library grids use three columns. At (1700px) and above navigation becomes (238px), gap (24px), inset (20px), topbar (48px), and modes cap at (810px). At (1250px) and below navigation becomes (200px), gap/inset (14px), and library grids use two columns. At (1050px) and below navigation becomes a (72px) icon rail with accessible names and a history shortcut.

At (650px) and below the shell uses (10px) side insets and reserves `77px + env(safe-area-inset-bottom)` underneath content. Navigation becomes a centered bottom pill, (54px) high, (10px) above the safe area. Topbar becomes (42px) with (12px) workspace gap. Library grids become one column. A compact horizontal upload card sits above the two-column tool grid without the paper stack. Conversation padding becomes (13px 11px); user messages may use (88%) width. Keep the bottom navigation clear of the anchored composer.

Short-height layouts compact welcome and composer: desktop thresholds are (760px) and (660px), mobile thresholds (740px) and (620px). Desktop topbar becomes (42px) at the first threshold; at the second, secondary welcome/tool copy and paper decoration disappear. Mobile topbar/navigation become (40px)/(50px) at (740px), with bottom reserve `68px + env(safe-area-inset-bottom)`. At (620px) the welcome heading disappears and the starter grid becomes (174px) high. Keep every starter tool reachable above the composer.

## Elevation & Depth

Floating navigation and topbar use translucent glass, a glass-edge border, inset highlight and diffuse depth. Glass backdrop blur is (24px) with saturation (140%); modes use (18px)/(130%). Theme-specific glass preserves the blue palette. Content depth otherwise comes primarily from surface tone and fine borders. Shadows support interaction and small overlays rather than making every card float. A shared shadow variable exists in the stylesheet, but current components use their own subtle shadows.

- Composer at rest: `0 5px 24px #24437406`; focused: `0 5px 25px #315dec12`.
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

Tool cards have document-radius corners, a line border, surface fill and (15px 17px) desktop padding. Hover changes the border and surface tone; the corner arrow moves (2px, -2px). Document cards use the frontmatter component token and offer distinct preview, index and delete controls. Do not turn metadata tags into actions.

### Inputs / Fields

Upload fields use a line border, background fill and field radius. Labels remain visible above controls. The dashed dropzone opens the native file chooser and also accepts drag-and-drop; hover and dragging use selected fill and accent border. Search is a compact bordered container. Errors remain textual, with the theme-specific error color.

### Navigation

Floating glass panels use floating-panel corners; the collapsed icon rail uses collapsed-nav corners. Actions have (14px) corners and at least (44px) height. Selected navigation combines a selected-color gradient, inset highlight and accent text with a filled Phosphor icon. Hover shifts an item (2px) right. Preserve accessible names, titles and aria-current when labels collapse. Recent chats have no trailing action icons. View all chats opens the history dialog for selection, new chats and deletion; compact navigation offers its history shortcut.

Modes use modes-radius corners and (4px) container padding. Buttons use mode-radius corners, (10px 8px) padding and (11px) labels. Active modes use a surface-to-selected gradient with an inset highlight; hover lifts (1px), pressing scales to (.96). Preserve pressed state.

### Library Folders

Browse semester → subject → category → documents. Folder cards use (16px) corners, (22px 18px) padding and (100px) minimum height; icon blocks are (46px × 48px). Hover changes the border to accent, lifts (2px), and rotates the icon (-4deg). Local library breadcrumbs and a back control navigate the hierarchy; the topbar stays breadcrumb-free.

Missing metadata displays “Unassigned semester”, “Unassigned subject” and “Uncategorized”. Grouping trims/stringifies values for comparison and naturally sorts folders without rewriting raw document metadata or backend values. Search displays matching documents directly and resets the folder path; filters also reset the path. Friendly category display labels preserve the raw document type.

### Study Composer and Sources

The anchored composer uses (18px) corners and (12px 15px 10px) padding, keeping attachment, answer mode and send/stop controls together. Its textarea starts at (33px) and caps at (80px), scrolling internally. User messages align right, with selected-fill bubbles, (78%) maximum width capped at (780px), and asymmetric (16px 5px 16px 16px) corners. Assistant messages align left, cap at (1000px) and use readable prose width. Long tables and code scroll inside their content regions. Sending is disabled for an empty question. Inline citation buttons use selected fill and open the source drawer. The drawer is a native modal dialog on the right, (440px) wide and at most (95vw); document previews are centered dialogs with scrollable content. Toasts use inverse text/surface colors and a dismiss control.

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
