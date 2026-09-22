"use client";

import Link from "next/link";
import { useState } from "react";

const QUICK = [
  "Where is the restroom?",
  "What time is the Registrar open?",
  "Is there Wi-Fi?",
  "Where is the clinic?",
  "How do I use the QR?",
];

export function Assistant() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<{
    answer: string;
    code?: string;
    confidence: number;
  } | null>(null);

  async function ask(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setReply(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text }),
      });
      const data = await res.json();
      setReply(data);
    } catch {
      setReply({
        answer: "Cannot reach the GABAY server right now. Please try again shortly.",
        confidence: 0,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-2 border-hud/40 bg-ink p-5 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hud opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-hud" />
        </span>
        <p className="label text-hud">Gabay · Information Assistant</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask away — e.g. “Where is the IT Room?”"
          className="focus-ring min-w-0 flex-1 border-2 border-hud/40 bg-glass px-4 py-3.5 font-mono2 text-[0.95rem] text-paper placeholder:text-paper/40 focus:border-hud"
        />
        <button
          type="submit"
          disabled={busy}
          className="focus-ring hud-btn border-2 border-hud bg-hud px-6 py-3.5 text-sm font-extrabold tracking-wider text-ink disabled:opacity-50"
        >
          {busy ? "THINKING…" : "ASK"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQ(s);
              ask(s);
            }}
            className="focus-ring hud-btn border border-paper/25 px-3 py-1.5 text-[0.75rem] text-paper/75 hover:border-hud hover:text-hud"
          >
            {s}
          </button>
        ))}
      </div>

      {reply && (
        <div className="snap-in mt-6 border-l-4 border-hud bg-glass p-5">
          <p className="label text-hud/80">
            Answer · confidence {Math.round((reply.confidence ?? 0) * 100)}%
          </p>
          <p className="mt-2 text-[1.05rem] leading-relaxed text-paper">
            {reply.answer}
          </p>
          {reply.code && (
            <Link
              href={`/ar?to=${reply.code}`}
              className="focus-ring hud-btn mt-4 inline-block bg-hud px-4 py-2 text-[0.8rem] font-extrabold tracking-wide text-ink"
            >
              ROUTE ME THERE →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
