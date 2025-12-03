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
      <body className="bg-gray-50 dark:bg-gray-900 antialiased text-gray-900 dark:text-gray-50">
        <header className="border-b border-gray-200/70 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
                FR
              </span>
              <p className="text-sm font-semibold tracking-tight">
                Flood Relief Sri Lanka
              </p>
            </div>
            <a
              href="/admin/login"
              className="text-xs font-medium text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-300"
            >
              Admin login
            </a>
          </div>
        </header>
        <div className="min-h-[calc(100vh-3.25rem)]">
          {children}
        </div>
        <footer className="border-t border-gray-200/70 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-[0.7rem] text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Flood Relief Sri Lanka.</p>
            <p>Built to support communities during storms and floods.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
