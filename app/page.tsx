"use client";

import { useMemo, useState } from "react";

type AnalyzeResult = {
  platform?: string;
  verdict?: string;
  scroll_stop_power?: number;
  first_3_seconds_verdict?: string;
  brutal_truth?: string;
  summary?: string;
  score?: {
    hook: number;
    clarity: number;
    relevance: number;
    engagement_potential: number;
    platform_fit: number;
    total: number;
  };
  reach_prediction?: {
    level: string;
    score: number;
    reason: string[];
    risk: string[];
  };
  strengths?: string[];
  weaknesses?: string[];
  why_not_working?: string[];
  killer_suggestions?: string[];
  rewrite_hook?: string;
  rewrite_cta?: string;
  improved_post?: string;
  error?: string;
};

const platformCopy = {
  facebook: {
    pageTitle: "เครื่องมือตรวจสอบ Content สำหรับ Facebook 🔥",
    platformLabel: "จะโพสต์ที่ไหน",
    textareaPlaceholder:
      "วางโพสต์ Facebook ของคุณตรงนี้... เช่น โพสต์ชวนคิด โพสต์เล่าเรื่อง หรือโพสต์ที่อยากให้คนคอมเมนต์",
    buttonText: "วิเคราะห์โพสต์ Facebook",
    resultTitle: "ผลวิเคราะห์สำหรับ Facebook",
    scoreLabels: {
      engagement: "Comment / Share Potential",
      fit: "Facebook Fit",
    },
    reachTitle: "คาดการณ์ Reach บน Facebook",
  },
  tiktok: {
    pageTitle: "เครื่องมือตรวจสอบ Hook สำหรับ TikTok ⚡",
    platformLabel: "จะโพสต์ที่ไหน",
    textareaPlaceholder:
      "วางสคริปต์เปิดคลิป หรือข้อความ TikTok ของคุณตรงนี้... เน้นประโยคเปิด 1-3 วินาทีแรก",
    buttonText: "วิเคราะห์โพสต์ TikTok",
    resultTitle: "ผลวิเคราะห์สำหรับ TikTok",
    scoreLabels: {
      engagement: "Watch / Comment Trigger",
      fit: "TikTok Fit",
    },
    reachTitle: "คาดการณ์โอกาสไปต่อบน TikTok",
  },
  instagram: {
    pageTitle: "เครื่องมือตรวจสอบ Caption สำหรับ Instagram ✨",
    platformLabel: "จะโพสต์ที่ไหน",
    textareaPlaceholder:
      "วาง caption Instagram ของคุณตรงนี้... เน้นความกระชับ ความรู้สึก และความหยุดสายตา",
    buttonText: "วิเคราะห์โพสต์ Instagram",
    resultTitle: "ผลวิเคราะห์สำหรับ Instagram",
    scoreLabels: {
      engagement: "Save / Comment Potential",
      fit: "Instagram Fit",
    },
    reachTitle: "คาดการณ์ Reach บน Instagram",
  },
} as const;

export default function Page() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<"facebook" | "tiktok" | "instagram">(
    "facebook"
  );
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const ui = useMemo(() => platformCopy[platform], [platform]);

  const analyze = async () => {
    if (!content.trim()) {
      setResult({ error: "กรุณาใส่ข้อความก่อน" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          platform,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "เชื่อมต่อไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: 44, marginBottom: 20 }}>{ui.pageTitle}</h1>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          {ui.platformLabel}
        </label>
        <select
          value={platform}
          onChange={(e) =>
            setPlatform(e.target.value as "facebook" | "tiktok" | "instagram")
          }
          style={{
            width: "100%",
            padding: 12,
            fontSize: 18,
            border: "1px solid #999",
            borderRadius: 6,
          }}
        >
          <option value="facebook">Facebook</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
      </div>

      <textarea
        placeholder={ui.textareaPlaceholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          width: "100%",
          height: 220,
          padding: 12,
          fontSize: 18,
          border: "1px solid #999",
          borderRadius: 6,
          marginBottom: 20,
        }}
      />

      <button
        onClick={analyze}
        disabled={loading}
        style={{
          width: "100%",
          padding: 14,
          fontSize: 20,
          backgroundColor: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginBottom: 24,
          borderRadius: 6,
        }}
      >
        {loading ? "กำลังวิเคราะห์..." : ui.buttonText}
      </button>

      <div style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        <h2>{ui.resultTitle}</h2>

        {result?.error && (
          <div style={{ color: "red", fontSize: 18 }}>❌ {result.error}</div>
        )}

        {!result?.error && result && (
          <>
            {result.platform && (
              <p>
                <strong>แพลตฟอร์ม:</strong> {result.platform}
              </p>
            )}

            {result.verdict && (
              <p>
                <strong>คำตัดสิน:</strong> {result.verdict}
              </p>
            )}

            {typeof result.scroll_stop_power === "number" && (
              <p>
                <strong>พลังหยุดนิ้ว:</strong> {result.scroll_stop_power}/10
              </p>
            )}

            {result.first_3_seconds_verdict && (
              <p>
                <strong>3 วินาทีแรก:</strong> {result.first_3_seconds_verdict}
              </p>
            )}

            {result.brutal_truth && (
              <p>
                <strong>ความจริงแบบตรงๆ:</strong> {result.brutal_truth}
              </p>
            )}

            {result.summary && (
              <p>
                <strong>สรุป:</strong> {result.summary}
              </p>
            )}

            {!!result.score && (
              <div style={{ marginTop: 16 }}>
                <h3>คะแนน</h3>
                <p>Hook: {result.score.hook}/10</p>
                <p>Clarity: {result.score.clarity}/10</p>
                <p>Relevance: {result.score.relevance}/10</p>
                <p>
                  {ui.scoreLabels.engagement}:{" "}
                  {result.score.engagement_potential}/10
                </p>
                <p>
                  {ui.scoreLabels.fit}: {result.score.platform_fit}/10
                </p>
                <p>
                  <strong>Total: {result.score.total}/50</strong>
                </p>
              </div>
            )}

            {!!result.reach_prediction && (
              <div style={{ marginTop: 16 }}>
                <h3>{ui.reachTitle}</h3>
                <p>
                  ระดับ: <strong>{result.reach_prediction.level}</strong>
                </p>
                <p>
                  คะแนน: <strong>{result.reach_prediction.score}/50</strong>
                </p>

                {!!result.reach_prediction.reason?.length && (
                  <>
                    <h4>เหตุผลที่น่าจะไปได้</h4>
                    <ul>
                      {result.reach_prediction.reason.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                {!!result.reach_prediction.risk?.length && (
                  <>
                    <h4>ความเสี่ยงที่กด Reach ลง</h4>
                    <ul>
                      {result.reach_prediction.risk.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {!!result.strengths?.length && (
              <div style={{ marginTop: 16 }}>
                <h3>จุดแข็ง</h3>
                <ul>
                  {result.strengths.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {!!result.weaknesses?.length && (
              <div style={{ marginTop: 16 }}>
                <h3>จุดที่ควรปรับ</h3>
                <ul>
                  {result.weaknesses.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {!!result.why_not_working?.length && (
              <div style={{ marginTop: 16 }}>
                <h3>ทำไมโพสต์นี้อาจยังไม่ไปได้ดี</h3>
                <ul>
                  {result.why_not_working.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {!!result.killer_suggestions?.length && (
              <div style={{ marginTop: 16 }}>
                <h3>คำแนะนำแบบตรงจุด</h3>
                <ul>
                  {result.killer_suggestions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.rewrite_hook && (
              <div style={{ marginTop: 16 }}>
                <h3>Hook ใหม่</h3>
                <div
                  style={{
                    border: "1px solid #ccc",
                    padding: 16,
                    borderRadius: 6,
                    background: "#f7f7f7",
                  }}
                >
                  {result.rewrite_hook}
                </div>
              </div>
            )}

            {result.rewrite_cta && (
              <div style={{ marginTop: 16 }}>
                <h3>CTA ใหม่</h3>
                <div
                  style={{
                    border: "1px solid #ccc",
                    padding: 16,
                    borderRadius: 6,
                    background: "#f7f7f7",
                  }}
                >
                  {result.rewrite_cta}
                </div>
              </div>
            )}

            {result.improved_post && (
              <div style={{ marginTop: 16 }}>
                <h3>เวอร์ชันที่ปรับแล้ว</h3>
                <div
                  style={{
                    border: "1px solid #ccc",
                    padding: 16,
                    borderRadius: 6,
                    background: "#f7f7f7",
                  }}
                >
                  {result.improved_post}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}