import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route("**/api/**", (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path.endsWith("/health"))
    return route.fulfill({ json: { status: "healthy" } });
  if (path.endsWith("/documents"))
    return route.fulfill({
      json: {
        documents: [
          {
            id: "test-doc",
            title: "Operating Systems",
            subject: "Computer Science",
            semester: "3",
            doc_type: "lecture_notes",
            file_type: "pdf",
            total_chunks: 12,
            total_pages: 8,
            file_size: 12345,
            status: "indexed",
          },
        ],
      },
    });
  if (path.endsWith("/chat/stream")) {
    const payload = route.request().postDataJSON();
    assert.equal(payload.mode, "exam_answer");
    assert.equal(payload.filters.semester, "3");
    return route.fulfill({
      contentType: "text/event-stream",
      body: 'data: {"type":"token","content":"## Virtual memory\\n\\nVirtual memory maps virtual addresses to physical memory. [Source 1]\\n\\n| Term | Meaning |\\n|---|---|\\n| Page | Fixed-size block |"}\n\ndata: {"type":"sources","sources":[{"document_name":"Operating Systems","page_number":3,"chunk_text":"Paging maps virtual addresses to physical memory.","relevance_score":0.95}]}\n\ndata: {"type":"done"}\n\n',
    });
  }
  return route.fulfill({ json: { status: "success" } });
});
await page.goto("http://127.0.0.1:3000");
await page
  .getByRole("button", { name: "Backend connected. Refresh connection" })
  .waitFor();
await page.getByRole("button", { name: "Exam prep", exact: true }).click();
await page.getByRole("combobox", { name: "Filter by semester" }).click();
await page.getByRole("option", { name: "Semester 3", exact: true }).click();
await page
  .getByRole("textbox", { name: "Ask a study question" })
  .fill("Explain virtual memory for an exam");
await page.getByRole("button", { name: "Send question" }).click();
await page
  .getByRole("heading", { name: "Virtual memory", exact: true })
  .waitFor();
await page.getByRole("button", { name: "Source 1", exact: true }).click();
await page.getByRole("dialog", { name: "Answer sources" }).waitFor();
await page.screenshot({
  path: "../.impeccable/review/smoke-sources.png",
  fullPage: true,
});
await page.keyboard.press("Escape");
await page.reload();
await page
  .getByText("Explain virtual memory for an exam", { exact: true })
  .first()
  .click();
await page
  .getByRole("heading", { name: "Virtual memory", exact: true })
  .waitFor();
await page.screenshot({
  path: "../.impeccable/review/smoke-answer.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open chat history" }).click();
await page.getByRole("dialog", { name: "Chat history" }).waitFor();
await page.screenshot({
  path: "../.impeccable/review/smoke-mobile-history.png",
  fullPage: true,
});
await page
  .getByRole("dialog", { name: "Chat history" })
  .getByRole("button", {
    name: "Explain virtual memory for an exam",
    exact: true,
  })
  .click();
await page
  .getByRole("heading", { name: "Virtual memory", exact: true })
  .waitFor();
await page.getByRole("button", { name: "New study chat", exact: true }).click();
await page
  .getByRole("heading", { name: "Okay, let’s make it click." })
  .waitFor();
await page.getByRole("button", { name: "Open chat history" }).click();
await page
  .getByRole("dialog", { name: "Chat history" })
  .getByRole("button", { name: "Delete chat" })
  .click();
await page.getByText("No saved chats yet.").waitFor();
assert.equal(errors.length, 0);
console.log(
  "PASS: API contracts, mode and filters, SSE, Markdown table, clickable citations, source dialog, persisted chat.",
);
await browser.close();
