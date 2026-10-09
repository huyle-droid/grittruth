"use client";
import { useState } from "react";
export function ContactForm() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [ok, setOk] = useState(false);
  return (
    <form
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        setOk(false);
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        try {
          const r = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const body = await r.json();
          setMessage(r.ok ? body.message : body.error);
          setOk(r.ok);
          if (r.ok) form.reset();
        } catch {
          setMessage("Connection problem. Please email contact@grittruth.com.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Your name
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          placeholder="Alex Morgan"
        />
      </label>
      <label>
        Email address
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@yourbrand.com"
        />
      </label>
      <label>
        What’s on your mind?
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={6}
          placeholder="Tell us about your brand, a question, or an idea…"
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="fine-print">
        Your message and contact details are used to respond to your inquiry.{" "}
        <a href="/privacy">Read our privacy policy.</a>
      </p>
      <button className="button" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
      {message && (
        <p className={ok ? "feedback success" : "feedback"} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
