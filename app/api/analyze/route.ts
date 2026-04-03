import OpenAI from "openai";

// เก็บจำนวนการใช้งานต่อ IP (แบบง่าย)
const usageMap = new Map();

export async function POST(req: Request) {
  try {
    const { text, platform } = await req.json();

    // 🔒 จำกัดความยาวข้อความ
    if (!text || text.length > 1000) {
      return Response.json(
        { error: "ข้อความยาวเกินไป" },
        { status: 400 }
      );
    }

    // 🔒 จำกัด 3 ครั้ง / วัน ต่อ IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const today = new Date().toDateString();

    const userData = usageMap.get(ip);

    if (userData && userData.date === today) {
      if (userData.count >= 3) {
        return Response.json(
          { error: "คุณใช้ครบ 3 ครั้งแล้ว ลองใหม่พรุ่งนี้" },
          { status: 429 }
        );
      }

      userData.count += 1;
      usageMap.set(ip, userData);
    } else {
      usageMap.set(ip, { count: 1, date: today });
    }

    // 🔒 delay กันยิงรัว
    await new Promise((r) => setTimeout(r, 800));

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
- สั้น กระแทก หยุดนิ้ว
- ภาษามนุษย์ ไม่ใช่ AI

ห้ามตอบเรื่องผิดกฎหมาย / ไม่เกี่ยวกับคอนเท้น

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