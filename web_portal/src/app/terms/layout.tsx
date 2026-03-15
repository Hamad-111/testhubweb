import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - TestHub",
  description: "Read the terms and conditions for using the TestHub AI platform. Our commitment to fair use and educational excellence.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
