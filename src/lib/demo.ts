import type { Brand, Campaign, Draft } from "./schema";
export const sampleBrand: Brand = {
  name: "Fieldwork",
  category: "Everyday outdoor essentials",
  audience: "City dwellers who make room for a little outside, every day.",
  personality: "Grounded, curious, quietly confident",
  tone: "Warm, direct, a little adventurous",
  vocabulary: "Take the long way, everyday outside, made to go",
  restricted: "Game-changing, revolutionary, unleash",
  context:
    "A fictional brand for this interactive demo. Canvas carry goods for everyday adventures. No performance or sustainability claims.",
};
export const sampleCampaign: Campaign = {
  id: "a5f721b9-0cae-4aaf-a742-5b60d159264e",
  name: "Take the long way",
  description: "A fictional launch campaign for an everyday canvas tote.",
};
export const sampleDraft: Draft = {
  id: "b5f721b9-0cae-4aaf-a742-5b60d159264e",
  campaign_id: sampleCampaign.id,
  title: "A little more outside",
  type: "Social caption",
  content:
    "Close the laptop. Take the long way home.\n\nA coffee stop, a park bench, a small detour. Make a little room for outside.\n\nMeet your everyday carry. — Fieldwork",
  source: "demo",
};
export function demoOutput(type: string, brand: Brand) {
  const name = brand.name || "Your brand";
  const samples: Record<string, string> = {
    "Social caption": `A little room for the things that matter.\n\nMeet ${name}. Thoughtful everyday essentials, with a point of view all their own.\n\nTake a closer look.\n\n[Template: replace with verified product details before publishing.]`,
    "Product description": `Meet your next everyday essential from ${name}.\n\nDesigned around the moments you make your own. Add your verified materials, dimensions, care instructions and product details here.\n\n• [Verified feature]\n• [Verified feature]\n• [Care or sizing detail]`,
    "Ad copy": `HEADLINE\nMake everyday your own.\n\nBODY\nDiscover ${name}. A fresh perspective on the essentials.\n\nCTA\nExplore the collection.\n\n[Template: add an accurate product benefit.]`,
    "Video concept": `CONCEPT: A day, your way\n\n0–3s: An everyday moment. Text: “A small change of pace.”\n3–10s: Show your product in use. Focus on one real detail.\n10–15s: A quiet closing shot. Text: “Make it yours. ${name}.”\n\nProduction idea only. No video has been generated.`,
    "Campaign ideas": `1. Everyday rituals — show one real use for your product.\n2. Behind the details — explain a verified design choice.\n3. Make it yours — invite your audience to share their own routine.\n\nSample starting points for ${name}; these are templates, not AI-generated ideas.`,
  };
  return samples[type] || samples["Social caption"];
}
