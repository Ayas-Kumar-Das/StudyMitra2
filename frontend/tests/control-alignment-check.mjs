import { chromium } from "playwright";
import assert from "node:assert/strict";
const b = await chromium.launch({ channel: "msedge", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://127.0.0.1:3000");
await p.waitForTimeout(250);
const check = async (name) => {
  await p.waitForTimeout(450);
  const m = await p.evaluate(() => {
    const r = (s) => {
      const a = document.querySelector(s).getBoundingClientRect();
      return { left: a.left, right: a.right, width: a.width, height: a.height };
    };
    return {
      focus: r(".focus-toggle"),
      explain: r(".mode"),
      tools: r(".theme-profile"),
      filter: r('[aria-label="Filter by document type"]'),
      modes: r(".mode-bar"),
      filters: r(".study-toolbar .filters"),
      root: document.documentElement.scrollWidth,
      viewport: innerWidth,
    };
  });
  assert.ok(
    Math.abs(m.focus.left - m.explain.left) < 1,
    `${name}: focus/explain alignment`,
  );
  assert.ok(
    Math.abs(m.tools.right - m.filter.right) < 1,
    `${name}: profile/filter right alignment`,
  );
  assert.ok(
    Math.abs(m.tools.width - m.filter.width) < 1,
    `${name}: profile/filter width`,
  );
  if (m.viewport > 1100)
    assert.ok(
      m.filters.left - m.modes.right >= 31,
      `${name}: insufficient toolbar gap`,
    );
  assert.equal(m.root, m.viewport);
  await p.screenshot({ path: `../.impeccable/review/alignment-${name}.png` });
  console.log(name, m);
};
await p.getByRole("button", { name: "Exam Prep", exact: true }).waitFor();
await check("desktop");
await p.setViewportSize({ width: 1920, height: 900 });
await check("wide");
await p.getByRole("button", { name: "Focus mode" }).click();
await check("focus");
await p.getByRole("button", { name: "Switch to dark mode" }).click();
await check("dark");
await p.getByRole("button", { name: "Open profile" }).click();
await p.getByRole("dialog", { name: "Your profile" }).waitFor();
await p.getByLabel("Display name").fill("Aman");
await p.getByRole("button", { name: "Save profile" }).click();
await p.getByRole("button", { name: "Open profile" }).click();
assert.equal(await p.getByLabel("Display name").inputValue(), "Aman");
await p.screenshot({ path: "../.impeccable/review/alignment-profile.png" });
await p.keyboard.press("Escape");
await p.getByRole("button", { name: "Focus mode" }).click();
await p.setViewportSize({ width: 820, height: 1180 });
await check("tablet");
for (const width of [390, 320]) {
  await p.setViewportSize({ width, height: 844 });
  await p.waitForTimeout(150);
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth),
    width,
  );
  await p.getByRole("button", { name: "Open profile" }).click();
  await p.getByRole("dialog", { name: "Your profile" }).waitFor();
  await p.keyboard.press("Escape");
  await p.screenshot({
    path: `../.impeccable/review/alignment-mobile-${width}.png`,
  });
}
await p.reload();
await p.getByRole("button", { name: "Open profile" }).click();
assert.equal(await p.getByLabel("Display name").inputValue(), "Aman");
assert.deepEqual(errors, []);
console.log(
  "PASS: exact tool alignment, filter-matched profile width, shorter mode strip and gap, both themes/focus, profile save/persistence, phone overflow.",
);
await b.close();
