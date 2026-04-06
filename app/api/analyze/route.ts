import OpenAI from "openai"
import { NextResponse } from "next/server"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function getLanguageConfig(language: string) {
  switch (language) {
    case "Thai":
      return {
        languageRule: "Respond only in Thai.",
        title: "ตัวเลือกที่เหมาะกับคุณที่สุด",
        whyFits: "ทำไมตัวเลือกนี้ถึงเหมาะกับคุณ",
        avoid: "สิ่งที่ควรเลี่ยง",
        alternative: "ทางเลือกสำรอง",
        localTip: "ทิปแบบคนพื้นที่",
        risk: "ระดับความเสี่ยง",
      }
    case "Chinese":
      return {
        languageRule: "Respond only in Simplified Chinese.",
        title: "最适合你的选择",
        whyFits: "为什么这个选择适合你",
        avoid: "需要避免的事",
        alternative: "备选方案",
        localTip: "当地小提示",
        risk: "风险等级",
      }
    case "Hindi":
      return {
        languageRule: "Respond only in Hindi.",
        title: "आपके लिए सबसे सही विकल्प",
        whyFits: "यह विकल्प आपके लिए क्यों सही है",
        avoid: "किन बातों से बचना चाहिए",
        alternative: "दूसरा विकल्प",
        localTip: "स्थानीय सुझाव",
        risk: "जोखिम स्तर",
      }
    case "Japanese":
      return {
        languageRule: "Respond only in Japanese.",
        title: "あなたに最も合う選択",
        whyFits: "この選択が合う理由",
        avoid: "避けたほうがいいこと",
        alternative: "代わりの選択肢",
        localTip: "ローカルのヒント",
        risk: "リスクレベル",
      }
    case "English":
    default:
      return {
        languageRule: "Respond only in English.",
        title: "Best Choice",
        whyFits: "Why This Fits You",
        avoid: "What To Avoid",
        alternative: "Alternative Option",
        localTip: "Local Tip",
        risk: "Risk Level",
      }
  }
}

export async function POST(request: Request) {
  try {
    const {
      language = "English",
      province = "Krabi",
      days = "1-3",
      travelType = "solo",
      budget = "budget",
      style = "relax",
      concern = "wrong location",
    } = await request.json()

    const labels = getLanguageConfig(language)

    const systemPrompt = `
You are a Thailand local travel decision expert.

Your job is NOT to write like a blog.
Your job is to help the user make a clear travel decision for one selected province in Thailand.

Important rules:
- Focus on the selected province: ${province}
- The main recommendation must stay inside ${province}
- You may mention another province only as a backup choice if truly necessary
- Give practical advice that helps the user picture the trip clearly
- Write in a natural, human, easy-to-understand way
- Do not write too short
- Do not write too long
- Aim for around 70% detail: clear, visual, and easy to understand
- Avoid generic filler
- Avoid long bullet lists
- Use short paragraphs
- Sound like a smart local helper, not a brochure
- Focus on decision clarity, not storytelling
- Avoid repeating the same idea
- Each section must add new value

STRICT FORMAT RULE:
You MUST use the exact headings below.
Do NOT rename them.
Do NOT translate them differently.
Do NOT change wording.

Use EXACTLY these headings:

${labels.title}:
${labels.whyFits}:
${labels.avoid}:
${labels.alternative}:
${labels.localTip}:
${labels.risk}:

Writing instructions for each section:

${labels.title}:
Write 2-3 short paragraphs.
Recommend the best area, zone, or trip direction inside ${province}.
Make it specific enough that the user can imagine where to stay, what kind of atmosphere to expect, and how the trip should flow.

${labels.whyFits}:
Write 1-2 short paragraphs.
Explain clearly why this recommendation matches the user's days, travel type, budget, style, and concern.

${labels.avoid}:
Write 1 short paragraph.
Explain the most likely mistake for this case in ${province}, in plain language.

${labels.alternative}:
Write 1-2 short paragraphs.
Give one backup option.
Prefer another area in the same province.
Only move to another province if there is a strong reason.

${labels.localTip}:
Write 1 short paragraph.
Give one realistic local-style tip that feels useful and helps avoid friction or wasted time.

${labels.risk}:
Write 1 short paragraph.
Start with Low, Medium, or High if responding in English.
If responding in Thai, start with ต่ำ, ปานกลาง, or สูง.
If responding in Chinese, start with 低, 中, or 高.
If responding in Hindi, start with कम, मध्यम, or उच्च.
If responding in Japanese, start with 低, 中, or 高.
Then explain briefly why.

Do not add any introduction before the first heading.
Do not add any conclusion after the last heading.

${labels.languageRule}
    `.trim()

    const userPrompt = `
Province: ${province}
Days: ${days}
Travel type: ${travelType}
Budget: ${budget}
Style: ${style}
Main concern: ${concern}
    `.trim()

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: systemPrompt,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: userPrompt,
            },
          ],
        },
      ],
    })

    return NextResponse.json({
      result: response.output_text || "No result",
    })
  } catch (error) {
    console.error("API error:", error)

    return NextResponse.json(
      { result: "Server error" },
      { status: 500 }
    )
  }
}