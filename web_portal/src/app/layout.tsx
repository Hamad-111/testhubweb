import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TestHub - AI Powered Learning & Quiz Generation",
  description: "Generate engaging quizzes with AI in seconds. Host live games, analyze student performance, and transform your classroom with TestHub.",
  keywords: ["AI quiz generator", "interactive learning", "classroom engagement", "online quiz maker", "student analytics", "live quiz hosting", "TestHub AI"],
  authors: [{ name: "TestHub Team" }],
  creator: "TestHub",
  publisher: "TestHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.test-hub.site"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TestHub - AI Powered Learning & Quiz Generation",
    description: "Generate engaging quizzes with AI in seconds and host live games that students love.",
    url: "https://www.test-hub.site",
    siteName: "TestHub",
    images: [
      {
        url: "/og-image.png", // Assuming this will be added or exists
        width: 1200,
        height: 630,
        alt: "TestHub - AI Powered Learning",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TestHub - AI Powered Learning & Quiz Generation",
    description: "Generate engaging quizzes with AI in seconds and host live games that students love.",
    creator: "@testhub_ai",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className={`${outfit.className} bg-slate-950 text-slate-50 selection:bg-primary/30`} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
