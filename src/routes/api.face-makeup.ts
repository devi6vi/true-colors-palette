import { createFileRoute } from "@tanstack/react-router";

export type FaceShape = "Oval" | "Round" | "Square" | "Heart" | "Oblong" | "Diamond";
export type Occasion = "everyday" | "work" | "evening" | "natural";

export interface Point { x: number; y: number }
export interface ZoneEllipse {
  cx: number; cy: number; rx: number; ry: number; rotation?: number;
}

export interface MakeupAnalysis {
  faceShape: FaceShape;
  faceShapeReasoning: string;
  // All coordinates are normalized (0-1) relative to the source image
  contour: { left: ZoneEllipse; right: ZoneEllipse; technique: string };
  highlight: { points: Point[]; technique: string };
  blush: { left: ZoneEllipse; right: ZoneEllipse; technique: string };
  brow: { leftPath: Point[]; rightPath: Point[]; technique: string };
  lip: { outline: Point[]; technique: string };
  eyes: { technique: string };
  occasionTip: string;
}

interface Body {
  imageBase64: string;
  occasion: Occasion;
  season?: string;
}

export const Route = createFileRoute("/api/face-makeup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "AI not configured" }, { status: 500 });
          }
          const body = (await request.json()) as Body;
          if (!body?.imageBase64 || !body?.occasion) {
            return Response.json({ error: "Missing image or occasion" }, { status: 400 });
          }
          if (body.imageBase64.length > 8_000_000) {
            return Response.json({ error: "Image too large (max ~6MB)" }, { status: 413 });
          }

          const systemPrompt = `You are an expert makeup artist and facial-anatomy analyst. Given a front-facing selfie, you must:
1. Identify the face shape (Oval, Round, Square, Heart, Oblong, or Diamond) with brief reasoning.
2. Return precise placement zones for makeup application as NORMALIZED COORDINATES (0.0 to 1.0) relative to the image dimensions. (0,0) = top-left, (1,1) = bottom-right.
3. Provide concise technique guidance for each zone, calibrated to face shape and occasion.

Coordinate guidance:
- Contour ellipses: place along the underside of each cheekbone, angled toward the corner of the mouth.
- Blush ellipses: place on the apples of the cheeks for round/heart faces, slightly higher and angled outward for square/oblong.
- Highlight points: forehead-center, bridge of nose, cupid's bow, chin tip, top of cheekbones.
- Brow paths: 4-6 points each, tracing head → arch → tail in natural order.
- Lip outline: 8-12 points tracing the natural lip border (clockwise from top-center).

Be anatomically accurate — coordinates must align with the actual face in the photo.`;

          const userText = `Occasion: ${body.occasion}.${body.season ? ` User's color season: ${body.season}.` : ""}`;

          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              messages: [
                { role: "system", content: systemPrompt },
                {
                  role: "user",
                  content: [
                    { type: "text", text: userText },
                    { type: "image_url", image_url: { url: body.imageBase64 } },
                  ],
                },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "submit_makeup_analysis",
                    description: "Submit the face shape and makeup placement zones.",
                    parameters: {
                      type: "object",
                      properties: {
                        faceShape: { type: "string", enum: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"] },
                        faceShapeReasoning: { type: "string" },
                        contour: {
                          type: "object",
                          properties: {
                            left: ellipseSchema(),
                            right: ellipseSchema(),
                            technique: { type: "string" },
                          },
                          required: ["left", "right", "technique"],
                          additionalProperties: false,
                        },
                        highlight: {
                          type: "object",
                          properties: {
                            points: { type: "array", items: pointSchema(), minItems: 3, maxItems: 8 },
                            technique: { type: "string" },
                          },
                          required: ["points", "technique"],
                          additionalProperties: false,
                        },
                        blush: {
                          type: "object",
                          properties: {
                            left: ellipseSchema(),
                            right: ellipseSchema(),
                            technique: { type: "string" },
                          },
                          required: ["left", "right", "technique"],
                          additionalProperties: false,
                        },
                        brow: {
                          type: "object",
                          properties: {
                            leftPath: { type: "array", items: pointSchema(), minItems: 3, maxItems: 8 },
                            rightPath: { type: "array", items: pointSchema(), minItems: 3, maxItems: 8 },
                            technique: { type: "string" },
                          },
                          required: ["leftPath", "rightPath", "technique"],
                          additionalProperties: false,
                        },
                        lip: {
                          type: "object",
                          properties: {
                            outline: { type: "array", items: pointSchema(), minItems: 6, maxItems: 16 },
                            technique: { type: "string" },
                          },
                          required: ["outline", "technique"],
                          additionalProperties: false,
                        },
                        eyes: {
                          type: "object",
                          properties: { technique: { type: "string" } },
                          required: ["technique"],
                          additionalProperties: false,
                        },
                        occasionTip: { type: "string" },
                      },
                      required: ["faceShape", "faceShapeReasoning", "contour", "highlight", "blush", "brow", "lip", "eyes", "occasionTip"],
                      additionalProperties: false,
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "submit_makeup_analysis" } },
            }),
          });

          if (!aiResp.ok) {
            if (aiResp.status === 429) {
              return Response.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });
            }
            if (aiResp.status === 402) {
              return Response.json({ error: "AI credits exhausted. Please add credits in Settings." }, { status: 402 });
            }
            const t = await aiResp.text();
            console.error("AI gateway error:", aiResp.status, t);
            return Response.json({ error: "Analysis failed" }, { status: 500 });
          }

          const data = await aiResp.json();
          const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
          if (!toolCall) {
            return Response.json({ error: "No analysis returned" }, { status: 500 });
          }
          const args = JSON.parse(toolCall.function.arguments) as MakeupAnalysis;
          return Response.json(args);
        } catch (e) {
          console.error("face-makeup error:", e);
          return Response.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
        }
      },
    },
  },
});

function pointSchema() {
  return {
    type: "object",
    properties: {
      x: { type: "number", minimum: 0, maximum: 1 },
      y: { type: "number", minimum: 0, maximum: 1 },
    },
    required: ["x", "y"],
    additionalProperties: false,
  };
}

function ellipseSchema() {
  return {
    type: "object",
    properties: {
      cx: { type: "number", minimum: 0, maximum: 1 },
      cy: { type: "number", minimum: 0, maximum: 1 },
      rx: { type: "number", minimum: 0, maximum: 0.5 },
      ry: { type: "number", minimum: 0, maximum: 0.5 },
      rotation: { type: "number", minimum: -90, maximum: 90 },
    },
    required: ["cx", "cy", "rx", "ry"],
    additionalProperties: false,
  };
}
