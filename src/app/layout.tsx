import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BuyerShell from "@/components/BuyerShell";
import VisitorTracker from "@/components/VisitorTracker";
import ThemeProvider from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://solevault.com"),
  title: {
    default: "Sole Vault | Premium Sneaker Resell & Authentic Streetwear",
    template: "%s | Sole Vault"
  },
  description: "India's premium destination for 100% authentic sneakers. Shop limited edition Jordans, Yeezys, Nike, and more with our expert authenticity guarantee.",
  keywords: ["sneakers", "resell", "authentic sneakers", "Jordan India", "Yeezy India", "Sole Vault", "sneaker marketplace", "streetwear"],
  authors: [{ name: "Sole Vault" }],
  creator: "Sole Vault",
  publisher: "Sole Vault",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Sole Vault | Premium Sneaker Resell",
    description: "100% authentic sneakers sourced from official drops. Elevate your collection today.",
    url: "https://solevault.com",
    siteName: "Sole Vault",
    images: [
      {
        url: "/og-image.jpg", // Assuming an OG image exists or will be added
        width: 1200,
        height: 630,
        alt: "Sole Vault - Premium Sneakers",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sole Vault | Premium Sneaker Resell",
    description: "100% authentic sneakers sourced from official drops. Elevate your collection today.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased text-black bg-white dark:text-neutral-100 dark:bg-neutral-950 transition-colors duration-300`}>
        <ThemeProvider>
          <Navbar />
          <VisitorTracker />
          <BuyerShell>
            <div className="flex-1">
              {children}
            </div>
          </BuyerShell>
          <Footer />
          <WhatsAppButton />
          <Toaster position="bottom-center" toastOptions={{ className: 'text-sm font-bold uppercase tracking-wide !bg-white !text-black dark:!bg-neutral-800 dark:!text-white' }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
