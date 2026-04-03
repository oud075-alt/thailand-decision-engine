"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("Facebook");
  const [result, setResult] = useState("");

  const handleAnalyze = async () => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, platform }),
    });

    const data = await res.json();

    console.log("API RESPONSE:", data); // debug

    setResult(data.result || "ไม่มีผลลัพธ์");
  };

  return (
    <main style={{ padding: 20 }}>
      <h2>จะโพสต์ที่ไหน</h2>

      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        <option>Facebook</option>
        <option>TikTok</option>
        <option>Instagram</option>
      </select>

      <textarea
        style={{ width: "100%", height: 200, marginTop: 10 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="วางข้อความโพสต์ที่นี่..."
      />

      <button
        onClick={handleAnalyze}
        style={{
          marginTop: 10,
          width: "100%",
          padding: 10,
          background: "black",
          color: "white",
        }}
      >
        วิเคราะห์โพสต์ {platform}
      </button>

      <h3 style={{ marginTop: 20 }}>
        ผลวิเคราะห์สำหรับ {platform}
      </h3>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f5f5f5",
          padding: 10,
        }}
      >
        {result}
      </pre>
    </main>
  );
}