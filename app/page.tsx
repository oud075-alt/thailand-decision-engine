
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type CSSProperties,
  type MouseEvent,
} from "react";

import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type TabKey = "home" | "content" | "advisory" | "decision" | "prep" | "create";
type PostType = "content" | "advisory";

type FeedCard = {
  id: string;
  title: string;
  source: string;
  time: string;
  image: string;
  category: string;
  desc: string;
  href: string;
  type: PostType;
};

type DbPost = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  type?: string | null;
};

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

type PostComment = {
  id: number;
  post_id: string;
  comment: string;
  created_at: string;
};
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

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1400&q=80",
];

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

function formatTimeLabel(createdAt: string) {
  // Ensure the date is parsed correctly and handle invalid dates gracefully
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "Recently";

  const diffMs = Date.now() - created.getTime();
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day ago`;

  // Fallback to a simple date string for older dates
  return created.toLocaleDateString();
}

function formatCommentDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

function getFallbackImage(index: number) {
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function inferType(title: string, content: string): PostType {
  const text = `${title} ${content}`.toLowerCase();

  if (
    text.includes("warning") ||
    text.includes("safety") ||
    text.includes("helmet") ||
    text.includes("fine") ||
    text.includes("notice") ||
    text.includes("scam") ||
    text.includes("alert") ||
    text.includes("law")
  ) {
    return "advisory";
  }

  return "content";
}

function makeDesc(content: string) {
  const clean = content.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157)}...`;
}

function extractPlace(text: string) {
  if (!text) return "";
  const parts = text.split("→");
  return parts.length > 1 ? parts[1].trim() : text.trim();
}

function getAgodaUrl(province: string) {
  const map: Record<string, string> = {
    Krabi: "https://www.agoda.com/city/krabi-th.html",
    Phuket: "https://www.agoda.com/city/phuket-th.html",
    Bangkok: "https://www.agoda.com/city/bangkok-th.html",
    Pattaya: "https://www.agoda.com/city/pattaya-th.html",
    "Koh Samui": "https://www.agoda.com/city/koh-samui-th.html",
  };

  return map[province] || "https://www.agoda.com/";
}

function mapPostToCard(post: DbPost, index: number): FeedCard {
  const type =
    post.type === "advisory" || post.type === "content"
      ? post.type
      : inferType(post.title || "", post.content || "");

  return {
    id: post.id,
    title: post.title || "Untitled Post",
    source: "Echoes Of Thailand",
    time: formatTimeLabel(post.created_at),
    image: post.image_url?.trim() ? post.image_url : getFallbackImage(index),
    category: type === "advisory" ? "Advisory" : "Content",
    desc: makeDesc(post.content || ""),
    href: `/posts/${post.id}`,
    type,
  };
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [selectedPost, setSelectedPost] = useState<DbPost | null>(null);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);
  const [posts, setPosts] = useState<DbPost[]>([]);

  const [province, setProvince] = useState("Krabi");
  const [days, setDays] = useState("1-3 days");
  const [travelType, setTravelType] = useState("friends");
  const [budget, setBudget] = useState("mid");
  const [style, setStyle] = useState("explore");
  const [extraPreference, setExtraPreference] = useState("");
  const [concern, setConcern] = useState("wrong location");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");

  const [language, setLanguage] = useState<LangKey>("English");
  const [tripType, setTripType] = useState("beach trip");
  const [prepDuration, setPrepDuration] = useState("1-3 days");
  const [prepTravelType, setPrepTravelType] = useState("solo");
  const [prepConcern, setPrepConcern] = useState("don’t know what to pack");
  const [wantMost, setWantMost] = useState("");
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<PrepResult | null>(null);

  // Admin mode state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");

  function handleAdminLogin() {
    const trimmed = adminInput.trim();
    if (!trimmed) {
      alert("Please enter admin password");
      return;
    }
    setAdminSecret(trimmed);
    setIsAdmin(true);
    setAdminInput("");
  }

  function handleAdminLogout() {
    setIsAdmin(false);
    setAdminSecret("");
    setAdminInput("");
    setActiveTab("home");
  }

  const t = useMemo(() => translations[language], [language]);

  async function loadPosts() {
    try {
      setFeedLoading(true);
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = await res.json();

      const rows = Array.isArray(data?.data) ? data.data : [];
      const sorted = rows.sort(
        (a: DbPost, b: DbPost) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(sorted);
    } catch (error) {
      console.error(error);
      setPosts([]);
    } finally {
      setFeedLoading(false);
    }
  }

  const loadComments = useCallback(async () => {
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
  }, [province, setComments, setCommentsLoading]);
  
  const loadCommentsByPostId = useCallback(async (postId: string) => {
  try {
    const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`, {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("LOAD_POST_COMMENTS_ERROR:", data?.error);
      return;
    }

    setPostComments((prev) => ({
      ...prev,
      [postId]: Array.isArray(data.comments) ? data.comments : [],
    }));
  } catch (error) {
    console.error("LOAD_POST_COMMENTS_ERROR:", error);
  }
}, []);
  

  useEffect(() => {
  loadPosts();
}, []);
useEffect(() => {
  setAdminInput("");

  const timer = window.setTimeout(() => {
    setAdminInput("");
  }, 500);

  return () => window.clearTimeout(timer);
}, []);
useEffect(() => {
  let mounted = true;

  supabase.auth.getUser().then(({ data }) => {
    if (!mounted) return;
    setAuthUser(data.user ?? null);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setAuthUser(session?.user ?? null);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

const handleEmailLogin = async () => {
  const email = authEmail.trim().toLowerCase();

  if (!email) {
    setAuthMessage("Please enter your email.");
    return;
  }

  setAuthLoading(true);
  setAuthMessage("");

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthMessage(error.message);
      return;
    }

    setAuthMessage("Check your email for the login link.");
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    setAuthMessage("Could not send login link.");
  } finally {
    setAuthLoading(false);
  }
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  setAuthUser(null);
  setAuthEmail("");
  setAuthMessage("");
};

useEffect(() => {
  if (!posts.length) return;

  posts.forEach((post) => {
    loadCommentsByPostId(post.id);
  });
}, [posts, loadCommentsByPostId]);

  useEffect(() => {
    loadComments();
  }, [province, loadComments]);

  useEffect(() => {
    if (!selectedPost) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedPost]);

  async function handleSubmit(type: PostType) {
    // Only allow admins to create posts
    if (!isAdmin || !adminSecret) {
      alert("Admin login required");
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl.trim(),
          type,
          adminSecret,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Error creating post");
        return;
      }

      setTitle("");
      setContent("");
      setImageUrl("");

      await loadPosts();
      setActiveTab(type);
      alert("Post created!");
    } catch (error) {
      console.error(error);
      alert("Error creating post");
    } finally {
      setLoading(false);
    }
  }

  const handleDecisionSubmit = async () => {
    setDecisionLoading(true);
    setResult(null);
    setCopied(false);
    setCommentMessage("");

    const question = `Help me decide where to stay in ${province}. I have ${days}, traveling as ${travelType}, budget ${budget}, style ${style}, concern ${concern}. Extra preference: ${extraPreference}`;

      try {
  const res = await fetch("/api/decision", {
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
      setDecisionLoading(false);
    }
  };

  const handleDecisionShare = async () => {
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

  const handleLanguageChange = (nextLanguage: LangKey) => {
    const current = translations[language];
    const next = translations[nextLanguage];

    const tripIndex = current.tripTypeOptions.indexOf(tripType);
    const durationIndex = current.durationOptions.indexOf(prepDuration);
    const travelTypeIndex = current.travelTypeOptions.indexOf(prepTravelType);
    const concernIndex = current.concernOptions.indexOf(prepConcern);

    setLanguage(nextLanguage);

    if (tripIndex >= 0) setTripType(next.tripTypeOptions[tripIndex]);
    if (durationIndex >= 0) setPrepDuration(next.durationOptions[durationIndex]);
    if (travelTypeIndex >= 0)
      setPrepTravelType(next.travelTypeOptions[travelTypeIndex]);
    if (concernIndex >= 0) setPrepConcern(next.concernOptions[concernIndex]);
  };

  const handlePrepDecision = async () => {
    try {
      setPrepLoading(true);
      setPrepResult(null);

      const res = await fetch("/api/ai-ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripType,
          duration: prepDuration,
          travelType: prepTravelType,
          concern: prepConcern,
          wantMost,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) return;

      setPrepResult(data.result || null);
    } catch (error) {
      console.error("TRAVEL_PREP_PAGE_ERROR:", error);
    } finally {
      setPrepLoading(false);
    }
  };

  const liveCards = useMemo(() => {
    return posts.map((post, index) => mapPostToCard(post, index));
  }, [posts]);

  const contentCards = useMemo(() => {
    return liveCards.filter((card) => card.type === "content");
  }, [liveCards]);

  const advisoryCards = useMemo(() => {
    return liveCards.filter((card) => card.type === "advisory");
  }, [liveCards]);

  const featuredContent = contentCards.slice(0, 3);
  const featuredAdvisory = advisoryCards.slice(0, 2);

  const popularTopics = [
    "Thailand memories people keep",
    "What travelers wish they knew earlier",
    "Short local safety reminders",
    "Useful travel reflections",
    "Things that stay after the trip",
  ];

  const notes = [
    "Everything now lives in one page.",
    "Posting is separated into Content and Advisory.",
    "Read post opens inside the same page like social media.",
  ];

  const visibleCards =
    activeTab === "content"
      ? contentCards
      : activeTab === "advisory"
      ? advisoryCards
      : [];

  const openPost = (id: string) => {
    const post = posts.find((item) => item.id === id) || null;
    setSelectedPost(post);
  };
  const handleSharePost = async (post: DbPost | null) => {
    if (!post) return;

    const shareUrl = `${window.location.origin}/posts/${post.id}`;
    const shareData = {
      title: post.title,
      text: post.content?.slice(0, 120) || post.title,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      alert("Post link copied!");
    } catch (error) {
      console.error("POST_SHARE_ERROR:", error);
    }
  };

  const [commentPost, setCommentPost] = useState<DbPost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handlePostComment = (post: DbPost | null) => {
    if (!post) return;
    // Load comments when clicking comment button
    loadCommentsByPostId(post.id);
    // Focus on the comment input (if it exists)
    setTimeout(() => {
      const commentInput = document.querySelector('[data-comment-input]') as HTMLTextAreaElement;
      if (commentInput) commentInput.focus();
    }, 100);
  };

  const submitComment = async () => {
  const trimmed = commentText.trim();

  if (!authUser?.email) {
    alert("Please login with your email before commenting.");
    return;
  }

  if (!selectedPost || !trimmed) return;

  try {
    setSubmittingComment(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Please login with your email before commenting.");
      return;
    }

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        post_id: selectedPost.id,
        comment: trimmed,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Could not post comment.");
      return;
    }

    setCommentText("");
    await loadCommentsByPostId(selectedPost.id);
  } catch (error) {
    console.error("SUBMIT_COMMENT_ERROR:", error);
    alert("Could not post comment.");
  } finally {
    setSubmittingComment(false);
  }
};

  const deleteComment = async (commentId: number, adminSecret: string) => {
    // Guard: only allow admin to delete comments
    if (!isAdmin || !adminSecret) {
      alert("Admin login required");
      return;
    }
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: commentId,
          adminSecret,
        }),
      });
      if (res.ok && selectedPost) {
        await loadCommentsByPostId(selectedPost.id);
      }
    } catch (error) {
      console.error("DELETE_COMMENT_ERROR:", error);
    }
  };

  const deletePost = async (postId: string, adminSecret: string) => {
    // Guard: only allow admin to delete posts
    if (!isAdmin || !adminSecret) {
      alert("Admin login required");
      return;
    }
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postId,
          adminSecret,
        }),
      });
      if (res.ok) {
        setSelectedPost(null);
        await loadPosts();
      }
    } catch (error) {
      console.error("DELETE_POST_ERROR:", error);
    }
  };

  return (
    <main style={styles.page}>
      <style>{`
        @media (max-width: 768px) {
          .app-frame {
            max-width: 100% !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .topbar {
            padding: 12px 14px !important;
            gap: 10px !important;
          }
          .hero-section {
            height: 260px !important;
          }
          .hero-title {
            font-size: 34px !important;
            line-height: 1.08 !important;
          }
          .hero-text {
            font-size: 15px !important;
            line-height: 1.5 !important;
          }
          .profile-bar {
            padding: 14px !important;
            flex-wrap: wrap !important;
          }
          .tabs-bar {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .tabs-bar button {
            flex: 0 0 auto !important;
            min-width: 130px !important;
            padding: 12px 14px !important;
            font-size: 15px !important;
          }
          .content-area {
            flex-direction: column !important;
            gap: 14px !important;
            padding: 14px !important;
          }
          .left-col,
          .center-col,
          .right-col {
            width: 100% !important;
            max-width: 100% !important;
          }
          .center-col {
            order: 1 !important;
          }
          .left-col {
            order: 2 !important;
          }
          .right-col {
            order: 3 !important;
          }
          .post-image {
            height: 220px !important;
            object-fit: cover !important;
          }
          .post-title-button {
            font-size: 22px !important;
            word-break: break-word !important;
          }
          .modal-card {
            width: calc(100% - 24px) !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            padding: 16px !important;
          }
          form input,
          form textarea,
          form select,
          form button {
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
        @media (max-width: 420px) {
          .hero-section {
            height: 240px !important;
          }
          .hero-title {
            font-size: 30px !important;
          }
          .hero-text {
            font-size: 14px !important;
          }
          .post-image {
            height: 200px !important;
          }
        }
      `}</style>
      <div style={styles.appFrame} className="app-frame">
        <header style={styles.topbar} className="topbar">
          <div style={styles.brand}>
            <div style={styles.brandLogo}>🌿</div>
            <div>
              <div style={styles.brandTitle}>Echoes Of Thailand</div>
              <div style={styles.brandSub}>
                stories, impressions, memory, atmosphere
              </div>
            </div>
          </div>

          <div style={styles.topActions}>
            <button style={styles.topGhostBtn} type="button">
              Search
            </button>
            <button style={styles.topPrimaryBtn} type="button">
              Follow
            </button>
          </div>
        </header>

        <section style={styles.hero} className="hero-section">
          <div style={styles.heroImage} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            
            
          </div>
        </section>

        <section style={styles.profileBar} className="profile-bar">
          <div>
            <h2 style={styles.profileTitle}>Echoes Of Thailand</h2>
            <p style={styles.profileSub}>
              One page for stories, advisories, and travel tools.
            </p>
          </div>

          <button style={styles.followBtn} type="button">
            Follow
          </button>
        </section>

        <section style={styles.tabs} className="tabs-bar">
          <TabButton
            active={activeTab === "home"}
            label="Home"
            onClick={() => setActiveTab("home")}
          />
          <TabButton
            active={activeTab === "content"}
            label="Content"
            onClick={() => setActiveTab("content")}
          />
          <TabButton
            active={activeTab === "advisory"}
            label="Advisory"
            onClick={() => setActiveTab("advisory")}
          />
          <TabButton
            active={activeTab === "decision"}
            label="Decision Tool"
            onClick={() => setActiveTab("decision")}
          />
          <TabButton
            active={activeTab === "prep"}
            label="Travel Prep Tool"
            onClick={() => setActiveTab("prep")}
          />
        </section>

        <section style={styles.contentArea} className="content-area">
          <aside style={styles.leftCol} className="left-col">
            <div style={styles.sideCard}>
              <div style={styles.sideTitle}>Tools</div>

              <button
                style={styles.sideLinkPrimary}
                type="button"
                onClick={() => setActiveTab("decision")}
              >
                Thailand Decision Tool
              </button>

              <button
                style={styles.sideLinkSecondary}
                type="button"
                onClick={() => setActiveTab("prep")}
              >
                Travel Prep Tool
              </button>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.sideTitle}>About this page</div>
              <p style={styles.sideText}>
                Home is overview only. Content is for general travel stories.
                Advisory is for practical warnings and reminders. The two tools
                now open inside this same page.
              </p>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.sideTitle}>Popular topics</div>
              <ul style={styles.bulletList}>
                {popularTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.sideTitle}>Notes</div>
              <ul style={styles.bulletList}>
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </aside>

          <div style={styles.centerCol} className="center-col">
            {activeTab === "home" && (
              <>
                <section style={styles.homeSection}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <div style={styles.sectionEyebrow}>Overview</div>
                      <h3 style={styles.sectionTitle}>Latest Content</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("content")}
                      style={styles.sectionAction}
                    >
                      Open Content
                    </button>
                  </div>

                  {feedLoading ? (
                    <div style={styles.loadingCard}>Loading content...</div>
                  ) : featuredContent.length === 0 ? (
                    <div style={styles.emptyCard}>No content posts yet.</div>
                  ) : (
                    <div style={styles.feedList}>
                      {featuredContent.map((card) => (
                        <SocialPostCard
                          key={card.id}
                          card={card}
                          post={posts.find((item) => item.id === card.id) || null}
                          onCardClick={() => openPost(card.id)}
                          onReadPost={() => openPost(card.id)}
                          onSharePost={handleSharePost}
                          onCommentPost={handlePostComment}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section style={styles.homeSection}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <div style={styles.sectionEyebrow}>Overview</div>
                      <h3 style={styles.sectionTitle}>Latest Advisory</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("advisory")}
                      style={styles.sectionAction}
                    >
                      Open Advisory
                    </button>
                  </div>

                  {feedLoading ? (
                    <div style={styles.loadingCard}>Loading advisory...</div>
                  ) : featuredAdvisory.length === 0 ? (
                    <div style={styles.emptyCard}>No advisory posts yet.</div>
                  ) : (
                    <div style={styles.feedList}>
                      {featuredAdvisory.map((card) => (
                        <SocialPostCard
                          key={card.id}
                          card={card}
                          post={posts.find((item) => item.id === card.id) || null}
                          onCardClick={() => openPost(card.id)}
                          onReadPost={() => openPost(card.id)}
                          onSharePost={handleSharePost}
                          onCommentPost={handlePostComment}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section style={styles.overviewGrid}>
                  <div style={styles.overviewToolCard}>
                    <div style={styles.overviewToolLabel}>Tool</div>
                    <div style={styles.overviewToolTitle}>
                      Thailand Decision Tool
                    </div>
                    <div style={styles.overviewToolText}>
                      Helps travelers decide where to stay based on province,
                      days, budget, style, and concern.
                    </div>
                    <button
                      style={styles.overviewToolButton}
                      type="button"
                      onClick={() => setActiveTab("decision")}
                    >
                      Open Tool
                    </button>
                  </div>

                  <div style={styles.overviewToolCard}>
                    <div style={styles.overviewToolLabel}>Tool</div>
                    <div style={styles.overviewToolTitle}>
                      Travel Prep Tool
                    </div>
                    <div style={styles.overviewToolText}>
                      Helps travelers decide what to pack based on trip type,
                      duration, travel type, and main concern.
                    </div>
                    <button
                      style={styles.overviewToolButton}
                      type="button"
                      onClick={() => setActiveTab("prep")}
                    >
                      Open Tool
                    </button>
                  </div>
                </section>
              </>
            )}

            {activeTab === "content" && (
              <div style={styles.feedList}>
                {feedLoading ? (
                  <div style={styles.loadingCard}>Loading content...</div>
                ) : contentCards.length === 0 ? (
                  <div style={styles.emptyCard}>No content posts yet.</div>
                ) : (
                  contentCards.map((card) => (
                    <SocialPostCard
                      key={card.id}
                      card={card}
                      post={posts.find((item) => item.id === card.id) || null}
                      onCardClick={() => openPost(card.id)}
                      onReadPost={() => openPost(card.id)}
                      onSharePost={handleSharePost}
                      onCommentPost={handlePostComment}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "advisory" && (
              <div style={styles.feedList}>
                {feedLoading ? (
                  <div style={styles.loadingCard}>Loading advisory...</div>
                ) : advisoryCards.length === 0 ? (
                  <div style={styles.emptyCard}>No advisory posts yet.</div>
                ) : (
                  advisoryCards.map((card) => (
                    <SocialPostCard
                      key={card.id}
                      card={card}
                      post={posts.find((item) => item.id === card.id) || null}
                      onCardClick={() => openPost(card.id)}
                      onReadPost={() => openPost(card.id)}
                      onSharePost={handleSharePost}
                      onCommentPost={handlePostComment}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "decision" && (
              <div style={styles.toolWrap}>
                <div style={styles.toolHeader}>
                  <div style={styles.toolBadge}>Decision Tool</div>
                  <h3 style={styles.toolTitle}>Thailand Decision Tool</h3>
                  <p style={styles.toolSub}>
                    Helps travelers decide where to stay based on province, days,
                    budget, style, and concern.
                  </p>
                </div>

                <div style={styles.toolCard}>
                  <div style={styles.field}>
                    <div style={styles.label}>Province</div>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      style={styles.select}
                    >
                      {provinces.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.toolGrid}>
                    <div style={styles.field}>
                      <div style={styles.label}>Days</div>
                      <select
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        style={styles.select}
                      >
                        <option>1-3 days</option>
                        <option>4-7 days</option>
                        <option>7+ days</option>
                      </select>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Travel type</div>
                      <select
                        value={travelType}
                        onChange={(e) => setTravelType(e.target.value)}
                        style={styles.select}
                      >
                        <option>solo</option>
                        <option>couple</option>
                        <option>family</option>
                        <option>friends</option>
                      </select>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Budget</div>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        style={styles.select}
                      >
                        <option>low</option>
                        <option>mid</option>
                        <option>high</option>
                      </select>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Style</div>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        style={styles.select}
                      >
                        <option>explore</option>
                        <option>relax</option>
                        <option>party</option>
                        <option>culture</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.field}>
                    <div style={styles.label}>Main concern</div>
                    <select
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                      style={styles.select}
                    >
                      <option>wrong location</option>
                      <option>too expensive</option>
                      <option>too crowded</option>
                      <option>too quiet</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <div style={styles.label}>Extra preference</div>
                    <input
                      type="text"
                      value={extraPreference}
                      onChange={(e) => setExtraPreference(e.target.value)}
                      placeholder="ex. near beach, good food, nightlife"
                      style={styles.input}
                    />
                  </div>

                  <button
                    style={styles.toolPrimaryButton}
                    onClick={handleDecisionSubmit}
                    type="button"
                  >
                    {decisionLoading ? "Thinking..." : "Get My Decision"}
                  </button>
                </div>

                {result && (
                  <div style={styles.resultBox}>
                    <StructuredResult result={result} province={province} />

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
                        type="button"
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

                      <button
                        style={styles.shareButtonPrimary}
                        onClick={handleDecisionShare}
                        type="button"
                      >
                        {copied ? "Link copied!" : "Share this result"}
                      </button>
                    </div>

                    <div style={styles.commentsWrap}>
                      <div style={styles.commentsTitle}>
                        Real traveler feedback
                      </div>

                      {comments.length > 0 && (
                        <div style={styles.commentsHighlight}>
                          <div style={styles.commentsHighlightTitle}>
                            What others noticed
                          </div>
                          <div style={styles.commentsHighlightText}>
                            {comments[0].comment}
                          </div>
                        </div>
                      )}

                      {commentsLoading ? (
                        <div style={styles.commentsEmpty}>
                          Loading comments...
                        </div>
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
                              <div style={styles.commentText}>
                                {item.comment}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "prep" && (
              <div style={styles.toolWrap}>
                <div style={styles.toolHeader}>
                  <div style={styles.toolBadge}>Travel Prep Tool</div>
                  <h3 style={styles.toolTitle}>{t.title}</h3>
                  <p style={styles.toolSub}>{t.subtitle}</p>
                </div>

                <div style={styles.toolCard}>
                  <div style={styles.field}>
                    <div style={styles.label}>{t.language}</div>
                    <select
                      value={language}
                      onChange={(e) =>
                        handleLanguageChange(e.target.value as LangKey)
                      }
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
                      value={prepDuration}
                      onChange={(e) => setPrepDuration(e.target.value)}
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
                      value={prepTravelType}
                      onChange={(e) => setPrepTravelType(e.target.value)}
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
                      value={prepConcern}
                      onChange={(e) => setPrepConcern(e.target.value)}
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

                  <button
                    style={styles.toolPrimaryButton}
                    onClick={handlePrepDecision}
                    type="button"
                  >
                    {prepLoading ? t.thinking : t.button}
                  </button>
                </div>

                {prepResult && (
                  <div style={styles.resultWrap}>
                    <div style={styles.resultSimpleBox}>
                      <div style={styles.resultLabel}>{t.bestNextStep}</div>
                      <div style={styles.resultBest}>
                        {prepResult.bestMatch.name}
                      </div>
                      <div style={styles.resultWhy}>
                        {prepResult.bestMatch.why}
                      </div>

                      <a
                        href={prepResult.bestMatch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.linkButton}
                      >
                        {t.openThisItem}
                      </a>
                    </div>

                    {prepResult.alternatives.map((item, index) => (
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
            )}

            {selectedPost && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalCard} className="modal-card">
                  <button
                    type="button"
                    onClick={() => setSelectedPost(null)}
                    style={styles.modalClose}
                  >
                    ✕
                  </button>

                  {selectedPost.image_url && (
                    <img
                      src={selectedPost.image_url}
                      alt={selectedPost.title}
                      style={styles.modalImage}
                    />
                  )}

                  <div style={styles.modalTopMeta}>
                    <div style={styles.modalPageName}>Echoes Of Thailand</div>
                    <div style={styles.modalTime}>
                      {formatTimeLabel(selectedPost.created_at)}
                    </div>
                  </div>

                  <h2 style={styles.modalTitle}>{selectedPost.title}</h2>
                  <p style={styles.modalContent}>{selectedPost.content}</p>

                  <div style={styles.modalActions}>
                    <button
                      type="button"
                      style={styles.modalActionBtn}
                      onClick={() => handlePostComment(selectedPost)}
                    >
                      Comment
                    </button>
                    <button
                      type="button"
                      style={styles.modalActionBtn}
                      onClick={() => handleSharePost(selectedPost)}
                    >
                      Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div style={styles.commentsSection}>
                    <h3 style={styles.commentsSectionTitle}>Comments</h3>
                    <div style={styles.commentsList}>
                      {postComments[selectedPost.id]?.length > 0 ? (
                        postComments[selectedPost.id].map((comment) => (
                          <div key={comment.id} style={styles.commentItem}>
                            <p style={styles.commentText}>{comment.comment}</p>
                            <div style={styles.commentMeta}>
                              <span style={styles.commentTime}>
                                {formatTimeLabel(comment.created_at)}
                              </span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => deleteComment(comment.id, adminSecret)}
                                  style={styles.deleteCommentBtn}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={styles.noComments}>No comments yet</p>
                      )}
                    </div>

                    {/* Comment Input Form */}
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #e5e7eb" }}>
                      {!authUser?.email ? (
  <div style={{ display: "grid", gap: 10 }}>
    <p style={{ margin: 0, color: "#475569", fontSize: 14 }}>
      Please login with your email before commenting.
    </p>

    <input
      type="email"
      value={authEmail}
      onChange={(e) => setAuthEmail(e.target.value)}
      placeholder="Enter your email to receive a login link"
      style={{
        width: "100%",
        border: "1px solid #d1d5db",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 15,
      }}
    />

    <button
      type="button"
      onClick={handleEmailLogin}
      disabled={authLoading || !authEmail.trim()}
      style={styles.submitCommentBtn}
    >
      {authLoading ? "Sending login link..." : "Login with Email"}
    </button>

    {authMessage && (
      <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
        {authMessage}
      </p>
    )}
  </div>
) : (
  <>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
      }}
    >
      <p style={{ margin: 0, color: "#475569", fontSize: 14 }}>
        Commenting as <strong>{authUser.email}</strong>
      </p>

      <button
        type="button"
        onClick={handleLogout}
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 999,
          background: "#fff",
          padding: "8px 12px",
          cursor: "pointer",
          color: "#334155",
          fontWeight: 600,
        }}
      >
        Logout
      </button>
    </div>

    <textarea
      data-comment-input
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      placeholder="Share your thoughts..."
      style={styles.commentInput}
    />

    <button
      type="button"
      onClick={submitComment}
      disabled={submittingComment || !commentText.trim()}
      style={styles.submitCommentBtn}
    >
      {submittingComment ? "Posting..." : "Post Comment"}
    </button>
  </>
)}
                    </div>
                  </div>

                  {/* Delete Post Button for Admin */}
                  {isAdmin && (
                    <button
                      type="button"
                      style={styles.deletePostBtn}
                      onClick={() => deletePost(selectedPost.id, adminSecret)}
                    >
                      Delete Post
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Comment Input Modal */}
            {commentPost && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalCard} className="modal-card">
                  <button
                    type="button"
                    onClick={() => setCommentPost(null)}
                    style={styles.modalClose}
                  >
                    X
                  </button>
                  <h2 style={styles.modalTitle}>Add Comment</h2>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    style={styles.commentInput}
                  />
                  <button
                    type="button"
                    onClick={submitComment}
                    disabled={submittingComment || !commentText.trim()}
                    style={styles.submitCommentBtn}
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside style={styles.rightCol} className="right-col">
            {isAdmin ? (
              <>
                <div style={styles.sideCard}>
                  <div style={styles.sideTitle}>Create new post</div>
                  <p style={styles.sideText}>
                    Share your stories, impressions, or advisories about Thailand.
                  </p>
                  <button
                    style={styles.sideLinkPrimary}
                    type="button"
                    onClick={() => setActiveTab("create")}
                  >
                    Create Post
                  </button>
                </div>

                {activeTab === "create" && (
                  <div style={styles.createPostCard}>
                    <div style={styles.createPostHeader}>
                      <div>
                        <h3 style={styles.createPostTitle}>Create New Post</h3>
                        <p style={styles.createPostSub}>
                          Share your stories, impressions, or advisories about
                          Thailand.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={loadPosts}
                        style={styles.refreshButton}
                      >
                        Refresh
                      </button>
                    </div>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      style={styles.input}
                    />
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Content"
                      style={styles.textarea}
                    />
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Image URL (optional)"
                      style={styles.input}
                    />

                    <div style={styles.postActions}>
                      <button
                        style={styles.postAction}
                        onClick={() => handleSubmit("content")}
                        disabled={loading}
                        type="button"
                      >
                        {loading ? "Posting..." : "Post Content"}
                      </button>
                      <button
                        style={styles.postActionPrimary}
                        onClick={() => handleSubmit("advisory")}
                        disabled={loading}
                        type="button"
                      >
                        {loading ? "Posting..." : "Post Advisory"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Logout button for admin */}
                <button
                  type="button"
                  style={styles.sideLinkSecondary}
                  onClick={handleAdminLogout}
                >
                  Logout admin
                </button>
              </>
            ) : (
              <div style={styles.adminLoginBox}>
  <div style={styles.sideTitle}>Admin mode</div>
  <p style={styles.sideText}>
    Login to create, edit, or delete posts.
  </p>

  {!showAdminLogin ? (
    <button
      type="button"
      style={styles.sideLinkPrimary}
      onClick={() => {
        setAdminInput("");
        setShowAdminLogin(true);
      }}
    >
      Admin login
    </button>
  ) : (
    <>
      <input
        type="password"
        value={adminInput}
        onChange={(e) => setAdminInput(e.target.value)}
        onFocus={() => setAdminInput("")}
        onClick={() => setAdminInput("")}
        placeholder="Admin password"
        autoComplete="off"
        name="echoes_admin_access_code_not_saved"
        id="echoes_admin_access_code_not_saved"
        data-lpignore="true"
        data-form-type="other"
        style={styles.input}
      />

      <button
        type="button"
        style={styles.sideLinkPrimary}
        onClick={handleAdminLogin}
      >
        Login
      </button>
    </>
  )}
</div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.tabButton,
        ...(active ? styles.tabButtonActive : {}),
      }}
    >
      {label}
    </button>
  );
}

function Select({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={styles.select}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function SocialPostCard({
  card,
  post,
  onCardClick,
  onReadPost,
  onSharePost,
  onCommentPost,
}: {
  card: FeedCard;
  post: DbPost | null;
  onCardClick: () => void;
  onReadPost: () => void;
  onSharePost: (post: DbPost | null) => void;
  onCommentPost: (post: DbPost | null) => void;
}) {
  return (
    <article style={styles.postCard}>
      <button
        type="button"
        onClick={onCardClick}
        style={styles.postCardImageButton}
      >
        <img src={card.image} alt={card.title} style={styles.postImage} className="post-image" />
      </button>

      <div style={styles.postBody}>
        <div style={styles.postTopMeta}>
          <div style={styles.postSource}>{card.source}</div>
          <div style={styles.postTime}>{card.time}</div>
        </div>

        <div style={styles.postCategory}>{card.category}</div>

        <button
          type="button"
          onClick={onCardClick}
          style={styles.postTitleButton}
          className="post-title-button"
        >
          {card.title}
        </button>

        <div style={styles.postDesc}>{card.desc}</div>

        <div style={styles.postActions}>
          <button
            type="button"
            style={styles.postAction}
            onClick={() => onCommentPost(post)}
          >
            Comment
          </button>

          <button
            type="button"
            style={styles.postAction}
            onClick={() => onSharePost(post)}
          >
            Share
          </button>

          <button
            type="button"
            style={styles.postActionPrimary}
            onClick={onReadPost}
          >
            Read post
          </button>
        </div>
      </div>
    </article>
  );
}

function StructuredResult({
  result,
  province,
}: {
  result: DecisionResult;
  province: string;
}) {
  return (
    <div style={styles.structuredWrap}>
      <div style={styles.structuredIntro}>{result.intro}</div>

      {result.options?.length > 0 && (
        <div style={styles.optionTableWrap}>
          <div style={styles.optionTableHeader}>
            Best options for {province}
          </div>

          <div style={styles.optionTable}>
            <div style={styles.optionTableRowHead}>
              <div>Option</div>
              <div>Vibe</div>
              <div>Best for</div>
              <div>Why it fits</div>
            </div>

            {result.options.map((item, index) => (
              <div key={index} style={styles.optionTableRow}>
                <div style={styles.optionCellStrong}>{item.option}</div>
                <div>{item.vibe}</div>
                <div>{item.bestFor}</div>
                <div>{item.whyItFits}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.quickGuide?.length > 0 && (
        <div style={styles.guideWrap}>
          <div style={styles.guideTitle}>Quick Guide</div>
          <ul style={styles.guideList}>
            {result.quickGuide.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {result.finalRecommendation && (
        <div style={styles.finalRecommendation}>
          <div style={styles.finalRecommendationLabel}>
            Final Recommendation
          </div>
          <div style={styles.finalRecommendationText}>
            {result.finalRecommendation}
          </div>
        </div>
      )}

      {result.optionalContext && (
        <p style={styles.optionalContext}>{result.optionalContext}</p>
      )}

      <div style={styles.agodaButtonWrap}>
        <a
          href={getAgodaUrl(province)}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.agodaButton}
        >
          Find hotels in {province} on Agoda
        </a>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    color: "#111827",
    lineHeight: 1.5,
  } as CSSProperties,

  appFrame: {
    maxWidth: 1200,
    margin: "0 auto",
    background: "#fff",
    boxShadow: "0 0 30px rgba(0,0,0,.05)",
  } as CSSProperties,

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  } as CSSProperties,

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  } as CSSProperties,

  brandLogo: {
    fontSize: 28,
  } as CSSProperties,

  brandTitle: {
    fontSize: 18,
    fontWeight: 800,
  } as CSSProperties,

  brandSub: {
    fontSize: 13,
    color: "#6b7280",
  } as CSSProperties,

  topActions: {
    display: "flex",
    gap: 10,
  } as CSSProperties,

  topGhostBtn: {
    border: "none",
    background: "transparent",
    color: "#111827",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  } as CSSProperties,

  topPrimaryBtn: {
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  } as CSSProperties,

  hero: {
    position: "relative",
    height: 380,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    textAlign: "center",
  } as CSSProperties,

  heroImage: {
    position: "absolute",
    inset: 0,
    backgroundImage:
  "linear-gradient(hsla(0, 0%, 0%, 0.00), rgba(0, 0, 0, 0)), url('/Images/echoes-hero.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
  } as CSSProperties,

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0) 100%)",
    zIndex: 1,
  } as CSSProperties,

  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: 600,
    padding: "0 20px",
  } as CSSProperties,

  heroBadge: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "6px 12px",
    background: "rgba(255,255,255,.2)",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 10,
  } as CSSProperties,

  heroTitle: {
    fontSize: 48,
    fontWeight: 900,
    margin: "0 0 12px",
    lineHeight: 1.1,
  } as CSSProperties,

  heroText: {
    fontSize: 18,
    lineHeight: 1.6,
    opacity: 0.9,
  } as CSSProperties,

  profileBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  } as CSSProperties,

  profileTitle: {
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
  } as CSSProperties,

  profileSub: {
    fontSize: 14,
    color: "#6b7280",
    margin: "4px 0 0",
  } as CSSProperties,

  followBtn: {
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  } as CSSProperties,

  tabs: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  } as CSSProperties,

  tabButton: {
    flex: 1,
    padding: "14px 20px",
    border: "none",
    background: "transparent",
    fontSize: 16,
    fontWeight: 600,
    color: "#6b7280",
    cursor: "pointer",
    transition: "color .2s, border-color .2s",
    // Use explicit border properties instead of shorthand to avoid conflicts with borderBottomColor
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
  } as CSSProperties,

  tabButtonActive: {
    color: "#111827",
    borderBottomColor: "#111827",
  } as CSSProperties,

  contentArea: {
    display: "flex",
    gap: 24,
    padding: 24,
    alignItems: "start",
  } as CSSProperties,

  leftCol: {
    flexShrink: 0,
    width: 280,
    display: "grid",
    gap: 20,
  } as CSSProperties,

  centerCol: {
    flexGrow: 1,
    maxWidth: 700,
    display: "grid",
    gap: 20,
  } as CSSProperties,

  rightCol: {
    flexShrink: 0,
    width: 280,
    display: "grid",
    gap: 20,
  } as CSSProperties,

  sideCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  sideTitle: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 12,
  } as CSSProperties,

  sideText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 1.7,
    marginBottom: 16,
  } as CSSProperties,

  sideLinkPrimary: {
    display: "block",
    width: "100%",
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    marginBottom: 10,
  } as CSSProperties,

  sideLinkSecondary: {
    display: "block",
    width: "100%",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,

  // Admin login box style
  adminLoginBox: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  bulletList: {
    margin: 0,
    paddingLeft: 20,
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 1.8,
  } as CSSProperties,

  homeSection: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  } as CSSProperties,

  sectionEyebrow: {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#6b7280",
    marginBottom: 4,
  } as CSSProperties,

  sectionTitle: {
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
  } as CSSProperties,

  sectionAction: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,

  feedList: {
    display: "grid",
    gap: 20,
  } as CSSProperties,

  postCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  postCardImageButton: {
    width: "100%",
    border: "none",
    padding: 0,
    background: "transparent",
    cursor: "pointer",
  } as CSSProperties,

  postImage: {
    display: "block",
    width: "100%",
    height: 300,
    objectFit: "cover",
  } as CSSProperties,

  postBody: {
    padding: 18,
  } as CSSProperties,

  postTopMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 8,
  } as CSSProperties,

  postSource: {
    fontSize: 14,
    fontWeight: 800,
  } as CSSProperties,

  postTime: {
    fontSize: 13,
    color: "#6b7280",
  } as CSSProperties,

  postCategory: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#f3f4f6",
    color: "#374151",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  } as CSSProperties,

  postTitleButton: {
    border: "none",
    padding: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 800,
    textAlign: "left",
    color: "#111827",
    marginBottom: 10,
  } as CSSProperties,

  postDesc: {
    color: "#4b5563",
    lineHeight: 1.7,
    fontSize: 15,
    marginBottom: 16,
  } as CSSProperties,

  postActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  } as CSSProperties,

  postAction: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,

  postActionPrimary: {
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,

  createPostCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  createPostHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "start",
    marginBottom: 16,
    flexWrap: "wrap",
  } as CSSProperties,

  createPostTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 4,
  } as CSSProperties,

  createPostSub: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
  } as CSSProperties,

  refreshButton: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 16,
    outline: "none",
    marginBottom: 12,
  } as CSSProperties,

  textarea: {
    width: "100%",
    minHeight: 160,
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 16,
    outline: "none",
    marginBottom: 12,
    resize: "vertical",
    fontFamily: "inherit",
  } as CSSProperties,

  createPostButton: {
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "14px 18px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 800,
  } as CSSProperties,

  loadingCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 20,
    color: "#6b7280",
  } as CSSProperties,

  emptyCard: {
    background: "#fff",
    border: "1px dashed #d1d5db",
    borderRadius: 18,
    padding: 24,
    color: "#6b7280",
    textAlign: "center",
  } as CSSProperties,

  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  } as CSSProperties,

  overviewToolCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  overviewToolLabel: {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#6b7280",
    marginBottom: 8,
  } as CSSProperties,

  overviewToolTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 10,
  } as CSSProperties,

  overviewToolText: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#4b5563",
    marginBottom: 16,
  } as CSSProperties,

  overviewToolButton: {
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,

  toolWrap: {
    display: "grid",
    gap: 18,
  } as CSSProperties,

  toolHeader: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  toolBadge: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  } as CSSProperties,

  toolTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    marginBottom: 8,
  } as CSSProperties,

  toolSub: {
    margin: 0,
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 1.7,
  } as CSSProperties,

  toolCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  toolGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 16,
  } as CSSProperties,

  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 8,
  } as CSSProperties,

  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    fontSize: 16,
    background: "#fff",
    outline: "none",
  } as CSSProperties,

  field: {
    marginBottom: 14,
  } as CSSProperties,

  toolPrimaryButton: {
    width: "100%",
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: 16,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 16,
  } as CSSProperties,

  shareHintWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginTop: 14,
    flexWrap: "wrap",
  } as CSSProperties,

  shareHintText: {
    color: "#6b7280",
    fontSize: 14,
  } as CSSProperties,

  shareButtonSecondary: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,

  shareButtonPrimary: {
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,

  resultBox: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  structuredWrap: {
    display: "grid",
    gap: 18,
  } as CSSProperties,

  structuredIntro: {
    fontSize: 16,
    lineHeight: 1.8,
    color: "#374151",
  } as CSSProperties,

  optionTableWrap: {
    display: "grid",
    gap: 10,
  } as CSSProperties,

  optionTableHeader: {
    fontSize: 18,
    fontWeight: 800,
  } as CSSProperties,

  optionTable: {
    display: "grid",
    gap: 10,
  } as CSSProperties,

  optionTableRowHead: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1.3fr",
    gap: 12,
    fontSize: 13,
    fontWeight: 800,
    color: "#6b7280",
    padding: "0 2px",
  } as CSSProperties,

  optionTableRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1.3fr",
    gap: 12,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    lineHeight: 1.6,
  } as CSSProperties,

  optionCellStrong: {
    fontWeight: 800,
  } as CSSProperties,

  guideWrap: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
  } as CSSProperties,

  guideTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 8,
  } as CSSProperties,

  guideList: {
    margin: 0,
    paddingLeft: 18,
    lineHeight: 1.8,
    color: "#374151",
  } as CSSProperties,

  finalRecommendation: {
    background: "#111827",
    color: "#fff",
    borderRadius: 18,
    padding: 18,
  } as CSSProperties,

  finalRecommendationLabel: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: "uppercase",
    opacity: 0.8,
    marginBottom: 8,
  } as CSSProperties,

  finalRecommendationText: {
    fontSize: 24,
    fontWeight: 900,
    lineHeight: 1.2,
  } as CSSProperties,

  optionalContext: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#6b7280",
  } as CSSProperties,

  agodaButtonWrap: {
    marginTop: 18,
    marginBottom: 18,
  } as CSSProperties,

  agodaButton: {
    display: "inline-flex",
    textDecoration: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: 800,
  } as CSSProperties,

  feedbackWrap: {
    marginTop: 12,
    marginBottom: 18,
    display: "grid",
    gap: 10,
  } as CSSProperties,

  feedbackLabel: {
    fontSize: 14,
    fontWeight: 700,
  } as CSSProperties,

  feedbackTextarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 110,
    border: "1px solid #d1d5db",
    borderRadius: 14,
    padding: "14px 16px",
    resize: "vertical",
    fontSize: 15,
    fontFamily: "inherit",
  } as CSSProperties,

  feedbackButton: {
    border: "none",
    background: "#111827",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
    justifySelf: "start",
  } as CSSProperties,

  commentMessage: {
    fontSize: 14,
    color: "#374151",
  } as CSSProperties,

  resultShareWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 18,
  } as CSSProperties,

  resultShareText: {
    color: "#6b7280",
    fontSize: 14,
  } as CSSProperties,

  commentsWrap: {
    display: "grid",
    gap: 12,
  } as CSSProperties,

  commentsTitle: {
    fontSize: 18,
    fontWeight: 800,
  } as CSSProperties,

  commentsHighlight: {
    background: "#fff8e1",
    border: "1px solid #ffe082",
    padding: 12,
    borderRadius: 12,
  } as CSSProperties,

  commentsHighlightTitle: {
    fontWeight: 800,
    marginBottom: 6,
  } as CSSProperties,

  commentsHighlightText: {
    fontSize: 14,
    color: "#374151",
  } as CSSProperties,

  commentsEmpty: {
    color: "#6b7280",
    fontSize: 14,
  } as CSSProperties,

  commentsList: {
    display: "grid",
    gap: 10,
  } as CSSProperties,

  commentCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  } as CSSProperties,

  commentMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  } as CSSProperties,
  commentTime: {
    color: "#9ca3af",
  } as CSSProperties,

  commentText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.7,
  } as CSSProperties,

  resultWrap: {
    display: "grid",
    gap: 16,
  } as CSSProperties,

  resultSimpleBox: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  resultLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#6b7280",
    marginBottom: 8,
  } as CSSProperties,

  resultBest: {
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 8,
  } as CSSProperties,

  resultWhy: {
    color: "#4b5563",
    lineHeight: 1.7,
    marginBottom: 14,
  } as CSSProperties,

  linkButton: {
    display: "inline-flex",
    textDecoration: "none",
    background: "#111827",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
  } as CSSProperties,

  altCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  altLevel: {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#6b7280",
    marginBottom: 8,
  } as CSSProperties,

  altName: {
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 8,
  } as CSSProperties,

  altWhy: {
    color: "#4b5563",
    lineHeight: 1.7,
    marginBottom: 14,
  } as CSSProperties,

  altLink: {
    display: "inline-flex",
    textDecoration: "none",
    color: "#2563eb",
    fontWeight: 700,
  } as CSSProperties,

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.65)",
    zIndex: 1000,
    overflowY: "auto",
    padding: "28px 16px",
  } as CSSProperties,

  modalCard: {
    maxWidth: 860,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 24px 60px rgba(0,0,0,.25)",
  } as CSSProperties,

  modalClose: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 999,
    border: "none",
    background: "rgba(17,24,39,.88)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 18,
    zIndex: 2,
  } as CSSProperties,

  modalImage: {
    width: "100%",
    height: 420,
    objectFit: "cover",
    display: "block",
  } as CSSProperties,

  modalTopMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    padding: "20px 22px 0",
    color: "#6b7280",
    fontSize: 14,
  } as CSSProperties,

  modalPageName: {
    fontWeight: 800,
    color: "#111827",
  } as CSSProperties,

  modalTime: {} as CSSProperties,

  modalTitle: {
    margin: 0,
    padding: "12px 22px 8px",
    fontSize: 34,
    lineHeight: 1.12,
    fontWeight: 900,
    color: "#111827",
  } as CSSProperties,

  modalContent: {
    padding: "0 22px 22px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.9,
    fontSize: 17,
    color: "#374151",
  } as CSSProperties,

  modalActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    padding: "0 22px 22px",
  } as CSSProperties,

  modalActionBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
  } as CSSProperties,
  commentsSection: {
    padding: "22px",
    borderTop: "1px solid #e5e7eb",
  } as CSSProperties,
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    color: "#111827",
  } as CSSProperties,
  commentItem: {
    padding: 12,
    background: "#f9fafb",
    borderRadius: 8,
    borderLeft: "3px solid #2563eb",
  } as CSSProperties,
  deleteCommentBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  } as CSSProperties,
  noComments: {
    textAlign: "center" as const,
    color: "#9ca3af",
    fontSize: 14,
    padding: 12,
  } as CSSProperties,
  deletePostBtn: {
    width: "100%",
    padding: "12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 12,
  } as CSSProperties,
  commentInput: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    resize: "vertical" as const,
    minHeight: 100,
    boxSizing: "border-box" as const,
  } as CSSProperties,
  submitCommentBtn: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 12,
  } as CSSProperties,

};
