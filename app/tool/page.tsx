"use client";

import { useEffect, useState } from "react";

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

type PublicComment = {
  id: number;
  province: string | null;
  comment: string;
  created_at: string;
};

function extractPlace(text: string) {
  if (!text) return "";
  const parts = text.split("→");
  return parts.length > 1 ? parts[1].trim() : text.trim();
}

function getAgodaUrl(province: string) {
  const map: Record<string, string> = {
    Krabi: "https://www.agoda.com/city/krabi-th.html",
    Phuket: "https://www.agoda.com/city/phuket-th.html",
    "Chiang Mai": "https://www.agoda.com/city/chiang-mai-th.html",
    Bangkok: "https://www.agoda.com/city/bangkok-th.html",
    Pattaya: "https://www.agoda.com/city/pattaya-th.html",
    "Koh Samui": "https://www.agoda.com/city/koh-samui-th.html",
  };

  return map[province] || "https://www.agoda.com/";
}

export default function Home() {
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
  ];

  const [province, setProvince] = useState("Krabi");
  const [days, setDays] = useState("1-3 days");
  const [travelType, setTravelType] = useState("friends");
  const [budget, setBudget] = useState("mid");
  const [style, setStyle] = useState("explore");
  const [extraPreference, setExtraPreference] = useState("");
  const [concern, setConcern] = useState("wrong location");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");

  const loadComments = async () => {
    try {
      setCommentsLoading(true);

      const res = await fetch(
        `/api/comments?province=${encodeURIComponent(province)}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (error) {
      console.error("LOAD_COMMENTS_ERROR:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [province]);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setCopied(false);
    setCommentMessage("");

    const question = `Help me decide where to stay in ${province}. I have ${days}, traveling as ${travelType}, budget ${budget}, style ${style}, concern ${concern}. Extra preference: ${extraPreference}`;

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          province,
          language: "English",
        }),
      });

      const data = await res.json();
      setResult(data.result || null);
    } catch (err) {
      setResult({
        intro: "Something went wrong.",
        options: [],
        quickGuide: [],
        finalRecommendation: "",
        optionalContext: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Thailand Decision Engine",
      text: result
        ? `I used this Thailand travel tool and got a useful stay suggestion for ${province}.`
        : "Not sure where to stay in Thailand? Try this decision tool.",
      url: "https://thailand-decision-engine-z3xj.vercel.app/",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleSendComment = async () => {
    const trimmed = feedback.trim();
    if (!trimmed) return;

    try {
      setSendingComment(true);
      setCommentMessage("");

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          province,
          comment: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCommentMessage(data?.error || "Could not send comment.");
        return;
      }

      setFeedback("");
      setCommentMessage("Comment sent.");
      await loadComments();
    } catch (error) {
      console.error("SEND_COMMENT_ERROR:", error);
      setCommentMessage("Could not send comment.");
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Thailand Decision Engine</h1>
        <p style={styles.subtitle}>
          Get clear travel decisions in seconds. No confusion.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.grid}>
          <Select
            label="Province"
            value={province}
            setValue={setProvince}
            options={provinces}
          />
          <Select
            label="Days"
            value={days}
            setValue={setDays}
            options={["1-3 days", "4-7 days", "7+ days"]}
          />
          <Select
            label="Travel type"
            value={travelType}
            setValue={setTravelType}
            options={["solo", "couple", "friends", "family"]}
          />
          <Select
            label="Budget"
            value={budget}
            setValue={setBudget}
            options={["budget", "mid", "luxury"]}
          />
          <Select
            label="Style"
            value={style}
            setValue={setStyle}
            options={["relax", "explore", "party"]}
          />

          <div>
            <div style={styles.label}>What do you want most?</div>
            <input
              value={extraPreference}
              onChange={(e) => setExtraPreference(e.target.value)}
              placeholder="e.g. quiet beach, nightlife but not too crazy, near airport, snorkeling"
              style={styles.input}
            />
          </div>

          <Select
            label="Main concern"
            value={concern}
            setValue={setConcern}
            options={["wrong location", "wasted time", "overpaying"]}
          />
        </div>

        <button style={styles.button} onClick={handleSubmit}>
          {loading ? "Thinking..." : "Get Decision"}
        </button>

        <div style={styles.shareHintWrap}>
          <div style={styles.shareHintText}>
            Know someone planning a Thailand trip? Share this tool.
          </div>

          <button style={styles.shareButtonSecondary} onClick={handleShare}>
            {copied ? "Link copied!" : "Share this tool"}
          </button>
        </div>
      </div>

      {result && (
        <div style={styles.resultBox}>
          <StructuredResult result={result} province={province} />

          <div style={styles.agodaButtonWrap}>
            <a
              href={getAgodaUrl(province)}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.agodaButton}
            >
              Check Hotels on Agoda
            </a>
          </div>

          <div style={styles.feedbackWrap}>
            <div style={styles.feedbackLabel}>
              What felt off while using this tool?
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type here..."
              style={styles.feedbackTextarea}
            />

            <button
              style={styles.feedbackButton}
              onClick={handleSendComment}
              disabled={sendingComment}
            >
              {sendingComment ? "Sending..." : "Send comment"}
            </button>

            {commentMessage && (
              <div style={styles.commentMessage}>{commentMessage}</div>
            )}
          </div>

          <div style={styles.resultShareWrap}>
            <div style={styles.resultShareText}>
              Traveling with others? Send this result before booking.
            </div>

            <button style={styles.shareButtonPrimary} onClick={handleShare}>
              {copied ? "Link copied!" : "Share this result"}
            </button>
          </div>

          <div style={styles.commentsWrap}>
            <div style={styles.commentsTitle}>Real traveler feedback</div>

            {comments.length > 0 && (
              <div
                style={{
                  background: "#fff8e1",
                  border: "1px solid #ffe082",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  What others noticed
                </div>
                <div style={{ fontSize: 14 }}>{comments[0].comment}</div>
              </div>
            )}

            {commentsLoading ? (
              <div style={styles.commentsEmpty}>Loading comments...</div>
            ) : comments.length === 0 ? (
              <div style={styles.commentsEmpty}>No comments yet.</div>
            ) : (
              <div style={styles.commentsList}>
                {comments.map((item) => (
                  <div key={item.id} style={styles.commentCard}>
                    <div style={styles.commentMeta}>
                      {item.province || "Thailand"} ·{" "}
                      {formatCommentDate(item.created_at)}
                    </div>
                    <div style={styles.commentText}>{item.comment}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Select({ label, value, setValue, options }: any) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={styles.select}
      >
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function StructuredResult({
  result,
  province,
}: {
  result: DecisionResult;
  province: string;
}) {
  const bestMatch = extractPlace(result.finalRecommendation);

  return (
    <div>
      <h2 style={styles.resultTitle}>
        Choose the best area for your stay in {province}.
      </h2>

      {bestMatch && (
        <div style={styles.bestMatchBox}>
          <span style={styles.bestMatchIcon}>✔</span>
          <span>
            <strong>Your best match:</strong> {bestMatch}
          </span>
        </div>
      )}

      {result.intro && <div style={styles.text}>{result.intro}</div>}

      {result.options?.length > 0 && (
        <>
          <div style={styles.sectionTitle}>Best options</div>
          <div style={styles.cardGrid}>
            {result.options.map((item, index) => (
              <div key={index} style={styles.optionCard}>
                <div style={styles.optionTitle}>{item.option}</div>
                <div style={styles.optionMeta}>
                  <strong>Vibe:</strong> {item.vibe}
                </div>
                <div style={styles.optionMeta}>
                  <strong>Best for:</strong> {item.bestFor}
                </div>
                <div style={styles.optionMeta}>
                  <strong>Why it fits:</strong> {item.whyItFits}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {result.quickGuide?.length > 0 && (
        <>
          <div style={styles.sectionTitle}>How to choose</div>
          <div style={styles.guideBox}>
            {result.quickGuide.map((item, index) => (
              <div key={index} style={styles.guideItem}>
                {item}
              </div>
            ))}
          </div>
        </>
      )}

      {result.optionalContext && (
        <div style={styles.context}>{result.optionalContext}</div>
      )}

      {bestMatch && (
        <div style={styles.nextStepBox}>
          <div style={styles.nextStepTitle}>Next step</div>
          <div style={styles.nextStepItem}>- Search hotels in {bestMatch}</div>
          <div style={styles.nextStepItem}>
            - Focus on areas close to main attractions
          </div>
        </div>
      )}
    </div>
  );
}

function formatCommentDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const styles: any = {
  page: {
    maxWidth: 720,
    margin: "40px auto",
    padding: 20,
    fontFamily: "system-ui",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: 700,
  },

  subtitle: {
    color: "#666",
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #eee",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gap: 12,
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    marginBottom: 4,
    color: "#666",
  },

  select: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: 14,
    background: "#111",
    color: "#fff",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },

  shareHintWrap: {
    marginTop: 12,
    textAlign: "center",
  },

  shareHintText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },

  shareButtonSecondary: {
    width: "100%",
    padding: 12,
    background: "#fff",
    color: "#111",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    fontWeight: 600,
  },

  resultBox: {
    background: "#fafafa",
    border: "1px solid #eee",
    padding: 16,
    borderRadius: 12,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
  },

  bestMatchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#111",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: 10,
    marginBottom: 16,
  },

  bestMatchIcon: {
    fontSize: 16,
    lineHeight: 1,
  },

  text: {
    marginBottom: 8,
    lineHeight: 1.6,
  },

  section: {
    marginTop: 16,
    marginBottom: 6,
    fontWeight: 700,
  },

  tableRow: {
    fontFamily: "monospace",
    background: "#fff",
    padding: 6,
    borderRadius: 6,
    marginBottom: 4,
  },

  recommend: {
    marginTop: 16,
    padding: 12,
    background: "#111",
    color: "#fff",
    borderRadius: 10,
    fontWeight: 600,
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 700,
    fontSize: 16,
  },

  cardGrid: {
    display: "grid",
    gap: 10,
  },

  optionCard: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 12,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
  },

  optionMeta: {
    marginBottom: 6,
    lineHeight: 1.5,
    color: "#333",
  },

  guideBox: {
    background: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
  },

  guideItem: {
    marginBottom: 6,
  },

  recommendWrap: {
    marginTop: 16,
  },

  recommendLabel: {
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 14,
    color: "#333",
  },

  recommendBox: {
    padding: 14,
    background: "#111",
    color: "#fff",
    borderRadius: 10,
    fontWeight: 600,
  },

  context: {
    marginTop: 12,
    color: "#666",
  },

  nextStepBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    background: "#f3f3f3",
  },

  nextStepTitle: {
    fontWeight: 700,
    marginBottom: 8,
  },

  nextStepItem: {
    marginBottom: 4,
    color: "#333",
  },

  agodaButtonWrap: {
    marginTop: 18,
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
  },

  agodaButton: {
    display: "inline-block",
    padding: "14px 22px",
    background: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
  },

  feedbackWrap: {
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid #eaeaea",
  },

  feedbackLabel: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    color: "#333",
  },

  feedbackTextarea: {
    width: "100%",
    minHeight: 90,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    fontSize: 14,
    fontFamily: "system-ui",
    boxSizing: "border-box",
    resize: "vertical",
  },

  feedbackButton: {
    marginTop: 10,
    padding: 10,
    background: "#111",
    color: "#fff",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
  },

  commentMessage: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
  },

  commentsWrap: {
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid #eaeaea",
  },

  commentsTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
  },

  commentsList: {
    display: "grid",
    gap: 10,
  },

  commentCard: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 12,
  },

  commentMeta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },

  commentText: {
    fontSize: 14,
    lineHeight: 1.5,
    color: "#222",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  commentsEmpty: {
    fontSize: 14,
    color: "#666",
  },

  resultShareWrap: {
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid #eaeaea",
  },

  resultShareText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },

  shareButtonPrimary: {
    width: "100%",
    padding: 14,
    background: "#111",
    color: "#fff",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
};