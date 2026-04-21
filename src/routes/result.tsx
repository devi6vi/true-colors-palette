import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { SEASONS, type Season, type Undertone } from "@/lib/seasons";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Your Color Season · Tiramisu Analysis" },
      { name: "description", content: "Your personalized 12-season color palette." },
      { property: "og:title", content: "Your Color Season · Tiramisu Analysis" },
      { property: "og:description", content: "Your personalized 12-season color palette." },
    ],
  }),
  component: Result,
});

interface StoredResult {
  season: Season;
  confidence: number;
  reasoning: string;
  photo: string;
  undertone: Undertone;
}

function Result() {
  const [data, setData] = useState<StoredResult | null>(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function generatePng(): Promise<string | null> {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#faf6f1",
    });
  }

  async function handleDownload() {
    try {
      setBusy(true);
      const url = await generatePng();
      if (!url || !data) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `tiramisu-${data.season}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    try {
      setBusy(true);
      const url = await generatePng();
      if (!url || !data) return;
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `tiramisu-${data.season}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Tiramisu Color Analysis",
          text: `I'm a ${SEASONS[data.season].name}!`,
        });
      } else {
        handleDownload();
      }
    } catch {
      // user cancelled or unsupported
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("hb:result");
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-28">
        <div className="max-w-md text-center">
          <h1 className="font-display text-4xl text-foreground">No analysis yet</h1>
          <p className="mt-3 text-muted-foreground">Start your color journey to see results here.</p>
          <Link
            to="/analyze"
            className="mt-6 inline-flex rounded-full bg-primary px-7 py-3.5 text-sm text-primary-foreground"
          >
            Begin analysis →
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-28">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const info = SEASONS[data.season];

  return (
    <main className="min-h-screen px-6 pt-28 pb-20 md:px-10" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-5xl">
        {/* Hero result card */}
        <section
          className="relative overflow-hidden rounded-[2.5rem] p-8 text-center md:p-16"
          style={{
            background: `linear-gradient(135deg, ${info.palette[0]}33, ${info.palette[3] || info.palette[1]}55)`,
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/60">You are a</p>
          <h1 className="mt-3 font-display text-6xl italic text-foreground md:text-8xl">{info.name}</h1>
          <p className="mt-3 font-display text-xl text-accent md:text-2xl">{info.tagline}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-widest text-foreground/70">
            <span>Family · {info.family}</span>
            <span>Undertone · {info.undertone}</span>
            <span>Confidence · {Math.round(data.confidence * 100)}%</span>
          </div>

          {/* Palette ribbon */}
          <div className="mx-auto mt-10 flex max-w-2xl gap-1.5">
            {info.palette.map((c, i) => (
              <span key={i} className="h-16 flex-1 rounded-lg shadow-sm" style={{ background: c }} />
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <img src={data.photo} alt="You" className="aspect-square w-full object-cover" />
            <div className="p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Your photo</p>
              <p className="mt-1 font-display text-lg text-foreground capitalize">{data.undertone} undertone</p>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Why this season</p>
            <p className="mt-3 font-display text-2xl leading-snug text-foreground">{info.description}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{data.reasoning}</p>
          </div>
        </section>

        {/* Characteristics + Avoid */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="font-display text-2xl text-foreground">Your characteristics</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {info.characteristics.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-accent">✺</span> {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="font-display text-2xl text-foreground">Colors to avoid</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {info.avoid.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-accent">⊘</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Full palette grid */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-2xl text-foreground">Your wardrobe palette</h2>
          <p className="text-sm text-muted-foreground">Build your closet, makeup, and accessories around these.</p>
          <div className="mt-6 grid grid-cols-4 gap-3 md:grid-cols-8">
            {info.palette.map((c) => (
              <div key={c} className="space-y-1.5">
                <div className="aspect-square rounded-xl shadow-sm" style={{ background: c }} />
                <p className="text-center font-mono text-[10px] text-muted-foreground">{c.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/analyze"
            className="rounded-full border border-border bg-card px-6 py-3 text-sm text-foreground transition hover:bg-muted"
          >
            Re-analyze
          </Link>
          <Link
            to="/"
            className="rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground transition hover:opacity-90"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
