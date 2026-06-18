import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jarvis — Your AI Superagent",
  description:
    "A cinematic voice & text agentic AI superagent with a rich British accent.",
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="jarvis-bg" />
        <div className="jarvis-grid" />
        {children}
      </body>
    </html>
  );
}
