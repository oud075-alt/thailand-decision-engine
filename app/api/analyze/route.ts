import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { content, platform } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
คุณคือ AI วิเคราะห์คอนเทนต์โซเชียล

วิเคราะห์โพสต์นี้สำหรับ ${platform}

เนื้อหา:
"${content}"

ให้ตอบ:
1. Hook แรงไหม (0-10)
2. เข้าใจง่ายไหม
3. มีโอกาสไวรัลไหม
4. ควรปรับอะไร
5. เขียนเวอร์ชันที่ดีกว่าให้ใหม่

ตอบแบบสั้น กระชับ ใช้งานได้จริง
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

    return Response.json({
      result: response.choices[0].message.content,
    });

  } catch (error) {
    return Response.json({
      error: "AI error",
    });
  }
}