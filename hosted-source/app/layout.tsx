import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://al-performance-powerhouse.phenlleyniron.chatgpt.site"),
  title: "A/L Performance Powerhouse · 2027 Reset",
  description: "A private, evidence-first command centre for deep work, marked-paper output, error repair and delayed retesting across Physics, Chemistry and Biology.",
  openGraph: {
    title: "A/L Performance Powerhouse",
    description: "2027 Reset · Evidence → Repair → Retest",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "A/L Performance Powerhouse",
    description: "2027 Reset · Evidence → Repair → Retest",
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
