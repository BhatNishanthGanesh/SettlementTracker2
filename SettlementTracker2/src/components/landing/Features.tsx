import {FadeInUp} from "../animations/FadeInUp";


export default function Features() {
    return(
        <>
        <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 2rem" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                  <p style={{ fontSize: 12, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Features</p>
                  <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, letterSpacing: "-0.02em" }}>Everything PhonePe groups<br />should have had</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                  {[
                    { icon: "👥", title: "Group management", desc: "Create a group, invite people by link or email. Anyone can join and add expenses.", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
                    { icon: "➕", title: "Add expenses instantly", desc: "Log what was spent, who paid, and who's included. Works for unequal splits too.", color: "#0D9488", bg: "rgba(13,148,136,0.08)" },
                    { icon: "🧮", title: "Smart settlement", desc: "Our algorithm minimises total transactions. 6 debts can become just 3 payments.", color: "#D97706", bg: "rgba(217,119,6,0.08)" },
                    { icon: "📊", title: "Expense breakdown", desc: "See category-wise spending — food, travel, stay — so you know where money went.", color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
                    { icon: "🤖", title: "AI Spending Assistant", desc: "Get smart insights on your spending pattern to stay on budget.", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
                    { icon: "✅", title: "Mark as settled", desc: "Once paid, mark it done. The balance updates for everyone in real time.", color: "#0D9488", bg: "rgba(13,148,136,0.08)" },
                  ].map((f, i) => (
                    <FadeInUp key={f.title} delay={i * 50}>
                      <div style={{ background: f.bg, border: `1px solid ${f.color}22`, borderRadius: 16, padding: "1.4rem" }}>
                        <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                        <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: "#F1F0F5" }}>{f.title}</h3>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{f.desc}</p>
                      </div>
                    </FadeInUp>
                  ))}
                </div>
              </section>
        </>
    )
}