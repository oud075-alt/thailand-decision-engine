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
    const { question, language, province } = body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a local Thailand travel decision assistant.

The user is asking about travel in ${province}.
Answer in ${language}.

Rules:
- Do NOT start with greeting
- Be direct and practical
- Sound like a real local person
- Include real-world details (time, price, how things actually work)
- Help the user DECIDE, not just explain
- No emojis
- No marketing tone

Structure EXACTLY:

Short Answer:
[give clear decision]

Why:
[simple local explanation]

What to do next:
[actionable steps with time/price if possible]

Question:
${question}
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
    console.error("ASK_ERROR:", error);

    return Response.json(
      {
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}