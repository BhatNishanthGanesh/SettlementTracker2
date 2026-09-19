'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  Settings,
  Users,
  Menu,
  X,
  Wallet,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Monitor,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils'
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  initialCollapsed: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ initialCollapsed, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
  const fetchProfileImage = async () => {
    try {
      const response = await fetch('/api/user/profile');

      if (!response.ok) return;

      const data = await response.json();
      const userData = data.data || data.user || data;

      setProfileImage(userData.image || null);
    } catch (error) {
      console.error('Failed to fetch profile image:', error);
    }
  };

  if (session?.user) {
    fetchProfileImage();
  }
}, [session]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    document.cookie = `sidebar-collapsed=${newState}; path=/; max-age=31536000`;
    onCollapseChange?.(newState);
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Trip', href: '/dashboard/create-trip', icon: PlusCircle },
    { name: 'Groups', href: '/dashboard/group', icon: Users },
    { name: 'Expenses', href: '/dashboard/expenses', icon: Calendar },
    { name: 'AI chat', href: '/dashboard/ai-chat', icon: Monitor },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <TooltipProvider>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border bg-white dark:bg-slate-900"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen z-40",
          "bg-white dark:bg-slate-900",
          "border-r border-slate-200 dark:border-slate-800",
          "transition-all duration-300 ease-in-out",
          "flex flex-col",
          isCollapsed ? "w-24" : "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "p-4 border-b border-slate-200 dark:border-slate-800",
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed ? "justify-center" : ""
          )}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Image src="/settlementTracker.jpg" alt="Logo" height={40} width={40} />
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="font-bold text-lg text-slate-900 dark:text-white">
                  Settlement Tracker
                </h1>
                <p className="text-xs text-slate-500">
                  Smart expense sharing
                </p>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className={cn(
              "hidden lg:flex items-center justify-center",
              "h-8 w-8 rounded-lg",
              "hover:bg-slate-100 dark:hover:bg-slate-800",
              "transition-colors",
              isCollapsed ? "absolute -right-1 top-4" : ""
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl",
                      "transition-all",
                      isCollapsed ? "justify-center" : "",
                      isActive(item.href)
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon size={isCollapsed ? 22 : 18} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Theme Toggle */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (mounted) {
                    setTheme(theme === "dark" ? "light" : "dark");
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                  "hover:bg-slate-100 dark:hover:bg-slate-800 transition",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                {mounted ? (
                  theme === "dark" ? (
                    <>
                      <Sun size={isCollapsed ? 22 : 18} />
                      {!isCollapsed && <span>Light Mode</span>}
                    </>
                  ) : (
                    <>
                      <Moon size={isCollapsed ? 22 : 18} />
                      {!isCollapsed && <span>Dark Mode</span>}
                    </>
                  )
                ) : (
                  <>
                    <Monitor size={isCollapsed ? 22 : 18} />
                    {!isCollapsed && <span>Theme</span>}
                  </>
                )}
              </button>
            </TooltipTrigger>

            {isCollapsed && (
              <TooltipContent side="right">
                {mounted
                  ? theme === "dark"
                    ? "Light Mode"
                    : "Dark Mode"
                  : "Theme"}
              </TooltipContent>
            )}
          </Tooltip>

          {/* Settings */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/settings"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl",
                  "hover:bg-slate-100 dark:hover:bg-slate-800 transition",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <Settings size={isCollapsed ? 22 : 18} />
                {!isCollapsed && <span>Settings</span>}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>


          {/* User Profile */}
          <Link
            href="/dashboard/profile"
            className={cn(
              "mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800",
              "hover:bg-slate-200 dark:hover:bg-slate-700",
              "flex items-center gap-3 transition-colors",
              isCollapsed ? "justify-center" : ""
            )}
          >
            {profileImage  || session?.user?.image ? (
              <img src={profileImage ?? session?.user.image??""} alt="User Profile" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                <User size={isCollapsed ? 20 : 16} />
              </div>
            )}
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  View Profile
                </p>
              </div>
            )}
          </Link>

          {/* Logout */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                  "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition",
                  isCollapsed ? "justify-center" : ""
                )}
                onClick={() => {
                  signOut({ callbackUrl: '/' })
                }}
              >
                <LogOut size={isCollapsed ? 22 : 18} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="text-red-600">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}