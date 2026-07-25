import { cookies } from "next/headers";
import DashboardShell from "./DashboardShell";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialCollapsed =
    cookieStore.get("sidebar-collapsed")?.value === "true";

  return (
    <DashboardShell
      initialCollapsed={initialCollapsed}
    >
      {children}
    </DashboardShell>
  );
}