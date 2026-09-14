import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
page.on("console", (e) => {
  if (["error", "warning"].includes(e.type()))
    console.log("CONSOLE", e.text().slice(0, 1500));
});
page.on("requestfailed", (r) =>
  console.log("REQUEST FAILED", r.url(), r.failure()),
);
await page.goto("http://localhost:3700");
await page.waitForTimeout(4000);
console.log("HEADING", await page.locator("main").innerText());
console.log(
  "STORAGE",
  await page.evaluate(() => !!localStorage.getItem("arenahub.demo.v1")),
);
await page.screenshot({ path: "test-results/inspection.png", fullPage: true });
await browser.close();
