import type { Metadata } from "next";
import { Outfit, Syne, Space_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Eco-Sync Nexus | Energy Intelligence",
  description: "Advanced AI-driven energy sovereignty and blockchain trading ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} ${spaceMono.variable}`}>
      <body className={`${outfit.className} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
