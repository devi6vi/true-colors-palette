import { useState } from "react";
import type { MakeupAnalysis, Point, ZoneEllipse } from "@/routes/api.face-makeup";

type LayerKey = "contour" | "highlight" | "blush" | "brow" | "lip";

const LAYERS: { key: LayerKey; label: string; color: string }[] = [
  { key: "contour", label: "Contour", color: "#8B5A3C" },
  { key: "highlight", label: "Highlight", color: "#F4E4BC" },
  { key: "blush", label: "Blush", color: "#E89B9B" },
  { key: "brow", label: "Brow", color: "#5C3A21" },
  { key: "lip", label: "Lip", color: "#C84B5F" },
];

function pathFromPoints(points: Point[], closed = false) {
  if (points.length === 0) return "";
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${(p.x * 100).toFixed(2)} ${(p.y * 100).toFixed(2)}`).join(" ");
  return closed ? `${d} Z` : d;
}

function Ellipse({ e, color }: { e: ZoneEllipse; color: string }) {
  const cx = e.cx * 100;
  const cy = e.cy * 100;
  const rx = e.rx * 100;
  const ry = e.ry * 100;
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      transform={e.rotation ? `rotate(${e.rotation} ${cx} ${cy})` : undefined}
      fill={color}
      fillOpacity={0.35}
      stroke={color}
      strokeOpacity={0.9}
      strokeWidth={0.4}
    />
  );
}

export function MakeupOverlay({
  imageSrc,
  analysis,
}: {
  imageSrc: string;
  analysis: MakeupAnalysis;
}) {
  const [active, setActive] = useState<Record<LayerKey, boolean>>({
    contour: true, highlight: true, blush: true, brow: true, lip: true,
  });

  const toggle = (k: LayerKey) => setActive((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LAYERS.map((l) => (
          <button
            key={l.key}
            onClick={() => toggle(l.key)}
            className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-xs font-medium transition ${
              active[l.key] ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/40">
        <img src={imageSrc} alt="Your selfie with makeup map" className="block w-full" />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {active.contour && (
            <g>
              <Ellipse e={analysis.contour.left} color={LAYERS[0].color} />
              <Ellipse e={analysis.contour.right} color={LAYERS[0].color} />
            </g>
          )}
          {active.blush && (
            <g>
              <Ellipse e={analysis.blush.left} color={LAYERS[2].color} />
              <Ellipse e={analysis.blush.right} color={LAYERS[2].color} />
            </g>
          )}
          {active.highlight && (
            <g>
              {analysis.highlight.points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x * 100}
                  cy={p.y * 100}
                  r={1.6}
                  fill={LAYERS[1].color}
                  fillOpacity={0.85}
                  stroke="#fff"
                  strokeOpacity={0.9}
                  strokeWidth={0.3}
                />
              ))}
            </g>
          )}
          {active.brow && (
            <g fill="none" stroke={LAYERS[3].color} strokeWidth={0.7} strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0.95}>
              <path d={pathFromPoints(analysis.brow.leftPath)} />
              <path d={pathFromPoints(analysis.brow.rightPath)} />
            </g>
          )}
          {active.lip && (
            <path
              d={pathFromPoints(analysis.lip.outline, true)}
              fill={LAYERS[4].color}
              fillOpacity={0.25}
              stroke={LAYERS[4].color}
              strokeOpacity={0.95}
              strokeWidth={0.5}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
