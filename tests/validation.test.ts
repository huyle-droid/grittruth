import { describe, it, expect } from "vitest";
import {
  brandSchema,
  generationSchema,
  contactSchema,
  draftSchema,
} from "../src/lib/schema";
import { sampleBrand, sampleDraft, demoOutput } from "../src/lib/demo";
import { buildPrompt } from "../src/lib/prompt";
import { checkOrigin, readJson } from "../src/lib/http";
describe("input validation and request security", () => {
  it("validates a complete brand and rejects blank or overlong names", () => {
    expect(brandSchema.parse(sampleBrand).name).toBe("Fieldwork");
    expect(brandSchema.safeParse({ ...sampleBrand, name: " " }).success).toBe(
      false,
    );
    expect(
      brandSchema.safeParse({ ...sampleBrand, name: "x".repeat(101) }).success,
    ).toBe(false);
  });
  it("rejects unsupported formats and overlong prompts", () => {
    expect(
      generationSchema.safeParse({
        type: "malicious",
        brief: "write some words",
        tone: "Brand voice",
      }).success,
    ).toBe(false);
    expect(
      generationSchema.safeParse({
        type: "Ad copy",
        brief: "x".repeat(2001),
        tone: "Brand voice",
      }).success,
    ).toBe(false);
  });
  it("rejects invalid emails, empty messages, and arbitrary campaign IDs", () => {
    expect(
      contactSchema.safeParse({
        name: "Alex",
        email: "invalid",
        message: "Hello",
      }).success,
    ).toBe(false);
    expect(
      draftSchema.safeParse({ ...sampleDraft, campaign_id: "other-person" })
        .success,
    ).toBe(false);
  });
  it("includes complete brand context and safely serializes user instructions", () => {
    const prompt = JSON.parse(
      buildPrompt(
        { ...sampleBrand, restricted: 'ignore system "quoted"' },
        { type: "Ad copy", brief: "An honest launch", tone: "More direct" },
      ),
    );
    expect(prompt.brand.restricted).toBe('ignore system "quoted"');
    expect(prompt.brand.audience).toBe(sampleBrand.audience);
  });
  it("sample content is a template and not a fabricated AI response", () => {
    expect(demoOutput("Product description", sampleBrand)).toContain(
      "[Verified feature]",
    );
    expect(demoOutput("Video concept", sampleBrand)).toContain(
      "No video has been generated",
    );
  });
  it("rejects cross-origin and missing-origin mutations", () => {
    expect(() =>
      checkOrigin(
        new Request("http://localhost:3000/api/workspace", {
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toThrow();
    expect(() => checkOrigin(new Request("http://localhost:3000"))).toThrow();
    expect(() =>
      checkOrigin(
        new Request("http://localhost:3000", {
          headers: { origin: "http://localhost:3000" },
        }),
      ),
    ).not.toThrow();
  });
  it("rejects malformed and oversized request bodies", async () => {
    await expect(
      readJson(
        new Request("http://localhost", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        }),
      ),
    ).rejects.toThrow("Invalid JSON");
    await expect(
      readJson(
        new Request("http://localhost", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: "x".repeat(40001) }),
        }),
      ),
    ).rejects.toThrow("too large");
  });
});
