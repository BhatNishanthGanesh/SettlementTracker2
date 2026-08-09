import Image from "next/image";

export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-8 py-8">
      <div className="flex items-center gap-2">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-md">
          <Image src="/SettlementTracker.jpg" alt="Settlement Tracker"  width={22} height={22}/>
        </div>

        <span className="text-sm font-semibold text-white">
          Settlement Tracker
        </span>

        <span className="ml-2 text-sm text-white/25">
          © 2025
        </span>
      </div>

      <div className="flex gap-8">
        {["Privacy", "Terms", "Contact"].map((link) => (
          <a
            key={link}
            href="#"
            className="text-sm text-white/30 transition-colors hover:text-violet-300"
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}