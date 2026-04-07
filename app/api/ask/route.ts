import OpenAI from "openai";

export const dynamic = "force-dynamic";

// ===== LIMIT LOGIC =====
const requestCounts = new Map<string, { count: number; date: string }>();

function checkLimit(ip: string) {
  const today = new Date().toISOString().slice(0, 10);
  const user = requestCounts.get(ip);

  if (!user || user.date !== today) {
    requestCounts.set(ip, { count: 1, date: today });
    return true;
  }

  if (user.count >= 3) {
    return false;
  }

  user.count += 1;
  return true;
}
// ======================

// ===== QUESTION FILTER =====
function normalizeText(text: string) {
  return text.toLowerCase().trim();
}

function isRestrictedQuestion(question: string) {
  const q = normalizeText(question);

  const restrictedKeywords = [
    "visa",
    "e-visa",
    "immigration",
    "immigration rules",
    "entry requirement",
    "entry requirements",
    "enter thailand",
    "entering thailand",
    "re-enter",
    "reentry",
    "tm6",
    "tm30",
    "passport validity",
    "customs",
    "declare",
    "declaration",
    "legal",
    "law",
    "laws",
    "regulation",
    "regulations",
    "rule",
    "rules",
    "official requirement",
    "official requirements",
    "insurance",
    "travel insurance",
    "mandatory insurance",
    "required insurance",
    "covid requirement",
    "covid requirements",
    "border control",
    "embassy",
    "consulate",
    "work permit",
    "permit",
    "residence permit",
    "overstay",
    "fine",
    "fines",
    "arrest",
    "illegal",
    "allowed to bring",
    "allowed to carry",
    "prohibited item",
    "prohibited items",
  ];

  return restrictedKeywords.some((keyword) => q.includes(keyword));
}

function getRestrictedMessage(language: string) {
  const lang = language?.toLowerCase() || "english";

  if (lang.includes("thai")) {
    return "ขออภัย เครื่องมือนี้ไม่ตอบเรื่องกฎหมาย วีซ่า ตม. ประกัน หรือกฎการเข้าประเทศ กรุณาตรวจสอบจากแหล่งข้อมูลทางการโดยตรง";
  }

  if (lang.includes("chinese")) {
    return "抱歉，这个工具不回答法律、签证、移民、保险或入境规定相关问题。请直接查看官方信息来源。";
  }

  if (lang.includes("japanese")) {
    return "申し訳ありません。このツールは法律、ビザ、入国管理、保険、入国条件に関する質問には対応していません。公式情報をご確認ください。";
  }

  if (lang.includes("hindi")) {
    return "क्षमा करें, यह टूल कानून, वीज़ा, इमिग्रेशन, इंश्योरेंस या एंट्री नियमों से जुड़े सवालों का जवाब नहीं देता। कृपया आधिकारिक स्रोत देखें।";
  }

  return "Sorry, this tool does not answer questions about laws, visas, immigration, insurance, or entry requirements. Please check official sources directly.";
}
// ======================

export async function POST(req: Request) {
  try {
    // ===== CHECK LIMIT =====
    const forwardedFor = req.headers.get("x-forwarded-for") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();

    if (!checkLimit(ip)) {
      return Response.json(
        {
          result:
            "You have reached the daily limit (3 requests). Please try again tomorrow.",
        },
        { status: 429 }
      );
    }
    // ======================

    const body = await req.json();
    const { question, language, province } = body;

    if (!question || typeof question !== "string") {
      return Response.json(
        {
          result: "Please enter a question.",
        },
        { status: 400 }
      );
    }

    // ===== BLOCK RESTRICTED TOPICS =====
    if (isRestrictedQuestion(question)) {
      return Response.json({
        result: getRestrictedMessage(language),
      });
    }
    // ======================

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a local Thailand travel decision assistant.

The user is asking about travel in ${province}.
Answer in ${language}.

IMPORTANT BOUNDARY:
- Only help with travel planning, places, transport, timing, budget, weather patterns, trip style, and visitor experience.
- Do NOT answer about laws, visas, immigration rules, entry requirements, insurance, customs, or legal requirements.
- If the user's question is about any of those restricted topics, refuse briefly and tell them to check official sources.

Rules:
- Do NOT start with greeting
- Be direct and practical
- Sound like a real local person
- Include real-world details (time, price, transport, how things usually work)
- Help the user decide, not just explain
- No emojis
- No marketing tone
- If something is uncertain, say so clearly
- Do not invent official rules or legal facts

Structure EXACTLY:

Short Answer:
[give clear decision]

Why:
[simple local explanation]

What to do next:
[actionable steps with time/price if possible]

Question:
${question}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You help travelers make practical decisions in Thailand. You must refuse questions about laws, visas, immigration, insurance, customs, or entry rules, and redirect users to official sources.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return Response.json({
      result: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("ASK_ERROR:", error);

    return Response.json(
      {
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}