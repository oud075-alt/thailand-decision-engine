"use client";

import { useState } from "react";

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

type Platform = "facebook" | "tiktok" | "instagram";

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
    const file = e.target.files?.[0] ?? null;
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
      formData.append("content", text.trim());
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

      if (data.result) {
        setResult(data.result);
      } else {
        setError("AI ไม่ส่งผลลัพธ์");
      }
    } catch {
      setError("เชื่อมต่อไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <section style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <div style={styles.badge}>AI Content Fixer</div>
          <h1 style={styles.title}>เครื่องซ่อมคอนเทนต์</h1>
          <p style={styles.subtitle}>
            วิเคราะห์จากข้อความหรือภาพ
            แล้วสรุปให้เห็นทันทีว่าโพสต์นี้เงียบเพราะอะไร
            พร้อมแนวแก้ที่เอาไปใช้ต่อได้เลย
          </p>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.miniStatCard}>
            <div style={styles.miniStatLabel}>เหมาะกับ</div>
            <div style={styles.miniStatValue}>Creator / พ่อค้าแม่ค้า</div>
          </div>
          <div style={styles.miniStatCard}>
            <div style={styles.miniStatLabel}>วิเคราะห์ได้จาก</div>
            <div style={styles.miniStatValue}>ข้อความ + ภาพ</div>
          </div>
        </div>
      </section>

      <section style={styles.inputCard}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>จะโพสต์ที่ไหน</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            style={styles.select}
          >
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>วางข้อความโพสต์</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="วางข้อความที่ต้องการให้ AI วิเคราะห์ตรงนี้..."
            style={styles.textarea}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>อัปโหลดภาพโพสต์</label>
          <label style={styles.uploadBox}>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            <div style={styles.uploadIcon}>＋</div>
            <div style={styles.uploadTitle}>
              {imageFile ? imageFile.name : "เลือกภาพหรือแคปหน้าจอโพสต์"}
            </div>
            <div style={styles.uploadHint}>
              ใช้ได้ทั้งภาพโพสต์ ภาพแคปหน้าจอ หรือภาพโฆษณา
            </div>
          </label>
        </div>

        {imagePreview && (
          <div style={styles.previewWrap}>
            <div style={styles.previewTitle}>ภาพที่อัปโหลด</div>
            <img src={imagePreview} alt="preview" style={styles.previewImage} />
          </div>
        )}

        <button onClick={handleAnalyze} disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
          {loading ? "กำลังวิเคราะห์..." : `วิเคราะห์โพสต์ ${platformLabels[platform]}`}
        </button>

        {error && <div style={styles.errorBox}>{error}</div>}
      </section>

      {result && (
        <section style={styles.resultWrap}>
          <div style={styles.resultHeader}>
            <div>
              <div style={styles.resultEyebrow}>ผลวิเคราะห์</div>
              <h2 style={styles.resultTitle}>{platformLabels[platform]}</h2>
            </div>
            <div style={styles.resultChip}>พร้อมใช้งาน</div>
          </div>

          <Card title="สรุปก่อน" icon="✦">
            <p style={styles.headlineText}>{result.headline}</p>
          </Card>

          <div style={styles.gridTwo}>
            <Card title="คาดการณ์" icon="◉">
              <div style={styles.statsGrid}>
                <InfoBox label="Reach คาดการณ์" value={result.prediction.reach} />
                <InfoBox label="โอกาสหยุดนิ้ว" value={`${result.prediction.hook_rate}%`} />
                <InfoBox label="ปัญหาหลัก" value={result.prediction.main_issue} />
              </div>
            </Card>

            <Card title="คำแนะนำสำหรับแพลตฟอร์มนี้" icon="➜">
              <div style={styles.textBlock}>{result.platform_tip}</div>
            </Card>
          </div>

          <div style={styles.gridTwo}>
            <Card title="จุดที่ทำให้โพสต์เงียบ" icon="!" >
              <ul style={styles.list}>
                {result.problems.map((item, index) => (
                  <li key={index} style={styles.listItem}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card title="จุดที่ยังดีอยู่" icon="✓">
              <ul style={styles.list}>
                {result.strengths.map((item, index) => (
                  <li key={index} style={styles.listItem}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card title="Hook ใหม่ ใช้แทนได้เลย" icon="⚡">
            <ul style={styles.list}>
              {result.fix.hooks.map((item, index) => (
                <li key={index} style={styles.listItem}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card title="เวอร์ชั่นแก้แล้ว" icon="✎">
            <div style={styles.textBlockStrong}>{result.fix.rewrite}</div>
          </Card>

          <Card title="แก้เร็วได้ทันที" icon="↺">
            <ul style={styles.list}>
              {result.fix.quick_fixes.map((item, index) => (
                <li key={index} style={styles.listItem}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card title="มุมมองของแต่ละแพลตฟอร์ม" icon="⌘">
            <div style={styles.platformGrid}>
              <InfoBox label="Facebook" value={result.ai_view.facebook} />
              <InfoBox label="TikTok" value={result.ai_view.tiktok} />
              <InfoBox label="Instagram" value={result.ai_view.instagram} />
            </div>
          </Card>
        </section>
      )}
    </main>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardIcon}>{icon}</div>
        <h3 style={styles.cardTitle}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoBox}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px 60px",
    maxWidth: 1120,
    margin: "0 auto",
    fontFamily: "Inter, system-ui, sans-serif",
    position: "relative",
    color: "#111827",
  },
  bgGlowTop: {
    position: "fixed",
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0) 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  bgGlowBottom: {
    position: "fixed",
    bottom: -120,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0) 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  heroCard: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: 18,
    padding: 24,
    borderRadius: 24,
    background: "linear-gradient(135deg, #111827 0%, #1f2937 60%, #0f172a 100%)",
    color: "white",
    boxShadow: "0 22px 60px rgba(15, 23, 42, 0.18)",
    marginBottom: 20,
  },
  heroLeft: {},
  heroRight: {
    display: "grid",
    gap: 12,
    alignContent: "center",
  },
  badge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 14,
  },
  title: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.05,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 14,
    marginBottom: 0,
    fontSize: 17,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.82)",
    maxWidth: 700,
  },
  miniStatCard: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 16,
    backdropFilter: "blur(8px)",
  },
  miniStatLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 8,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.4,
  },
  inputCard: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(17,24,39,0.06)",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 800,
    fontSize: 15,
    color: "#111827",
  },
  select: {
    width: "100%",
    maxWidth: 240,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    fontSize: 16,
    outline: "none",
    background: "white",
  },
  textarea: {
    width: "100%",
    minHeight: 220,
    padding: 16,
    borderRadius: 18,
    border: "1px solid #d1d5db",
    fontSize: 16,
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    background: "white",
    boxSizing: "border-box",
  },
  uploadBox: {
    border: "1.5px dashed #cbd5e1",
    borderRadius: 18,
    padding: 22,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    cursor: "pointer",
    display: "block",
  },
  uploadIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    background: "#111827",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontSize: 24,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 6,
  },
  uploadHint: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  previewWrap: {
    marginTop: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 14,
    background: "#f8fafc",
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 10,
    color: "#334155",
  },
  previewImage: {
    width: "100%",
    borderRadius: 14,
    display: "block",
  },
  button: {
    width: "100%",
    marginTop: 8,
    padding: 16,
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #111827 0%, #2563eb 100%)",
    color: "white",
    fontSize: 18,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 14px 35px rgba(37, 99, 235, 0.22)",
  },
  buttonDisabled: {
    width: "100%",
    marginTop: 8,
    padding: 16,
    borderRadius: 18,
    border: "none",
    background: "#94a3b8",
    color: "white",
    fontSize: 18,
    fontWeight: 800,
    cursor: "not-allowed",
  },
  errorBox: {
    marginTop: 16,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    padding: 14,
    borderRadius: 16,
    color: "#be123c",
    fontWeight: 700,
  },
  resultWrap: {
    position: "relative",
    zIndex: 1,
    marginTop: 24,
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  resultEyebrow: {
    fontSize: 13,
    fontWeight: 800,
    color: "#6366f1",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  resultTitle: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.1,
  },
  resultChip: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "#ecfeff",
    color: "#0f766e",
    fontWeight: 800,
    fontSize: 14,
    border: "1px solid #a5f3fc",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 16,
  },
  card: {
    background: "rgba(255,255,255,0.90)",
    border: "1px solid rgba(17,24,39,0.06)",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
    marginTop: 16,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "#eef2ff",
    color: "#4338ca",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.2,
  },
  headlineText: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.7,
  },
  statsGrid: {
    display: "grid",
    gap: 10,
  },
  infoBox: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 14,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: 700,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.6,
    color: "#111827",
  },
  list: {
    margin: 0,
    paddingLeft: 22,
    lineHeight: 1.9,
  },
  listItem: {
    marginBottom: 6,
    color: "#1f2937",
  },
  textBlock: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 16,
    lineHeight: 1.85,
    color: "#1f2937",
  },
  textBlockStrong: {
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    border: "1px solid #dbeafe",
    borderRadius: 18,
    padding: 16,
    lineHeight: 1.9,
    color: "#111827",
    fontWeight: 600,
    whiteSpace: "pre-wrap",
  },
  platformGrid: {
    display: "grid",
    gap: 10,
  },
};