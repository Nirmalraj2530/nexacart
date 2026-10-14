import "@/styles/tokens.css";
import "@/styles/common.css";
import "@/styles/layout.css";
import "@/styles/product.css";
import "@/styles/cart.css";
import "@/styles/admin.css";
import "./globals.css";

import { ReduxProvider } from "@/redux/provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/common/Toast";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: {
    default: "Nexacart | Modern E-Commerce Platform",
    template: "%s | Nexacart",
  },
  description:
    "Discover high-quality electronics, apparel, accessories, and shoes on Nexacart. Fast shipping and premium curated items.",
  keywords: ["e-commerce", "online shopping", "electronics", "fashion", "nextjs", "react"],
};

import { ApiSimulationProvider } from "@/hooks/useApiSimulation";
import { LoginModal } from "@/components/auth/LoginModal";
import { PromoOfferModal } from "@/components/common/PromoOfferModal";
import { GlobalLoadingManager } from "@/components/common/GlobalLoadingManager";
import { BackToTop } from "@/components/common/BackToTop";
import { ComparisonFloatingBar } from "@/components/common/ComparisonFloatingBar";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white" suppressHydrationWarning>
        <ReduxProvider>
          <ApiSimulationProvider>
            <Header />
            <main className="flex-1 w-full" style={{ minHeight: "calc(100vh - 350px)" }}>
              {children}
            </main>
            <Footer />
            <ToastContainer />
            <LoginModal />
            <PromoOfferModal />
            <BackToTop />
            <ComparisonFloatingBar />
            <GlobalLoadingManager />
          </ApiSimulationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
