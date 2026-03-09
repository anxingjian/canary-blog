import PasswordGate from "@/components/PasswordGate";

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <PasswordGate>{children}</PasswordGate>;
}
