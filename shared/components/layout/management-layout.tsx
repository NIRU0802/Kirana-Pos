"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Toaster } from "./toaster";
import { useAppStore } from "@/shared/stores/app.store";

export function ManagementLayout({ children }: { children: React.ReactNode }) {
  const { user, theme } = useAppStore();
  const router = useRouter();
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  useEffect(() => { if (!user) router.replace("/login"); }, [user, router]);
  if (!user) return null;
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Toaster />
    </div>
  );
}
