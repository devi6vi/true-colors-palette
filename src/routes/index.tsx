import { createFileRoute, Link } from "@tanstack/react-router";
import { SEASONS } from "@/lib/seasons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tiramisu Analysis — Find your 12-season color palette" },
      { name: "description", content: "Upload a daylight selfie and discover your true 12-season color palette in minutes." },
      { property: "og:title", content: "Tiramisu Analysis — Find your 12-season color palette" },
      { property: "og:description", content: "Upload a daylight selfie and discover your true 12-season color palette in minutes." },
    ],
  }),
  component: Home,
});

const FAMILIES = ["Spring", "Summer", "Autumn", "Winter"] as const;

function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* HERO */}
      <section
        className="relative flex min-h-screen items-center px-6 pt-32 pb-20 md:px-10"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-secondary/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-foreground/70 backdrop-blur">
              ✺ 12-Season Color Analysis
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
              Find the colors <br />
              you were <em className="text-accent">born</em> to wear.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/75 md:text-lg">
              Upload a natural-light selfie, share your undertone, and we&apos;ll reveal your
              true season — complete with a curated palette to live in.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/analyze"
                className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition hover:translate-y-[-2px]"
              >
                Discover my season →
              </Link>
              <a href="#how" className="text-sm text-foreground/70 underline-offset-4 hover:underline">
                How it works
              </a>
            </div>
            <div className="mt-10 flex items-center gap-3">
              {["#E29CA1", "#E5C0BF", "#F4EFD9", "#98A57A", "#6E5F4D"].map((c) => (
                <span
                  key={c}
                  className="h-9 w-9 rounded-full ring-2 ring-card/60"
                  style={{ background: c }}
                />
              ))}
              <span className="ml-2 text-xs uppercase tracking-widest text-foreground/60">Today&apos;s palette</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <div className="absolute inset-0 rotate-3 rounded-[2rem] bg-card shadow-[var(--shadow-petal)]" />
              <div className="absolute inset-0 -rotate-2 rounded-[2rem] bg-secondary/60" />
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-card p-6"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="grid w-full grid-cols-4 gap-2">
                  {Object.values(SEASONS).slice(0, 4).flatMap((s) => s.palette.slice(0, 4)).map((c, i) => (
                    <span
                      key={i}
                      className="aspect-square rounded-lg"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-4 rounded-2xl bg-card px-5 py-3 shadow-[var(--shadow-soft)]">
                <p className="font-display text-lg italic text-accent">True Summer</p>
                <p className="text-[11px] uppercase tracking-widest text-foreground/60">Cool · Soft · Medium</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">The Process</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Three small steps. One true palette.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Upload daylight photo", d: "A clear selfie taken in natural light — no makeup, no filter." },
              { n: "02", t: "Check your undertone", d: "Look at your wrist veins. Green = warm, blue/purple = cool, both = neutral." },
              { n: "03", t: "Receive your palette", d: "AI maps you to one of 12 seasons with a tailored color wardrobe." },
            ].map((s) => (
              <div key={s.n} className="rounded-3xl border border-border bg-card p-8 transition hover:shadow-[var(--shadow-soft)]">
                <span className="font-display text-5xl italic text-accent">{s.n}</span>
                <h3 className="mt-4 font-display text-2xl text-foreground">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEASONS PREVIEW */}
      <section className="px-6 py-24 md:px-10" style={{ background: "var(--gradient-soft)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Twelve Seasons</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">A spectrum to belong to.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FAMILIES.map((family) => {
              const seasons = Object.values(SEASONS).filter((s) => s.family === family);
              return (
                <div key={family} className="rounded-3xl border border-border bg-card p-6">
                  <h3 className="font-display text-2xl italic text-foreground">{family}</h3>
                  <div className="mt-4 space-y-4">
                    {seasons.map((s) => (
                      <div key={s.name}>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <div className="mt-1.5 flex gap-1">
                          {s.palette.slice(0, 6).map((c, i) => (
                            <span key={i} className="h-5 flex-1 rounded-sm" style={{ background: c }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-28 md:px-10">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] bg-primary p-12 text-center text-primary-foreground md:p-16"
          style={{ boxShadow: "var(--shadow-soft)" }}>
          <h2 className="font-display text-4xl md:text-5xl">Ready to bloom?</h2>
          <p className="mt-4 text-base opacity-80">Two minutes. One photo. A wardrobe of confidence.</p>
          <Link
            to="/analyze"
            className="mt-8 inline-flex rounded-full bg-cream px-8 py-3.5 text-sm font-medium text-mocha transition hover:opacity-90"
            style={{ background: "var(--cream)", color: "var(--mocha)" }}
          >
            Begin analysis →
          </Link>
        </div>
      </section>

      <footer className="px-6 pb-10 text-center text-xs text-muted-foreground md:px-10">
        Hue &amp; Bloom · A personal color story
      </footer>
    </main>
  );
}
