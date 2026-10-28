import { chromium } from "playwright";
import assert from "node:assert/strict";
const b = await chromium.launch({ channel: "msedge", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.route("**/api/**", (r) =>
  r.fulfill({ status: 503, json: { detail: "Offline fixture" } }),
);
await p.goto("http://127.0.0.1:3000");
await p.waitForTimeout(250);
assert.equal(
  await p
    .locator(".bento .tool-arrow,.bento .start-card-top,.bento .card-link svg")
    .count(),
  0,
);
const align = await p.evaluate(() => {
  const m = document.querySelector(".mode-bar").getBoundingClientRect(),
    f = document
      .querySelector(".study-toolbar .filters")
      .getBoundingClientRect();
  return {
    modeY: m.y,
    filterY: f.y,
    modeHeight: m.height,
    filterHeight: f.height,
  };
});
assert.ok(Math.abs(align.modeY - align.filterY) < 1);
assert.equal(align.modeHeight, align.filterHeight);
await p.screenshot({ path: "../.impeccable/review/clean-desktop.png" });
await p.getByRole("button", { name: "My library", exact: true }).click();
await p.getByRole("button", { name: "Add materials", exact: true }).click();
for (const [width, height, name] of [
  [1440, 900, "desktop"],
  [1366, 768, "laptop"],
  [1920, 900, "wide"],
  [820, 1180, "tablet"],
  [390, 844, "mobile"],
  [390, 667, "mobile-short"],
  [320, 568, "mobile-small"],
]) {
  await p.setViewportSize({ width, height });
  await p.waitForTimeout(100);
  const state = await p.evaluate(() => {
    const el = document.querySelector(".library-main");
    return {
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      footer: document.querySelector(".upload-footer").getBoundingClientRect()
        .bottom,
      rootHeight: document.documentElement.scrollHeight,
      viewport: innerHeight,
    };
  });
  assert.ok(
    state.scrollHeight <= state.clientHeight + 1,
    `${name}: upload requires scroll ${JSON.stringify(state)}`,
  );
  assert.ok(state.footer < height, `${name}: save action clipped`);
  assert.equal(
    await p
      .locator(".library-summary,.library-browser,.library-toolbar")
      .count(),
    0,
  );
  await p.screenshot({ path: `../.impeccable/review/upload-${name}.png` });
}
await p.setViewportSize({ width: 390, height: 667 });
await p.locator(".upload-description summary").click();
await p.screenshot({
  path: "../.impeccable/review/upload-description-mobile.png",
});
await p.getByLabel("Description", { exact: false }).fill("Chapter 3 revision");
await p
  .locator("input[type=file]")
  .setInputFiles({
    name: "Pointers.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Pointers store memory addresses."),
  });
await p.getByLabel("Document title").fill("Pointers");
await p.getByLabel("Subject", { exact: true }).fill("PPWC");
await p.getByRole("combobox", { name: "Semester", exact: true }).click();
await p.getByRole("option", { name: "Semester 5", exact: true }).click();
await p.getByRole("button", { name: "Save to my library" }).click();
await p.getByRole("button", { name: /Semester 5.*1 document/ }).waitFor();
const data = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("sm-local-docs")),
);
assert.equal(data[0].description, "Chapter 3 revision");
assert.equal(data[0].semester, "5");
assert.equal(data[0].subject, "PPWC");
await p.getByRole("button", { name: "Add materials", exact: true }).click();
await p.getByRole("button", { name: "Resources", exact: true }).click();
await p.getByRole("button", { name: /Semester 5.*1 document/ }).waitFor();
await p.setViewportSize({ width: 1440, height: 900 });
await p.getByRole("button", { name: "Study space", exact: true }).click();
await p.getByRole("button", { name: "Switch to dark mode" }).click();
await p.waitForTimeout(450);
await p.screenshot({ path: "../.impeccable/review/clean-dark.png" });
await p.getByRole("button", { name: "My library", exact: true }).click();
await p.getByRole("button", { name: "Add materials", exact: true }).click();
await p.screenshot({ path: "../.impeccable/review/upload-dark.png" });
assert.deepEqual(errors, []);
console.log(
  "PASS: aligned controls; clean bento; separate Resources/upload; upload fits seven sizes; metadata and local save; return navigation; dark mode; no runtime errors.",
);
await b.close();
