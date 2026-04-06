import OpenAI from "openai"
import { NextResponse } from "next/server"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function getLanguageRule(language: string) {
  switch (language) {
    case "Thai":
      return "Respond only in Thai."
    case "Chinese":
      return "Respond only in Simplified Chinese."
    case "Hindi":
      return "Respond only in Hindi."
    case "Japanese":
      return "Respond only in Japanese."
    default:
      return "Respond only in English."
  }
}

function getUiLabels(language: string) {
  switch (language) {
    case "Thai":
      return {
        shortAnswer: "คำตอบสั้นๆ",
        why: "เหตุผล",
        nextStep: "ควรทำต่อยังไง",
      }
    case "Chinese":
      return {
        shortAnswer: "简短结论",
        why: "原因",
        nextStep: "接下来怎么做",
      }
    case "Hindi":
      return {
        shortAnswer: "संक्षिप्त जवाब",
        why: "क्यों",
        nextStep: "अब क्या करें",
      }
    case "Japanese":
      return {
        shortAnswer: "短い結論",
        why: "理由",
        nextStep: "次にすること",
      }
    default:
      return {
        shortAnswer: "Short Answer",
        why: "Why",
        nextStep: "What To Do Next",
      }
  }
}

export async function POST(req: Request) {
  try {
    const {
      language = "English",
      province = "Krabi",
      question = "",
    } = await req.json()

    if (!question || !question.trim()) {
      return NextResponse.json(
        { result: "Missing question" },
        { status: 400 }
      )
    }

    const labels = getUiLabels(language)

    const systemPrompt = `
You are a LOCAL Thailand travel fixer.

The user is asking about a real travel situation.
This is not a blog.
This is not a general guide.
This is not a long article.

Your job:
- Answer directly
- Focus on the selected province: ${province}
- Use practical real-world logic
- Reduce confusion
- Help the user decide fast
- If something is risky, say it clearly
- If the user is choosing between two things, lean toward one unless uncertainty is genuinely high
- Sound like a smart local helper
- Be clear, human, and useful
- Do not over-explain
- Do not use bullet lists
- Use short paragraphs
- Keep the answer moderately detailed, but still fast to read

STRICT FORMAT:
You must use exactly these headings and nothing else.

${labels.shortAnswer}:
Write 1 short paragraph. Give the direct answer first.

${labels.why}:
Write 1-2 short paragraphs. Explain the real reason, clearly and simply.

${labels.nextStep}:
Write 1 short paragraph. Tell the user exactly what to do next.

Do not add any introduction before the first heading.
Do not add any conclusion after the last heading.

${getLanguageRule(language)}
    `.trim()

    const userPrompt = `
Province: ${province}
Question: ${question}
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
    console.error("ASK API error:", error)

    return NextResponse.json(
      { result: "Server error" },
      { status: 500 }
    )
  }
}