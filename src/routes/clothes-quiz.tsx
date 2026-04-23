import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import oldMoney from "@/assets/aesthetic-old-money.jpg";
import coastal from "@/assets/aesthetic-coastal.jpg";
import streetwear from "@/assets/aesthetic-streetwear.jpg";
import minimal from "@/assets/aesthetic-minimal.jpg";
import romantic from "@/assets/aesthetic-romantic.jpg";
import edgy from "@/assets/aesthetic-edgy.jpg";

export const Route = createFileRoute("/clothes-quiz")({
  head: () => ({
    meta: [
      { title: "Clothes Quiz — Tiramisu Analysis" },
      { name: "description", content: "Tell us about you and your style — we'll build a wardrobe edit around your color season." },
    ],
  }),
  component: ClothesQuizPage,
});

const BODY_SHAPES = [
  { id: "hourglass", name: "Hourglass", note: "Bust ≈ hips, defined waist" },
  { id: "pear", name: "Pear", note: "Hips wider than bust" },
  { id: "apple", name: "Apple", note: "Fuller midsection, slimmer legs" },
  { id: "rectangle", name: "Rectangle", note: "Bust ≈ waist ≈ hips" },
  { id: "inverted-triangle", name: "Inverted Triangle", note: "Shoulders wider than hips" },
];

const AESTHETICS = [
  { id: "old-money", name: "Old Money", img: oldMoney, note: "Quiet luxury, heritage tailoring" },
  { id: "coastal", name: "Coastal", img: coastal, note: "Linen, sand, sun-warmed neutrals" },
  { id: "streetwear", name: "Streetwear", img: streetwear, note: "Oversized, urban, statement" },
  { id: "minimal", name: "Minimal", img: minimal, note: "Architectural lines, monochrome" },
  { id: "romantic", name: "Romantic", img: romantic, note: "Soft, feminine, ethereal" },
  { id: "edgy", name: "Edgy", img: edgy, note: "Leather, structure, contrast" },
];

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const BUST_SIZES = ["AA", "A", "B", "C", "D", "DD", "E+"];

type Step = "intake" | "shape" | "aesthetic" | "picks" | "saving";

function ClothesQuizPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>("intake");

  // Intake
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [bust, setBust] = useState("");

  // Selections
  const [bodyShape, setBodyShape] = useState<string | null>(null);
  const [aesthetic, setAesthetic] = useState<string | null>(null);
  const [picks, setPicks] = useState<string[]>([]);

  // Color season gate (read from sessionStorage from /result)
  const colorSeason = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("hb:result");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return (parsed?.season as string) ?? null;
    } catch {
      return null;
    }
  }, []);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  // Color analysis gate
  if (!authLoading && user && !colorSeason) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-28">
        <div className="max-w-md text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">One step first</p>
          <h1 className="mt-3 font-display text-4xl text-foreground">Take your color analysis</h1>
          <p className="mt-3 text-muted-foreground">
            Your wardrobe edit builds on your color season. Complete that quiz first — it takes about a minute.
          </p>
          <Link
            to="/analyze"
            className="mt-6 inline-flex rounded-full bg-primary px-7 py-3.5 text-sm text-primary-foreground transition hover:opacity-90"
          >
            Start color analysis →
          </Link>
        </div>
      </main>
    );
  }

  const intakeValid =
    height.trim() !== "" &&
    weight.trim() !== "" &&
    gender !== "" &&
    age.trim() !== "" &&
    Number(age) > 0 &&
    Number(age) < 120;

  async function handleSave() {
    if (!user) return;
    setStep("saving");
    const { error } = await supabase
      .from("profiles")
      .update({
        height_cm: Number(height),
        weight_kg: Number(weight),
        gender,
        age: Number(age),
        bust_size: bust || null,
        body_shape: bodyShape,
        aesthetic,
        style_picks: picks,
        color_season: colorSeason,
        clothes_quiz_completed_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error(error.message);
      setStep("picks");
      return;
    }
    toast.success("Saved to your profile");
    navigate({ to: "/clothes-analysis" });
  }

  return (
    <main className="relative min-h-screen px-6 pt-32 pb-20 md:px-10" style={{ background: "var(--gradient-soft)" }}>
      <Toaster position="top-center" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Clothes Quiz</p>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
            Build your <em className="text-accent">wardrobe edit</em>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Quick quiz · {step === "intake" ? "1" : step === "shape" ? "2" : step === "aesthetic" ? "3" : "4"} of 4
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
          {step === "intake" && (
            <>
              <h2 className="font-display text-2xl text-foreground">A little about you</h2>
              <p className="mt-1 text-sm text-muted-foreground">All fields private — used only to tailor your edit.</p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Height (cm)">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="input-base"
                    placeholder="170"
                  />
                </Field>
                <Field label="Weight (kg)">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="input-base"
                    placeholder="60"
                  />
                </Field>
                <Field label="Age">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-base"
                    placeholder="28"
                  />
                </Field>
                <Field label="Gender">
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-base">
                    <option value="">Select…</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Bust size (optional)" className="sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setBust("")}
                      className={`chip ${bust === "" ? "chip-active" : ""}`}
                    >
                      Skip
                    </button>
                    {BUST_SIZES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBust(b)}
                        className={`chip ${bust === b ? "chip-active" : ""}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <NextButton disabled={!intakeValid} onClick={() => setStep("shape")}>
                Continue →
              </NextButton>
            </>
          )}

          {step === "shape" && (
            <>
              <h2 className="font-display text-2xl text-foreground">Pick your body shape</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose the silhouette that feels closest to yours.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {BODY_SHAPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBodyShape(s.id)}
                    className={`group rounded-2xl border-2 p-5 text-left transition ${
                      bodyShape === s.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <ShapeIcon id={s.id} active={bodyShape === s.id} />
                    <p className="mt-3 font-display text-lg text-foreground">{s.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between gap-3">
                <BackButton onClick={() => setStep("intake")} />
                <NextButton disabled={!bodyShape} onClick={() => setStep("aesthetic")}>Continue →</NextButton>
              </div>
            </>
          )}

          {step === "aesthetic" && (
            <>
              <h2 className="font-display text-2xl text-foreground">What's your aesthetic?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pick the one that feels most like you.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {AESTHETICS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAesthetic(a.id)}
                    className={`group overflow-hidden rounded-2xl border-2 text-left transition ${
                      aesthetic === a.id ? "border-accent" : "border-transparent hover:border-accent/50"
                    }`}
                  >
                    <img src={a.img} alt={a.name} loading="lazy" width={768} height={768} className="aspect-square w-full object-cover" />
                    <div className="bg-card p-3">
                      <p className="font-display text-base text-foreground">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground">{a.note}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between gap-3">
                <BackButton onClick={() => setStep("shape")} />
                <NextButton disabled={!aesthetic} onClick={() => setStep("picks")}>Continue →</NextButton>
              </div>
            </>
          )}

          {(step === "picks" || step === "saving") && (
            <>
              <h2 className="font-display text-2xl text-foreground">Pick the looks you love</h2>
              <p className="mt-1 text-sm text-muted-foreground">Select 2–4 outfits that resonate. Tap to toggle.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {AESTHETICS.map((a) => {
                  const on = picks.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() =>
                        setPicks((p) => (on ? p.filter((x) => x !== a.id) : [...p, a.id]))
                      }
                      className={`relative overflow-hidden rounded-2xl border-2 transition ${
                        on ? "border-accent" : "border-transparent hover:border-accent/50"
                      }`}
                    >
                      <img src={a.img} alt={a.name} loading="lazy" width={768} height={768} className="aspect-square w-full object-cover" />
                      {on && (
                        <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-between gap-3">
                <BackButton onClick={() => setStep("aesthetic")} />
                <NextButton
                  disabled={picks.length < 2 || step === "saving"}
                  onClick={handleSave}
                >
                  {step === "saving" ? "Saving…" : "Save & see my edit ✺"}
                </NextButton>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 0.625rem 0.875rem;
          font-size: 0.95rem;
          color: var(--foreground);
          transition: border-color 0.15s;
        }
        .input-base:focus { outline: none; border-color: var(--accent); }
        .chip {
          padding: 0.45rem 0.95rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          font-size: 0.85rem;
          color: var(--foreground);
          background: var(--card);
          transition: all 0.15s;
        }
        .chip:hover { border-color: color-mix(in oklab, var(--accent) 50%, transparent); }
        .chip-active {
          background: var(--accent);
          color: var(--accent-foreground);
          border-color: var(--accent);
        }
      `}</style>
    </main>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-foreground/60">{label}</span>
      {children}
    </label>
  );
}

function NextButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="ml-auto mt-8 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition disabled:opacity-40 hover:enabled:opacity-90"
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-border bg-card px-5 py-3 text-sm text-foreground/70 transition hover:bg-muted"
    >
      ← Back
    </button>
  );
}

function ShapeIcon({ id, active }: { id: string; active: boolean }) {
  const stroke = active ? "var(--accent)" : "var(--muted-foreground)";
  const fill = active ? "color-mix(in oklab, var(--accent) 15%, transparent)" : "transparent";
  const common = { stroke, fill, strokeWidth: 2, strokeLinejoin: "round" as const };
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" aria-hidden>
      {id === "hourglass" && (
        <path {...common} d="M18 8 H42 L34 36 L42 50 L46 72 H14 L18 50 L26 36 Z" />
      )}
      {id === "pear" && (
        <path {...common} d="M22 8 H38 L36 36 L48 72 H12 L24 36 Z" />
      )}
      {id === "apple" && (
        <path {...common} d="M16 8 H44 L46 30 L42 50 L40 72 H20 L18 50 L14 30 Z" />
      )}
      {id === "rectangle" && (
        <path {...common} d="M20 8 H40 L42 36 L42 72 H18 L18 36 Z" />
      )}
      {id === "inverted-triangle" && (
        <path {...common} d="M12 8 H48 L40 36 L36 72 H24 L20 36 Z" />
      )}
    </svg>
  );
}
