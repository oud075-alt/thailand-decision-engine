import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Platform = "facebook" | "tiktok" | "instagram";

type AnalysisResult = {
  headline: string;
  problems: string[];
  fix: {
    hooks: string[];
    rewrite: string;
    quick_fixes: string[];
  };
  ai_view: {
    facebook: string;
    tiktok: string;
    instagram: string;
  };
  prediction: {
    reach: "ต่ำ" | "กลาง" | "สูง";
    hook_rate: number;
    main_issue: string;
  };
  strengths: string[];
  platform_tip: string;
};

const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  tiktok: "TikTok",
  instagram: "Instagram",
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const content = ((formData.get("content") as string) || "").trim();
    const platformValue = ((formData.get("platform") as string) || "facebook").toLowerCase();
    const image = formData.get("image") as File | null;

    const platform: Platform =
      platformValue === "facebook" || platformValue === "tiktok" || platformValue === "instagram"
        ? platformValue
        : "facebook";

    if (!content && !image) {
      return NextResponse.json(
        { error: "กรุณาใส่ข้อความหรืออัปโหลดรูป" },
        { status: 400 }
      );
    }

    let imageDataUrl = "";

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = image.type || "image/png";
      imageDataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    const userContent: Array<
      | { type: "text"; text: string }
      | {
          type: "image_url";
          image_url: {
            url: string;
          };
        }
    > = [
      {
        type: "text",
        text: `
คุณคือ "เครื่องซ่อมคอนเทนต์"

หน้าที่:
- ถ้ามีข้อความ ให้ใช้ข้อความนั้นเป็นหลัก
- ถ้ามีภาพ ให้ดูภาพร่วมด้วย
- ถ้ามีแต่ภาพ ให้ดึงสารจากภาพแล้ววิเคราะห์เหมือนเป็นโพสต์จริง
- ต้องตอบเป็น JSON เท่านั้น
- ห้ามมีข้อความอื่นนอก JSON

แพลตฟอร์มเป้าหมาย: ${PLATFORM_LABELS[platform]}

กติกา:
- ตอบภาษาไทย
- พูดตรง สั้น ชัด
- ถ้าอ่านข้อความในภาพได้ไม่ครบ ให้ใช้เท่าที่เห็น
- ถ้ามีข้อความที่ผู้ใช้พิมพ์มา ให้ความสำคัญกับข้อความนั้นก่อน

JSON schema ที่ต้องตอบ:
{
  "headline": "string",
  "problems": ["string", "string", "string"],
  "fix": {
    "hooks": ["string", "string", "string"],
    "rewrite": "string",
    "quick_fixes": ["string", "string", "string"]
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
  "strengths": ["string", "string"],
  "platform_tip": "string"
}
        `.trim(),
      },
    ];

    if (content) {
      userContent.push({
        type: "text",
        text: `ข้อความที่ต้องวิเคราะห์:\n${content}`,
      });
    }

    if (imageDataUrl) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageDataUrl,
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "คุณคือเครื่องซ่อมคอนเทนต์ ต้องตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นนอก JSON",
        },
        {
          role: "user",
          content: userContent,
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

    let parsed: AnalysisResult;

    try {
      parsed = JSON.parse(raw) as AnalysisResult;
    } catch {
      return NextResponse.json(
        { error: "AI ไม่ได้ตอบเป็น JSON", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: parsed,
    });
  } catch (error) {
    console.error("Analyze error:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดระหว่างวิเคราะห์คอนเทนต์" },
      { status: 500 }
    );
  }
}