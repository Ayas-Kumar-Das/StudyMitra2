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
typography:
  headline:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "29px"
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
  document: "13px"
  panel: "14px"
  hero: "15px"
spacing:
  compact: "8px"
  control-x: "15px"
  card: "20px"
  desktop-gutter: "38px"
  mobile-gutter: "18px"
components:
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
    padding: "19px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "10px"
---

# Design System: StudyMitra

## Overview

**Creative North Star: “Blue-hour study desk”**

StudyMitra pairs an orderly study workspace with the warmth of a helpful classmate. Pale blue paper, dark ink, rounded controls, Phosphor icons and a luminous blue upload card make personal materials feel approachable. The interface is compact and organized, with a stable navigation rail and an obvious place to ask a question.

Focus mode quiets the personality through direct language, fewer decorative elements and a tonal upload card. Light and dark themes preserve the same spatial hierarchy. The React application and its styles are the implementation source of truth; these guidelines describe the current code.

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

- **Headline:** page heading; reduces to (25px), then (24px), then (23px) across narrower layouts.
- **Title:** section headings; the welcome title is (25px) on desktop and (22px) on mobile.
- **Body:** answer prose, limited to (74ch). Supporting UI copy commonly uses (12px); mobile tool descriptions use (11px).
- **Label:** primary and secondary actions. Uppercase section labels use (10px), weight (800), tracking (.1em). Footnotes use (10px), reducing to (9px) on mobile. Tables, library summaries and document footers use tabular numerals. Brand tracking is (-.04em).

## Layout

Desktop uses a fixed (240px) sidebar and matching workspace offset, an (80px) topbar, and a centered main area capped at (1450px). The welcome and composer regions cap at (1050px); conversation content caps at (900px). Main gutters follow the desktop-gutter token.

The welcome grid combines an upload card and a two-by-two tool grid at a (1:1.4) ratio with (16px) gap. Document cards form three columns. At (1500px) and above the hero ratio becomes (1:1.5), with more breathing room.

At (1150px) and below the sidebar becomes (210px), main gutters (25px), and documents use two columns. At (900px) and below the sidebar becomes a (76px) icon rail. At (650px) and below navigation becomes a horizontal top strip; workspace offset disappears, main gutters use mobile-gutter, upload and document grids become one column, and the tool grid remains two columns. Modes scroll horizontally. Upload fields collapse from two columns to one; modal padding contracts. Preserve content wrapping and horizontally scrollable answer tables and code. The mobile upload heading and supporting copy are limited to (68%) width; the heading uses (23px) and the paper stack scales to (.9) at the bottom right.

## Elevation & Depth

Depth comes primarily from surface tone and fine borders. Shadows support interaction and small overlays rather than making every card float. A shared shadow variable exists in the stylesheet, but current components use their own subtle shadows.

- Composer at rest: `0 5px 20px #24437406`; focused: `0 5px 25px #315dec12`.
- Primary action hover: `0 5px 15px #315dec25`.
- Toast: `0 8px 32px #10203a25`.
- Dialog backdrop: `#10234066`.

**The Quiet Desk Rule.** Retain tonal separation and borders for document and tool cards; reserve strong depth for overlays and the small paper illustration.

## Shapes

Controls have gently curved corners, cards slightly broader curves, and the upload hero the broadest shared card silhouette. Avatar and status indicators are circular. Document tags use (5px) corners; the composer uses document-radius corners. Borders are generally (1px), and upload affordances use a dashed stroke. The decorative paper stack tilts within an overflow-clipped hero.

## Components

### Buttons

Primary actions use accent, the control radius and compact horizontal padding from the tokens. Hover darkens the accent with a small blue shadow. Secondary actions use surface and line borders, switching to selected on hover. Icon buttons are (32px) squares with (7px) corners and selected hover backgrounds. Disabled controls lower opacity and use a non-interactive cursor.

Keyboard focus uses a (3px) focus-ring outline offset by (3px). Preserve accessible labels on icon-only buttons. The composer textarea instead delegates visible focus to its containing border and shadow.

### Cards / Containers

Tool cards have document-radius corners, a line border, surface fill and (20px) desktop padding. Hover changes the border and surface tone; the corner arrow moves (2px, -2px). Document cards use the frontmatter component token and offer distinct preview, index and delete controls. Do not turn metadata tags into actions.

### Inputs / Fields

Upload fields use a line border, background fill and field radius. Labels remain visible above controls. The dashed dropzone opens the native file chooser and also accepts drag-and-drop; hover and dragging use selected fill and accent border. Search is a compact bordered container. Errors remain textual, with the theme-specific error color.

### Navigation

Active navigation uses selected fill and accent text, paired with a filled Phosphor icon. Modes are grouped buttons with pressed state, surface fill and a small shadow when selected. Preserve accessible names when the tablet rail hides visual labels. Recent chats and supplemental sidebar content are hidden in the compact rail; compact new-chat and history controls appear at (900px) and below. History opens in a native modal dialog, (450px) wide with (24px) padding and panel-radius corners. On mobile, the breadcrumb is hidden to preserve room for these actions.

### Study Composer and Sources

The bordered composer keeps attachment, answer mode and send/stop controls together. Sending is disabled for an empty question. Inline citation buttons use selected fill and open the source drawer. The drawer is a native modal dialog on the right, (440px) wide and at most (95vw); document previews are centered dialogs with scrollable content. Toasts use inverse text/surface colors and a dismiss control.

### Theme, Focus and Motion

Theme and focus preferences persist in browser storage. Focus mode switches headings and prompts to direct language, removes the note, sparkle, paper stack, grounding note and welcome emblem, and replaces the gradient with surface-2. It preserves tools and document actions.

Normal controls use short (.18s) color, shadow and transform transitions. The paper stack uses (.3s) with `cubic-bezier(.16,1,.3,1)`; the tool arrow uses (.2s ease). Both focus mode and `prefers-reduced-motion: reduce` disable animation, transitions and smooth scrolling. Maintain this behavior for new elements.

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
