import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/clothes-analysis")({
  head: () => ({
    meta: [
      { title: "Clothes Analysis — Tiramisu Analysis" },
      { name: "description", content: "Discover silhouettes, fabrics, and styling that flatter your body and personal aesthetic." },
      { property: "og:title", content: "Clothes Analysis — Tiramisu Analysis" },
      { property: "og:description", content: "Discover silhouettes, fabrics, and styling that flatter your body and personal aesthetic." },
    ],
  }),
  component: ClothesAnalysisPage,
});

const MODULES = [
  { title: "Body Type Mapping", desc: "Identify your proportions and the silhouettes that balance them." },
  { title: "Capsule Wardrobe", desc: "A curated 30-piece capsule built around your lifestyle and palette." },
  { title: "Fabric & Texture Guide", desc: "Which weights, weaves, and drapes harmonize with your frame." },
  { title: "Print & Pattern Edit", desc: "Scale and motif recommendations that complement your features." },
  { title: "Outfit Formulas", desc: "Repeatable outfit equations for work, weekend, and evening." },
  { title: "Seasonal Style Edit", desc: "Pieces tied to your color season for an effortless wardrobe." },
];

function ClothesAnalysisPage() {
  return (
    <main className="relative min-h-screen px-6 pt-32 pb-20 md:px-10" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Wardrobe & Style</p>
          <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">
            Clothes <em className="text-accent">Analysis</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-foreground/70">
            Dress in harmony with your body, your colors, and the energy you want to project.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <article key={m.title} className="rounded-3xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
              <h2 className="font-display text-xl text-foreground">{m.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] bg-primary p-10 text-center text-primary-foreground md:p-14" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h2 className="font-display text-3xl md:text-4xl">Coming soon</h2>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-85">
            Clothes analysis is in development. Begin with your color season — your wardrobe edit will build on it.
          </p>
          <Link
            to="/analyze"
            className="mt-6 inline-flex rounded-full px-7 py-3 text-sm font-medium transition hover:opacity-90"
            style={{ background: "var(--cream)", color: "var(--mocha)" }}
          >
            Start with color →
          </Link>
        </div>
      </div>
    </main>
  );
}
