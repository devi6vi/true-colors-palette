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
  confidence: number; // 0-1
  // Anatomical outline of the user's face (normalized 0-1)
  faceOutline: {
    jawline: Point[];   // ear -> chin -> ear (left to right)
    hairline: Point[];  // right temple -> forehead arc -> left temple
    noseBridge: Point[]; // between brows -> nose tip
  };
  // Makeup placement (normalized 0-1)
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

          const systemPrompt = `You are a forensic-grade facial-anatomy analyst and senior editorial makeup artist. Your job is to trace the actual face in the submitted selfie and place makeup zones that align to that geometry with sub-percent precision.

============================================================
NON-NEGOTIABLE PROTOCOL
============================================================
1. LANDMARK DETECTION FIRST. Before answering, mentally locate:
   - Pupil centers, inner & outer eye corners
   - Eyebrow head, arch peak, tail
   - Nose root (between brows), nose tip, alar bases (nostril sides)
   - Cupid's bow, lip corners, lower lip apex, mental crease
   - Chin tip, gonial angle (jaw corner), ear tragus, zygomatic peak (cheekbone high point)
   - Hairline at center forehead and both temples
   Use them as ANCHORS for every coordinate you return.

2. NORMALIZED COORDINATES. All x,y are 0.0-1.0 where (0,0)=top-left, (1,1)=bottom-right of the IMAGE (not the crop of the face). Be exact to ~0.005 (half a percent of image dimension). Coordinates outside [0,1] are invalid.

3. FACE OUTLINE — this is the most important deliverable. Trace the user's actual face contour:
   - jawline: 11-15 points starting at the RIGHT ear lobe attachment, descending along the right mandible, around the chin tip, up the left mandible, ending at the LEFT ear lobe attachment. Hug the real silhouette, not a generic oval.
   - hairline: 9-13 points starting at the RIGHT temple where hair meets skin, arcing across the forehead at the actual hairline, ending at the LEFT temple. If hair covers the forehead, trace the visible skin/hair boundary.
   - noseBridge: 4-6 points from the nose root (between brows) to the nose tip, following the bridge midline.
   Points MUST sit ON the visible edge of the face in the photo — verify by re-checking each point lies on the boundary, not inside the cheek or outside in the background.

4. FACE-SHAPE CLASSIFICATION. After tracing, classify using measured ratios:
   - face length / face width (>1.5 -> Oblong; ~1 -> Round/Square)
   - jaw width vs cheekbone width vs forehead width
   - jaw angle: sharp+wide -> Square; tapered -> Heart/Oval; pointed -> Diamond
   State the ratios you observed in faceShapeReasoning (one sentence, concrete numbers).

5. MAKEUP PLACEMENT — derived from anchors, not guessed:
   - Contour ellipses: long axis sits UNDER the zygomatic arch, from just below the cheekbone peak angling toward the mouth corner. rx ~0.06-0.10, ry ~0.025-0.04, rotation reflects the cheekbone tilt (typically -20° to -40° for the right cheek, +20° to +40° for the left).
   - Blush ellipses: centered on the apple of the cheek (directly below pupil, level with nose tip) for round/heart faces; shifted up-and-out toward the cheekbone for square/oblong.
   - Highlight points: forehead center (between brows, above nose root), nose bridge mid, cupid's bow center, chin tip, top of each cheekbone (just above contour). 5-8 points total.
   - Brow paths: 5-8 points each tracing the user's ACTUAL brow from head -> arch peak -> tail. Follow the existing brow hairs, do not invent a generic arch.
   - Lip outline: 12-20 points clockwise from top-center cupid's bow, around the upper lip vermilion border, down the right corner, across the lower lip, up the left corner, back to start. Hug the natural lip border.

6. QUALITY GATE. If the photo is not a clear, front-facing, single-person selfie (profile angle, heavy occlusion, multiple faces, extreme filter, blur, low light), set confidence < 0.4 and still return your best estimate — never refuse.

7. TECHNIQUE COPY. Each technique field is 1-2 sentences, specific to THIS face shape and THIS occasion, naming product textures (cream/powder), tools (fluffy brush, fingertips), and direction of motion. No generic platitudes.

Self-check before submitting: re-read every coordinate and confirm it lies on the anatomical feature you claim. If unsure, adjust.`;

          const userText = `Occasion: ${body.occasion}.${body.season ? ` User's color season: ${body.season}.` : ""} Trace the face precisely and return the structured analysis.`;

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
                    description: "Submit the traced face outline, classified face shape, and precise makeup placement zones.",
                    parameters: {
                      type: "object",
                      properties: {
                        faceShape: { type: "string", enum: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"] },
                        faceShapeReasoning: { type: "string", description: "One sentence with the measured ratios that justify the classification." },
                        confidence: { type: "number", minimum: 0, maximum: 1 },
                        faceOutline: {
                          type: "object",
                          properties: {
                            jawline: { type: "array", items: pointSchema(), minItems: 11, maxItems: 15 },
                            hairline: { type: "array", items: pointSchema(), minItems: 9, maxItems: 13 },
                            noseBridge: { type: "array", items: pointSchema(), minItems: 4, maxItems: 6 },
                          },
                          required: ["jawline", "hairline", "noseBridge"],
                          additionalProperties: false,
                        },
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
                            points: { type: "array", items: pointSchema(), minItems: 5, maxItems: 8 },
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
                            leftPath: { type: "array", items: pointSchema(), minItems: 5, maxItems: 8 },
                            rightPath: { type: "array", items: pointSchema(), minItems: 5, maxItems: 8 },
                            technique: { type: "string" },
                          },
                          required: ["leftPath", "rightPath", "technique"],
                          additionalProperties: false,
                        },
                        lip: {
                          type: "object",
                          properties: {
                            outline: { type: "array", items: pointSchema(), minItems: 12, maxItems: 20 },
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
                      required: ["faceShape", "faceShapeReasoning", "confidence", "faceOutline", "contour", "highlight", "blush", "brow", "lip", "eyes", "occasionTip"],
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
