import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
    { media: "(prefers-color-scheme: dark)",  color: "#080B14" },
  ],
};

export const metadata: Metadata = {
  title: { default: "EVONANCE | Premium Crypto-Fintech Platform", template: "%s | EVONANCE" },
  description: "Trade, swap, and manage digital assets with institutional-grade tools. Create a USD Virtual Card from just $1.",
  keywords: ["crypto", "trading", "DeFi", "virtual card", "Bitcoin", "Ethereum", "portfolio"],
  authors: [{ name: "Evolution Finance Limited" }],
  openGraph: {
    type: "website",
    title: "EVONANCE | Premium Crypto-Fintech Platform",
    description: "Institutional-grade crypto trading and financial ecosystem.",
    siteName: "EVONANCE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, outfit.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
