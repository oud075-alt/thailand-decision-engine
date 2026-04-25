"use client";

import { useMemo, useState } from "react";

type PrepResult = {
  bestMatch: {
    name: string;
    why: string;
    url: string;
  };
  alternatives: {
    level: string;
    name: string;
    why: string;
    url: string;
  }[];
};

type LangKey = "English" | "ไทย" | "中文" | "日本語" | "हिन्दी";

const translations: Record<
  LangKey,
  {
    title: string;
    subtitle: string;
    language: string;
    preparingFor: string;
    tripDuration: string;
    travelType: string;
    mainConcern: string;
    wantMost: string;
    placeholder: string;
    button: string;
    thinking: string;
    bestNextStep: string;
    openThisItem: string;
    viewOption: string;
    tripTypeOptions: string[];
    durationOptions: string[];
    travelTypeOptions: string[];
    concernOptions: string[];
  }
> = {
  English: {
    title: "Travel Prep Tool",
    subtitle: "Get a clear decision on what you need before your trip.",
    language: "Language",
    preparingFor: "What are you preparing for?",
    tripDuration: "Trip duration",
    travelType: "Travel type",
    mainConcern: "Main concern",
    wantMost: "What do you want most?",
    placeholder: "ex. travel light, stay connected, avoid problems",
    button: "Get My Packing Plan",
    thinking: "Thinking...",
    bestNextStep: "Best next step",
    openThisItem: "Open this item",
    viewOption: "View option",
    tripTypeOptions: [
      "beach trip",
      "island hopping",
      "city travel",
      "adventure",
      "first time thailand",
    ],
    durationOptions: ["1-3 days", "4-7 days", "7+ days"],
    travelTypeOptions: ["solo", "couple", "family", "friends"],
    concernOptions: [
      "don’t know what to pack",
      "worried about internet",
      "safety / insurance",
      "overpacking",
    ],
  },
  ไทย: {
    title: "เครื่องมือเตรียมตัวก่อนเดินทาง",
    subtitle: "ช่วยตัดสินใจว่าคุณควรเตรียมอะไรบ้างก่อนออกทริป",
    language: "ภาษา",
    preparingFor: "คุณกำลังเตรียมตัวสำหรับอะไร?",
    tripDuration: "ระยะเวลาทริป",
    travelType: "ประเภทการเดินทาง",
    mainConcern: "สิ่งที่กังวลที่สุด",
    wantMost: "คุณต้องการอะไรมากที่สุด?",
    placeholder: "เช่น เดินทางเบา ๆ เน็ตไม่ขาด ป้องกันปัญหา",
    button: "ดูสิ่งที่ควรเตรียม",
    thinking: "กำลังคิด...",
    bestNextStep: "สิ่งที่ควรเตรียมก่อน",
    openThisItem: "เปิดดูสิ่งนี้",
    viewOption: "ดูตัวเลือก",
    tripTypeOptions: [
      "ทริปทะเล",
      "เที่ยวเกาะ",
      "เที่ยวเมือง",
      "สายผจญภัย",
      "เที่ยวไทยครั้งแรก",
    ],
    durationOptions: ["1-3 วัน", "4-7 วัน", "7 วันขึ้นไป"],
    travelTypeOptions: ["คนเดียว", "คู่รัก", "ครอบครัว", "เพื่อน"],
    concernOptions: [
      "ไม่รู้จะจัดกระเป๋าอะไร",
      "กังวลเรื่องอินเทอร์เน็ต",
      "ความปลอดภัย / ประกัน",
      "กลัวขนของเยอะเกินไป",
    ],
  },
  中文: {
    title: "旅行准备工具",
    subtitle: "帮你在出发前清楚决定需要准备什么",
    language: "语言",
    preparingFor: "你正在为哪种旅行做准备？",
    tripDuration: "旅行时长",
    travelType: "出行类型",
    mainConcern: "主要担心的问题",
    wantMost: "你最想要的是什么？",
    placeholder: "例如：轻装出行、保持联网、避免麻烦",
    button: "获取我的准备建议",
    thinking: "思考中...",
    bestNextStep: "最适合先准备的",
    openThisItem: "打开这个项目",
    viewOption: "查看选项",
    tripTypeOptions: ["海滩旅行", "跳岛游", "城市旅行", "冒险旅行", "第一次去泰国"],
    durationOptions: ["1-3天", "4-7天", "7天以上"],
    travelTypeOptions: ["独自旅行", "情侣", "家庭", "朋友"],
    concernOptions: ["不知道该带什么", "担心网络问题", "安全 / 保险", "怕带太多东西"],
  },
  日本語: {
    title: "旅行準備ツール",
    subtitle: "出発前に何を準備すべきかを分かりやすく判断します",
    language: "言語",
    preparingFor: "どんな旅行の準備をしていますか？",
    tripDuration: "旅行日数",
    travelType: "旅行タイプ",
    mainConcern: "いちばん気になること",
    wantMost: "いちばん欲しいものは？",
    placeholder: "例：荷物を軽くしたい、ネットを確保したい、トラブルを避けたい",
    button: "準備プランを見る",
    thinking: "考え中...",
    bestNextStep: "最初に準備すべきもの",
    openThisItem: "これを見る",
    viewOption: "オプションを見る",
    tripTypeOptions: ["ビーチ旅行", "アイランドホッピング", "都市旅行", "アドベンチャー", "初めてのタイ旅行"],
    durationOptions: ["1-3日", "4-7日", "7日以上"],
    travelTypeOptions: ["一人旅", "カップル", "家族", "友達"],
    concernOptions: ["何を持てばいいかわからない", "インターネットが心配", "安全 / 保険", "荷物が多くなりすぎる"],
  },
  हिन्दी: {
    title: "ट्रैवल प्रेप टूल",
    subtitle: "यात्रा से पहले क्या तैयार करना है, इसका साफ़ निर्णय पाएँ",
    language: "भाषा",
    preparingFor: "आप किस तरह की यात्रा की तैयारी कर रहे हैं?",
    tripDuration: "यात्रा की अवधि",
    travelType: "यात्रा का प्रकार",
    mainConcern: "मुख्य चिंता",
    wantMost: "आपको सबसे ज़्यादा क्या चाहिए?",
    placeholder: "जैसे: हल्का सामान, कनेक्टेड रहना, दिक्कतों से बचना",
    button: "मेरी तैयारी योजना देखें",
    thinking: "सोच रहा है...",
    bestNextStep: "सबसे अच्छा अगला कदम",
    openThisItem: "इसे खोलें",
    viewOption: "विकल्प देखें",
    tripTypeOptions: [
      "बीच ट्रिप",
      "आइलैंड हॉपिंग",
      "सिटी ट्रैवल",
      "एडवेंचर",
      "थाईलैंड की पहली यात्रा",
    ],
    durationOptions: ["1-3 दिन", "4-7 दिन", "7+ दिन"],
    travelTypeOptions: ["अकेले", "कपल", "परिवार", "दोस्त"],
    concernOptions: [
      "समझ नहीं आ रहा क्या पैक करें",
      "इंटरनेट की चिंता",
      "सुरक्षा / बीमा",
      "ज़्यादा सामान ले जाने की चिंता",
    ],
  },
};

export default function AIToolsPage() {
  const [language, setLanguage] = useState<LangKey>("English");
  const [tripType, setTripType] = useState("beach trip");
  const [duration, setDuration] = useState("1-3 days");
  const [travelType, setTravelType] = useState("solo");
  const [concern, setConcern] = useState("don’t know what to pack");
  const [wantMost, setWantMost] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrepResult | null>(null);

  const t = useMemo(() => translations[language], [language]);

  const handleLanguageChange = (nextLanguage: LangKey) => {
    const current = translations[language];
    const next = translations[nextLanguage];

    const tripIndex = current.tripTypeOptions.indexOf(tripType);
    const durationIndex = current.durationOptions.indexOf(duration);
    const travelTypeIndex = current.travelTypeOptions.indexOf(travelType);
    const concernIndex = current.concernOptions.indexOf(concern);

    setLanguage(nextLanguage);

    if (tripIndex >= 0) setTripType(next.tripTypeOptions[tripIndex]);
    if (durationIndex >= 0) setDuration(next.durationOptions[durationIndex]);
    if (travelTypeIndex >= 0) setTravelType(next.travelTypeOptions[travelTypeIndex]);
    if (concernIndex >= 0) setConcern(next.concernOptions[concernIndex]);
  };

  const handleDecision = async () => {
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/ai-ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripType,
          duration,
          travelType,
          concern,
          wantMost,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return;
      }

      setResult(data.result || null);
    } catch (error) {
      console.error("TRAVEL_PREP_PAGE_ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>{t.title}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>

        <div style={styles.card}>
          <div style={styles.field}>
            <div style={styles.label}>{t.language}</div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LangKey)}
              style={styles.select}
            >
              <option>English</option>
              <option>ไทย</option>
              <option>中文</option>
              <option>日本語</option>
              <option>हिन्दी</option>
            </select>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>{t.preparingFor}</div>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
              style={styles.select}
            >
              {t.tripTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>{t.tripDuration}</div>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={styles.select}
            >
              {t.durationOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>{t.travelType}</div>
            <select
              value={travelType}
              onChange={(e) => setTravelType(e.target.value)}
              style={styles.select}
            >
              {t.travelTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>{t.mainConcern}</div>
            <select
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              style={styles.select}
            >
              {t.concernOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>{t.wantMost}</div>
            <input
              type="text"
              value={wantMost}
              onChange={(e) => setWantMost(e.target.value)}
              placeholder={t.placeholder}
              style={styles.input}
            />
          </div>

          <button style={styles.button} onClick={handleDecision}>
            {loading ? t.thinking : t.button}
          </button>
        </div>

        {result && (
          <div style={styles.resultWrap}>
            <div style={styles.resultBox}>
              <div style={styles.resultLabel}>{t.bestNextStep}</div>
              <div style={styles.resultBest}>{result.bestMatch.name}</div>
              <div style={styles.resultWhy}>{result.bestMatch.why}</div>

              <a
                href={result.bestMatch.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.linkButton}
              >
                {t.openThisItem}
              </a>
            </div>

            {result.alternatives.map((item, index) => (
              <div key={index} style={styles.altCard}>
                <div style={styles.altLevel}>{item.level}</div>
                <div style={styles.altName}>{item.name}</div>
                <div style={styles.altWhy}>{item.why}</div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.altLink}
                >
                  {t.viewOption}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f7",
    padding: "40px 20px",
    fontFamily: "system-ui",
  },

  container: {
    maxWidth: 820,
    margin: "0 auto",
  },

  title: {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 10,
    color: "#111827",
  },

  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 24,
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    color: "#374151",
  },

  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 16,
    background: "#fff",
    outline: "none",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 16,
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "16px 20px",
    border: "none",
    borderRadius: 14,
    fontSize: 17,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #4f8df8 0%, #2563eb 100%)",
    cursor: "pointer",
    marginTop: 8,
  },

  resultWrap: {
    marginTop: 20,
    display: "grid",
    gap: 16,
  },

  resultBox: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },

  resultLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#6b7280",
    marginBottom: 6,
  },

  resultBest: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 12,
    color: "#111827",
  },

  resultWhy: {
    fontSize: 16,
    lineHeight: 1.6,
    color: "#374151",
    marginBottom: 14,
  },

  linkButton: {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 12,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
  },

  altCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },

  altLevel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#6b7280",
    marginBottom: 6,
    textTransform: "uppercase",
  },

  altName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 10,
  },

  altWhy: {
    fontSize: 15,
    lineHeight: 1.6,
    color: "#4b5563",
    marginBottom: 12,
  },

  altLink: {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 10,
    background: "#eff6ff",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
};