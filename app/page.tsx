"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/shared/stores/app.store";

export default function Root() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  useEffect(() => { router.replace(user ? "/dashboard" : "/login"); }, [user, router]);
  return null;
}
