"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Gate from "./Gate";

export default function HomeWithGate({ children }: { children: React.ReactNode }) {
  const [gateOpen, setGateOpen] = useState(false);
  const router = useRouter();

  const handleEnter = (href: string) => {
    if (href === "/") {
      // Stay on home, just reveal content
      setGateOpen(true);
    } else {
      router.push(href);
    }
  };

  return (
    <>
      {!gateOpen && <Gate onEnter={handleEnter} />}
      <div
        style={{
          opacity: gateOpen ? 1 : 0,
          transition: "opacity 0.5s ease-in 0.1s",
        }}
      >
        {children}
      </div>
    </>
  );
}
