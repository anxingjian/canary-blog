import PasswordGate from "@/components/PasswordGate";

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <PasswordGate>{children}</PasswordGate>;
}
