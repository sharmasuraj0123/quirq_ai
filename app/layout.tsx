import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";

/* Geometric for the mark, grotesque for reading, mono for anything metered. */
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "Tokens meter what your AI consumed. quirq meters what it delivered — verified against captured state, priced by the person who wanted it, costed all-in.";

export const metadata: Metadata = {
  metadataBase: new URL("https://quirq.ai"),
  title: "quirq · watch the work, not the meter",
  description: DESCRIPTION,
  icons: {
    icon: "/assets/favicon.svg",
    apple: "/assets/quirq-mark.jpg",
  },
  openGraph: {
    title: "quirq · watch the work, not the meter",
    description: DESCRIPTION,
    url: "https://quirq.ai",
    type: "website",
    images: [{ url: "/assets/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "quirq · watch the work, not the meter",
    description: DESCRIPTION,
    images: ["/assets/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${jetbrains.variable} antialiased`}
    >
      <head>
        {/* Entrance animations start from opacity:0. Without JS those inline
            styles would never be cleared, so the page would render blank. */}
        <noscript>
          <style>{`main *, nav, nav * { opacity: 1 !important; transform: none !important; filter: none !important; }`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
