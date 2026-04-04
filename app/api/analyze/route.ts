import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Platform = "facebook" | "tiktok" | "instagram";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const content = (formData.get("content") as string) || "";
    const platform = (formData.get("platform") as Platform) || "facebook";
    const image = formData.get("image") as File | null;

    // เช็ค input
    if (!content && !image) {
      return NextResponse.json(
        { error: "กรุณาใส่ข้อความหรืออัปโหลดรูป" },
        { status: 400 }
      );
    }

    // แค่ทดสอบว่ารับรูปได้จริงไหม
    if (image) {
      console.log("ได้รับรูป:", image.name, image.type, image.size);
    }

    // ตอนนี้ยังใช้ content วิเคราะห์เหมือนเดิมก่อน
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "คุณคือช่างซ่อมคอนเทนต์",
        },
        {
          role: "user",
          content: content || "มีรูปแต่ไม่มีข้อความ",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      note: image ? "มีการอัปโหลดรูปแล้ว" : "ไม่มีรูป",
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}