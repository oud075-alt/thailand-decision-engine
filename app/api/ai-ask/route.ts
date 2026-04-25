import OpenAI from "openai";

export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type PrepOption = {
  level: string;
  name: string;
  why: string;
  url: string;
};

type PrepResult = {
  bestMatch: {
    name: string;
    why: string;
    url: string;
  };
  alternatives: PrepOption[];
};

function guessUrl(name: string, why: string) {
  const text = `${name} ${why}`.toLowerCase();

  if (
    text.includes("esim") ||
    text.includes("sim") ||
    text.includes("internet") ||
    text.includes("data") ||
    text.includes("อินเทอร์เน็ต") ||
    text.includes("เน็ต") ||
    text.includes("网络") ||
    text.includes("wifi") ||
    text.includes("ネット")
  ) {
    return "https://www.airalo.com/";
  }

  if (
    text.includes("insurance") ||
    text.includes("insured") ||
    text.includes("travel cover") ||
    text.includes("ประกัน") ||
    text.includes("保险") ||
    text.includes("保険")
  ) {
    return "https://www.worldnomads.com/";
  }

  return "https://shopee.co.th/";
}

function safeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    const { tripType, duration, travelType, concern, wantMost, language } =
      await req.json();

    const prompt = `
You are a travel preparation decision engine.

User profile:
- Trip type: ${safeText(tripType)}
- Duration: ${safeText(duration)}
- Travel type: ${safeText(travelType)}
- Main concern: ${safeText(concern)}
- What they want most: ${safeText(wantMost) || "not specified"}

Response language:
- ${safeText(language) || "English"}

Rules:
- Write ALL output in the selected language
- Recommend exactly 3 practical prep items or prep directions before travel
- Do NOT recommend AI tools or software
- Keep names short and natural
- Keep reasons short, clear, and useful
- Return valid JSON only
- Do not add markdown

Return this exact shape:
{
  "bestMatch": {
    "name": "short item or prep name",
    "why": "short reason"
  },
  "alternatives": [
    {
      "level": "Strong alternative",
      "name": "short item or prep name",
      "why": "short reason"
    },
    {
      "level": "Useful backup option",
      "name": "short item or prep name",
      "why": "short reason"
    }
  ]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a precise travel prep recommendation engine that returns valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(raw);

    const bestName = safeText(parsed?.bestMatch?.name) || "Travel essentials";
    const bestWhy =
      safeText(parsed?.bestMatch?.why) ||
      "A practical starting point before your trip.";

    const alt1Level =
      safeText(parsed?.alternatives?.[0]?.level) || "Strong alternative";
    const alt1Name =
      safeText(parsed?.alternatives?.[0]?.name) || "Travel insurance";
    const alt1Why =
      safeText(parsed?.alternatives?.[0]?.why) ||
      "Useful if you want extra protection before leaving.";

    const alt2Level =
      safeText(parsed?.alternatives?.[1]?.level) || "Useful backup option";
    const alt2Name =
      safeText(parsed?.alternatives?.[1]?.name) || "Power bank";
    const alt2Why =
      safeText(parsed?.alternatives?.[1]?.why) ||
      "Helpful as a backup for common travel problems.";

    const result: PrepResult = {
      bestMatch: {
        name: bestName,
        why: bestWhy,
        url: guessUrl(bestName, bestWhy),
      },
      alternatives: [
        {
          level: alt1Level,
          name: alt1Name,
          why: alt1Why,
          url: guessUrl(alt1Name, alt1Why),
        },
        {
          level: alt2Level,
          name: alt2Name,
          why: alt2Why,
          url: guessUrl(alt2Name, alt2Why),
        },
      ],
    };

    return Response.json({ result });
  } catch (error) {
    console.error("AI_ASK_ERROR:", error);

    return Response.json(
      {
        error: "Could not generate travel prep decision.",
      },
      { status: 500 }
    );
  }
}