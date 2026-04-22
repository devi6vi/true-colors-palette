import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/quizzes")({
  head: () => ({
    meta: [
      { title: "Fashion & Aesthetic Quizzes — Tiramisu Analysis" },
      { name: "description", content: "Discover your style identity with curated quizzes on fashion, aesthetics, and personal taste." },
      { property: "og:title", content: "Fashion & Aesthetic Quizzes — Tiramisu Analysis" },
      { property: "og:description", content: "Discover your style identity with curated quizzes on fashion, aesthetics, and personal taste." },
    ],
  }),
  component: QuizzesPage,
});

const QUIZZES = [
  { title: "Style Aesthetic", desc: "Coquette, old money, clean girl, dark academia — find your true aesthetic.", tag: "Aesthetic", time: "3 min" },
  { title: "Kibbe Body Type", desc: "Discover your Kibbe archetype to dress in harmony with your natural lines.", tag: "Body", time: "5 min" },
  { title: "Style Essence", desc: "Romantic, classic, dramatic, gamine, natural — what energy do you carry?", tag: "Essence", time: "4 min" },
  { title: "Wardrobe Capsule", desc: "Build a 30-piece capsule wardrobe tailored to your lifestyle.", tag: "Wardrobe", time: "6 min" },
  { title: "Print & Pattern", desc: "Find which prints, patterns and textures suit your personality.", tag: "Texture", time: "3 min" },
  { title: "Jewelry Metal", desc: "Gold, silver, rose — discover your most flattering metal tone.", tag: "Accessory", time: "2 min" },
];

function QuizzesPage() {
  return (
    <main className="relative min-h-screen px-6 pt-32 pb-20 md:px-10" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Discover Yourself</p>
          <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">
            Fashion & <em className="text-accent">Aesthetic</em> Quizzes
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-foreground/70">
            A growing library of quizzes to help you understand your style, your essence, and the way you want to be seen.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {QUIZZES.map((q) => (
            <article
              key={q.title}
              className="group flex flex-col rounded-3xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary/60 px-3 py-1 text-[10px] uppercase tracking-widest text-foreground/70">
                  {q.tag}
                </span>
                <span className="text-xs text-muted-foreground">{q.time}</span>
              </div>
              <h2 className="mt-5 font-display text-2xl text-foreground">{q.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{q.desc}</p>
              <button
                type="button"
                disabled
                className="mt-6 w-fit rounded-full border border-border bg-background px-5 py-2 text-xs uppercase tracking-widest text-foreground/60"
              >
                Coming soon
              </button>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] border border-border bg-card p-8 text-center md:p-12">
          <h2 className="font-display text-3xl text-foreground md:text-4xl">Already know your season?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Pair your color palette with a style quiz for a complete personal aesthetic profile.
          </p>
          <Link
            to="/analyze"
            className="mt-6 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Begin color analysis →
          </Link>
        </div>
      </div>
    </main>
  );
}
