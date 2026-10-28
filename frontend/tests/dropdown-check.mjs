import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:3000");
await page.getByRole("combobox", { name: "Filter by document type" }).click();
await page.getByRole("option", { name: "All types", exact: true }).waitFor();
await page.waitForTimeout(200);
await page.screenshot({
  path: "../.impeccable/review/smoke-dropdown-light.png",
  fullPage: false,
});
await page.getByRole("option", { name: "All types", exact: true }).focus();
await page.keyboard.press("ArrowDown");
await page.waitForTimeout(100);
await page.keyboard.press("Enter");
assert.match(
  await page
    .getByRole("combobox", { name: "Filter by document type" })
    .textContent(),
  /Lecture notes/,
);
await page.getByRole("button", { name: "Switch to dark mode" }).click();
await page.waitForTimeout(250);
await page.getByRole("combobox", { name: "Filter by document type" }).click();
await page.waitForTimeout(200);
await page.screenshot({
  path: "../.impeccable/review/smoke-dropdown-dark.png",
  fullPage: false,
});
await page.keyboard.press("Escape");
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("combobox", { name: "Filter by document type" }).click();
await page.waitForTimeout(200);
await page.screenshot({
  path: "../.impeccable/review/smoke-dropdown-mobile.png",
  fullPage: false,
});
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
await page.keyboard.press("Escape");
assert.deepEqual(errors, []);
console.log(
  "PASS: styled dropdowns, keyboard selection, Escape, themes and mobile overflow",
);
await browser.close();
