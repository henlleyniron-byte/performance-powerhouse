import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A/L Performance Powerhouse",
  description: "Evidence-first Physics, Chemistry and Biology exam performance command centre.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
