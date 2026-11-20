import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans-src", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono-src", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif-src", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "School Management Research",
    template: "%s · School Management Research",
  },
  description:
    "An academic research questionnaire on how school management operates in practice.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
