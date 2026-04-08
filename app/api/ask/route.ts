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
    "entry requirement",
    "enter thailand",
    "passport",
    "customs",
    "legal",
    "law",
    "regulation",
    "insurance",
    "covid",
    "embassy",
    "permit",
    "overstay",
    "fine",
    "illegal",
    "prohibited",
  ];

  return restrictedKeywords.some((keyword) => q.includes(keyword));
}

function getRestrictedMessage(language: string) {
  const lang = language?.toLowerCase() || "english";

  if (lang.includes("thai")) {
    return "ขออภัย เครื่องมือนี้ไม่ตอบเรื่องกฎหมาย วีซ่า หรือกฎการเข้าประเทศ กรุณาตรวจสอบจากแหล่งทางการ";
  }

  return "Sorry, this tool does not answer questions about laws, visas, or entry requirements. Please check official sources.";
}
// ======================

type DecisionOption = {
  option: string;
  vibe: string;
  bestFor: string;
  whyItFits: string;
};

type DecisionResult = {
  intro: string;
  options: DecisionOption[];
  quickGuide: string[];
  finalRecommendation: string;
  optionalContext: string;
};

function extractJson(text: string): string {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON object found in model response");
  }

  return text.slice(firstBrace, lastBrace + 1);
}

function sanitizeDecisionResult(data: any): DecisionResult {
  const options = Array.isArray(data?.options)
    ? data.options.slice(0, 3).map((item: any) => ({
        option: String(item?.option || "").trim(),
        vibe: String(item?.vibe || "").trim(),
        bestFor: String(item?.bestFor || "").trim(),
        whyItFits: String(item?.whyItFits || "").trim(),
      }))
    : [];

  const quickGuide = Array.isArray(data?.quickGuide)
    ? data.quickGuide
        .slice(0, 3)
        .map((item: any) => String(item || "").trim())
        .filter(Boolean)
    : [];

  return {
    intro: String(data?.intro || "").trim(),
    options,
    quickGuide,
    finalRecommendation: String(data?.finalRecommendation || "").trim(),
    optionalContext: String(data?.optionalContext || "").trim(),
  };
}

export async function POST(req: Request) {
  try {
    // ===== CHECK LIMIT =====
    const forwardedFor = req.headers.get("x-forwarded-for") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();

    if (!checkLimit(ip)) {
      return Response.json(
        {
          result: {
            intro: "You have reached the daily limit.",
            options: [],
            quickGuide: [],
            finalRecommendation: "Please try again tomorrow.",
            optionalContext: "",
          },
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
          result: {
            intro: "Please enter a question.",
            options: [],
            quickGuide: [],
            finalRecommendation: "",
            optionalContext: "",
          },
        },
        { status: 400 }
      );
    }

    // ===== BLOCK RESTRICTED =====
    if (isRestrictedQuestion(question)) {
      return Response.json({
        result: {
          intro: getRestrictedMessage(language),
          options: [],
          quickGuide: [],
          finalRecommendation: "",
          optionalContext: "",
        },
      });
    }
    // ======================

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a Thailand travel DECISION ENGINE.

Your job is NOT to explain.
Your job is to HELP THE USER DECIDE FAST.

User context:
- Location: ${province}
- Language: ${language}

PRODUCT GOAL:
- Reduce confusion
- Narrow choices
- Make the user feel they can stop thinking now

STRICT RULES:
- ALWAYS give only 2 or 3 options
- ALWAYS compare options
- ALWAYS push toward one strongest match
- NO long explanations
- NO generic travel guide tone
- NO markdown table
- NO numbered list
- NO extra commentary outside JSON
- Sound practical, confident, and human
- Keep every field short and easy to scan

Return ONLY valid JSON in this exact shape:

{
  "intro": "short human intro",
  "options": [
    {
      "option": "area or choice name",
      "vibe": "short vibe",
      "bestFor": "who it fits",
      "whyItFits": "why it fits"
    }
  ],
  "quickGuide": [
    "If you want X → Option A",
    "If you want Y → Option B"
  ],
  "finalRecommendation": "Best choice for YOU → Option A",
  "optionalContext": "short extra context"
}

REQUIREMENTS:
- options must contain 2 or 3 items
- quickGuide should contain 2 or 3 short lines
- intro must be short, direct, and calming
- optionalContext must be short
- finalRecommendation must be decisive and personal
- Avoid weak wording like "it depends" or "you could also"
- Do not sound like a blog or travel article
- Each option should feel clearly different from the others
- The finalRecommendation should match the strongest option in the list

IMPORTANT BOUNDARY:
- Only help with travel decisions
- Do NOT answer about laws, visas, immigration, insurance, customs, or legal requirements
- If question is about those, return JSON with the refusal in "intro" and leave other fields empty

User question:
${question}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a strict decision engine. Return only valid JSON with the exact required keys. Be decisive, concise, and product-like.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content || "";
    const parsed = JSON.parse(extractJson(raw));
    const result = sanitizeDecisionResult(parsed);

    return Response.json({
      result,
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