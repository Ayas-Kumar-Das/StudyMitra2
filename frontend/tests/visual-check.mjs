import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:3000");
await page.waitForSelector(".welcome");
await page.waitForTimeout(300);
await page.waitForTimeout(250);
await page.screenshot({
  path: "../.impeccable/review/desktop.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Switch to dark mode" }).click();
await page.waitForTimeout(250);
await page.screenshot({
  path: "../.impeccable/review/dark.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Focus mode" }).click();
await page.waitForTimeout(250);
await page.screenshot({
  path: "../.impeccable/review/focus.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Focus mode" }).click();
await page.getByRole("button", { name: "Switch to light mode" }).click();
await page.getByRole("button", { name: "My library" }).click();
await page.getByRole("button", { name: "Add your first document" }).click();
await page.locator("input[type=file]").setInputFiles({
  name: "Operating Systems — Unit 3.txt",
  mimeType: "text/plain",
  buffer: Buffer.from(
    "Virtual memory uses paging to map virtual addresses to physical memory.\nRevision checklist: paging, page faults, replacement algorithms.",
  ),
});
await page.getByLabel("Document title").fill("Operating Systems — Unit 3");
await page.getByLabel("Subject", { exact: true }).fill("Computer Science");
await page.getByRole("combobox", { name: "Semester", exact: true }).click();
await page.getByRole("option", { name: "Semester 3", exact: true }).click();
await page.getByRole("button", { name: "Save to my library" }).click();
await page.waitForSelector(".document-card");
await page.waitForTimeout(250);
await page.screenshot({
  path: "../.impeccable/review/library.png",
  fullPage: true,
});
await page.getByRole("button", { name: "View document", exact: true }).click();
await page.waitForSelector(".text-preview");
await page.keyboard.press("Escape");
await page.reload();
await page.waitForSelector(".document-card");
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(250);
await page.screenshot({
  path: "../.impeccable/review/mobile-library.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Study space", exact: true }).click();
await page.waitForTimeout(250);
await page.screenshot({
  path: "../.impeccable/review/mobile.png",
  fullPage: true,
});
console.log(
  JSON.stringify(
    {
      errors,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      localPersistence: await page.evaluate(
        () => JSON.parse(localStorage.getItem("sm-local-docs")).length,
      ),
    },
    null,
    2,
  ),
);
await browser.close();
