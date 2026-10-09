import { z } from "zod";
const short = z.string().trim().max(500);
export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Give your brand a name (at least 2 characters).")
    .max(100),
  category: short.min(2, "Add a business category."),
  audience: short.min(5, "Describe your audience."),
  personality: short.min(2, "Add a brand personality."),
  tone: short.min(2, "Choose a tone of voice."),
  vocabulary: short,
  restricted: short,
  context: z.string().trim().max(3000),
});
export type Brand = z.infer<typeof brandSchema>;
export const contentTypes = [
  "Social caption",
  "Product description",
  "Ad copy",
  "Video concept",
  "Campaign ideas",
] as const;
export const generationSchema = z.object({
  type: z.enum(contentTypes),
  brief: z
    .string()
    .trim()
    .min(10, "Add a brief of at least 10 characters.")
    .max(2000),
  tone: z.enum(["Brand voice", "More direct", "More playful", "More refined"]),
  existing: z.string().max(12000).optional(),
});
export const campaignSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000),
});
export const draftSchema = z.object({
  id: z.uuid(),
  campaign_id: z.uuid().nullable(),
  title: z.string().trim().min(1).max(150),
  type: z.enum(contentTypes),
  content: z.string().trim().min(1).max(12000),
  source: z.enum(["demo", "claude", "edited"]),
});
export type Campaign = z.infer<typeof campaignSchema>;
export type Draft = z.infer<typeof draftSchema> & { updated_at?: string };
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(20).max(4000),
  website: z.string().max(100).optional(),
});
