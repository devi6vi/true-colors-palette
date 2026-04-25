import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

import hourglass1 from "@/assets/outfit-hourglass-1.jpg";
import hourglass2 from "@/assets/outfit-hourglass-2.jpg";
import pear1 from "@/assets/outfit-pear-1.jpg";
import pear2 from "@/assets/outfit-pear-2.jpg";
import apple1 from "@/assets/outfit-apple-1.jpg";
import apple2 from "@/assets/outfit-apple-2.jpg";
import rect1 from "@/assets/outfit-rectangle-1.jpg";
import rect2 from "@/assets/outfit-rectangle-2.jpg";
import inv1 from "@/assets/outfit-inverted-1.jpg";
import inv2 from "@/assets/outfit-inverted-2.jpg";

export const Route = createFileRoute("/quiz/body-type")({
  head: () => ({
    meta: [
      { title: "Body Type Mapping — Tiramisu Analysis" },
      { name: "description", content: "Upload a full-body photo and pick outfits you love — we'll map your silhouette and save your edit." },
    ],
  }),
  component: BodyTypeQuiz,
});

type ShapeId = "hourglass" | "pear" | "apple" | "rectangle" | "inverted-triangle";

const SHAPES: { id: ShapeId; name: string; note: string }[] = [
  { id: "hourglass", name: "Hourglass", note: "Bust ≈ hips, defined waist" },
  { id: "pear", name: "Pear", note: "Hips wider than bust" },
  { id: "apple", name: "Apple", note: "Fuller midsection, slimmer legs" },
  { id: "rectangle", name: "Rectangle", note: "Bust ≈ waist ≈ hips" },
  { id: "inverted-triangle", name: "Inverted Triangle", note: "Shoulders wider than hips" },
];

type Outfit = { id: string; img: string; tag: string; shapes: ShapeId[] };

const OUTFITS: Outfit[] = [
  { id: "wrap-dress", img: hourglass1, tag: "Wrap dress · defined waist", shapes: ["hourglass", "pear"] },
  { id: "silk-trousers", img: hourglass2, tag: "Silk blouse · belted trousers", shapes: ["hourglass", "rectangle"] },
  { id: "a-line-skirt", img: pear1, tag: "A-line midi · structured top", shapes: ["pear", "hourglass"] },
  { id: "boatneck-bootcut", img: pear2, tag: "Boat-neck · bootcut denim", shapes: ["pear", "inverted-triangle"] },
  { id: "peplum", img: apple1, tag: "Peplum top · straight pants", shapes: ["apple", "rectangle"] },
  { id: "duster", img: apple2, tag: "Long duster · monochrome base", shapes: ["apple", "rectangle"] },
  { id: "ruffle-paperbag", img: rect1, tag: "Ruffled blouse · paperbag pant", shapes: ["rectangle", "inverted-triangle"] },
  { id: "shirtdress", img: rect2, tag: "Belted shirtdress", shapes: ["rectangle", "hourglass"] },
  { id: "v-wide-leg", img: inv1, tag: "Soft V-neck · wide-leg", shapes: ["inverted-triangle", "apple"] },
  { id: "midi-tank", img: inv2, tag: "Flowy midi · fitted tank", shapes: ["inverted-triangle", "pear"] },
];

type Step = "upload" | "shape" | "picks" | "saving";

function BodyTypeQuiz() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [shape, setShape] = useState<ShapeId | null>(null);
  const [picks, setPicks] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  // Preload existing if any
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("body_image_url, body_shape, body_type_result, body_type_outfit_picks")
        .eq("id", user.id)
        .maybeSingle();
      if (!active || !data) return;
      if (data.body_image_url) setImageDataUrl(data.body_image_url);
      const existing = (data.body_type_result || data.body_shape) as ShapeId | null;
      if (existing) setShape(existing);
      if (data.body_type_outfit_picks) setPicks(data.body_type_outfit_picks);
    })();
    return () => { active = false; };
  }, [user]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image must be under 6 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const togglePick = (id: string) => {
    setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const save = async () => {
    if (!user || !shape) return;
    setStep("saving");
    const { error } = await supabase
      .from("profiles")
      .update({
        body_image_url: imageDataUrl,
        body_shape: shape,
        body_type_result: shape,
        body_type_outfit_picks: picks,
        body_type_completed_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      setStep("picks");
      return;
    }
    toast.success("Body type saved to your profile");
    setTimeout(() => navigate({ to: "/clothes-analysis" }), 600);
  };

  const filteredOutfits = shape ? OUTFITS.filter((o) => o.shapes.includes(shape)) : OUTFITS;

  const stepIndex = step === "upload" ? 1 : step === "shape" ? 2 : 3;

  return (
    <main className="min-h-screen px-6 pt-28 pb-20" style={{ background: "var(--gradient-soft)" }}>
      <Toaster />
      <div className="mx-auto max-w-5xl">
        <Link to="/clothes-analysis" className="text-xs uppercase tracking-[0.25em] text-foreground/60 hover:text-foreground">
          ← Clothes analysis
        </Link>

        <div className="mt-6 mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Quiz · Step {stepIndex} of 3</p>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
            Body Type <em className="text-accent">Mapping</em>
          </h1>
          <p className="mt-3 max-w-xl text-foreground/70">
            Upload a full-body photo, confirm your silhouette, then tell us which outfits feel like you.
          </p>
        </div>

        {/* STEP 1 — Upload */}
        {step === "upload" && (
          <section className="rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
            <h2 className="font-display text-2xl text-foreground">Upload a full-body photo</h2>
            <p className="mt-2 text-sm text-foreground/70">
              Stand straight, arms slightly out, neutral background. We use it only to map your proportions.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[3/4] w-full max-w-sm items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/40 text-center transition hover:border-accent hover:bg-accent/5"
              >
                {imageDataUrl ? (
                  <img src={imageDataUrl} alt="Your full-body photo" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <div className="px-6">
                    <p className="font-display text-xl text-foreground">Tap to upload</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-foreground/50">JPG · PNG · up to 6 MB</p>
                  </div>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              <div className="hidden h-px w-12 bg-border md:block" />

              <ul className="space-y-3 text-sm text-foreground/70">
                <li>· Whole body in frame, head to feet</li>
                <li>· Form-fitting clothes work best</li>
                <li>· Soft, even lighting</li>
                <li>· Plain wall behind you</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep("shape")}
                className="text-xs uppercase tracking-[0.25em] text-foreground/60 hover:text-foreground"
              >
                Skip photo →
              </button>
              <button
                type="button"
                onClick={() => setStep("shape")}
                disabled={!imageDataUrl}
                className="rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 2 — Shape */}
        {step === "shape" && (
          <section className="rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
            <h2 className="font-display text-2xl text-foreground">Which silhouette feels closest?</h2>
            <p className="mt-2 text-sm text-foreground/70">Pick the one that matches your proportions today.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SHAPES.map((s) => {
                const active = shape === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShape(s.id)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      active
                        ? "border-accent bg-accent/10 ring-2 ring-accent"
                        : "border-border bg-background/40 hover:border-accent/50"
                    }`}
                  >
                    <p className="font-display text-lg text-foreground">{s.name}</p>
                    <p className="mt-1 text-xs text-foreground/60">{s.note}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="text-xs uppercase tracking-[0.25em] text-foreground/60 hover:text-foreground"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep("picks")}
                disabled={!shape}
                className="rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 3 — Outfit picks */}
        {(step === "picks" || step === "saving") && (
          <section className="rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-foreground">Pick the outfits you love</h2>
                <p className="mt-2 text-sm text-foreground/70">
                  Tailored for {shape ? SHAPES.find((s) => s.id === shape)?.name : "your shape"} — choose any that feel like you.
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">{picks.length} selected</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {filteredOutfits.map((o) => {
                const active = picks.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => togglePick(o.id)}
                    className={`group relative overflow-hidden rounded-2xl border transition ${
                      active ? "border-accent ring-2 ring-accent" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <img
                      src={o.img}
                      alt={o.tag}
                      loading="lazy"
                      width={768}
                      height={1024}
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {active && (
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm text-accent-foreground shadow">
                        ✓
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                      <p className="text-xs text-white/90">{o.tag}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep("shape")}
                className="text-xs uppercase tracking-[0.25em] text-foreground/60 hover:text-foreground"
                disabled={step === "saving"}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={save}
                disabled={step === "saving" || !shape}
                className="rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                {step === "saving" ? "Saving…" : "Save to my profile"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
