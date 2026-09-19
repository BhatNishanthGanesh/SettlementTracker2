"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav
            className="
        fixed top-4 left-1/2 -translate-x-1/2
        z-50
        w-[95%]
        max-w-7xl

        rounded-2xl
        border border-white/10

        bg-[#0A0A0F]/95
        backdrop-blur-xl

        px-4 md:px-6
        py-3
      "
        >
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl ">
                        <Image src="/settlementTracker.jpg" alt="Settlement Tracker"  width={40} height={40}/>
                    </div>

                    <span className="text-sm md:text-base font-semibold tracking-tight text-white">
                        Settlement Tracker
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#features"
                        className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                        Features
                    </a>

                    <a
                        href="#how-it-works"
                        className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                        How it works
                    </a>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className="text-white/80 hover:text-white hover:bg-white/5"
                            >
                                Log in
                            </Button>
                        </Link>

                        <Link href="/register">
                            <Button className="bg-purple-600 hover:bg-purple-500">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center gap-2 md:hidden">
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/80 hover:text-white px-2"
                        >
                            Log in
                        </Button>
                    </Link>

                    <Link href="/register">
                        <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-500"
                        >
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}