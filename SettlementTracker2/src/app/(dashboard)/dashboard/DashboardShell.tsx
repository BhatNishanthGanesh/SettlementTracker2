'use client';

import React, { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  initialCollapsed: boolean;
}

export default function DashboardShell({
  children,
  initialCollapsed,
}: DashboardShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(initialCollapsed);

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <Sidebar
        initialCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <main
        className={cn(
          "min-h-screen p-4 lg:p-8 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        )}
      >
        <div className="max-w-7xl mx-auto">
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  );
}