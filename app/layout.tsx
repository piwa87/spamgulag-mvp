import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scam Handler",
  description: "AI voice agent — acoustic bridge prototype for handling suspicious phone calls",
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
