import { FadeInUp } from "../animations/FadeInUp";
import {steps} from "@/components/landing/data/demo-data";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-[800px] px-8 pb-20"
    >
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.1em] text-violet-400">
          How it works
        </p>

        <h2 className="text-[clamp(26px,4vw,40px)] font-bold tracking-tight text-white">
          From trip to settled,
          <br />
          in under a minute
        </h2>
      </div>

      <div className="relative">
        {steps.map((step, i) => (
          <FadeInUp key={step.step} delay={i * 100}>
            <div className="mb-10 flex items-start gap-8">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-sm font-bold tracking-tight text-violet-400">
                {step.step}
              </div>

              <div className="pt-3">
                <h3 className="mb-1.5 text-base font-semibold text-white">
                  {step.title}
                </h3>

                <p className="text-sm leading-6 text-white/45">
                  {step.desc}
                </p>
              </div>
            </div>
          </FadeInUp>
        ))}
      </div>
    </section>
  );
}