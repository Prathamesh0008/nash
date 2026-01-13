import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgeGateWrapper from "@/components/AgeGateWrapper";

export const metadata = {
  title: {
    default: "Elite Companions – Premium Adult Platform",
    template: "%s | Elite Companions",
  },
  description:
    "Elite Companions is a premium adults-only platform connecting verified models with users worldwide. 18+ only.",
  metadataBase: new URL("https://elitecompanions.com"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "Elite Companions",
    title: "Elite Companions – Adults Only Platform",
    description:
      "Verified models, private interactions, and secure access. Strictly 18+.",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />

        <main
          className="
            pt-[95px]
            md:pt-[180px]
            transition-all duration-300
          "
        >
          <AgeGateWrapper>
            {children}
          </AgeGateWrapper>
        </main>

        <Footer />
      </body>
    </html>
  );
}
