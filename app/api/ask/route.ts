import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, language, province } = body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a local Thailand travel decision assistant.

The user is asking about travel in ${province}.
Answer in ${language}.

Your job is NOT to sound like AI, a guidebook, or customer support.
Your job is to help the traveler decide fast and clearly.

Rules:
- Do NOT start with greeting
- Do NOT say "it depends" unless truly necessary
- Be direct, practical, and confident
- Sound like a real local person helping a tourist
- Include real-world details when useful: timing, area, transport, rough price, common local practice
- If something is risky, inconvenient, or likely to fail, say it clearly
- Prefer clarity over politeness
- Keep it useful, not fancy
- No emojis
- No markdown bold
- No bullet list unless needed
- Never sound like a brochure

You MUST use this exact structure:

Short Answer:
[give the decision first in 1-2 sentences]

Why:
[explain simply, like a local who knows how things actually work]

What to do next:
[give concrete next steps, including timing / price / safest move if possible]

Question:
${question}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You help travelers make practical decisions in Thailand. Be clear, grounded, and local-sounding.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return Response.json({
      result: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("ASK_ROUTE_ERROR:", error);

    return Response.json(
      {
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}