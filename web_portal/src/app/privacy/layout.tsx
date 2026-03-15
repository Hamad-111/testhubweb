import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - TestHub",
  description: "Learn how TestHub protects your data and ensures a safe, secure environment for teachers and students using our AI educational tools.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
