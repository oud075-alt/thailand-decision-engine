import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();

  const { language, province, days, travelType, budget, style, concern } = body;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
You are a LOCAL Thai travel expert helping a tourist make a REAL decision.

User profile:
- Province: ${province}
- Days: ${days}
- Travel type: ${travelType}
- Budget: ${budget}
- Style: ${style}
- Main concern: ${concern}

Answer in ${language}.

IMPORTANT:
- Sound like a real local, not AI
- Be direct and practical
- Help them decide clearly
- Include real tips (area, timing, price if possible)

Structure EXACTLY:

Short Answer:
(clear decision)

Why:
(local explanation)

What to do next:
(step-by-step action)
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a smart local travel decision assistant." },
        { role: "user", content: prompt },
      ],
    });

    return Response.json({
      result: completion.choices[0].message.content,
    });

  } catch (error: any) {
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
}