"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>Welcome to Thailand</h1>

          <p style={styles.heroSubtitle}>
            Discover the beauty, culture, and unforgettable experiences of
            Thailand.
          </p>

          <button
            style={styles.heroButton}
            onClick={() => router.push("/tool")}
          >
            START DECISION
          </button>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How It Works</h2>

          <div style={styles.cardRow}>
            <InfoCard
              icon="✓"
              iconBg="#4da3ff"
              title="Answer Questions"
              text="Tell us your preferences, like budget and activities"
            />
            <InfoCard
              icon="◎"
              iconBg="#f59b4a"
              title="Get Recommendation"
              text="See the best destinations and hotels for you"
            />
            <InfoCard
              icon="↪"
              iconBg="#67b86a"
              title="Book Instantly"
              text="Click to book your ideal stay through Agoda"
            />
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Who Is This For?</h2>

          <div style={styles.photoCardRow}>
            <AudienceCard
              image="https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80"
              icon="✓"
              iconBg="#2f80ed"
              title="First-time Travelers"
              text="Better quiet or stay near the action? Get clear direction fast."
            />
            <AudienceCard
              image="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80"
              icon="◉"
              iconBg="#f2994a"
              title="Families"
              text="Find places that feel easier, cleaner, and more comfortable."
            />
            <AudienceCard
              image="https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80"
              icon="▶"
              iconBg="#6fcf97"
              title="Couples"
              text="Choose areas with Thai charm, culture, and memorable atmosphere."
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Use Thailand Decision Engine?</h2>

          <div style={styles.cardRow}>
            <InfoCard
              icon="⌚"
              iconBg="#56a8ff"
              title="Save Time"
              text="Find the perfect spot in seconds, not hours of research"
            />
            <InfoCard
              icon="➜"
              iconBg="#f2994a"
              title="Reduce Confusion"
              text="No more endless searching — get a clear recommendation"
            />
            <InfoCard
              icon="👍"
              iconBg="#6fcf97"
              title="Avoid Bad Choices"
              text="Discover places that match your style, budget, and needs"
            />
          </div>
        </div>
      </section>

      <section style={styles.aboutSection}>
        <div style={styles.container}>
          <div style={styles.aboutBox}>
            <div style={styles.aboutContent}>
              <h2 style={styles.aboutTitle}>About Thailand Decision Engine</h2>

              <p style={styles.aboutText}>
  About Thailand Decision Engine

  {"\n\n"}I live in Thailand and work around tourist areas every day.

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

            <div style={styles.aboutImageWrap}>
              <img
                src="/images/about-thai-man.jpg"  
                alt="Thai local expert"
                style={styles.aboutImage}
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
}: {
  icon: string;
  iconBg: string;
  title: string;
  text: string;
}) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoCardHeader}>
        <div style={{ ...styles.infoIcon, background: iconBg }}>{icon}</div>
        <h3 style={styles.infoTitle}>{title}</h3>
      </div>
      <p style={styles.infoText}>{text}</p>
    </div>
  );
}

function AudienceCard({
  image,
  icon,
  iconBg,
  title,
  text,
}: {
  image: string;
  icon: string;
  iconBg: string;
  title: string;
  text: string;
}) {
  return (
    <div style={styles.audienceCard}>
      <img src={image} alt={title} style={styles.audienceImage} />
      <div style={styles.audienceBody}>
        <div style={styles.audienceTitleRow}>
          <div style={{ ...styles.infoIcon, background: iconBg }}>{icon}</div>
          <h3 style={styles.audienceTitle}>{title}</h3>
        </div>
        <p style={styles.audienceText}>{text}</p>
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
    minHeight: "560px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    overflow: "hidden",
    backgroundImage: "url('/images/thai-hero.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: `
      linear-gradient(
        to bottom,
        rgba(0,0,0,0.25) 0%,
        rgba(0,0,0,0.45) 60%,
        rgba(0,0,0,0.65) 100%
      )
    `,
  },

  heroInner: {
    position: "relative",
    zIndex: 1,
    maxWidth: 980,
    padding: "40px 24px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "68px",
    lineHeight: 1.05,
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "-1px",
    textShadow: "0 4px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)",
  },

  heroSubtitle: {
    margin: "22px auto 0",
    fontSize: "22px",
    color: "rgba(255,255,255,0.9)",
    maxWidth: "720px",
    lineHeight: 1.6,
  },

  heroButton: {
    marginTop: "36px",
    padding: "18px 44px",
    fontSize: "18px",
    fontWeight: 800,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    border: "none",
    borderRadius: "14px",
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
    fontSize: "40px",
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#1d2430",
    letterSpacing: "-0.02em",
  },

  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "28px",
  },

  infoCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "26px 28px",
    boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
  },

  infoCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "16px",
  },

  infoIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 800,
    flexShrink: 0,
  },

  infoTitle: {
    margin: 0,
    fontSize: "22px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#1f2430",
  },

  infoText: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.55,
    color: "#4f5663",
  },

  photoCardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "28px",
  },

  audienceCard: {
    overflow: "hidden",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
  },

  audienceImage: {
    display: "block",
    width: "100%",
    height: "230px",
    objectFit: "cover",
  },

  audienceBody: {
    padding: "18px 22px 22px",
  },

  audienceTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  audienceTitle: {
    margin: 0,
    fontSize: "22px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#1f2430",
  },

  audienceText: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.5,
    color: "#555d69",
  },

  aboutSection: {
    padding: "38px 0 72px",
    background: "#f3f3f3",
  },

  aboutBox: {
    display: "grid",
    gridTemplateColumns: "1.45fr 0.95fr",
    gap: "28px",
    borderRadius: "22px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(11,84,108,0.96), rgba(18,120,140,0.88))",
    boxShadow: "0 16px 34px rgba(0,0,0,0.1)",
  },

  aboutContent: {
    padding: "42px 40px 44px",
    color: "#fff",
  },

  aboutTitle: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.2,
    fontWeight: 800,
  },

  aboutText: {
    marginTop: "18px",
    maxWidth: "620px",
    fontSize: "18px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.92)",
  },

  aboutImageWrap: {
    minHeight: "100px",
    background: "rgba(255,255,255,0.08)",
  },

  aboutImage: {
    width: "100%",
    height: "100%",
    minHeight: "280px",
    objectFit: "cover",
    display: "block",
  },
};