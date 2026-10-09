import { requireUser } from "@/lib/auth";
import { apiError, checkOrigin, readJson, json, HttpError } from "@/lib/http";
import { brandSchema, campaignSchema, draftSchema } from "@/lib/schema";
import { z } from "zod";
export async function GET() {
  try {
    const { db, user } = await requireUser();
    const [b, c, d] = await Promise.all([
      db
        .from("brands")
        .select(
          "name,category,audience,personality,tone,vocabulary,restricted,context",
        )
        .eq("user_id", user.id)
        .maybeSingle(),
      db
        .from("campaigns")
        .select("id,name,description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      db
        .from("drafts")
        .select("id,campaign_id,title,type,content,source,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
    ]);
    if (b.error || c.error || d.error)
      throw new HttpError(
        503,
        "Workspace unavailable. Please try again shortly.",
      );
    return json({
      brand: b.data,
      campaigns: c.data,
      drafts: d.data,
      aiAvailable: Boolean(process.env.ANTHROPIC_API_KEY),
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function PUT(request: Request) {
  try {
    checkOrigin(request);
    const { db, user } = await requireUser();
    const body = await readJson(request);
    const kind = z.enum(["brand", "campaign", "draft"]).parse(body.kind);
    const data =
      kind === "brand"
        ? brandSchema.parse(body.data)
        : kind === "campaign"
          ? campaignSchema.parse(body.data)
          : draftSchema.parse(body.data);
    if (kind === "draft" && "campaign_id" in data && data.campaign_id) {
      const { data: campaign } = await db
        .from("campaigns")
        .select("id")
        .eq("id", data.campaign_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!campaign)
        throw new HttpError(400, "Select a campaign in your workspace.");
    }
    const table =
      kind === "brand"
        ? "brands"
        : kind === "campaign"
          ? "campaigns"
          : "drafts";
    const { error } = await db
      .from(table)
      .upsert(
        { ...data, user_id: user.id },
        { onConflict: kind === "brand" ? "user_id" : "id" },
      );
    if (error)
      throw new HttpError(
        400,
        "Could not save this item. Check the content and try again.",
      );
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const { db, user } = await requireUser();
    const body = await readJson(request);
    const kind = z.enum(["draft", "campaign"]).parse(body.kind);
    const id = z.uuid().parse(body.id);
    const { error } = await db
      .from(kind === "draft" ? "drafts" : "campaigns")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new HttpError(400, "Could not delete this item.");
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
