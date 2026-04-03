import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { text, platform } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
คุณคือผู้เชี่ยวชาญด้านการเขียนคอนเท้นสำหรับ ${platform}

วิเคราะห์โพสต์นี้:

"${text}"

ให้ตอบเป็น 4 ส่วน:

1. Hook ดีไหม
2. เนื้อหาเข้าใจง่ายไหม
3. จุดขายคืออะไร
4. CTA ดีไหม

จากนั้นเพิ่มส่วนที่ 5:

5. ✨ ตัวอย่างการปรับปรุง (3 แบบ)
- เขียนโพสต์ใหม่ 3 แบบ
- แต่ละแบบต้อง “สั้น กระแทก อ่านแล้วอยากหยุด”
- โทนมนุษย์ ไม่ใช่ AI
- ใช้ภาษาธรรมดา

รูปแบบ:

1. Hook: ...
2. เนื้อหา: ...
3. จุดขาย: ...
4. CTA: ...

---
✨ ตัวอย่างคอนเท้น (3 แบบ)

แบบที่ 1:
...

แบบที่ 2:
...

แบบที่ 3:
...
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return Response.json({
      result: response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "AI error" },
      { status: 500 }
    );
  }
}