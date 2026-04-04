import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Platform = "facebook" | "tiktok" | "instagram";

const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  tiktok: "TikTok",
  instagram: "Instagram",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const platform: Platform = isValidPlatform(body?.platform)
      ? body.platform
      : "facebook";

    if (!content) {
      return NextResponse.json(
        { error: "กรุณาใส่ข้อความคอนเทนต์ก่อนวิเคราะห์" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "content_fixer_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              headline: {
                type: "string",
                description: "ประโยคสรุปเปิดผลลัพธ์ เช่น โพสต์นี้มีโอกาสเงียบ เพราะ..."
              },
              problems: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 5
              },
              fix: {
                type: "object",
                additionalProperties: false,
                properties: {
                  hooks: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  },
                  rewrite: {
                    type: "string"
                  },
                  quick_fixes: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 5
                  }
                },
                required: ["hooks", "rewrite", "quick_fixes"]
              },
              ai_view: {
                type: "object",
                additionalProperties: false,
                properties: {
                  facebook: { type: "string" },
                  tiktok: { type: "string" },
                  instagram: { type: "string" }
                },
                required: ["facebook", "tiktok", "instagram"]
              },
              prediction: {
                type: "object",
                additionalProperties: false,
                properties: {
                  reach: {
                    type: "string",
                    enum: ["ต่ำ", "กลาง", "สูง"]
                  },
                  hook_rate: {
                    type: "number",
                    minimum: 0,
                    maximum: 100
                  },
                  main_issue: {
                    type: "string"
                  }
                },
                required: ["reach", "hook_rate", "main_issue"]
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4
              },
              platform_tip: {
                type: "string"
              }
            },
            required: [
              "headline",
              "problems",
              "fix",
              "ai_view",
              "prediction",
              "strengths",
              "platform_tip"
            ]
          }
        }
      },
      messages: [
        {
          role: "system",
          content: `
คุณคือ “ช่างซ่อมคอนเทนต์”

หน้าที่ของคุณ:
ไม่ใช่วิเคราะห์แบบนักวิจารณ์
แต่ต้องช่วยให้โพสต์นี้ “ไม่เงียบ” และเอาไปใช้ต่อได้ทันที

กติกาสำคัญ:
- ตอบเป็นภาษาไทยเท่านั้น
- พูดตรง สั้น ชัด
- ห้ามใช้ภาษาวิชาการ
- ห้ามใช้คำฟุ้ง คำสวย คำแบบ AI
- ห้ามดุผู้ใช้
- ต้องเขียนเหมือนคนจริงที่กำลังช่วยแก้โพสต์
- ให้ความสำคัญกับ 3 วินาทีแรก / ประโยคเปิด / ความรู้สึกว่าโพสต์นี้มีอะไรให้อ่านต่อ
- ถ้าเป็นโพสต์ขายของ อย่าตำหนิว่าเป็นการขาย แต่ให้ดูว่าเปิดขายเร็วเกินไปไหม
- ทุกข้อเสนอแนะต้องเอาไปใช้ได้จริง
- rewrite ต้องเขียนใหม่ให้น่าโพสต์จริง ไม่ใช่แค่สรุป
- hooks ต้องเป็นประโยคเปิดที่หยิบไปใช้ได้ทันที
- quick_fixes ต้องเป็นคำสั่งแก้สั้นๆแบบลงมือได้เลย
- ai_view ต้องแปลมุมมองของแต่ละแพลตฟอร์มให้คนธรรมดาเข้าใจ
- prediction.hook_rate คือ “โอกาสหยุดนิ้ว” เป็นตัวเลข 0-100
- strengths คือสิ่งที่โพสต์นี้ยังมีของดีอยู่ อย่าให้มีแต่ด้านลบ

ความหมายของแต่ละส่วน:
1. headline:
   ประโยคเปิดผลลัพธ์ เช่น “โพสต์นี้มีโอกาสเงียบ เพราะเปิดเรื่องยังไม่ดึงพอ”

2. problems:
   จุดที่ทำให้โพสต์เงียบ 3-5 ข้อ

3. fix.hooks:
   Hook ใหม่ 3 แบบ ใช้ได้ทันที

4. fix.rewrite:
   เขียนโพสต์เวอร์ชั่นใหม่ 1 เวอร์ชั่น ให้เหมาะกับแพลตฟอร์มที่ผู้ใช้เลือก

5. fix.quick_fixes:
   ลิสต์สิ่งที่ควรแก้แบบสั้น กระชับ 3-5 ข้อ

6. ai_view:
   อธิบายว่า Facebook / TikTok / Instagram จะมองโพสต์นี้ยังไง

7. prediction:
   - reach: ต่ำ/กลาง/สูง
   - hook_rate: 0-100
   - main_issue: ปัญหาหลัก 1 ประโยค

8. strengths:
   จุดแข็งของโพสต์นี้ที่ยังพอมี

9. platform_tip:
   ทิปสั้นๆ 1 ข้อ ที่เหมาะกับแพลตฟอร์มที่ผู้ใช้เลือก

ข้อห้าม:
- ห้ามตอบกว้าง
- ห้ามพูดซ้ำไปมา
- ห้ามให้คำแนะนำที่ลอย
- ห้ามใส่ markdown
- ห้ามใส่อิโมจิในค่า JSON
          `.trim(),
        },
        {
          role: "user",
          content: `
แพลตฟอร์มเป้าหมาย: ${PLATFORM_LABELS[platform]}

ข้อความคอนเทนต์:
"""
${content}
"""

ช่วยวิเคราะห์และซ่อมโพสต์นี้ตามโครงสร้างที่กำหนด
          `.trim(),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return NextResponse.json(
        { error: "ไม่สามารถวิเคราะห์คอนเทนต์ได้ในตอนนี้" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      platform,
      result: parsed,
    });
  } catch (error) {
    console.error("Analyze error:", error);

    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดระหว่างวิเคราะห์คอนเทนต์",
      },
      { status: 500 }
    );
  }
}

function isValidPlatform(value: unknown): value is Platform {
  return value === "facebook" || value === "tiktok" || value === "instagram";
}