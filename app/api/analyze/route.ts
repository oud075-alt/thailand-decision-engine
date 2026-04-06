import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { language, province, days, travelType, budget, style, concern } =
      body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a local Thailand travel decision assistant.

The traveler needs help deciding how to plan a trip in ${province}.
Answer in ${language}.

Traveler profile:
- Province: ${province}
- Days: ${days}
- Travel type: ${travelType}
- Budget: ${budget}
- Style: ${style}
- Main concern: ${concern}

Your job is NOT to describe options endlessly.
Your job is to recommend the best direction clearly.

Rules:
- Do NOT start with greeting
- Do NOT sound like AI, a blog, or tourism website
- Be decisive
- Pick the best direction based on the traveler profile
- Explain in simple, practical language
- Mention likely best area / trip style / pace / spending logic when useful
- Include rough real-world guidance when possible
- If a common mistake exists, warn them directly
- Keep it useful and grounded
- No emojis
- No markdown bold
- No long generic filler

You MUST use this exact structure:

Short Answer:
[give the best overall direction immediately]

Why:
[explain the logic in a practical local way]

What to do next:
[give simple next steps, what to prioritize, what to avoid, and rough timing/budget if useful]

Do not be neutral.
Do not just restate the inputs.
Make an actual recommendation.
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
    console.error("ANALYZE_ROUTE_ERROR:", error);

    return Response.json(
      {
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}