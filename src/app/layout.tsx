import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PartyFace",
  description: "A disco-glam birthday creation studio for personalized stills and motion cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
