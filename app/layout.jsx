import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
            pt-[70px]          /* mobile navbar height */
            sm:pt-[70px]
            md:pt-[320px]      /* desktop full navbar */
            transition-all duration-300
          "
        >
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
