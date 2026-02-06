"use client";

import { useEffect } from "react";

const EXTENSION_ERROR_PATTERNS = [
  "Could not establish connection",
  "Receiving end does not exist",
];

function isExtensionError(msg: string): boolean {
  return EXTENSION_ERROR_PATTERNS.some((p) => msg.includes(p));
}

function shouldSuppress(args: unknown[]): boolean {
  const first = args[0];
  const msg =
    typeof first === "string"
      ? first
      : first instanceof Error
        ? first.message
        : "";
  return isExtensionError(msg);
}

export default function ConsoleFilter() {
  useEffect(() => {
    const original = console.error;
    console.error = (...args: unknown[]) => {
      if (shouldSuppress(args)) return;
      original.apply(console, args);
    };

    const onRejection = (e: PromiseRejectionEvent) => {
      const msg =
        e.reason?.message ?? (typeof e.reason === "string" ? e.reason : "");
      if (isExtensionError(msg)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      console.error = original;
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
