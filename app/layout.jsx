import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nash Wellness",
  description: "Book verified massage, spa, and wellness home services with live chat support.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="page w-full flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
