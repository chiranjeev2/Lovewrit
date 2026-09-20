import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lovewrit | Personalized Occasion Cards & Keepsake Pages",
  description:
    "Handcrafted digital greeting cards & emotional multimedia keepsake mini-websites for life's sacred moments, celebrations, and love letters.",
  openGraph: {
    title: "Lovewrit | Personalized Occasion Cards & Keepsake Pages",
    description:
      "Handcrafted digital greeting cards & emotional multimedia keepsake mini-websites for life's sacred moments.",
    siteName: "Lovewrit",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 selection:bg-rose-500 selection:text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
