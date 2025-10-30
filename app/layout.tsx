import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebFastTry - Test Pages",
  description: "Internal testing pages for engineers and external users",
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

