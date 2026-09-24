"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScanRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/undangan/scan");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f0c", color: "#c9a84c", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <p>Membuka scanner...</p>
    </div>
  );
}
