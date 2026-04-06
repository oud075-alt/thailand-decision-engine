"use client"

import { useState } from "react"

const provinces = [
  "Bangkok",
  "Amnat Charoen",
  "Ang Thong",
  "Bueng Kan",
  "Buriram",
  "Chachoengsao",
  "Chai Nat",
  "Chaiyaphum",
  "Chanthaburi",
  "Chiang Mai",
  "Chiang Rai",
  "Chonburi",
  "Chumphon",
  "Kalasin",
  "Kamphaeng Phet",
  "Kanchanaburi",
  "Khon Kaen",
  "Krabi",
  "Lampang",
  "Lamphun",
  "Loei",
  "Lopburi",
  "Mae Hong Son",
  "Maha Sarakham",
  "Mukdahan",
  "Nakhon Nayok",
  "Nakhon Pathom",
  "Nakhon Phanom",
  "Nakhon Ratchasima",
  "Nakhon Sawan",
  "Nakhon Si Thammarat",
  "Nan",
  "Narathiwat",
  "Nong Bua Lamphu",
  "Nong Khai",
  "Nonthaburi",
  "Pathum Thani",
  "Pattani",
  "Phang Nga",
  "Phatthalung",
  "Phayao",
  "Phetchabun",
  "Phetchaburi",
  "Phichit",
  "Phitsanulok",
  "Phra Nakhon Si Ayutthaya",
  "Phrae",
  "Phuket",
  "Prachinburi",
  "Prachuap Khiri Khan",
  "Ranong",
  "Ratchaburi",
  "Rayong",
  "Roi Et",
  "Sa Kaeo",
  "Sakon Nakhon",
  "Samut Prakan",
  "Samut Sakhon",
  "Samut Songkhram",
  "Saraburi",
  "Satun",
  "Sing Buri",
  "Sisaket",
  "Songkhla",
  "Sukhothai",
  "Suphan Buri",
  "Surat Thani",
  "Surin",
  "Tak",
  "Trang",
  "Trat",
  "Ubon Ratchathani",
  "Udon Thani",
  "Uthai Thani",
  "Uttaradit",
  "Yala",
  "Yasothon",
]

const provinceThai: Record<string, string> = {
  Bangkok: "กรุงเทพมหานคร",
  "Amnat Charoen": "อำนาจเจริญ",
  "Ang Thong": "อ่างทอง",
  "Bueng Kan": "บึงกาฬ",
  Buriram: "บุรีรัมย์",
  Chachoengsao: "ฉะเชิงเทรา",
  "Chai Nat": "ชัยนาท",
  Chaiyaphum: "ชัยภูมิ",
  Chanthaburi: "จันทบุรี",
  "Chiang Mai": "เชียงใหม่",
  "Chiang Rai": "เชียงราย",
  Chonburi: "ชลบุรี",
  Chumphon: "ชุมพร",
  Kalasin: "กาฬสินธุ์",
  "Kamphaeng Phet": "กำแพงเพชร",
  Kanchanaburi: "กาญจนบุรี",
  "Khon Kaen": "ขอนแก่น",
  Krabi: "กระบี่",
  Lampang: "ลำปาง",
  Lamphun: "ลำพูน",
  Loei: "เลย",
  Lopburi: "ลพบุรี",
  "Mae Hong Son": "แม่ฮ่องสอน",
  "Maha Sarakham": "มหาสารคาม",
  Mukdahan: "มุกดาหาร",
  "Nakhon Nayok": "นครนายก",
  "Nakhon Pathom": "นครปฐม",
  "Nakhon Phanom": "นครพนม",
  "Nakhon Ratchasima": "นครราชสีมา",
  "Nakhon Sawan": "นครสวรรค์",
  "Nakhon Si Thammarat": "นครศรีธรรมราช",
  Nan: "น่าน",
  Narathiwat: "นราธิวาส",
  "Nong Bua Lamphu": "หนองบัวลำภู",
  "Nong Khai": "หนองคาย",
  Nonthaburi: "นนทบุรี",
  "Pathum Thani": "ปทุมธานี",
  Pattani: "ปัตตานี",
  "Phang Nga": "พังงา",
  Phatthalung: "พัทลุง",
  Phayao: "พะเยา",
  Phetchabun: "เพชรบูรณ์",
  Phetchaburi: "เพชรบุรี",
  Phichit: "พิจิตร",
  Phitsanulok: "พิษณุโลก",
  "Phra Nakhon Si Ayutthaya": "พระนครศรีอยุธยา",
  Phrae: "แพร่",
  Phuket: "ภูเก็ต",
  Prachinburi: "ปราจีนบุรี",
  "Prachuap Khiri Khan": "ประจวบคีรีขันธ์",
  Ranong: "ระนอง",
  Ratchaburi: "ราชบุรี",
  Rayong: "ระยอง",
  "Roi Et": "ร้อยเอ็ด",
  "Sa Kaeo": "สระแก้ว",
  "Sakon Nakhon": "สกลนคร",
  "Samut Prakan": "สมุทรปราการ",
  "Samut Sakhon": "สมุทรสาคร",
  "Samut Songkhram": "สมุทรสงคราม",
  Saraburi: "สระบุรี",
  Satun: "สตูล",
  "Sing Buri": "สิงห์บุรี",
  Sisaket: "ศรีสะเกษ",
  Songkhla: "สงขลา",
  Sukhothai: "สุโขทัย",
  "Suphan Buri": "สุพรรณบุรี",
  "Surat Thani": "สุราษฎร์ธานี",
  Surin: "สุรินทร์",
  Tak: "ตาก",
  Trang: "ตรัง",
  Trat: "ตราด",
  "Ubon Ratchathani": "อุบลราชธานี",
  "Udon Thani": "อุดรธานี",
  "Uthai Thani": "อุทัยธานี",
  Uttaradit: "อุตรดิตถ์",
  Yala: "ยะลา",
  Yasothon: "ยโสธร",
}

const ui: Record<string, any> = {
  English: {
    title: "Thailand Decision Engine",
    subtitle:
      "Choose your destination, travel style, and trip type to get a clearer travel decision.",
    modeDecision: "Decision Mode",
    modeAsk: "Ask Mode",
    askPlaceholder:
      "Example: Phi Phi or Hong? / Is taxi expensive? / Early flight, what time should I leave?",
    askButton: "Ask",
    language: "Language",
    province: "Province",
    days: "Days",
    travelType: "Travel type",
    budget: "Budget",
    style: "Style",
    concern: "Main concern",
    button: "Get Decision",
    thinking: "Thinking...",
    error: "Something went wrong",
    noResult: "No result",
    days1: "1-3 days",
    days2: "4-7 days",
    days3: "7+ days",
    solo: "solo",
    couple: "couple",
    family: "family",
    friends: "friends",
    budget1: "budget",
    budget2: "mid",
    budget3: "luxury",
    style1: "relax",
    style2: "explore",
    style3: "party",
    style4: "mixed",
    concern1: "wrong location",
    concern2: "wasted time",
    concern3: "overpaying",
    concern4: "don't know where to start",
    provinceLabel: (name: string) => name,
  },
  Thai: {
    title: "เครื่องช่วยตัดสินใจเที่ยวไทย",
    subtitle:
      "เลือกจังหวัด รูปแบบการเที่ยว และสไตล์การเดินทาง เพื่อให้ได้คำแนะนำที่ชัดขึ้นและตัดสินใจง่ายขึ้น",
    modeDecision: "โหมดเลือกให้",
    modeAsk: "โหมดถามตรงๆ",
    askPlaceholder:
      "เช่น: ไป phi phi หรือ hong ดี / taxi กระบี่แพงไหม / flight เช้าควรออกกี่โมง",
    askButton: "ถามเลย",
    language: "ภาษา",
    province: "จังหวัด",
    days: "จำนวนวัน",
    travelType: "ลักษณะการเดินทาง",
    budget: "งบประมาณ",
    style: "สไตล์เที่ยว",
    concern: "สิ่งที่กังวลที่สุด",
    button: "ขอคำแนะนำ",
    thinking: "กำลังคิด...",
    error: "เกิดข้อผิดพลาด",
    noResult: "ยังไม่มีผลลัพธ์",
    days1: "1-3 วัน",
    days2: "4-7 วัน",
    days3: "7 วันขึ้นไป",
    solo: "เที่ยวคนเดียว",
    couple: "คู่รัก",
    family: "ครอบครัว",
    friends: "เพื่อน",
    budget1: "ประหยัด",
    budget2: "ปานกลาง",
    budget3: "หรู",
    style1: "พักผ่อน",
    style2: "เที่ยวสำรวจ",
    style3: "สายปาร์ตี้",
    style4: "ผสมหลายแบบ",
    concern1: "กลัวเลือกพื้นที่ผิด",
    concern2: "กลัวเสียเวลา",
    concern3: "กลัวจ่ายแพงเกินไป",
    concern4: "ไม่รู้จะเริ่มจากตรงไหน",
    provinceLabel: (name: string) => provinceThai[name] || name,
  },
  Chinese: {
    title: "泰国旅行决策助手",
    subtitle: "选择目的地、省份、旅行方式和风格，帮助你更快做出更清晰的旅行决定。",
    modeDecision: "选择模式",
    modeAsk: "提问模式",
    askPlaceholder:
      "例如：Phi Phi 还是 Hong？/ 出租车贵吗？/ 早班机几点出发？",
    askButton: "提问",
    language: "语言",
    province: "省份",
    days: "天数",
    travelType: "出行类型",
    budget: "预算",
    style: "旅行风格",
    concern: "最担心的问题",
    button: "获取建议",
    thinking: "正在分析...",
    error: "发生错误",
    noResult: "暂无结果",
    days1: "1-3天",
    days2: "4-7天",
    days3: "7天以上",
    solo: "独自旅行",
    couple: "情侣",
    family: "家庭",
    friends: "朋友",
    budget1: "经济型",
    budget2: "中等",
    budget3: "高端",
    style1: "放松休闲",
    style2: "探索体验",
    style3: "夜生活/派对",
    style4: "混合型",
    concern1: "担心选错地方",
    concern2: "担心浪费时间",
    concern3: "担心花太多钱",
    concern4: "不知道从哪里开始",
    provinceLabel: (name: string) => name,
  },
  Hindi: {
    title: "थाईलैंड ट्रैवल डिसीजन इंजन",
    subtitle:
      "अपनी मंज़िल, यात्रा शैली और ट्रिप प्रकार चुनें ताकि आपको ज़्यादा साफ़ और आसान निर्णय मिल सके।",
    modeDecision: "डिसीजन मोड",
    modeAsk: "आस्क मोड",
    askPlaceholder:
      "उदाहरण: Phi Phi या Hong? / टैक्सी महंगी है? / सुबह की फ्लाइट के लिए कितने बजे निकलें?",
    askButton: "पूछें",
    language: "भाषा",
    province: "प्रांत",
    days: "दिन",
    travelType: "यात्रा प्रकार",
    budget: "बजट",
    style: "यात्रा शैली",
    concern: "मुख्य चिंता",
    button: "सलाह पाएं",
    thinking: "सोचा जा रहा है...",
    error: "कुछ गड़बड़ हो गई",
    noResult: "कोई परिणाम नहीं",
    days1: "1-3 दिन",
    days2: "4-7 दिन",
    days3: "7+ दिन",
    solo: "अकेले",
    couple: "कपल",
    family: "परिवार",
    friends: "दोस्त",
    budget1: "कम बजट",
    budget2: "मध्यम",
    budget3: "लक्ज़री",
    style1: "आराम",
    style2: "घूमना-खोजना",
    style3: "पार्टी",
    style4: "मिक्स",
    concern1: "गलत जगह चुनने का डर",
    concern2: "समय बर्बाद होने का डर",
    concern3: "ज़्यादा खर्च होने का डर",
    concern4: "समझ नहीं आ रहा कहाँ से शुरू करें",
    provinceLabel: (name: string) => name,
  },
  Japanese: {
    title: "タイ旅行ディシジョンエンジン",
    subtitle:
      "行き先、旅のタイプ、スタイルを選ぶと、より分かりやすく旅の判断ができます。",
    modeDecision: "選択モード",
    modeAsk: "質問モード",
    askPlaceholder:
      "例: Phi Phi と Hong どっち？ / タクシー高い？ / 早朝便は何時に出ればいい？",
    askButton: "質問する",
    language: "言語",
    province: "県",
    days: "日数",
    travelType: "旅行タイプ",
    budget: "予算",
    style: "旅のスタイル",
    concern: "いちばん心配なこと",
    button: "提案を見る",
    thinking: "考え中...",
    error: "エラーが発生しました",
    noResult: "結果がありません",
    days1: "1-3日",
    days2: "4-7日",
    days3: "7日以上",
    solo: "一人旅",
    couple: "カップル",
    family: "家族",
    friends: "友人",
    budget1: "節約",
    budget2: "中間",
    budget3: "高級",
    style1: "のんびり",
    style2: "探索",
    style3: "パーティー",
    style4: "ミックス",
    concern1: "場所選びを間違えたくない",
    concern2: "時間を無駄にしたくない",
    concern3: "高くつきすぎるのが不安",
    concern4: "何から始めればいいか分からない",
    provinceLabel: (name: string) => name,
  },
}

export default function Home() {
  const [language, setLanguage] = useState("English")
  const [province, setProvince] = useState("Krabi")
  const [days, setDays] = useState("1-3")
  const [travelType, setTravelType] = useState("solo")
  const [budget, setBudget] = useState("budget")
  const [style, setStyle] = useState("relax")
  const [concern, setConcern] = useState("wrong location")
  const [mode, setMode] = useState("decision")
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const t = ui[language] || ui.English

  const handleSubmit = async () => {
    setLoading(true)
    setResult("")

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          province,
          days,
          travelType,
          budget,
          style,
          concern,
        }),
      })

      const data = await res.json()
      setResult(data.result || t.noResult)
    } catch (error) {
      setResult(t.error)
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = async () => {
    setLoading(true)
    setResult("")

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          province,
          question,
        }),
      })

      const data = await res.json()
      setResult(data.result || t.noResult)
    } catch (error) {
      setResult(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "40px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>{t.title}</h1>

      <p style={{ marginBottom: "24px", color: "#555", lineHeight: 1.6 }}>
        {t.subtitle}
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => setMode("decision")}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            background: mode === "decision" ? "#111" : "#eee",
            color: mode === "decision" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          {t.modeDecision}
        </button>

        <button
          onClick={() => setMode("ask")}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            background: mode === "ask" ? "#111" : "#eee",
            color: mode === "ask" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          {t.modeAsk}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <label>
          <div style={{ marginBottom: "6px" }}>{t.language}</div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
          >
            <option value="English">English</option>
            <option value="Chinese">中文</option>
            <option value="Hindi">हिन्दी</option>
            <option value="Japanese">日本語</option>
            <option value="Thai">ไทย</option>
          </select>
        </label>

        <label>
          <div style={{ marginBottom: "6px" }}>{t.province}</div>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
          >
            {provinces.map((item) => (
              <option key={item} value={item}>
                {t.provinceLabel(item)}
              </option>
            ))}
          </select>
        </label>

        {mode === "decision" && (
          <>
            <label>
              <div style={{ marginBottom: "6px" }}>{t.days}</div>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              >
                <option value="1-3">{t.days1}</option>
                <option value="4-7">{t.days2}</option>
                <option value="7+">{t.days3}</option>
              </select>
            </label>

            <label>
              <div style={{ marginBottom: "6px" }}>{t.travelType}</div>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              >
                <option value="solo">{t.solo}</option>
                <option value="couple">{t.couple}</option>
                <option value="family">{t.family}</option>
                <option value="friends">{t.friends}</option>
              </select>
            </label>

            <label>
              <div style={{ marginBottom: "6px" }}>{t.budget}</div>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              >
                <option value="budget">{t.budget1}</option>
                <option value="mid">{t.budget2}</option>
                <option value="luxury">{t.budget3}</option>
              </select>
            </label>

            <label>
              <div style={{ marginBottom: "6px" }}>{t.style}</div>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              >
                <option value="relax">{t.style1}</option>
                <option value="explore">{t.style2}</option>
                <option value="party">{t.style3}</option>
                <option value="mixed">{t.style4}</option>
              </select>
            </label>

            <label>
              <div style={{ marginBottom: "6px" }}>{t.concern}</div>
              <select
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              >
                <option value="wrong location">{t.concern1}</option>
                <option value="wasted time">{t.concern2}</option>
                <option value="overpaying">{t.concern3}</option>
                <option value="don't know where to start">{t.concern4}</option>
              </select>
            </label>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "12px",
                marginTop: "8px",
                cursor: "pointer",
              }}
            >
              {loading ? t.thinking : t.button}
            </button>
          </>
        )}

        {mode === "ask" && (
          <>
            <textarea
              placeholder={t.askPlaceholder}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{
                width: "100%",
                height: "120px",
                padding: "12px",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />

            <button
              onClick={handleAsk}
              disabled={loading}
              style={{
                padding: "12px",
                marginTop: "8px",
                cursor: "pointer",
              }}
            >
              {loading ? t.thinking : t.askButton}
            </button>
          </>
        )}

        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fafafa",
            minHeight: "160px",
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              fontFamily: "inherit",
              lineHeight: 1.65,
            }}
          >
            {result}
          </pre>
        </div>
      </div>
    </main>
  )
}