import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Platform = "facebook" | "tiktok" | "instagram";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const content = ((formData.get("content") as string) || "").trim();
    const platform = ((formData.get("platform") as string) || "facebook") as Platform;
    const image = formData.get("image") as File | null;

    if (!content && !image) {
      return NextResponse.json(
        { error: "กรุณาใส่ข้อความหรืออัปโหลดรูป" },
        { status: 400 }
      );
    }

    // เตรียม input
    const userContent: any[] = [];

    userContent.push({
      type: "input_text",
      text: `
คุณคือเครื่องซ่อมคอนเทนต์

ถ้ามีภาพ → วิเคราะห์จากภาพเป็นหลัก
ถ้ามีข้อความ → ใช้ร่วมกัน
ถ้าเป็นภาพโพสต์ → อ่านข้อความในภาพแล้ววิเคราะห์เหมือนโพสต์จริง

ตอบเป็น JSON เท่านั้นตามโครงนี้:

{
  "headline": "string",
  "problems": ["string"],
  "fix": {
    "hooks": ["string"],
    "rewrite": "string",
    "quick_fixes": ["string"]
  },
  "ai_view": {
    "facebook": "string",
    "tiktok": "string",
    "instagram": "string"
  },
  "prediction": {
    "reach": "ต่ำ",
    "hook_rate": 0,
    "main_issue": "string"
  },
  "strengths": ["string"],
  "platform_tip": "string"
}
      `,
    });

    if (content) {
      userContent.push({
        type: "input_text",
        text: content,
      });
    }

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");

      userContent.push({
        type: "input_image",
        image_url: `data:${image.type};base64,${base64}`,
      });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    // 🔥 แก้จุดพังตรงนี้
    const raw = response.output_text;

    if (!raw) {
      return NextResponse.json(
        { error: "AI ไม่ตอบ", debug: response },
        { status: 500 }
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json(
        { error: "AI ไม่ได้ตอบเป็น JSON", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: parsed,
      debug_raw: raw,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}