import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://al-performance-powerhouse.phenlleyniron.chatgpt.site"),
  title: "A/L Performance Powerhouse · V5 Evidence Edition",
  description: "A local-first G.C.E. A/L Biological Science system for honest attempts, diagnosis, repair, fresh transfer and delayed retesting.",
  openGraph: {
    title: "A/L Performance Powerhouse · V5 Evidence Edition",
    description: "Attempt → Mark → Diagnose → Repair → Transfer → Retest",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "A/L Performance Powerhouse · V4 Community Edition",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
