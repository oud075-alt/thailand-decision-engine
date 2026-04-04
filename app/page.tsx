"use client";

import { useState } from "react";

type AnalysisResult = any;

export default function Home() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    setImageFile(file);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!text && !imageFile) {
      setError("กรุณาใส่ข้อความหรือรูป");
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
        setError(data.error || "error");
        console.log(data);
        return;
      }

      // 🔥 กันพังตรงนี้
      if (data.result) {
        setResult(data.result);
      } else {
        setError("AI ไม่ส่งผลลัพธ์");
        console.log("RAW:", data.debug_raw);
      }
    } catch (err) {
      setError("เชื่อมต่อไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>เครื่องซ่อมคอนเทนต์</h2>

      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        <option value="facebook">Facebook</option>
        <option value="tiktok">TikTok</option>
        <option value="instagram">Instagram</option>
      </select>

      <textarea
        style={{ width: "100%", height: 200, marginTop: 10 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="วางข้อความ..."
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      {imagePreview && (
        <img
          src={imagePreview}
          style={{ width: "100%", marginTop: 10 }}
        />
      )}

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์"}
      </button>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {result && (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}