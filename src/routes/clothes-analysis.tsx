import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SEASONS, type Season } from "@/lib/seasons";

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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <article key={m.title} className="rounded-3xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
              <h2 className="font-display text-xl text-foreground">{m.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] bg-primary p-10 text-center text-primary-foreground md:p-14" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h2 className="font-display text-3xl md:text-4xl">Detailed edit coming soon</h2>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-85">
            Your full personalized wardrobe edit — capsule pieces, outfit formulas, and shoppable picks — is in development.
          </p>
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
