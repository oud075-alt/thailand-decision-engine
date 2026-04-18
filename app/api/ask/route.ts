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
    ? data.options
        .slice(0, 3)
        .map((item: any) => ({
          option: String(item?.option || "").trim(),
          vibe: String(item?.vibe || "").trim(),
          bestFor: String(item?.bestFor || "").trim(),
          whyItFits: String(item?.whyItFits || "").trim(),
        }))
        .filter(
          (item: DecisionOption) =>
            item.option || item.vibe || item.bestFor || item.whyItFits
        )
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

const PROVINCE_HIGHLIGHTS: Record<string, string[]> = {
  Bangkok: [
    "Sukhumvit",
    "Siam",
    "Silom",
    "Old Town",
    "Chatuchak",
    "Riverside",
    "Khao San Road",
  ],
  Krabi: [
    "Ao Nang",
    "Railay Beach",
    "Krabi Town",
    "Klong Muang",
    "Tubkaek",
    "Phi Phi Islands",
    "Hong Islands",
    "Emerald Pool",
    "Tiger Cave Temple",
  ],
  Phuket: [
    "Patong",
    "Kata",
    "Karon",
    "Old Town",
    "Kamala",
    "Bang Tao",
    "Rawai",
    "Nai Harn",
    "Phi Phi day trip access",
  ],
  "Surat Thani": [
    "Koh Samui",
    "Chaweng",
    "Lamai",
    "Bophut / Fisherman's Village",
    "Maenam",
    "Choeng Mon",
    "Koh Phangan",
    "Haad Rin",
    "Thong Sala",
    "Srithanu",
    "Koh Tao",
    "Sairee Beach",
    "Surat Thani City",
    "Khao Sok access",
  ],
  "Phang Nga": [
    "Khao Lak",
    "Koh Yao Yai",
    "Koh Yao Noi",
    "Phang Nga Bay",
    "Similan Islands access",
    "Surin Islands access",
    "Samet Nangshe",
  ],
  PhangNga: [
    "Khao Lak",
    "Koh Yao Yai",
    "Koh Yao Noi",
    "Phang Nga Bay",
    "Similan Islands access",
    "Surin Islands access",
    "Samet Nangshe",
  ],
  "Chiang Mai": [
    "Old City",
    "Nimman",
    "Riverside",
    "Mae Rim",
    "Doi Suthep",
    "Mon Jam",
    "Elephant sanctuary areas",
  ],
  ChiangMai: [
    "Old City",
    "Nimman",
    "Riverside",
    "Mae Rim",
    "Doi Suthep",
    "Mon Jam",
    "Elephant sanctuary areas",
  ],
  "Chiang Rai": [
    "Chiang Rai Town",
    "White Temple area",
    "Blue Temple area",
    "Golden Triangle",
    "Mae Salong",
    "Phu Chi Fa",
  ],
  ChiangRai: [
    "Chiang Rai Town",
    "White Temple area",
    "Blue Temple area",
    "Golden Triangle",
    "Mae Salong",
    "Phu Chi Fa",
  ],
  Chonburi: [
    "Pattaya",
    "Jomtien",
    "Naklua",
    "Bangsaen",
    "Koh Larn",
    "Sriracha",
  ],
  "Prachuap Khiri Khan": [
    "Hua Hin",
    "Khao Takiab",
    "Pranburi",
    "Sam Roi Yot",
    "Kui Buri",
  ],
  PrachuapKhiriKhan: [
    "Hua Hin",
    "Khao Takiab",
    "Pranburi",
    "Sam Roi Yot",
    "Kui Buri",
  ],
  Kanchanaburi: [
    "River Kwai",
    "Kanchanaburi Town",
    "Erawan National Park",
    "Sai Yok",
    "Sangkhlaburi",
  ],
  Loei: ["Chiang Khan", "Phu Ruea", "Phu Kradueng", "ภูเรือ", "ภูกระดึง"],
  Nan: ["Nan Town", "Bo Kluea", "Pua", "Doi Samer Dao"],
  "Mae Hong Son": ["Pai", "Mae Hong Son Town", "Ban Rak Thai", "Pang Ung"],
  MaeHongSon: ["Pai", "Mae Hong Son Town", "Ban Rak Thai", "Pang Ung"],
  Trat: ["Koh Chang", "Koh Kood", "Koh Mak", "Trat Town"],
  Ranong: ["Koh Phayam", "Ranong Town", "Hot springs", "Mangrove areas"],
  Trang: ["Koh Mook", "Koh Kradan", "Koh Libong", "Trang Town"],
  Satun: ["Koh Lipe", "Tarutao", "Pak Bara", "La-ngu"],
  Songkhla: ["Hat Yai", "Songkhla Old Town", "Samila Beach", "Koh Yo"],
  Rayong: ["Koh Samet", "Mae Ramphueng", "Rayong City", "Ban Phe"],
  Phetchabun: ["Khao Kho", "Phu Thap Boek", "Wat Pha Sorn Kaew"],
  "Nakhon Ratchasima": [
    "Khao Yai",
    "Pak Chong",
    "Wang Nam Khiao",
    "Korat City",
  ],
  NakhonRatchasima: [
    "Khao Yai",
    "Pak Chong",
    "Wang Nam Khiao",
    "Korat City",
  ],
  "Udon Thani": ["Red Lotus Lake", "Udon City", "Ban Chiang"],
  UdonThani: ["Red Lotus Lake", "Udon City", "Ban Chiang"],
  Ayutthaya: [
    "Ayutthaya Historical Park",
    "Riverside",
    "Old City",
    "Night market area",
  ],
  "Phra Nakhon Si Ayutthaya": [
    "Ayutthaya Historical Park",
    "Riverside",
    "Old City",
    "Night market area",
  ],
};

function getProvinceHighlights(province: string) {
  if (!province) return [];

  const raw = province.trim();
  const compact = raw.replace(/\s+/g, "");

  return PROVINCE_HIGHLIGHTS[raw] || PROVINCE_HIGHLIGHTS[compact] || [];
}

function getFallbackResult(province: string, question: string): DecisionResult {
  const highlights = getProvinceHighlights(province);
  const first = highlights[0] || province;
  const second = highlights[1] || `${province} Town`;
  const third = highlights[2] || "main travel area";

  return {
    intro: `Here is the clearest way to narrow down your stay in ${province}.`,
    options: [
      {
        option: first,
        vibe: "most balanced",
        bestFor: "easy first choice",
        whyItFits: "Good starting point if you want convenience and fewer mistakes.",
      },
      {
        option: second,
        vibe: "slower and simpler",
        bestFor: "lighter plans",
        whyItFits: "Better if you want less movement and a calmer base.",
      },
      {
        option: third,
        vibe: "more specific",
        bestFor: "travelers with a stronger preference",
        whyItFits: "Useful if your trip is built around one activity or one mood.",
      },
    ],
    quickGuide: [
      `If you want the safest choice → ${first}`,
      `If you want calmer pace → ${second}`,
      `If you want something more specific → ${third}`,
    ],
    finalRecommendation: `Best choice for YOU → ${first}`,
    optionalContext: question
      ? "Your preference was included, but the model response was unstable, so a safe fallback was returned."
      : "",
  };
}

export async function POST(req: Request) {
  try {
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

    const body = await req.json();
    const question =
      typeof body?.question === "string" ? body.question.trim() : "";
    const language =
      typeof body?.language === "string" ? body.language.trim() : "English";
    const province =
      typeof body?.province === "string" ? body.province.trim() : "Thailand";

    if (!question) {
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

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          result: {
            intro: "The AI connection is not configured yet.",
            options: [],
            quickGuide: [],
            finalRecommendation: "",
            optionalContext: "Missing OPENAI_API_KEY",
          },
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const provinceHighlights = getProvinceHighlights(province);
    const provinceHintsText =
      provinceHighlights.length > 0
        ? provinceHighlights.join(", ")
        : "Use the province's best-known beaches, islands, mountains, waterfalls, old town areas, and city areas when relevant.";

    const prompt = `
You are a Thailand travel decision engine.

Your only job is to help the user decide where to stay fast.

User context:
- Province: ${province}
- Language: ${language}

Known major areas in this province:
${provinceHintsText}

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation outside JSON
- Give 2 or 3 clearly different options
- Use real famous areas when possible
- Push toward one strongest recommendation
- Keep every field short, practical, and easy to scan
- Only answer travel decision questions
- Do not answer about law, visa, immigration, insurance, customs, entry rules, or legal issues

JSON shape:
{
  "intro": "short human intro",
  "options": [
    {
      "option": "area name",
      "vibe": "short vibe",
      "bestFor": "who it fits",
      "whyItFits": "short reason"
    }
  ],
  "quickGuide": [
    "If you want X → Option A",
    "If you want Y → Option B"
  ],
  "finalRecommendation": "Best choice for YOU → Option A",
  "optionalContext": "short extra context"
}

User question:
${question}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a strict Thailand travel decision engine. Return only valid JSON with exactly these keys: intro, options, quickGuide, finalRecommendation, optionalContext.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(extractJson(raw));
    const result = sanitizeDecisionResult(parsed);

    if (!result.intro && result.options.length === 0) {
      return Response.json({
        result: getFallbackResult(province, question),
      });
    }

    return Response.json({
      result,
    });
  } catch (error: any) {
    console.error("ASK_ERROR:", error);

    return Response.json({
      result: getFallbackResult("Thailand", ""),
    });
  }
}