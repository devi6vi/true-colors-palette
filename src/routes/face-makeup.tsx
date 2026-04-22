import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/face-makeup")({
  head: () => ({
    meta: [
      { title: "Face Shape & Makeup Analysis — Tiramisu Analysis" },
      { name: "description", content: "Identify your face shape and unlock makeup techniques, brow shapes, and contour maps tailored to you." },
      { property: "og:title", content: "Face Shape & Makeup Analysis — Tiramisu Analysis" },
      { property: "og:description", content: "Identify your face shape and unlock makeup techniques, brow shapes, and contour maps tailored to you." },
    ],
  }),
  component: FaceMakeupPage,
});

const FACE_SHAPES = [
  { name: "Oval", note: "Balanced proportions — most styles flatter." },
  { name: "Round", note: "Soft curves — contour to elongate." },
  { name: "Square", note: "Strong jaw — soften with curves & blush." },
  { name: "Heart", note: "Wider forehead — balance with lower-face emphasis." },
  { name: "Oblong", note: "Longer face — horizontal blush placement." },
  { name: "Diamond", note: "Defined cheekbones — frame brows & jaw." },
];

const MAKEUP_MODULES = [
  { title: "Contour & Highlight Map", desc: "A custom map showing where to sculpt and where to glow, based on your face shape." },
  { title: "Brow Shape Guide", desc: "Find the brow arch, thickness, and tail length that harmonizes with your features." },
  { title: "Lip Shape Analysis", desc: "Overlining, blurring, gloss placement — techniques chosen for your lip anatomy." },
  { title: "Eye Shape Techniques", desc: "Hooded, monolid, almond, downturned — eyeshadow placement that opens your eyes." },
  { title: "Blush Placement", desc: "Where to place color for lift, youth, or sculpt — calibrated to your face shape." },
  { title: "Seasonal Makeup Edit", desc: "Lipsticks, blushes, and shadows from your color season — the wearable shortlist." },
];

function FaceMakeupPage() {
  return (
    <main className="relative min-h-screen px-6 pt-32 pb-20 md:px-10">
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-20 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Face & Beauty</p>
          <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">
            Face Shape & <em className="text-accent">Makeup</em> Analysis
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-foreground/70">
            Understand the architecture of your face — then learn the makeup techniques that celebrate it.
          </p>
        </div>

        {/* Face shapes */}
        <section className="mb-20">
          <h2 className="mb-8 font-display text-3xl text-foreground md:text-4xl">The six face shapes</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FACE_SHAPES.map((f) => (
              <div key={f.name} className="rounded-3xl border border-border bg-card p-6 transition hover:shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-14 rounded-full bg-secondary/60 ring-2 ring-card"
                    style={{
                      borderRadius:
                        f.name === "Square" ? "20%" :
                        f.name === "Heart" ? "50% 50% 50% 50% / 40% 40% 60% 60%" :
                        f.name === "Diamond" ? "50% 50% 50% 50% / 30% 30% 70% 70%" :
                        f.name === "Oblong" ? "40%" :
                        "50%",
                    }}
                  />
                  <h3 className="font-display text-2xl text-foreground">{f.name}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Makeup modules */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl text-foreground md:text-4xl">What you'll get</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {MAKEUP_MODULES.map((m) => (
              <div key={m.title} className="rounded-3xl border border-border bg-card p-7">
                <h3 className="font-display text-xl text-foreground">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-[2rem] bg-primary p-10 text-center text-primary-foreground md:p-14" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h2 className="font-display text-3xl md:text-4xl">Coming soon</h2>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-85">
            Face shape & makeup analysis is in development. In the meantime, get your color season — your future makeup edit will be built on it.
          </p>
          <Link
            to="/analyze"
            className="mt-6 inline-flex rounded-full bg-cream px-7 py-3 text-sm font-medium text-mocha transition hover:opacity-90"
            style={{ background: "var(--cream)", color: "var(--mocha)" }}
          >
            Start with color →
          </Link>
        </div>
      </div>
    </main>
  );
}
