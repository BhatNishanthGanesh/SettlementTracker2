import { FadeInUp } from "../animations/FadeInUp";
import {features,cardStyles} from "@/components/landing/data/demo-data";

export default function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-[1100px] px-8 py-20"
    >
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.1em] text-violet-400">
          Features
        </p>

        <h2 className="text-[clamp(26px,4vw,40px)] font-bold tracking-tight text-white">
          Everything PhonePe groups
          <br />
          should have had
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {features.map((feature, i) => (
          <FadeInUp key={feature.title} delay={i * 50}>
            <div
              className={`rounded-2xl p-6 ${cardStyles[feature.color as keyof typeof cardStyles]}`}
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>

              <h3 className="mb-2 text-[15px] font-semibold text-zinc-100">
                {feature.title}
              </h3>

              <p className="text-sm leading-6 text-white/45">
                {feature.desc}
              </p>
            </div>
          </FadeInUp>
        ))}
      </div>
    </section>
  );
}