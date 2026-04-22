import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { MakeupOverlay } from "@/components/MakeupOverlay";
import type { MakeupAnalysis } from "@/routes/api.face-makeup";

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

const OCCASIONS = [
  { value: "everyday", label: "Everyday" },
  { value: "work", label: "Work / Polished" },
  { value: "evening", label: "Evening / Glam" },
  { value: "natural", label: "Natural / No-makeup" },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File, maxDim = 1024, quality = 0.85): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas error"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function FaceMakeupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string>("everyday");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setImageData(compressed);
      setPreview(compressed);
    } catch {
      toast.error("Could not read that image");
    }
  };

  const handleAnalyze = () => {
    if (!imageData) {
      toast.error("Please upload a photo first");
      return;
    }
    toast.info("Makeup analysis is coming soon — your photo is ready ✺");
  };

  return (
    <main className="relative min-h-screen px-6 pt-32 pb-20 md:px-10">
      <Toaster position="top-center" />
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

        {/* Upload section */}
        <section className="mb-16 rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)] md:p-12">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Step 1</p>
            <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">Upload your selfie</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Front-facing, natural daylight, no makeup, hair pulled back. We'll map contour, blush, brow, and lip zones onto your photo.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className="cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition hover:border-accent"
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Your selfie" className="max-h-80 w-full object-contain" />
                  <div className="bg-card/80 px-4 py-2 text-center text-xs text-muted-foreground backdrop-blur">
                    Click to replace
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="font-display text-xl text-foreground">Tap or drop a selfie</p>
                  <p className="text-xs text-muted-foreground">JPG / PNG · daylight · no filter</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>

            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-[0.25em] text-foreground/60">Choose an occasion</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {OCCASIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setOccasion(o.value)}
                    className={`rounded-2xl border-2 p-4 text-sm font-medium transition ${
                      occasion === o.value
                        ? "border-accent bg-accent/5 text-foreground"
                        : "border-border text-foreground/70 hover:border-accent/50"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-muted/50 p-5 text-xs leading-relaxed text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">What you'll get</p>
                An annotated map of your face showing contour, highlight, blush placement, brow shape, and lip technique — calibrated to your color season.
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!imageData}
                className="mt-6 w-full rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition disabled:opacity-40 hover:enabled:opacity-90"
              >
                Analyze my face ✺
              </button>
              <p className="mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-foreground/50">
                Scroll for details ↓
              </p>
            </div>
          </div>
        </section>

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
