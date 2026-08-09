import { FadeInUp } from "../animations/FadeInUp";
import { AnimatedCounter } from "../animations/AnimatedCounter";
import {stats} from "@/components/landing/data/demo-data";

export default function Stats() {
  return (
    <section
      id="stats-section"
      className="border-y border-violet-500/15 bg-violet-500/5 px-8 py-12"
    >
      <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-8 text-center sm:grid-cols-3">
        {stats.map((stat, i) => (
          <FadeInUp key={stat.label} delay={i * 150}>
            <div>
              <div className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.03em] text-violet-400">
                <AnimatedCounter
                  end={stat.num}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={2000}
                  id="stats-section"
                />
              </div>

              <p className="mt-1 text-sm text-white/40">
                {stat.label}
              </p>
            </div>
          </FadeInUp>
        ))}
      </div>
    </section>
  );
}