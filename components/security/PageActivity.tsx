"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export default function PageActivity() {
  const path = usePathname();
  useEffect(() => {
    if (
      !path ||
      path.startsWith("/security") ||
      path.startsWith("/tx-dashboard")
    )
      return;
    void fetch("/api/activity", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        "X-NexusPay-Request": "1",
      },
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }, [path]);
  return null;
}
