import {FadeInUp} from "../animations/FadeInUp";

export default function HowItWorks() {
    return(
        <>
         <section id="how-it-works" style={{ maxWidth: 800, margin: "0 auto", padding: "0 2rem 80px" }}>
                 <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                   <p style={{ fontSize: 12, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>How it works</p>
                   <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, letterSpacing: "-0.02em" }}>From trip to settled,<br />in under a minute</h2>
                 </div>
                 <div style={{ position: "relative" }}>
                   {[
                     { step: "01", title: "Create a trip", desc: "Name your trip, pick dates. You get a shareable link instantly — no app download for members." },
                     { step: "02", title: "Set your budget", desc: "Enter your estimated trip budget. Our AI will track your spending and alert you if you're going over." },
                     { step: "03", title: "Log expenses as you go", desc: "Add expenses on the fly. Pick who paid, split equally or by custom amounts per person." },
                     { step: "04", title: "Get AI insights", desc: "Our AI analyzes your spending patterns and gives you smart recommendations to stay on track." },
                     { step: "05", title: "Pay and mark settled", desc: "Pay via any UPI app. Come back and mark it settled. Everyone sees the updated balance." },
                   ].map((s, i) => (
                     <FadeInUp key={i} delay={i * 100}>
                       <div style={{ display: "flex", gap: "2rem", marginBottom: "2.5rem", alignItems: "flex-start" }}>
                         <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 14, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#A78BFA", letterSpacing: "-0.02em" }}>
                           {s.step}
                         </div>
                         <div style={{ paddingTop: 12 }}>
                           <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{s.title}</h3>
                           <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{s.desc}</p>
                         </div>
                       </div>
                     </FadeInUp>
                   ))}
                 </div>
               </section>
        </>
    )
}