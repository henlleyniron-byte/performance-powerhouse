import { AppearanceControl } from "./appearance-control";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://al-performance-powerhouse.phenlleyniron.chatgpt.site"),
  title: "A/L Performance Powerhouse · V10 Guided Execution Edition",
  description: "A local-first G.C.E. A/L Biological Science system for honest attempts, diagnosis, repair, fresh transfer and delayed retesting.",
  openGraph: {
    title: "A/L Performance Powerhouse · V10 Guided Execution Edition",
    description: "Attempt → Mark → Diagnose → Repair → Transfer → Retest",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "A/L Performance Powerhouse · V10 Guided Execution Edition",
    description: "Attempt → Mark → Diagnose → Repair → Transfer → Retest",
    images: ["/og.png"],
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
    <html lang="en" data-theme="dark" data-ui-shell="react" suppressHydrationWarning>
      <head><meta name="color-scheme" content="dark light" /><link rel="stylesheet" href="/ui-theme/theme.css" /><script src="/ui-theme/theme.js" /></head>
      <body>{children}<AppearanceControl /></body>
    </html>
  );
}
