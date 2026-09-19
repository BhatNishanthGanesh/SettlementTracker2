import { FadeInUp } from "../animations/FadeInUp";
import { steps } from "@/components/landing/data/demo-data";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-4xl px-6 pb-24 md:px-8"
    >
      <div className="mb-14 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
          How it works
        </p>

        <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-tight text-white">
          From trip to settled,
          <br />
          in under a minute
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/40">
          Add your expenses, let Settlement Tracker handle the math,
          and settle up with ease.
        </p>
      </div>

      <div className="relative">
        <div className="space-y-5">
          {steps.map((step, i) => (
            <FadeInUp key={step.step} delay={i * 100}>
              <div className="group relative flex gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-violet-500/20 hover:bg-violet-500/[0.03]">
                {/* Step number */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-[#0A0A0F] text-sm font-bold text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all duration-300 group-hover:border-violet-400/50 group-hover:text-violet-300">
                  {step.step}
                </div>

                {/* Content */}
                <div className="pt-1.5">
                  <h3 className="mb-2 text-base font-semibold text-white">
                    {step.title}
                  </h3>

                  <p className="max-w-xl text-sm leading-6 text-white/40">
                    {step.desc}
                  </p>
                </div>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}