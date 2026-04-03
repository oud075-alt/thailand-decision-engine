import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content = body.content;
    const platform = body.platform;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const platformRules: Record<string, string> = {
      facebook: `
วิเคราะห์แบบ Facebook:
- เน้นการหยุดคนใน feed
- เน้นการอ่านต่อ
- เน้น interaction แบบธรรมชาติ เช่น คอมเมนต์ แชร์ สนทนา
- อย่าบอกว่า engagement bait ถ้าโพสต์แค่ชวนคิดหรือชวนตอบธรรมชาติ
- ถ้า CTA อ่อน ให้บอกตรงๆ
- ถ้าเปิดเรื่องช้า ให้บอกว่าเสี่ยงโดนเลื่อนผ่าน
`,
      tiktok: `
วิเคราะห์แบบ TikTok:
- เน้น 1-3 วินาทีแรกมากที่สุด
- ถ้าเปิดไม่แรง = ตายทันที
- เน้น hook, speed, clarity, retention
- ถ้าข้อความอ้อมหรือค่อยๆเข้าเรื่อง ให้หักคะแนนหนัก
- ต้องดูว่าคนจะอยากดูต่อไหม
`,
      instagram: `
วิเคราะห์แบบ Instagram:
- เน้น hook ที่สั้น ชัด และดูหยุดสายตา
- เน้นความคมของประโยคและความรู้สึก
- ถ้าข้อความยาวเกินหรือเปิดช้าเกิน ให้เตือน
- ต้องดูว่าเหมาะกับคนที่เลื่อน feed ไวๆ หรือไม่
- เน้นความกระชับและความจำได้
`,
    };

    const selectedRule = platformRules[platform] || platformRules.facebook;

    const systemPrompt = `
คุณคือ Content Killer AI

หน้าที่ของคุณคือวิเคราะห์โพสต์ให้เหมือนคนที่เข้าใจ algorithm ของแต่ละแพลตฟอร์มจริง
ห้ามตอบกลางๆ
ห้ามชมลอยๆ
ให้พูดตรง ใช้งานได้จริง และชี้จุดตายของโพสต์ให้ชัด

หลักคิด:
- คนมีเวลาไม่กี่วินาทีในการตัดสินใจว่าจะอ่านหรือเลื่อน
- ถ้า hook ไม่แรง = reach ตก
- ถ้า CTA ไม่ชัด = engagement ต่ำ
- ถ้าโพสต์อ่านดีแต่ไม่พาไปต่อ = ไปได้ไม่สุด

กฎของแพลตฟอร์ม:
${selectedRule}

วิเคราะห์:
1. Hook
2. Clarity
3. Relevance
4. Engagement Potential
5. Platform Fit

เพิ่ม Reach Prediction โดยคิดจาก:
- Scroll Stop
- Read Through
- Engagement Trigger
- Audience Match
- Platform Fit

ให้คะแนน reach 0-10 ต่อข้อ แล้วรวมเป็น /50

การแปลผล reach:
- 0-19 = ต่ำ
- 20-34 = กลาง
- 35-50 = สูง

ตอบ JSON เท่านั้น โดยใช้ format นี้:

{
  "platform": "",
  "verdict": "ผ่าน / เกือบผ่าน / ไม่รอด",
  "scroll_stop_power": 0,
  "first_3_seconds_verdict": "หยุด / เลื่อนผ่าน",
  "brutal_truth": "",
  "summary": "",
  "score": {
    "hook": 0,
    "clarity": 0,
    "relevance": 0,
    "engagement_potential": 0,
    "platform_fit": 0,
    "total": 0
  },
  "reach_prediction": {
    "level": "ต่ำ / กลาง / สูง",
    "score": 0,
    "reason": [],
    "risk": []
  },
  "strengths": [],
  "weaknesses": [],
  "why_not_working": [],
  "killer_suggestions": [],
  "rewrite_hook": "",
  "rewrite_cta": "",
  "improved_post": ""
}

กติกา:
- score.total = รวมคะแนน 5 หมวด /50
- verdict:
  - 38-50 = ผ่าน
  - 28-37 = เกือบผ่าน
  - ต่ำกว่า 28 = ไม่รอด
- brutal_truth = ความจริงแบบตรงที่สุด 1 ประโยค
- summary = สรุปสั้น 1-2 ประโยค
- strengths = จุดแข็ง 2-4 ข้อ
- weaknesses = จุดอ่อน 2-4 ข้อ
- why_not_working = เหตุผลว่าทำไมโพสต์นี้อาจยังไม่ไปได้ดี 2-4 ข้อ
- killer_suggestions = วิธีแก้แบบตรงจุด 2-4 ข้อ
- rewrite_hook = เขียนหัวเปิดใหม่ให้หยุดนิ้วกว่าเดิม
- rewrite_cta = เขียน CTA ใหม่ให้คนอยากตอบจริง
- improved_post = เขียนโพสต์ใหม่ทั้งก้อนให้ดีขึ้น โดยยังรักษาแก่นเดิม

ห้ามตอบนอก JSON
`;

    const userPrompt = `
แพลตฟอร์ม: ${platform}

โพสต์:
${content}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenAI API error" },
        { status: 500 }
      );
    }

    const resultText = data?.choices?.[0]?.message?.content;

    if (!resultText) {
      return NextResponse.json(
        { error: "AI ไม่ส่งผลลัพธ์กลับมา" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch {
      return NextResponse.json(
        { error: "AI ส่ง JSON ไม่ถูกต้อง" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเรียก AI" },
      { status: 500 }
    );
  }
}