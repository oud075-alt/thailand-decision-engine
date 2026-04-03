import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { text, platform } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
คุณคือผู้เชี่ยวชาญด้านคอนเทนต์โซเชียล

วิเคราะห์โพสต์นี้สำหรับ ${platform}

โพสต์:
${text}

ให้วิเคราะห์:
1. Hook ดีไหม
2. เนื้อหาเข้าใจง่ายไหม
3. จุดขายคืออะไร
4. CTA ดีไหม

ตอบแบบสั้น กระชับ อ่านง่าย
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const content = response.choices?.[0]?.message?.content;

    return Response.json({
      result: content || "AI ไม่ส่งข้อมูลกลับมา",
      raw: response // debug เผื่อใช้
    });

  } catch (error) {
    console.error("ERROR:", error);

    return Response.json(
      {
        error: "AI error",
        detail: String(error)
      },
      { status: 500 }
    );
  }
}