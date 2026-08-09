import type { Metadata } from "next";
import { Inter} from "next/font/google";
//@ts-ignore
import "./globals.css";
import { getServerSession } from "next-auth";
import SessionProvider from "../components/SessionProvider";
import { Providers } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Settlement Tracker",
  description: "created by nextjs",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" className={cn("font-sans")}>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Providers>
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}