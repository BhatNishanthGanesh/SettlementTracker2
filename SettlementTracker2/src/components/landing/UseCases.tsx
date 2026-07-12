import { FadeInUp } from "../animations/FadeInUp";

const useCases = [
  "Dorms",
  "Office Trips",
  "Weddings",
  "Backpacking",
  "Weekend Getaways",
  "Friend Circles",
];

export default function UseCases() {
  return (
    <FadeInUp>
      <section className="relative overflow-hidden border-y border-white/5 py-12 md:py-16">
        {/* glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />

        <div className="relative mx-auto max-w-7xl px-6">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-white/30">
            Perfect for
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {useCases.map((item) => (
              <div
                key={item}
                className="
                  group
                  rounded-full
                  border border-white/10
                  bg-white/[0.03]
                  px-5 py-3
                  backdrop-blur-sm
                  transition-all duration-300
                  hover:border-purple-500/40
                  hover:bg-purple-500/10
                  hover:scale-105
                  hover:shadow-lg
                  hover:shadow-purple-500/10
                "
              >
                <span className="text-sm md:text-base font-medium text-white/60 transition-colors group-hover:text-white">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeInUp>
  );
}