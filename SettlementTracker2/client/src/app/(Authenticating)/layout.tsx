"use client";

import Link from "next/link";
import { ArrowLeft } from "react-feather";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0A0A0F] to-black flex items-center justify-center p-4 relative overflow-hidden">
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back to Home</span>
      </Link>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {children}
    </div>
  );
}