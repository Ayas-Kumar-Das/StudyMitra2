import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const fixtures = [
  {
    id: "itc",
    title: "ITC Book",
    subject: "ITC",
    semester: "5",
    doc_type: "textbook",
    file_type: "pdf",
    total_chunks: 150,
    total_pages: 120,
    file_size: 10485760,
    status: "indexed",
  },
  {
    id: "ptr",
    title: "Pointers",
    subject: "PPWC",
    semester: "5",
    doc_type: "notes",
    file_type: "pdf",
    total_chunks: 20,
    total_pages: 10,
    file_size: 12345,
    status: "indexed",
  },
  {
    id: "mem",
    title: "Dynamic Memory Allocation",
    subject: "PPWC",
    semester: "5",
    doc_type: "notes",
    file_type: "pdf",
    total_chunks: 30,
    total_pages: 12,
    file_size: 34567,
    status: "indexed",
  },
  {
    id: "os",
    title: "Virtual Memory",
    subject: "Operating Systems",
    semester: "3",
    doc_type: "lecture_notes",
    file_type: "txt",
    total_chunks: 12,
    file_size: 4567,
    status: "indexed",
  },
  {
    id: "misc",
    title: "Unsorted revision",
    subject: "",
    semester: "",
    doc_type: "",
    file_type: "md",
    total_chunks: 0,
    file_size: 123,
    status: "indexed",
  },
];
let received;
const answer =
  "## Pointers, made clear\n\nA pointer stores a memory address. [Source 1]\n\n### Quick comparison\n\n| Operation | Meaning |\n|---|---|\n| `&value` | Address of value |\n| `*pointer` | Value at address |\n\n" +
  Array.from(
    { length: 35 },
    (_, i) =>
      `### Revision point ${i + 1}\n\nUse pointers carefully: initialize them, check for null, and release allocated memory when ownership ends.\n\n`,
  ).join("") +
  "```c\n" +
  "a_very_long_identifier = another_very_long_identifier + some_more_details; ".repeat(
    20,
  ) +
  "\n```\n";
await page.route("**/api/**", (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path.endsWith("/health"))
    return route.fulfill({ json: { status: "ok", qdrant: "connected" } });
  if (path.endsWith("/documents"))
    return route.fulfill({ json: { documents: fixtures } });
  if (path.endsWith("/chat/stream")) {
    received = route.request().postDataJSON();
    return route.fulfill({
      contentType: "text/event-stream",
      body: [
        { type: "token", content: answer },
        {
          type: "sources",
          sources: [
            {
              document_name: "Pointers",
              page_number: 3,
              chunk_text: "Pointers store memory addresses.",
              relevance_score: 0.96,
            },
          ],
        },
        { type: "done" },
      ]
        .map((e) => "data: " + JSON.stringify(e) + "\n\n")
        .join(""),
    });
  }
  return route.fulfill({ json: { status: "success" } });
});
await page.goto("http://127.0.0.1:3000");
await page.locator(".composer-foot .status-dot.online").waitFor();
const capture = async (name) => {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `../.impeccable/review/revision-${name}.png` });
};
const bounds = async () =>
  page.evaluate(() => {
    const rect = (selector) => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      };
    };
    return {
      width: innerWidth,
      height: innerHeight,
      pageWidth: document.documentElement.scrollWidth,
      pageHeight: document.documentElement.scrollHeight,
      composer: rect(".composer"),
      welcome: document.querySelector(".welcome") ? rect(".welcome") : null,
      bento: document.querySelector(".bento") ? rect(".bento") : null,
    };
  });
for (const [width, height, name] of [
  [1440, 900, "desktop"],
  [1920, 900, "user-1920"],
  [1366, 768, "laptop"],
  [1024, 768, "tablet-landscape"],
  [820, 1180, "tablet"],
  [390, 844, "mobile"],
  [390, 667, "mobile-short"],
  [320, 568, "mobile-small"],
]) {
  await page.setViewportSize({ width, height });
  await capture(name);
  const box = await bounds();
  if (width > 650) {
    const sidebar = await page.locator(".sidebar").boundingBox();
    assert.ok(
      Math.abs(sidebar.y + sidebar.height / 2 - height / 2) < 2,
      `${name}: sidebar must float at vertical center`,
    );
  }

  assert.equal(box.pageWidth, width, `${name}: horizontal page overflow`);
  assert.equal(box.pageHeight, height, `${name}: vertical page overflow`);
  assert.ok(box.composer.bottom < height, `${name}: composer below viewport`);
  assert.ok(box.composer.y > 0);
  assert.ok(
    box.bento.bottom <= box.welcome.bottom + 1,
    `${name}: clipped bento`,
  );
}
await page.setViewportSize({ width: 1440, height: 900 });
const initialComposer=await page.locator('.composer').boundingBox();
await page.getByRole('button',{name:'Expand message box'}).click();
await page.waitForTimeout(300);
assert.ok((await page.locator('.composer').boundingBox()).height>initialComposer.height+40);
await page.getByRole('button',{name:'Shrink message box'}).click();
await page.waitForTimeout(300);
assert.equal(await page.getByRole('button',{name:'Add materials',exact:true}).count(),0,'no redundant upload button in chat header');
const startTransform=await page.locator('.mode-indicator').evaluate(e=>getComputedStyle(e).transform);
await page.getByRole('button',{name:'Compare',exact:true}).click();
await page.waitForTimeout(400);
const endTransform=await page.locator('.mode-indicator').evaluate(e=>getComputedStyle(e).transform);
assert.notEqual(startTransform,endTransform,'one selection pill should slide between modes');
await page.getByRole('button',{name:'Explain',exact:true}).click();

const modeBox = await page.locator(".mode-bar").boundingBox(),
  filterBox = await page.locator(".study-toolbar .filters").boundingBox();
assert.ok(
  Math.abs(modeBox.y - filterBox.y) < 10,
  "desktop tools and filters should be parallel",
);
await page.getByRole("button", { name: "My library", exact: true }).click();
await capture("library-semesters");
await page.getByRole("button", { name: /Semester 5.*3 documents/ }).click();
await capture("library-subjects");
await page.getByRole("button", { name: /PPWC.*2 documents/ }).click();
await page.getByRole("button", { name: /notes.*2 documents/ }).click();
await capture("library-documents");
assert.equal(await page.locator(".document-card").count(), 2);
await page.getByRole("button", { name: "All semesters", exact: true }).click();
await page.getByRole("button", { name: /Unassigned semester/ }).click();
await page.getByRole("button", { name: /Unassigned subject/ }).click();
await page.getByRole("button", { name: /Uncategorized.*document/ }).click();
assert.equal(await page.locator(".document-card").count(), 1);
await page.getByRole("textbox", { name: "Search documents" }).fill("Pointers");
await page.waitForTimeout(100);
assert.equal(await page.locator(".document-card").count(), 1);
await page.getByRole("textbox", { name: "Search documents" }).fill("");
await page.getByRole("button", { name: "Study space", exact: true }).click();
for (const [name, option] of [
  ["Filter by semester", "Semester 5"],
  ["Filter by subject", "PPWC"],
  ["Filter by document type", "notes"],
]) {
  await page.getByRole("combobox", { name }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
await page.getByRole("button", { name: "Explain", exact: true }).click();
await page
  .getByRole("textbox", { name: "Ask a study question" })
  .fill("Explain pointers in short");
await page.getByRole("button", { name: "Send question" }).click();
await page.getByRole("button", { name: "Copy", exact: true }).waitFor();
assert.equal(received.filters.doc_type, "notes");
assert.equal(received.filters.semester, "5");
assert.equal(received.filters.subject, "PPWC");
await page.locator(".conversation").evaluate((e) => (e.scrollTop = 0));
await capture("conversation");
const positions = await page.evaluate(() => ({
  user: document.querySelector(".message.user").getBoundingClientRect().x,
  assistant: document
    .querySelector(".message.assistant")
    .getBoundingClientRect().x,
  pageScroll: document.scrollingElement.scrollTop,
}));
assert.ok(positions.user > positions.assistant + 100);
assert.equal(positions.pageScroll, 0);
const composerBefore = await page.locator(".composer").boundingBox();
await page
  .locator(".conversation")
  .evaluate((e) => (e.scrollTop = e.scrollHeight));
await page.mouse.move(1000, 400);
await page.mouse.wheel(0, 700);
const composerAfter = await page.locator(".composer").boundingBox();
assert.equal(composerAfter.y, composerBefore.y);
assert.equal(await page.evaluate(() => document.scrollingElement.scrollTop), 0);
await page.locator(".conversation").evaluate((e) => (e.scrollTop = 0));
await page.getByRole("button", { name: "Source 1", exact: true }).click();
await capture("sources");
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Switch to dark mode" }).click();
await capture("dark-conversation");
await page.getByRole("button", { name: "Focus mode" }).click();
await capture("focus");
assert.ok((await page.locator(".sidebar").boundingBox()).width < 80);
await page.setViewportSize({ width: 390, height: 844 });
await capture("mobile-conversation");
await page.getByRole("button", { name: "Open chat history" }).click();
await capture("mobile-history");
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "New study chat", exact: true }).click();
await capture("dark-focus-welcome");
await page.getByRole("button", { name: "Focus mode" }).click();
await page.setViewportSize({ width: 1440, height: 900 });
await capture("dark-welcome");
await page.emulateMedia({ reducedMotion: "reduce" });
await page.getByRole("button", { name: "Switch to light mode" }).click();
await page.getByRole("button", { name: "Focus mode" }).click();
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.focus),
  "true",
);
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.theme),
  "light",
);
assert.deepEqual(errors, []);
console.log(
  "PASS: viewport containment at 8 sizes; parallel toolbar; semester/subject/category browsing; missing metadata; search; raw backend filters; long answer scrolling; composer position; message alignment; citations; dark/focus transitions; reduced motion.",
);
await browser.close();
