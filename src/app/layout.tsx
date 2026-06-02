import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}
