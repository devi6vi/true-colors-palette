import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SEASONS, type Season } from "@/lib/seasons";
import quizBodyType from "@/assets/quiz-body-type.jpg";
import quizCapsule from "@/assets/quiz-capsule.jpg";
import quizFabric from "@/assets/quiz-fabric.jpg";
import quizPrint from "@/assets/quiz-print.jpg";
import quizFormulas from "@/assets/quiz-formulas.jpg";
import quizSeasonal from "@/assets/quiz-seasonal.jpg";

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

const QUIZZES = [
  { slug: "body-type", title: "Body Type Mapping", desc: "Identify your proportions and the silhouettes that balance them.", img: quizBodyType, tag: "Silhouette", time: "4 min", questions: 8, tall: true },
  { slug: "capsule", title: "Capsule Wardrobe", desc: "Build a 30-piece capsule around your lifestyle and palette.", img: quizCapsule, tag: "Wardrobe", time: "6 min", questions: 12 },
  { slug: "fabric", title: "Fabric & Texture", desc: "Which weights, weaves and drapes harmonize with your frame.", img: quizFabric, tag: "Material", time: "3 min", questions: 6 },
  { slug: "print", title: "Print & Pattern", desc: "Scale and motif recommendations that complement your features.", img: quizPrint, tag: "Pattern", time: "3 min", questions: 7, tall: true },
  { slug: "formulas", title: "Outfit Formulas", desc: "Repeatable outfit equations for work, weekend and evening.", img: quizFormulas, tag: "Styling", time: "5 min", questions: 10 },
  { slug: "seasonal", title: "Seasonal Edit", desc: "Pieces tied to your color season for an effortless wardrobe.", img: quizSeasonal, tag: "Season", time: "4 min", questions: 8 },
];

type ProfileRow = {
  height_cm: number | null;
  weight_kg: number | null;
  gender: string | null;
  age: number | null;
  body_shape: string | null;
  bust_size: string | null;
  aesthetic: string | null;
  style_picks: string[] | null;
  color_season: string | null;
  clothes_quiz_completed_at: string | null;
};

function ClothesAnalysisPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const sessionSeason = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("hb:result");
      if (!raw) return null;
      return (JSON.parse(raw)?.season as string) ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("height_cm, weight_kg, gender, age, body_shape, bust_size, aesthetic, style_picks, color_season, clothes_quiz_completed_at")
        .eq("id", user.id)
        .maybeSingle();
      if (active) {
        setProfile((data as ProfileRow | null) ?? null);
        setLoadingProfile(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading, navigate]);

  if (authLoading || loadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-28">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  // Gate 1: must have completed color analysis
  const hasColor = Boolean(sessionSeason || profile?.color_season);
  if (!hasColor) {
    return (
      <Gate
        eyebrow="Step 1 of 2"
        title="Start with your color season"
        body="Your wardrobe edit is built around the colors that flatter you. Take the color analysis first — it takes about a minute."
        cta={{ to: "/analyze", label: "Start color analysis →" }}
      />
    );
  }

  // Gate 2: must have completed clothes quiz
  const completed = Boolean(profile?.clothes_quiz_completed_at);
  if (!completed) {
    return (
      <Gate
        eyebrow="Step 2 of 2"
        title="Take the quick clothes quiz"
        body="Five quick questions about your body and style — then we'll build your wardrobe edit."
        cta={{ to: "/clothes-quiz", label: "Begin clothes quiz →" }}
        secondary={
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-foreground/50">
            Color season detected · {sessionSeason || profile?.color_season}
          </p>
        }
      />
    );
  }

  // Completed → show summary
  const seasonKey = (profile?.color_season || sessionSeason) as Season | null;
  const seasonInfo = seasonKey && SEASONS[seasonKey] ? SEASONS[seasonKey] : null;

  return (
    <main className="relative min-h-screen px-6 pt-32 pb-20 md:px-10" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Your wardrobe edit</p>
          <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">
            Clothes <em className="text-accent">Analysis</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-foreground/70">
            Built from your color season, body shape, and aesthetic preferences.
          </p>
        </div>

        {/* Saved profile summary */}
        <section className="mb-12 rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl text-foreground">Your style profile</h2>
            <Link
              to="/clothes-quiz"
              className="rounded-full border border-border bg-background px-5 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:bg-muted"
            >
              Edit
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Color season" value={seasonInfo?.name ?? seasonKey ?? "—"} accent />
            <Stat label="Body shape" value={cap(profile?.body_shape)} />
            <Stat label="Aesthetic" value={cap(profile?.aesthetic)} />
            <Stat label="Height / Weight" value={`${profile?.height_cm ?? "—"} cm · ${profile?.weight_kg ?? "—"} kg`} />
            <Stat label="Age" value={profile?.age?.toString() ?? "—"} />
            <Stat label="Gender" value={profile?.gender ?? "—"} />
            {profile?.bust_size && <Stat label="Bust" value={profile.bust_size} />}
          </div>

          {seasonInfo && (
            <div className="mt-6 rounded-2xl bg-muted/40 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Your wardrobe palette</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {seasonInfo.palette.map((c) => (
                  <span
                    key={c}
                    title={c}
                    className="h-10 w-10 rounded-lg ring-1 ring-border"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Style quizzes</p>
            <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">Go deeper, one quiz at a time</h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-muted-foreground md:block">
            Each quiz refines a different layer of your wardrobe — take them in any order.
          </p>
        </div>

        <div className="grid auto-rows-[200px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {QUIZZES.map((q, i) => (
            <Link
              key={q.slug}
              to="/clothes-analysis"
              className={`group relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-petal)] ${q.tall ? "row-span-2" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <img
                src={q.img}
                alt={q.title}
                loading="lazy"
                width={1024}
                height={1024}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute left-5 top-5 flex items-center gap-2">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground backdrop-blur">
                  {q.tag}
                </span>
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
                  {q.time}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl leading-tight text-white drop-shadow-md md:text-3xl">
                  {q.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/85">{q.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">{q.questions} questions</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground transition-all group-hover:gap-2.5 group-hover:bg-white group-hover:text-foreground">
                    Take quiz
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">{label}</p>
      <p className={`mt-1.5 font-display text-lg ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function Gate({
  eyebrow,
  title,
  body,
  cta,
  secondary,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: { to: string; label: string };
  secondary?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-28" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">{body}</p>
        <Link
          to={cta.to}
          className="mt-7 inline-flex rounded-full bg-primary px-7 py-3.5 text-sm text-primary-foreground transition hover:opacity-90"
        >
          {cta.label}
        </Link>
        {secondary}
      </div>
    </main>
  );
}

function cap(s: string | null | undefined): string {
  if (!s) return "—";
  return s.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}
