import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = body.content || "";
    const platform = body.platform || "Facebook";

    if (!content) {
      return Response.json({ error: "No content provided" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
คุณคือ AI วิเคราะห์คอนเทนต์โซเชียลแบบมืออาชีพ

แพลตฟอร์ม: ${platform}

โพสต์:
"${content}"

ให้วิเคราะห์แบบนี้:

1. Hook (0-10) + เหตุผลสั้นๆ  
2. จุดอ่อน (สั้น กระแทก)  
3. โอกาสไวรัล (ต่ำ/กลาง/สูง + เพราะอะไร)  
4. คำแนะนำที่ “ทำแล้วดีขึ้นจริง”  
5. เขียนโพสต์ใหม่เวอร์ชันที่ดีกว่า (พร้อมใช้ทันที)

ห้ามเขียนยาวน้ำ  
เน้นใช้งานจริง
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = response.choices?.[0]?.message?.content || "No response";

    return Response.json({ result });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "AI error" },
      { status: 500 }
    );
  }
}