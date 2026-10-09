"use client";
import { useEffect, useRef, useState } from "react";
import { ZodError } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AudioLines,
  PenLine,
  Layers3,
  Files,
  FlaskConical,
  Copy,
  Download,
  Save,
  Plus,
  Trash2,
  LogOut,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "./brand-mark";
import {
  brandSchema,
  campaignSchema,
  draftSchema,
  generationSchema,
  contentTypes,
  type Brand,
  type Campaign,
  type Draft,
} from "@/lib/schema";
import {
  sampleBrand,
  sampleCampaign,
  sampleDraft,
  demoOutput,
} from "@/lib/demo";
import { browserDb } from "@/lib/supabase/browser";
type Tab = "studio" | "brand" | "campaigns" | "drafts";
type State = { brand: Brand; campaigns: Campaign[]; drafts: Draft[] };
const emptyBrand: Brand = {
  name: "",
  category: "",
  audience: "",
  personality: "",
  tone: "Warm and direct",
  vocabulary: "",
  restricted: "",
  context: "",
};
const tabs: { id: Tab; label: string; icon: typeof PenLine }[] = [
  { id: "studio", label: "Content studio", icon: PenLine },
  { id: "brand", label: "Brand DNA", icon: AudioLines },
  { id: "campaigns", label: "Campaigns", icon: Layers3 },
  { id: "drafts", label: "Saved drafts", icon: Files },
];
const key = "grittruth-demo-v1";
function download(filename: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename.replace(/[^a-z0-9._ -]/gi, "").slice(0, 100) || "grittruth.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function api(path: string, options?: RequestInit) {
  const response = await fetch(path, options);
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error || "Unable to complete this action.");
  return body;
}
export function Workspace({
  mode,
  email,
}: {
  mode: "demo" | "account";
  email?: string;
}) {
  const router = useRouter();
  const isDemo = mode === "demo";
  const [tab, setTab] = useState<Tab>("studio"),
    [data, setData] = useState<State>({
      brand: isDemo ? sampleBrand : emptyBrand,
      campaigns: [],
      drafts: [],
    });
  const [brand, setBrand] = useState<Brand>(isDemo ? sampleBrand : emptyBrand),
    [ready, setReady] = useState(false),
    [loadError, setLoadError] = useState(""),
    [ai, setAi] = useState(false);
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [type, setType] = useState<(typeof contentTypes)[number]>("Social caption"),
    [tone, setTone] = useState("Brand voice"),
    [brief, setBrief] = useState(""),
    [output, setOutput] = useState(""),
    [title, setTitle] = useState(""),
    [campaign, setCampaign] = useState(""),
    [draftId, setDraftId] = useState<string | null>(null),
    [source, setSource] = useState<Draft["source"]>("demo");
  const [filter, setFilter] = useState(""),
    [confirm, setConfirm] = useState<{
      kind: "campaign" | "draft" | "reset";
      id?: string;
    } | null>(null);
  const dirty = useRef(false);
  const brandDirty = useRef(false);
  const pending = useRef(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        let next: State;
        if (isDemo) {
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            next = {
              brand: brandSchema.parse(parsed.brand),
              campaigns: campaignSchema.array().parse(parsed.campaigns),
              drafts: draftSchema.array().parse(parsed.drafts),
            };
          } else
            next = {
              brand: sampleBrand,
              campaigns: [sampleCampaign],
              drafts: [sampleDraft],
            };
        } else {
          const result = await api("/api/workspace");
          next = {
            brand: result.brand || emptyBrand,
            campaigns: result.campaigns,
            drafts: result.drafts,
          };
          if (active) setAi(result.aiAvailable);
        }
        if (active) {
          setData(next);
          setBrand(next.brand);
          setReady(true);
        }
      } catch {
        if (active)
          setLoadError(
            isDemo
              ? "Your browser’s demo data could not be read. Clear it to start again, or allow browser storage."
              : "Your workspace could not be loaded. Reload to try again.",
          );
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [isDemo]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current || brandDirty.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const notify = (e: unknown) =>
    setNotice(
      e instanceof ZodError
        ? e.issues[0].message
        : e instanceof Error
          ? e.message
          : "Something went wrong. Try again.",
    );
  async function persist(
    next: State,
    kind: "brand" | "campaign" | "draft",
    item: Brand | Campaign | Draft,
  ) {
    if (isDemo) localStorage.setItem(key, JSON.stringify(next));
    else
      await api("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, data: item }),
      });
    setData(next);
  }
  async function run(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setNotice("");
    try {
      await action();
    } catch (e) {
      notify(e);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  function navigate(next: Tab) {
    setTab(next);
    setNotice("");
  }
  function openDraft(d: Draft) {
    if (
      dirty.current &&
      !window.confirm("Replace the unsaved draft in the studio?")
    )
      return;
    setOutput(d.content);
    setTitle(d.title);
    setType(d.type);
    setCampaign(d.campaign_id || "");
    setDraftId(d.id);
    setSource(d.source);
    dirty.current = false;
    setTab("studio");
    setNotice("");
  }
  function newDraft() {
    if (
      dirty.current &&
      !window.confirm("Discard changes to the current draft?")
    )
      return;
    setOutput("");
    setTitle("");
    setDraftId(null);
    dirty.current = false;
    setNotice("");
  }
  async function generate() {
    await run(async () => {
      if (
        dirty.current &&
        !window.confirm("Replace the unsaved draft with a new result?")
      )
        return;
      const input = generationSchema.parse({
        type,
        brief,
        tone,
        existing: output || undefined,
      });
      if (isDemo || !ai) {
        setOutput(demoOutput(type, data.brand));
        setSource("demo");
        setNotice(
          "Sample template loaded. It uses the brand name only; the brief and tone are not processed by AI.",
        );
      } else {
        const result = await api("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        setOutput(result.content);
        setSource("claude");
        if (result.truncated)
          setNotice(
            "This draft reached the response limit. Review or regenerate with a shorter brief.",
          );
      }
      setTitle(type + " — " + (data.brand.name || "Untitled brand"));
      setDraftId(null);
      dirty.current = true;
    });
  }
  async function saveDraft() {
    await run(async () => {
      const draft = draftSchema.parse({
        id: draftId || crypto.randomUUID(),
        campaign_id: campaign || null,
        title,
        type,
        content: output,
        source,
      });
      const next = {
        ...data,
        drafts: [draft, ...data.drafts.filter((d) => d.id !== draft.id)],
      };
      await persist(next, "draft", draft);
      setDraftId(draft.id);
      dirty.current = false;
      setNotice(
        isDemo
          ? "Draft saved in this browser."
          : "Draft saved to your account.",
      );
    });
  }
  async function remove() {
    if (!confirm) return;
    await run(async () => {
      if (confirm.kind === "reset") {
        localStorage.removeItem(key);
        setData({
          brand: sampleBrand,
          campaigns: [sampleCampaign],
          drafts: [sampleDraft],
        });
        setBrand(sampleBrand);
        setOutput("");
        setTitle("");
        setDraftId(null);
        setCampaign("");
        setFilter("");
        setReady(true);
        setLoadError("");
        dirty.current = false;
        brandDirty.current = false;
      } else {
        const next = {
          ...data,
          campaigns:
            confirm.kind === "campaign"
              ? data.campaigns.filter((c) => c.id !== confirm.id)
              : data.campaigns,
          drafts: data.drafts.filter((d) =>
            confirm.kind === "draft"
              ? d.id !== confirm.id
              : d.campaign_id !== confirm.id,
          ),
        };
        if (isDemo) localStorage.setItem(key, JSON.stringify(next));
        else
          await api("/api/workspace", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(confirm),
          });
        setData(next);
        if (confirm.kind === "campaign" && campaign === confirm.id)
          setCampaign("");
        if (confirm.kind === "campaign" && filter === confirm.id) setFilter("");
        if (draftId && !next.drafts.some((d) => d.id === draftId)) {
          setDraftId(null);
          dirty.current = Boolean(output);
        }
      }
      setConfirm(null);
      setNotice("Done. Your workspace has been updated.");
    });
  }
  const nav = tabs.map((t) => (
    <button
      key={t.id}
      type="button"
      disabled={busy}
      aria-current={tab === t.id ? "page" : undefined}
      onClick={() => navigate(t.id)}
    >
      <t.icon size={18} />
      {t.label}
    </button>
  ));
  if (loadError)
    return (
      <main id="main-content" className="error-page">
        <h1>Let’s reconnect.</h1>
        <p role="alert">{loadError}</p>
        {isDemo ? (
          <button
            className="button"
            onClick={() => {
              try {
                localStorage.removeItem(key);
                window.location.reload();
              } catch {
                setLoadError(
                  "Browser storage is disabled. Enable it to use the demo.",
                );
              }
            }}
          >
            Clear demo data and retry
          </button>
        ) : (
          <button className="button" onClick={() => window.location.reload()}>
            Reload workspace
          </button>
        )}
        <Link href="/">Back home</Link>
      </main>
    );
  if (!ready)
    return (
      <main id="main-content" className="loading-state">
        <div role="status">
          <div className="spinner" />
          <p>Opening your workspace…</p>
        </div>
      </main>
    );
  return (
    <div className="workspace">
      <aside className="workspace-sidebar">
        <Link className="wordmark" href="/">
          <BrandMark />
          grittruth.
        </Link>
        <div className="workspace-brand">
          <div className="avatar">
            {data.brand.name.slice(0, 1).toLowerCase() || "g"}.
          </div>
          <div>
            <strong>{data.brand.name || "Your brand"}</strong>
            <span>{isDemo ? "Demo workspace" : "Your workspace"}</span>
          </div>
        </div>
        <nav className="workspace-nav" aria-label="Workspace">
          {nav}
        </nav>
        <div className="workspace-sidebar-bottom">
          <Link href="/contact">Help & feedback</Link>
          {isDemo ? (
            <>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => setConfirm({ kind: "reset" })}
              >
                Reset demo
              </button>
              <Link href="/login">Create an account</Link>
            </>
          ) : (
            <>
              <span className="workspace-account">{email}</span>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    if (
                      (dirty.current || brandDirty.current) &&
                      !window.confirm("Sign out and discard unsaved edits?")
                    )
                      return;
                    const db = browserDb();
                    const result = await db?.auth.signOut();
                    if (result?.error) throw result.error;
                    dirty.current = false;
                    brandDirty.current = false;
                    router.replace("/login");
                    router.refresh();
                  })
                }
              >
                <LogOut size={14} />
                Sign out
              </button>
            </>
          )}
        </div>
      </aside>
      <main id="main-content" className="workspace-main">
        <div className="workspace-topbar">
          <span className="eyebrow">
            WORKSPACE / {tabs.find((t) => t.id === tab)?.label.toUpperCase()}
          </span>
          <span className="pill">
            {isDemo
              ? "Interactive demo"
              : ai
                ? "Claude connected"
                : "Sample content mode"}
          </span>
        </div>
        <nav className="workspace-tabs-mobile" aria-label="Workspace mobile">
          {nav}
        </nav>
        {(isDemo || !ai) && (
          <div className="demo-banner">
            <FlaskConical size={18} />
            <p>
              <strong>
                {isDemo
                  ? "A real workspace. Sample content."
                  : "AI isn’t connected yet."}
              </strong>{" "}
              {isDemo
                ? "Edits stay in this browser. Sample templates are not generated by Claude."
                : "Your account stores your work. The studio provides labeled sample templates until Claude is connected."}
            </p>
            {isDemo && <Link href="/login">Use an account</Link>}
          </div>
        )}
        <div className="workspace-title">
          <div>
            <span className="eyebrow">
              {tab === "brand"
                ? "YOUR STARTING POINT"
                : tab === "campaigns"
                  ? "THE BIGGER PICTURE"
                  : tab === "drafts"
                    ? "A LITTLE PROGRESS, SAVED"
                    : "LET’S MAKE SOMETHING"}
            </span>
            <h1>
              {tab === "brand"
                ? "The DNA behind your words."
                : tab === "campaigns"
                  ? "Keep your ideas connected."
                  : tab === "drafts"
                    ? "Your words, in progress."
                    : "Words with a point of view."}
            </h1>
            <p>
              {tab === "brand"
                ? "Define what makes your brand sound like you. Save your profile before generating."
                : tab === "campaigns"
                  ? "Give your next launch, collection, or idea a place to take shape."
                  : tab === "drafts"
                    ? "Pick up where you left off. Refine, organize, and make it yours."
                    : "A clear brief. Your brand’s perspective. A better place to start."}
            </p>
          </div>
          <span className="pill neutral">
            {data.brand.name || "Brand DNA not saved"}
          </span>
        </div>
        {notice && (
          <p className="feedback workspace-feedback" role="status">
            {notice}
          </p>
        )}
        {confirm && (
          <div className="confirm-panel" role="alert">
            <p>
              {confirm.kind === "reset"
                ? "Reset all browser-local demo work to the sample brand? This cannot be undone."
                : confirm.kind === "campaign"
                  ? "Delete this campaign and all drafts saved inside it? This cannot be undone."
                  : "Delete this saved draft? This cannot be undone."}
            </p>
            <button
              disabled={busy}
              className="button danger small"
              onClick={remove}
            >
              Confirm delete
            </button>
            <button
              className="button secondary small"
              onClick={() => setConfirm(null)}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        )}
        {tab === "brand" && (
          <form
            className="brand-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                const valid = brandSchema.parse(brand);
                await persist({ ...data, brand: valid }, "brand", valid);
                brandDirty.current = false;
                setNotice(
                  isDemo
                    ? "Brand DNA saved in this browser."
                    : "Brand DNA saved to your account.",
                );
              });
            }}
          >
            <div className="form-grid">
              {(
                [
                  {
                    key: "name",
                    label: "Brand name",
                    hint: "The name behind your work.",
                    max: 100,
                  },
                  {
                    key: "category",
                    label: "Business category",
                    hint: "What you make or do.",
                    max: 500,
                  },
                  {
                    key: "audience",
                    label: "Target audience",
                    hint: "Who you’re speaking to and what they care about.",
                    max: 500,
                  },
                  {
                    key: "personality",
                    label: "Brand personality",
                    hint: "A few traits that make you recognizable.",
                    max: 500,
                  },
                  {
                    key: "tone",
                    label: "Tone of voice",
                    hint: "How your brand sounds in conversation.",
                    max: 500,
                  },
                  {
                    key: "vocabulary",
                    label: "Preferred vocabulary",
                    hint: "Words and phrases you want to make your own.",
                    max: 500,
                  },
                  {
                    key: "restricted",
                    label: "Words to avoid",
                    hint: "Phrases that don’t belong in your brand’s world.",
                    max: 500,
                  },
                  {
                    key: "context",
                    label: "Product context",
                    hint: "Verified product details. Leave out claims you can’t support.",
                    max: 3000,
                  },
                ] as {
                  key: keyof Brand;
                  label: string;
                  hint: string;
                  max: number;
                }[]
              ).map((field) => (
                <label
                  key={field.key}
                  className={field.key === "context" ? "span-2" : ""}
                >
                  {field.label}
                  {field.key === "context" || field.key === "audience" ? (
                    <textarea
                      rows={3}
                      maxLength={field.max}
                      value={brand[field.key]}
                      disabled={busy}
                      required={field.key === "audience"}
                      onChange={(e) => {
                        setBrand({ ...brand, [field.key]: e.target.value });
                        brandDirty.current = true;
                      }}
                    />
                  ) : (
                    <input
                      maxLength={field.max}
                      value={brand[field.key]}
                      disabled={busy}
                      required={
                        !["vocabulary", "restricted"].includes(field.key)
                      }
                      onChange={(e) => {
                        setBrand({ ...brand, [field.key]: e.target.value });
                        brandDirty.current = true;
                      }}
                    />
                  )}
                  <span>{field.hint}</span>
                </label>
              ))}
            </div>
            <div className="form-actions">
              <p>
                {isDemo
                  ? "Saved only in this browser."
                  : "Saved privately to your account."}{" "}
                Avoid sensitive information.
              </p>
              <button className="button" disabled={busy}>
                <Save size={16} />
                {busy ? "Saving…" : "Save Brand DNA"}
              </button>
            </div>
          </form>
        )}
        {tab === "studio" && (
          <div className="studio-grid">
            <form
              className="studio-controls"
              onSubmit={(e) => {
                e.preventDefault();
                void generate();
              }}
            >
              <h2>Give your idea a direction.</h2>
              <label>
                Content format
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  disabled={busy}
                >
                  {contentTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Your brief
                <textarea
                  rows={5}
                  value={brief}
                  minLength={10}
                  maxLength={2000}
                  required
                  disabled={busy}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="What are we making? Include the product, the moment, and what you want people to do."
                />
              </label>
              <label>
                Tone adjustment
                <select
                  value={tone}
                  disabled={busy}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {[
                    "Brand voice",
                    "More direct",
                    "More playful",
                    "More refined",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Save to campaign
                <select
                  value={campaign}
                  disabled={busy}
                  onChange={(e) => {
                    setCampaign(e.target.value);
                    if (output) dirty.current = true;
                  }}
                >
                  <option value="">No campaign</option>
                  {data.campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button" disabled={busy}>
                <Sparkles size={16} />
                {busy
                  ? "Working…"
                  : isDemo || !ai
                    ? "Load sample template"
                    : output
                      ? "Regenerate draft"
                      : "Generate draft"}
              </button>
              <p className="fine-print">
                {isDemo || !ai
                  ? "Sample mode: templates use your brand name only. Brief and tone controls are applied only in connected AI mode."
                  : "Your saved Brand DNA, brief, and current draft are sent to Claude. Review all facts before publishing. Limit: 30 attempts per UTC day."}
              </p>
              <button
                className="text-link"
                type="button"
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  justifySelf: "start",
                }}
                onClick={() => navigate("brand")}
              >
                Review your Brand DNA
              </button>
            </form>
            <section className="studio-output" aria-label="Draft editor">
              <div className="output-toolbar">
                <span className="tiny">YOUR DRAFT</span>
                <span className="pill neutral">
                  {output
                    ? source === "demo"
                      ? "Sample template"
                      : source === "claude"
                        ? "Claude draft"
                        : "Edited draft"
                    : "Ready when you are"}
                </span>
              </div>
              {output || title || draftId ? (
                <div className="output-editor">
                  <label>
                    Draft title
                    <input
                      maxLength={150}
                      value={title}
                      disabled={busy}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        dirty.current = true;
                      }}
                    />
                  </label>
                  <label>
                    Draft content
                    <textarea
                      rows={10}
                      maxLength={12000}
                      value={output}
                      disabled={busy}
                      onChange={(e) => {
                        setOutput(e.target.value);
                        if (source === "claude") setSource("edited");
                        dirty.current = true;
                      }}
                    />
                  </label>
                  <div className="output-actions">
                    <button
                      className="button"
                      disabled={busy || !output.trim()}
                      onClick={saveDraft}
                    >
                      <Save size={14} />
                      Save draft
                    </button>
                    <button
                      className="button secondary"
                      onClick={() =>
                        run(async () => {
                          await navigator.clipboard.writeText(output);
                          setNotice("Draft copied to clipboard.");
                        })
                      }
                      disabled={busy}
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() =>
                        download(title + ".txt", title + "\n\n" + output)
                      }
                    >
                      <Download size={14} />
                      Export
                    </button>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={newDraft}
                    >
                      <Plus size={14} />
                      New
                    </button>
                  </div>
                  <p className="fine-print">
                    {source === "demo"
                      ? "This is sample copy, not AI output. Edit freely and verify details before use."
                      : "You’re the final editor. Check claims, product facts, and rights before publishing."}{" "}
                    Changes are saved only when you choose Save draft.
                  </p>
                </div>
              ) : (
                <div className="output-empty">
                  <PenLine size={35} strokeWidth={1.25} />
                  <h2>A blank page, with potential.</h2>
                  <p>
                    Choose a format and add your brief. Your next draft starts
                    here.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
        {tab === "campaigns" && (
          <>
            <form
              className="campaign-create"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fields = new FormData(form);
                void run(async () => {
                  const c = campaignSchema.parse({
                    id: crypto.randomUUID(),
                    name: fields.get("name"),
                    description: fields.get("description"),
                  });
                  await persist(
                    { ...data, campaigns: [c, ...data.campaigns] },
                    "campaign",
                    c,
                  );
                  form.reset();
                  setNotice("Campaign created.");
                });
              }}
            >
              <label>
                Campaign name
                <input
                  name="name"
                  placeholder="A new collection, a fresh start…"
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={busy}
                />
              </label>
              <label>
                A little context
                <input
                  name="description"
                  placeholder="What is this campaign about?"
                  maxLength={1000}
                  disabled={busy}
                />
              </label>
              <button className="button" disabled={busy}>
                <Plus size={16} />
                Create campaign
              </button>
            </form>
            {data.campaigns.length ? (
              <div className="campaign-grid">
                {data.campaigns.map((c) => (
                  <article className="campaign-card" key={c.id}>
                    <div className="campaign-card-top">
                      <Layers3 size={22} />
                      <span className="pill neutral">
                        {
                          data.drafts.filter((d) => d.campaign_id === c.id)
                            .length
                        }{" "}
                        drafts
                      </span>
                    </div>
                    <h2>{c.name}</h2>
                    <p>{c.description || "A new space for your ideas."}</p>
                    <div className="card-actions">
                      <button
                        className="button small"
                        onClick={() => {
                          setFilter(c.id);
                          navigate("drafts");
                        }}
                      >
                        View drafts
                      </button>
                      <button
                        className="button secondary small"
                        disabled={busy}
                        onClick={() => {
                          if (
                            dirty.current &&
                            !window.confirm("Replace the unsaved studio draft?")
                          )
                            return;
                          setCampaign(c.id);
                          setType("Campaign ideas");
                          setBrief(
                            "Develop campaign ideas for " +
                              c.name +
                              ". " +
                              c.description,
                          );
                          setOutput("");
                          setDraftId(null);
                          dirty.current = false;
                          navigate("studio");
                        }}
                      >
                        Develop ideas
                      </button>
                      <button
                        className="icon-button"
                        title="Export campaign"
                        aria-label={"Export " + c.name}
                        onClick={() =>
                          download(
                            c.name + ".txt",
                            c.name +
                              "\n" +
                              c.description +
                              "\n\n" +
                              data.drafts
                                .filter((d) => d.campaign_id === c.id)
                                .map((d) => d.title + "\n" + d.content)
                                .join("\n\n---\n\n"),
                          )
                        }
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="icon-button"
                        disabled={busy}
                        title="Delete campaign"
                        aria-label={"Delete " + c.name}
                        onClick={() =>
                          setConfirm({ kind: "campaign", id: c.id })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="workspace-empty">
                <h2>Give your next idea a home.</h2>
                <p>
                  Create your first campaign above, then bring its drafts
                  together.
                </p>
              </div>
            )}
          </>
        )}
        {tab === "drafts" && (
          <>
            <label className="draft-filter">
              Filter by campaign
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All drafts</option>
                <option value="none">No campaign</option>
                {data.campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="draft-list">
              {data.drafts
                .filter(
                  (d) =>
                    !filter ||
                    (filter === "none" && !d.campaign_id) ||
                    d.campaign_id === filter,
                )
                .map((d) => (
                  <article className="draft-card" key={d.id}>
                    <header>
                      <span className="tiny">{d.type.toUpperCase()}</span>
                      <span className="pill neutral">
                        {d.source === "demo"
                          ? "Sample content"
                          : d.source === "claude"
                            ? "Claude draft"
                            : "Edited draft"}
                      </span>
                    </header>
                    <h2>{d.title}</h2>
                    <p>{d.content}</p>
                    <span className="save-note">
                      {data.campaigns.find((c) => c.id === d.campaign_id)
                        ?.name || "No campaign"}
                    </span>
                    <div className="output-actions">
                      <button
                        className="button small"
                        onClick={() => openDraft(d)}
                      >
                        Open & edit
                      </button>
                      <button
                        className="button secondary small"
                        onClick={() =>
                          download(
                            d.title + ".txt",
                            d.title + "\n\n" + d.content,
                          )
                        }
                      >
                        <Download size={14} />
                        Export
                      </button>
                      <button
                        className="icon-button"
                        disabled={busy}
                        aria-label={"Delete " + d.title}
                        onClick={() => setConfirm({ kind: "draft", id: d.id })}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
            </div>
            {!data.drafts.some(
              (d) =>
                !filter ||
                (filter === "none" && !d.campaign_id) ||
                d.campaign_id === filter,
            ) && (
              <div className="workspace-empty">
                <h2>A place for your next good line.</h2>
                <p>Save a draft from the studio to see it here.</p>
                <button className="button" onClick={() => navigate("studio")}>
                  Open the studio
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
