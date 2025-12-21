import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethical Hacking Lab Platform",
  description: "Web-Based Learning Management System for Penetration Testing Foundation Course",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
