import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SEASONS, type Season } from "@/lib/seasons";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Tiramisu Analysis" },
      { name: "description", content: "Your saved style profile, color palette, and analysis progress." },
    ],
  }),
  component: ProfilePage,
});

type ProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: string | null;
  age: number | null;
  body_shape: string | null;
  bust_size: string | null;
  aesthetic: string | null;
  color_season: string | null;
  clothes_quiz_completed_at: string | null;
};

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
        .select("display_name, avatar_url, height_cm, weight_kg, gender, age, body_shape, bust_size, aesthetic, color_season, clothes_quiz_completed_at")
        .eq("id", user.id)
        .maybeSingle();
      if (active) {
        setProfile((data as ProfileRow | null) ?? null);
        setNameDraft(data?.display_name ?? "");
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: dataUrl })
        .eq("id", user.id);
      if (!error) setProfile((p) => (p ? { ...p, avatar_url: dataUrl } : p));
    } finally {
      setUploading(false);
    }
  };

  const saveName = async () => {
    if (!user) return;
    const v = nameDraft.trim();
    if (!v) return;
    await supabase.from("profiles").update({ display_name: v }).eq("id", user.id);
    setProfile((p) => (p ? { ...p, display_name: v } : p));
    setEditingName(false);
  };

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-28">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const seasonKey = profile?.color_season as Season | null;
  const seasonInfo = seasonKey && SEASONS[seasonKey] ? SEASONS[seasonKey] : null;
  const initial = (profile?.display_name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <main className="relative min-h-screen px-6 pt-32 pb-20 md:px-10" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Your account</p>
          <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">
            Profile
          </h1>
        </div>

        {/* Identity card */}
        <section className="mb-8 rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-border">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-4xl text-foreground/60">{initial}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 rounded-full bg-primary px-3 py-1.5 text-[10px] uppercase tracking-wider text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-50"
              >
                {uploading ? "…" : "Edit"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              {editingName ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-lg"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={saveName} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Save</button>
                    <button onClick={() => { setEditingName(false); setNameDraft(profile?.display_name ?? ""); }} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <h2 className="font-display text-3xl text-foreground">
                    {profile?.display_name || "Unnamed"}
                  </h2>
                  <button
                    onClick={() => setEditingName(true)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:bg-muted"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Color season */}
        <section className="mb-8 rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-foreground">Color palette</h2>
            <Link
              to="/analyze"
              className="rounded-full border border-border bg-background px-5 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:bg-muted"
            >
              {seasonKey ? "Retake" : "Take quiz"}
            </Link>
          </div>
          {seasonInfo ? (
            <div className="mt-5">
              <p className="font-display text-3xl text-accent">{seasonInfo.name}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {seasonInfo.palette.map((c) => (
                  <span
                    key={c}
                    title={c}
                    className="h-12 w-12 rounded-lg ring-1 ring-border"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No color analysis yet.</p>
          )}
        </section>

        {/* Style profile */}
        <section className="rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-foreground">Style profile</h2>
            <Link
              to="/clothes-quiz"
              className="rounded-full border border-border bg-background px-5 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:bg-muted"
            >
              {profile?.clothes_quiz_completed_at ? "Edit" : "Take quiz"}
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Height" value={profile?.height_cm ? `${profile.height_cm} cm` : "—"} />
            <Stat label="Weight" value={profile?.weight_kg ? `${profile.weight_kg} kg` : "—"} />
            <Stat label="Age" value={profile?.age?.toString() ?? "—"} />
            <Stat label="Gender" value={cap(profile?.gender)} />
            <Stat label="Body shape" value={cap(profile?.body_shape)} />
            <Stat label="Bust size" value={profile?.bust_size ?? "—"} />
            <Stat label="Aesthetic" value={cap(profile?.aesthetic)} accent />
          </div>
        </section>
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

function cap(s: string | null | undefined): string {
  if (!s) return "—";
  return s.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}
