import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgeGateWrapper from "@/components/AgeGateWrapper";

export const metadata = {
  title: "CreatorRank — Premium Creator Marketplace",
  description: "Premium creator profiles, ranking & featured demos.",
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
