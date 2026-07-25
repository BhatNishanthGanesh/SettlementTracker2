
import {FadeInUp} from "../animations/FadeInUp";
import { AnimatedCounter } from "../animations/AnimatedCounter";

export default function Stats() {
    return(
        <>
         <div id="stats-section" style={{ background: "rgba(124,58,237,0.06)", borderTop: "1px solid rgba(124,58,237,0.15)", borderBottom: "1px solid rgba(124,58,237,0.15)", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", textAlign: "center" }}>
          {[
            { num: 24000, suffix: "+", label: "Expenses tracked", prefix: "" },
            { num: 18, suffix: "Cr+", label: "Total amount split", prefix: "₹" },
            { num: 99, suffix: "%", label: "Settlement accuracy", prefix: "" },
          ].map((s, i) => (
            <FadeInUp key={s.label} delay={i * 150}>
              <div>
                <div style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#A78BFA" }}>
                  <AnimatedCounter end={s.num} prefix={s.prefix} suffix={s.suffix} duration={2000} id="stats-section" />
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
        </>
    )
}