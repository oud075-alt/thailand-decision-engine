"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <main style={styles.page}>
      <section
        style={{
          ...styles.hero,
          minHeight: isMobile ? "72vh" : "560px",
          backgroundImage: "url('/Images/thai-hero.jpg')",
        }}
      >
        <div style={styles.heroOverlay} />

        <div
          style={{
            ...styles.heroInner,
            padding: isMobile ? "32px 20px" : "40px 24px",
          }}
        >
          <h1
            style={{
              ...styles.heroTitle,
              fontSize: isMobile ? 30 : 68,
              lineHeight: isMobile ? 1.25 : 1.05,
              maxWidth: isMobile ? 340 : 980,
              margin: "0 auto",
              padding: isMobile ? "0 16px" : "0",
            }}
          >
            Welcome to Thailand
          </h1>

          <p
            style={{
              ...styles.heroSubtitle,
              fontSize: isMobile ? 18 : 22,
              maxWidth: isMobile ? 320 : 720,
              margin: isMobile ? "18px auto 0" : "22px auto 0",
            }}
          >
            Discover the beauty, culture, and unforgettable experiences of
            Thailand.
          </p>

          <button
            style={{
              ...styles.heroButton,
              marginTop: isMobile ? 28 : 36,
              padding: isMobile ? "16px 30px" : "18px 44px",
              fontSize: isMobile ? 17 : 18,
              width: isMobile ? "100%" : "auto",
              maxWidth: isMobile ? 300 : "none",
            }}
            onClick={() => router.push("/tool")}
          >
            START DECISION
          </button>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2
            style={{
              ...styles.sectionTitle,
              fontSize: isMobile ? 34 : 40,
              marginBottom: isMobile ? 24 : 34,
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              ...styles.cardRow,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(3, minmax(0, 1fr))",
              gap: isMobile ? 16 : 28,
            }}
          >
            <InfoCard
              icon="✓"
              iconBg="#4da3ff"
              title="Answer Questions"
              text="Tell us your preferences, like budget and activities"
              isMobile={isMobile}
            />
            <InfoCard
              icon="◎"
              iconBg="#f59b4a"
              title="Get Recommendation"
              text="See the best destinations and hotels for you"
              isMobile={isMobile}
            />
            <InfoCard
              icon="↪"
              iconBg="#67b86a"
              title="Book Instantly"
              text="Click to book your ideal stay through Agoda"
              isMobile={isMobile}
            />
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.container}>
          <h2
            style={{
              ...styles.sectionTitle,
              fontSize: isMobile ? 34 : 40,
              marginBottom: isMobile ? 24 : 34,
            }}
          >
            Who Is This For?
          </h2>

          <div
            style={{
              ...styles.photoCardRow,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(3, minmax(0, 1fr))",
              gap: isMobile ? 16 : 28,
            }}
          >
            <AudienceCard
              image="https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80"
              icon="✓"
              iconBg="#2f80ed"
              title="First-time Travelers"
              text="Better quiet or stay near the action? Get clear direction fast."
              isMobile={isMobile}
            />
            <AudienceCard
              image="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80"
              icon="◉"
              iconBg="#f2994a"
              title="Families"
              text="Find areas that feel easier, cleaner, and more comfortable."
              isMobile={isMobile}
            />
            <AudienceCard
              image="https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80"
              icon="▶"
              iconBg="#6fcf97"
              title="Couples"
              text="Choose places that feel more special, romantic, and well matched."
              isMobile={isMobile}
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2
            style={{
              ...styles.sectionTitle,
              fontSize: isMobile ? 34 : 40,
              marginBottom: isMobile ? 24 : 34,
            }}
          >
            Why Use Thailand Decision Engine?
          </h2>

          <div
            style={{
              ...styles.cardRow,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(3, minmax(0, 1fr))",
              gap: isMobile ? 16 : 28,
            }}
          >
            <InfoCard
              icon="⌚"
              iconBg="#56a8ff"
              title="Save Time"
              text="Find the perfect spot in seconds, not hours of research"
              isMobile={isMobile}
            />
            <InfoCard
              icon="➜"
              iconBg="#f2994a"
              title="Reduce Confusion"
              text="No more endless searching — get a clear recommendation"
              isMobile={isMobile}
            />
            <InfoCard
              icon="👍"
              iconBg="#6fcf97"
              title="Avoid Bad Choices"
              text="Discover places that match your style, budget, and needs"
              isMobile={isMobile}
            />
          </div>
        </div>
      </section>

      <section style={styles.aboutSection}>
        <div style={styles.container}>
          <div
            style={{
              ...styles.aboutBox,
              gridTemplateColumns: isMobile ? "1fr" : "1.45fr 0.95fr",
              gap: isMobile ? 0 : 28,
            }}
          >
            <div
              style={{
                ...styles.aboutContent,
                padding: isMobile ? "28px 22px 30px" : "42px 40px 44px",
              }}
            >
              <h2
                style={{
                  ...styles.aboutTitle,
                  fontSize: isMobile ? 28 : 30,
                }}
              >
                About Thailand Decision Engine
              </h2>

              <p
                style={{
                  ...styles.aboutText,
                  fontSize: isMobile ? 16 : 18,
                  lineHeight: isMobile ? 1.7 : 1.7,
                }}
              >
                I live in Thailand and work around tourist areas every day.

                {"\n\n"}I see the same problem again and again:
                {"\n"}Travelers don’t struggle because Thailand is bad —
                {"\n"}they struggle because there are too many choices.

                {"\n\n"}Phuket, Krabi, Bangkok, Chiang Mai…
                {"\n"}Every place looks good, but not every place fits you.

                {"\n\n"}That’s why I built this tool.

                {"\n\n"}Instead of guessing, just answer a few simple questions —
                {"\n"}and instantly get a clear, personalized place to stay.

                {"\n\n"}Stop wasting time comparing.
                {"\n"}Start with a place that actually fits you.
              </p>
            </div>

            <div
              style={{
                ...styles.aboutImageWrap,
                minHeight: isMobile ? 280 : 100,
              }}
            >
              <img
                src="/Images/about-thai-man.jpg"
                alt="Thai local expert"
                style={{
                  ...styles.aboutImage,
                  minHeight: isMobile ? 280 : 280,
                  maxHeight: isMobile ? 320 : "none",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  iconBg,
  title,
  text,
  isMobile,
}: {
  icon: string;
  iconBg: string;
  title: string;
  text: string;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        ...styles.infoCard,
        padding: isMobile ? "22px 20px" : "26px 28px",
      }}
    >
      <div style={styles.infoCardHeader}>
        <div style={{ ...styles.infoIcon, background: iconBg }}>{icon}</div>
        <h3
          style={{
            ...styles.infoTitle,
            fontSize: isMobile ? 20 : 22,
          }}
        >
          {title}
        </h3>
      </div>
      <p
        style={{
          ...styles.infoText,
          fontSize: isMobile ? 16 : 18,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function AudienceCard({
  image,
  icon,
  iconBg,
  title,
  text,
  isMobile,
}: {
  image: string;
  icon: string;
  iconBg: string;
  title: string;
  text: string;
  isMobile: boolean;
}) {
  return (
    <div style={styles.audienceCard}>
      <img
        src={image}
        alt={title}
        style={{
          ...styles.audienceImage,
          height: isMobile ? 220 : 230,
        }}
      />
      <div
        style={{
          ...styles.audienceBody,
          padding: isMobile ? "16px 18px 20px" : "18px 22px 22px",
        }}
      >
        <div style={styles.audienceTitleRow}>
          <div style={{ ...styles.infoIcon, background: iconBg }}>{icon}</div>
          <h3
            style={{
              ...styles.audienceTitle,
              fontSize: isMobile ? 20 : 22,
            }}
          >
            {title}
          </h3>
        </div>
        <p
          style={{
            ...styles.audienceText,
            fontSize: isMobile ? 16 : 18,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f3f3f3",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
  },

  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px",
  },

  hero: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",
  },

  heroInner: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 980,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  heroTitle: {
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "-1px",
    textShadow: "0 4px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)",
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.95)",
    fontWeight: 500,
  },

  heroButton: {
    border: "none",
    borderRadius: 14,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(37, 99, 235, 0.4)",
  },

  section: {
    padding: "56px 0",
    background: "#f3f3f3",
  },

  sectionAlt: {
    padding: "36px 0 56px",
    background: "#f0f0f0",
  },

  sectionTitle: {
    margin: "0 0 34px",
    textAlign: "center",
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#1d2430",
    letterSpacing: "-0.02em",
  },

  cardRow: {
    display: "grid",
  },

  infoCard: {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
  },

  infoCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
    flexShrink: 0,
  },

  infoTitle: {
    margin: 0,
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#1f2430",
  },

  infoText: {
    margin: 0,
    lineHeight: 1.55,
    color: "#4f5663",
  },

  photoCardRow: {
    display: "grid",
  },

  audienceCard: {
    overflow: "hidden",
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
  },

  audienceImage: {
    display: "block",
    width: "100%",
    objectFit: "cover",
  },

  audienceBody: {},

  audienceTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  audienceTitle: {
    margin: 0,
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#1f2430",
  },

  audienceText: {
    margin: 0,
    lineHeight: 1.5,
    color: "#555d69",
  },

  aboutSection: {
    padding: "38px 0 72px",
    background: "#f3f3f3",
  },

  aboutBox: {
    display: "grid",
    borderRadius: 22,
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(11,84,108,0.96), rgba(18,120,140,0.88))",
    boxShadow: "0 16px 34px rgba(0,0,0,0.1)",
  },

  aboutContent: {
    color: "#fff",
  },

  aboutTitle: {
    margin: 0,
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#fff",
  },

  aboutText: {
    marginTop: 18,
    maxWidth: 620,
    color: "rgba(255,255,255,0.92)",
    whiteSpace: "pre-line",
  },

  aboutImageWrap: {
    background: "rgba(255,255,255,0.08)",
  },

  aboutImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};