import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("public routes, metadata, links, accessibility, and responsive layout", async ({
  page,
  request,
}, info) => {
  for (const path of [
    "/",
    "/product",
    "/how-it-works",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/login",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/GritTruth/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({
      path:
        "docs/screenshots/" +
        info.project.name +
        (path === "/" ? "-home" : path.replaceAll("/", "-")) +
        ".png",
      fullPage: true,
    });
    const links = await page
      .locator("a[href]")
      .evaluateAll((nodes) =>
        nodes
          .map((n) => n.getAttribute("href")!)
          .filter((h) => h.startsWith("/")),
      );
    for (const link of [...new Set(links)])
      expect((await request.get(link)).status(), link).toBeLessThan(400);
  }
});
test("demo persists Brand DNA, campaigns and edited drafts; export and reset work", async ({
  page,
}, info) => {
  await page.goto("/workspace?demo=1");
  await expect(
    page.getByRole("heading", { name: "Words with a point of view." }),
  ).toBeVisible();
  const nav = page.getByRole("navigation", {
    name: info.project.name === "mobile" ? "Workspace mobile" : "Workspace",
    exact: true,
  });
  await nav.getByRole("button", { name: "Brand DNA" }).click();
  await page.getByLabel("Brand name", { exact: false }).fill("Test Brand");
  await page.getByRole("button", { name: "Save Brand DNA" }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  await page.reload();
  await nav.getByRole("button", { name: "Brand DNA" }).click();
  await expect(page.getByLabel("Brand name", { exact: false })).toHaveValue(
    "Test Brand",
  );
  await nav.getByRole("button", { name: "Campaigns", exact: true }).click();
  await page.getByLabel("Campaign name").fill("Summer stories");
  await page
    .getByLabel("A little context")
    .fill("A thoughtful summer collection");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(
    page.getByRole("heading", { name: "Summer stories" }),
  ).toBeVisible();
  await nav.getByRole("button", { name: "Content studio" }).click();
  await page
    .getByLabel("Your brief")
    .fill("Introduce our new canvas carry collection.");
  await page
    .getByLabel("Save to campaign")
    .selectOption({ label: "Summer stories" });
  await page.getByRole("button", { name: "Load sample template" }).click();
  await expect(page.getByLabel("Draft content")).toContainText("Test Brand");
  await page.getByLabel("Draft title").fill("Summer introduction");
  await page
    .getByLabel("Draft content")
    .fill("A considered introduction to our summer collection.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  await page.screenshot({
    path: "docs/screenshots/" + info.project.name + "-studio.png",
    fullPage: true,
  });
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await nav.getByRole("button", { name: "Saved drafts" }).click();
  await page
    .getByLabel("Filter by campaign")
    .selectOption({ label: "Summer stories" });
  await expect(
    page.getByRole("heading", { name: "Summer introduction" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  expect((await download).suggestedFilename()).toContain("Summer introduction");
  await page.getByRole("button", { name: "Open & edit" }).click();
  await expect(page.getByLabel("Draft content")).toHaveValue(
    "A considered introduction to our summer collection.",
  );
  await nav.getByRole("button", { name: "Campaigns", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete Summer stories", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(
    page.getByRole("heading", { name: "Summer stories" }),
  ).toHaveCount(0);
  await nav.getByRole("button", { name: "Saved drafts" }).click();
  await expect(
    page.getByRole("heading", { name: "Summer introduction" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await nav.getByRole("button", { name: "Brand DNA" }).click();
  await expect(page.getByLabel("Brand name", { exact: false })).toHaveValue(
    "Fieldwork",
  );
});
test("unconfigured services fail honestly and validation prevents empty submissions", async ({
  page,
  request,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  expect(
    await page
      .getByLabel("Your name")
      .evaluate((e: HTMLInputElement) => e.validity.valid),
  ).toBe(false);
  await page.getByLabel("Your name").fill("Alex");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page
    .getByLabel("What’s on your mind?")
    .fill("I would like to know more about this workspace.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("not connected");
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Email me a sign-in link" }),
  ).toBeDisabled();
  expect(
    (
      await request.post("/api/generate", {
        headers: { origin: "http://localhost:3000" },
        data: {
          type: "Ad copy",
          brief: "An example brief",
          tone: "Brand voice",
        },
      })
    ).status(),
  ).toBe(503);
  expect((await request.get("/auth/callback?code=invalid")).url()).toContain(
    "/login?error=expired",
  );
  expect((await request.get("/nonexistent-page")).status()).toBe(404);
});
