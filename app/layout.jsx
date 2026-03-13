import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import LiveLocationTracker from "@/components/LiveLocationTracker";
import PopupHost from "@/components/PopupHost";
import AppFrame from "@/components/AppFrame";

export const metadata = {
  title: "Nash Elite Escorts",
  description: "Book verified escort and companionship escorts with secure booking and live chat support.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <AuthProvider>
          <LiveLocationTracker />
          <PopupHost />
          <AppFrame>{children}</AppFrame>
        </AuthProvider>
      </body>
    </html>
  );
}
