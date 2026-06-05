import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BT - Blindtest",
    template: "%s | BT",
  },
  description:
    "Web app mobile-first de blindtest musical pour jouer en soiree ou en mini-jeux rapides.",
  applicationName: "BT - Blindtest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BT",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/bt-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/bt-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#050611",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
