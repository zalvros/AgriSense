"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg px-4 py-3 flex items-start gap-3 animate-in slide-in-from-right-full text-sm ${
            toast.type === "success"
              ? "bg-green-600/20 text-green-200 border border-green-600/30"
              : toast.type === "error"
                ? "bg-red-600/20 text-red-200 border border-red-600/30"
                : toast.type === "warning"
                  ? "bg-yellow-600/20 text-yellow-200 border border-yellow-600/30"
                  : "bg-blue-600/20 text-blue-200 border border-blue-600/30"
          }`}
        >
          {toast.type === "success" && <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
          {toast.type === "error" && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
          {toast.type === "warning" && <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
          <div className="flex-1">{toast.message}</div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-foreground/60 hover:text-foreground/80 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
