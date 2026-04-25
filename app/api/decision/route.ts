import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function fallbackResult(province: string) {
  return {
    intro: `For this trip, ${province || "this province"} is a good choice, but the best area depends on your time, budget, style, and main concern.`,
    options: [
      {
        title: "Best first choice",
        description: "Choose the most convenient base with easy transport, food, and access to tours.",
        bestFor: "First-time visitors who want fewer mistakes.",
        caution: "Avoid staying too far from the area you will actually use every day.",
      },
      {
        title: "More local option",
        description: "Choose a quieter area if you want lower pressure and a slower pace.",
        bestFor: "Travelers who prefer calm, food, and local atmosphere.",
        caution: "Transport may take more planning.",
      },
      {
        title: "Scenic / experience option",
        description: "Choose this if atmosphere matters more than convenience.",
        bestFor: "People who want memory, views, and a stronger travel feeling.",
        caution: "It may cost more time or money to move around.",
      },
    ],
    quickGuide: [
      "Stay close to the activity you will do most.",
      "Do not choose only by hotel photos.",
      "Check transport before booking.",
    ],
    finalRecommendation: "Choose the area that reduces your biggest concern first, then compare hotels inside that area.",
    optionalContext: "This answer is a safe fallback because the AI response could not be parsed.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const question = safeText(body.question);
    const province = safeText(body.province);
    const language = safeText(body.language) || "English";

    if (!question && !province) {
      return NextResponse.json(
        { error: "Decision details are required" },
        { status: 400 }
      );
    }

const prompt = `
You are Thailand Decision Engine.

Your job:
Help travelers make ONE clear decision about where to stay or which area to choose in Thailand.

You are NOT a general travel chatbot.
You are NOT writing a travel blog.
You are a decision engine.

User request:
${question}

Province:
${province || "not specified"}

Response language:
${language}

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside JSON.

Use this exact JSON structure:

{
  "intro": "One short direct answer. Start with the recommended area.",
  "options": [
    {
      "option": "Area name"",
      "vibe": "2-4 words only",
      "bestFor": "Short phrase only",
      "whyItFits": "One short sentence only"
    },
    {
      "option": "Area name"",
      "vibe": "2-4 words only",
      "bestFor": "Short phrase only",
      "whyItFits": "One short sentence only"
    },
    {
      "option": "Area name"",
      "vibe": "2-4 words only",
      "bestFor": "Short phrase only",
      "whyItFits": "One short sentence only"
    }
  ],
  "quickGuide": [
    "Short practical decision rule 1",
    "Short practical decision rule 2",
    "Short practical decision rule 3"
  ],
  "finalRecommendation": "One clear final recommendation in 1-2 short sentences.",
  "optionalContext": "One useful caution or local note in one short sentence."
}

Decision rules:
- Recommend exactly 3 area options.
- The first option must be the best match.
- Keep every field short and easy to scan.
- Do not write long paragraphs.
- Do not use fake prices.
- Do not claim live hotel availability.
- Do not recommend based only on beauty.
- Prioritize the user's concern first.
- If the main concern is wrong location, explain which area reduces that risk.
- If the trip is short, prioritize convenience.
- If the traveler is with friends, consider food, nightlife, transport, and easy tours.
- If the style is explore, balance convenience with access to activities.
- If the budget is mid, avoid overly expensive or isolated areas.
- If extra preference is provided, use it.
- If extra preference is empty, do not mention it.
- Avoid vague phrases like "it depends".
- Give a decision, not many possibilities.

Tone:
- Clear
- Practical
- Human
- Direct
- Helpful

Example style:
Intro should feel like:
"Best fit: Ao Nang. For a short Krabi trip with friends, it gives you the easiest mix of food, nightlife, tours, and transport."

Final recommendation should feel like:
"Choose Ao Nang as your base. It reduces the risk of staying in the wrong location while still keeping Railay and island tours easy to reach."
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON API. Return only valid JSON. No markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || "";

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = fallbackResult(province);
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("DECISION_API_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to generate decision",
        result: fallbackResult("Thailand"),
      },
      { status: 500 }
    );
  }
}