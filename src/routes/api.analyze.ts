import { createFileRoute } from "@tanstack/react-router";
import { SEASON_LIST, type Season, type Undertone } from "@/lib/seasons";

interface Body {
  imageBase64: string; // data URL
  undertone: Undertone;
  notes?: string;
}

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "AI not configured" }, { status: 500 });
          }
          const body = (await request.json()) as Body;
          if (!body?.imageBase64 || !body?.undertone) {
            return Response.json({ error: "Missing image or undertone" }, { status: 400 });
          }
          if (body.imageBase64.length > 8_000_000) {
            return Response.json({ error: "Image too large (max ~6MB)" }, { status: 413 });
          }

          const systemPrompt = `You are an expert color analyst specializing in the 12-season (Sci-ART) color analysis system. Analyze the user's photo (taken in natural daylight) along with their self-reported undertone to determine the most accurate season.

The 12 seasons are: ${SEASON_LIST.join(", ")}.

Consider: skin undertone, hair color & depth, eye color & clarity, overall contrast level, and chroma (muted vs bright). Use the user's stated undertone (warm/cool/neutral) as a strong hint.

Return ONLY a tool call with: season (one of the 12), confidence (0-1), and a 2-3 sentence reasoning explaining what features led to the choice.`;

          const userText = `My self-identified undertone: ${body.undertone}.${body.notes ? ` Additional notes: ${body.notes}` : ""}`;

          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
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
                    name: "submit_season",
                    description: "Submit the determined color season analysis.",
                    parameters: {
                      type: "object",
                      properties: {
                        season: { type: "string", enum: SEASON_LIST },
                        confidence: { type: "number", minimum: 0, maximum: 1 },
                        reasoning: { type: "string" },
                      },
                      required: ["season", "confidence", "reasoning"],
                      additionalProperties: false,
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "submit_season" } },
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
          const args = JSON.parse(toolCall.function.arguments) as {
            season: Season;
            confidence: number;
            reasoning: string;
          };

          return Response.json(args);
        } catch (e) {
          console.error("analyze error:", e);
          return Response.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
        }
      },
    },
  },
});
