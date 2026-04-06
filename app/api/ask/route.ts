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
You are a helpful local travel assistant in Thailand.

User is asking about travel in ${province}.
Answer in ${language}.

Question:
${question}

Give:
- Short clear answer first
- Then explanation
- Then what to do next
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a smart travel decision assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content;

    return Response.json({ result: answer });
  } catch (error) {
    console.error(error);
    return Response.json({ result: "Error occurred" }, { status: 500 });
  }
}