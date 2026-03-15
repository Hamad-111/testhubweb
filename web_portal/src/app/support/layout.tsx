import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support & Help Center - TestHub",
  description: "Get help with TestHub AI. Find answers to frequently asked questions, email our support team, or join our community of educators.",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
