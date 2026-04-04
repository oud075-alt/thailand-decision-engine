"use client";

import { useState } from "react";

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

const platformLabels: Record<Platform, string> = {
  facebook: "Facebook",
  tiktok: "TikTok",
  instagram: "Instagram",
};

export default function Home() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (!file) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleAnalyze = async () => {
    if (!text.trim() && !imageFile) {
      setError("กรุณาใส่ข้อความหรืออัปโหลดรูปก่อน");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("content", text);
      formData.append("platform", platform);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      setResult(data.result);
    } catch (error) {
      setError("เชื่อมต่อ AI ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>เครื่องซ่อมคอนเทนต์</h1>
      <p style={{ marginTop: 0, color: "#555", marginBottom: 20 }}>
        ช่วยดูว่าโพสต์นี้มีโอกาสเงียบเพราะอะไร และแก้ให้ใช้ต่อได้ทันที
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
          จะโพสต์ที่ไหน
        </label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        >
          <option value="facebook">Facebook</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
          วางข้อความโพสต์
        </label>
        <textarea
          style={{
            width: "100%",
            minHeight: 220,
            padding: 14,
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 16,
            lineHeight: 1.5,
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="วางข้อความโพสต์ที่นี่..."
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
          อัปโหลดภาพโพสต์
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: 12 }}
        />

        {imagePreview && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <img
              src={imagePreview}
              alt="preview"
              style={{
                maxWidth: "100%",
                borderRadius: 8,
                display: "block",
              }}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          marginTop: 6,
          width: "100%",
          padding: 14,
          background: loading ? "#666" : "black",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {loading
          ? "กำลังวิเคราะห์..."
          : `วิเคราะห์โพสต์ ${platformLabels[platform]}`}
      </button>

      {loading && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            background: "#f5f5f5",
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          AI กำลังซ่อมโพสต์นี้อยู่...
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 18,
            background: "#fff1f1",
            border: "1px solid #f0caca",
            padding: 14,
            borderRadius: 10,
            color: "#a40000",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 30, marginBottom: 16 }}>
            ผลวิเคราะห์สำหรับ {platformLabels[platform]}
          </h2>

          <Section title="สรุปก่อน">
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              {result.headline}
            </p>
          </Section>

          <Section title="คาดการณ์">
            <div style={{ display: "grid", gap: 10 }}>
              <InfoBox
                label="Reach คาดการณ์"
                value={result.prediction.reach}
              />
              <InfoBox
                label="โอกาสหยุดนิ้ว"
                value={`${result.prediction.hook_rate}%`}
              />
              <InfoBox
                label="ปัญหาหลัก"
                value={result.prediction.main_issue}
              />
            </div>
          </Section>

          <Section title="จุดที่ทำให้โพสต์เงียบ">
            <ul style={listStyle}>
              {result.problems.map((item, index) => (
                <li key={index} style={listItemStyle}>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Hook ใหม่ ใช้แทนได้เลย">
            <ul style={listStyle}>
              {result.fix.hooks.map((item, index) => (
                <li key={index} style={listItemStyle}>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="เวอร์ชั่นแก้แล้ว">
            <div style={textBlockStyle}>{result.fix.rewrite}</div>
          </Section>

          <Section title="แก้เร็วได้ทันที">
            <ul style={listStyle}>
              {result.fix.quick_fixes.map((item, index) => (
                <li key={index} style={listItemStyle}>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="มุมมองของแต่ละแพลตฟอร์ม">
            <div style={{ display: "grid", gap: 10 }}>
              <InfoBox label="Facebook" value={result.ai_view.facebook} />
              <InfoBox label="TikTok" value={result.ai_view.tiktok} />
              <InfoBox label="Instagram" value={result.ai_view.instagram} />
            </div>
          </Section>

          <Section title="จุดที่ยังดีอยู่">
            <ul style={listStyle}>
              {result.strengths.map((item, index) => (
                <li key={index} style={listItemStyle}>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={`คำแนะนำสำหรับ ${platformLabels[platform]}`}>
            <div style={textBlockStyle}>{result.platform_tip}</div>
          </Section>
        </div>
      )}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginTop: 18,
        background: "#f7f7f7",
        padding: 16,
        borderRadius: 12,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 22 }}>{title}</h3>
      {children}
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e5e5",
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 20,
  lineHeight: 1.8,
};

const listItemStyle: React.CSSProperties = {
  marginBottom: 6,
};

const textBlockStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e5e5e5",
  borderRadius: 10,
  padding: 14,
  lineHeight: 1.8,
  whiteSpace: "pre-wrap",
};