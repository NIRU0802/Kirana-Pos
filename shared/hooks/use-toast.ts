import { useState, useCallback } from "react";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
}

let _globalToast: ((opts: ToastOptions) => void) | null = null;

export function useToastEmitter() {
  return {
    toast: (opts: ToastOptions) => { _globalToast?.(opts); },
  };
}

export function useToastState() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toast = useCallback((opts: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { ...opts, id, open: true }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), opts.duration ?? 4000);
  }, []);
  _globalToast = toast;
  return { toasts, toast, dismiss: (id: string) => setToasts((p) => p.filter((t) => t.id !== id)) };
}
