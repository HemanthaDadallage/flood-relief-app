import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flood Relief Sri Lanka",
  description: "Connecting volunteers with people affected by storms in Sri Lanka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
