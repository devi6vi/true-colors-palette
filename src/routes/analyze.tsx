import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import type { Undertone } from "@/lib/seasons";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze · Hue & Bloom" },
      { name: "description", content: "Upload your daylight photo and check your undertone to begin your color analysis." },
      { property: "og:title", content: "Analyze · Hue & Bloom" },
      { property: "og:description", content: "Upload your daylight photo and check your undertone to begin your color analysis." },
    ],
  }),
  component: Analyze,
});

const UNDERTONES: { value: Undertone; title: string; cue: string; swatch: string }[] = [
  { value: "warm", title: "Warm", cue: "Veins look greenish · gold jewelry suits you", swatch: "linear-gradient(135deg,#F4D6A0,#E29452)" },
  { value: "cool", title: "Cool", cue: "Veins look blue/purple · silver jewelry suits you", swatch: "linear-gradient(135deg,#C9D6E8,#7B92B5)" },
  { value: "neutral", title: "Neutral", cue: "Mix of both · either metal works", swatch: "linear-gradient(135deg,#E5C0BF,#98A57A)" },
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

function Analyze() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [undertone, setUndertone] = useState<Undertone | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const submit = async () => {
    if (!imageData || !undertone) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imageData, undertone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Analysis failed");
        setLoading(false);
        return;
      }
      // Store in sessionStorage to pass to result
      sessionStorage.setItem("hb:result", JSON.stringify({ ...data, photo: imageData, undertone }));
      navigate({ to: "/result" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 pt-28 pb-20 md:px-10" style={{ background: "var(--gradient-soft)" }}>
      <Toaster position="top-center" />
      <div className="mx-auto max-w-3xl">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.25em] text-foreground/60">
          <span className={step === 1 ? "text-accent" : ""}>① Photo</span>
          <span className="h-px w-10 bg-border" />
          <span className={step === 2 ? "text-accent" : ""}>② Undertone</span>
        </div>

        {step === 1 && (
          <section className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)] md:p-12">
            <h1 className="font-display text-4xl text-foreground md:text-5xl">Upload your photo</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              For accurate results: take it in <strong>natural daylight</strong>, no makeup, hair pulled back, neutral background.
            </p>

            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className="mt-8 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition hover:border-accent"
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Your upload" className="max-h-96 w-full object-contain" />
                  <div className="bg-card/80 px-4 py-2 text-center text-xs text-muted-foreground backdrop-blur">
                    Click to replace
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="font-display text-xl text-foreground">Tap or drop a photo</p>
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

            <button
              disabled={!imageData}
              onClick={() => setStep(2)}
              className="mt-8 w-full rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition disabled:opacity-40 hover:enabled:opacity-90"
            >
              Continue →
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)] md:p-12">
            <h1 className="font-display text-4xl text-foreground md:text-5xl">Check your undertone</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Turn your wrist toward natural light. Look at the veins on the inside of your wrist.
            </p>

            <div className="mt-8 space-y-3">
              {UNDERTONES.map((u) => (
                <button
                  key={u.value}
                  onClick={() => setUndertone(u.value)}
                  className={`flex w-full items-center gap-5 rounded-2xl border-2 p-5 text-left transition ${
                    undertone === u.value
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <span
                    className="h-14 w-14 flex-shrink-0 rounded-full ring-1 ring-border"
                    style={{ background: u.swatch }}
                  />
                  <span className="flex-1">
                    <span className="block font-display text-2xl text-foreground">{u.title}</span>
                    <span className="block text-xs text-muted-foreground md:text-sm">{u.cue}</span>
                  </span>
                  {undertone === u.value && (
                    <span className="text-accent">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                ← Back
              </button>
              <button
                disabled={!undertone || loading}
                onClick={submit}
                className="flex-1 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition disabled:opacity-40 hover:enabled:opacity-90"
              >
                {loading ? "Analyzing your colors…" : "Reveal my season ✺"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
