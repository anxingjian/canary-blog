"use client";

import PasswordGate from "@/components/PasswordGate";

export default function PostPasswordGate({ isPublic, children }: { isPublic: boolean; children: React.ReactNode }) {
  if (isPublic) return <>{children}</>;
  return <PasswordGate>{children}</PasswordGate>;
}
