import { test, expect } from "@playwright/test";

test("discover, filter, bookmark, and restore on refresh", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your next win starts here." }),
  ).toBeVisible();
  await expect(page.locator(".competition-card")).toHaveCount(6);
  await page
    .getByRole("button", {
      name: "Save Counter-Strike Community Clash",
      exact: true,
    })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Unsave Counter-Strike Community Clash",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByLabel("Search competitions", { exact: true })
    .fill("no-matching-game");
  await expect(
    page.getByRole("heading", { name: "No competitions match just yet." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Registration", { exact: true }).selectOption("Full");
  await expect(page.locator(".competition-card")).toHaveCount(1);
  await expect(page.locator(".competition-card")).toContainText(
    "Last Squad Standing",
  );
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".competition-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/arenahub-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(
    await page
      .locator(".hero-art")
      .evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
});

test("solo registration persists and can be withdrawn", async ({ page }) => {
  await page.goto("/competitions/arena-5");
  await page
    .getByRole("button", { name: "Join competition", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("I accept the competition rules").check();
  await page.getByRole("button", { name: "Confirm registration" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Your registration is")).toContainText(
    "confirmed",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Withdraw registration" }),
  ).toBeVisible();
  await page.goto("/my-competitions");
  await expect(page.locator(".entry-row")).toContainText("Boost & Beyond Cup");
  await page.getByRole("button", { name: "Withdraw", exact: true }).click();
  await expect(page.locator(".entry-row .status-chip")).toHaveText("withdrawn");
});

test("team entry rejects duplicate players and submits for host approval", async ({
  page,
}) => {
  await page.goto("/competitions/arena-2");
  await page.getByRole("button", { name: "Join competition" }).click();
  await page.getByLabel("Team name", { exact: true }).fill("Night Owls");
  for (let i = 2; i <= 5; i++)
    await page
      .getByLabel(`Player ${i} username`, { exact: true })
      .fill(i === 2 ? "Alex#2048" : `Player${i}`);
  await page.getByLabel("I accept the competition rules").check();
  await page.getByRole("button", { name: "Submit for approval" }).click();
  await expect(
    page.locator("[role=alert]:not(#__next-route-announcer__)"),
  ).toContainText("unique");
  await page.getByLabel("Player 2 username").fill("Nova#22");
  await page.getByRole("button", { name: "Submit for approval" }).click();
  await expect(page.getByText("Your registration is")).toContainText("pending");
  await expect(
    page.getByRole("button", { name: "Join competition", exact: true }),
  ).toHaveCount(0);
  await page.goto("/competitions/arena-4");
  await expect(
    page.getByRole("button", { name: "Join competition" }),
  ).toBeDisabled();
  await page.goto("/competitions/arena-6");
  await expect(
    page.getByRole("button", { name: "Join competition" }),
  ).toBeDisabled();
});

test("host creates a draft, publishes, reviews an entry, and cancels", async ({
  page,
}) => {
  await page.goto("/host");
  await page
    .getByLabel("Competition title", { exact: true })
    .fill("Friday Night Test Cup");
  await page
    .getByLabel("Description", { exact: true })
    .fill(
      "A community competition for testing the complete hosting experience.",
    );
  await page.getByLabel("Review and approve registrations").check();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByText("Your draft is saved.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.goto("/dashboard");
  await expect(page.locator(".host-row")).toContainText(
    "Friday Night Test Cup",
  );
  await page.getByRole("button", { name: "Edit draft", exact: true }).click();
  await page.getByRole("button", { name: "Preview competition" }).click();
  await expect(page.locator(".preview-panel")).toContainText(
    "Friday Night Test Cup",
  );
  await page
    .getByRole("button", { name: "Publish competition", exact: true })
    .click();
  await expect(
    page.getByText("Your arena is open.", { exact: true }),
  ).toBeVisible();
  await page.goto("/competitions");
  await page
    .getByLabel("Search competitions", { exact: true })
    .fill("Friday Night Test Cup");
  await expect(page.locator(".competition-card")).toHaveCount(1);
  // Simulate an incoming entry in local storage; the demo has no shared backend.
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem("arenahub.demo.v1")!);
    const event = data.competitions.find(
      (e: { title: string }) => e.title === "Friday Night Test Cup",
    );
    data.registrations.push({
      id: "incoming-demo",
      competitionId: event.id,
      userId: "other-player",
      name: "Guest Player",
      roster: ["Guest#17"],
      status: "pending",
    });
    localStorage.setItem("arenahub.demo.v1", JSON.stringify(data));
  });
  await page.reload();
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Manage registrations" }).click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.locator(".registration-review .status-chip")).toHaveText(
    "confirmed",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Cancel event", exact: true }).click();
  await page
    .getByLabel("Cancellation reason", { exact: true })
    .fill("Venue maintenance");
  await page
    .getByRole("button", { name: "Cancel competition", exact: true })
    .click();
  await expect(page.locator(".host-row")).toContainText("Venue maintenance");
  await page.reload();
  await expect(page.locator(".host-row .status-chip")).toHaveText("cancelled");
});

test("mobile navigation, modal keyboard behavior, and horizontal fit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".competition-card")).toHaveCount(6);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/arenahub-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("link", { name: "My competitions", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your first competition is waiting." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "About this demo" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/host");
  await expect(
    page.getByLabel("Competition title", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("Rebana handles rate limits and unavailable references explicitly", async ({
  page,
}) => {
  await page.route("**/api/sandbox/ping", (route) =>
    route.fulfill({
      status: 429,
      json: {
        code: "SANDBOX_RATE_LIMITED",
        message: "Rate limit reached.",
        retryAfterSeconds: 2,
      },
    }),
  );
  await page.goto("/resources");
  await expect(
    page.locator("[role=alert]:not(#__next-route-announcer__)"),
  ).toContainText("Rate limit reached.");
  await expect(page.getByRole("button", { name: /Retry in/ })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Refresh live data" }),
  ).toBeEnabled({ timeout: 6000 });
  await page.route("**/api/sandbox/ping", (route) =>
    route.fulfill({
      status: 503,
      json: { message: "Council references are not configured." },
    }),
  );
  await page.getByRole("button", { name: "Refresh live data" }).click();
  await expect(
    page.locator("[role=alert]:not(#__next-route-announcer__)"),
  ).toContainText("not configured");
  await expect(page.getByText("Unavailable", { exact: true })).toBeVisible();
});

test("proxy denies undocumented writes and invalid paging", async ({
  request,
}) => {
  expect((await request.get("/api/sandbox/not-allowed")).status()).toBe(404);
  expect((await request.get("/api/sandbox/zones?limit=0")).status()).toBe(400);
  expect(
    (await request.post("/api/sandbox/zones", { data: {} })).status(),
  ).toBe(405);
});
