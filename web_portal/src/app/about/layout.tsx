import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TestHub - The Future of AI-Powered Learning",
  description: "Discover the mission behind TestHub. We're on a journey to transform classrooms through interactive AI-powered quiz generation and live engagement.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
