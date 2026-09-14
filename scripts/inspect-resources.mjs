import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3700/resources");
  await expect(page.getByText("Connected", { exact: true })).toBeVisible({
    timeout: 30000,
  });
  await expect(page.locator("tbody tr")).toHaveCount(4, { timeout: 30000 });
  await page
    .getByRole("button", { name: "License types", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(13);
  await page
    .getByRole("button", { name: "Business activities", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(589);
  await page
    .getByRole("button", { name: "Licensing statistics", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Permit application stages" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/arenahub-resources.png",
    fullPage: true,
  });
  await page.goto("http://localhost:3700/host");
  await page
    .getByLabel("Play location", { exact: true })
    .selectOption("In person");
  await page
    .getByRole("button", { name: "Load live council references" })
    .click();
  await expect(
    page.getByLabel("Council zone", { exact: true }).locator("option"),
  ).toHaveCount(5, { timeout: 30000 });
  await page
    .getByLabel("Council zone", { exact: true })
    .selectOption({ index: 1 });
  await page.screenshot({
    path: "test-results/arenahub-host.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
  console.log(
    "Live resource screens passed: 4 zones, 13 types, 589 activities, separate statistics pipelines, and host zone selection.",
  );
} finally {
  await browser.close();
}
