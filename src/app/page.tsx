"use client";

import { useRouter } from "next/navigation";
import Gate from "@/components/Gate";

export default function Home() {
  const router = useRouter();

  const handleEnter = (href: string) => {
    router.push(href);
  };

  return <Gate onEnter={handleEnter} />;
}
