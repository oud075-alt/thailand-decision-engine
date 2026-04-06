import OpenAI from "openai";

export const dynamic = "force-dynamic";

// ===== LIMIT LOGIC =====
const requestCounts = new Map<string, { count: number; date: string }>();

function checkLimit(ip: string) {
  const today = new Date().toISOString().slice(0, 10);

  const user = requestCounts.get(ip);

  if (!user || user.date !== today) {
    requestCounts.set(ip, { count: 1, date: today });
    return true;
  }

  if (user.count >= 3) {
    return false;
  }

  user.count += 1;
  return true;
}
// ======================

export async function POST(req: Request) {
  try {
    // ===== CHECK LIMIT =====
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!checkLimit(ip)) {
      return Response.json(
        {
          result:
            "You have reached the daily limit (3 requests). Please try again tomorrow.",
        },
        { status: 429 }
      );
    }
    // ======================

    const body = await req.json();
    const { language, province, days, travelType, budget, style, concern } =
      body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a local Thailand travel decision assistant.

Traveler profile:
- Province: ${province}
- Days: ${days}
- Travel type: ${travelType}
- Budget: ${budget}
- Style: ${style}
- Main concern: ${concern}

Answer in ${language}.

Rules:
- Be decisive
- Do NOT start with greeting
- Sound like a real local, not AI
- Give practical advice (area, timing, budget reality)
- Warn if something is a bad idea
- No emojis
- No fluff

Structure EXACTLY:

Short Answer:
[best direction immediately]

Why:
[practical explanation]

What to do next:
[clear next steps, priorities, timing, budget hint]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You help travelers make practical decisions in Thailand.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return Response.json({
      result: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("ANALYZE_ERROR:", error);

    return Response.json(
      {
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}