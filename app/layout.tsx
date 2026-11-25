import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/components/CartContext";
import { AuthProvider } from "@/components/AuthContext";
import { ToastProvider } from "@/components/Toast";
import ChatWidgetLoader from "@/components/ChatWidgetLoader";
import PartnerModal from "@/components/PartnerModal";
import {
  SITE_URL,
  SITE_NAME,
  buildMetadata,
  organizationSchema,
  websiteSchema,
  jsonLd,
} from "@/lib/seo";

/**
 * Single typeface for the whole site, matching the reference storefront's
 * approach: one geometric sans carrying every level purely through weight and
 * size. Poppins is the closest freely-licensable match to the reference's
 * F37 Ginger — near-identical metrics, single-storey `a` and `g`, and the
 * same circular geometry. Italic ships too, for the hero's accent line.
 */
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-core",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  ...buildMetadata({
    title: "Peptiva Labs — Reference-Grade Research Peptides for Laboratory Use",
    path: "/",
    keywords: [
      "research peptides",
      "reference peptides",
      "laboratory research compounds",
      "BPC-157 TB-500 reference",
      "tirzepatide research reference",
      "retatrutide research reference",
      "analytical research materials",
      "Peptiva Labs",
    ],
  }),
  // Child routes render "<Page> · Peptiva Labs"; the home page keeps its full title.
  title: {
    default: "Peptiva Labs — Reference-Grade Research Peptides for Laboratory Use",
    template: `%s · ${SITE_NAME}`,
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={poppins.variable}
    >
      <body
        suppressHydrationWarning
        className="bg-white font-core text-black antialiased"
      >
        {/* Keyboard/screen-reader shortcut past the fixed navigation. */}
        <a href="#home" className="skip-link">
          Skip to content
        </a>

        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <SmoothScroll>{children}</SmoothScroll>
              <PartnerModal />
              <ChatWidgetLoader />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(organizationSchema())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(websiteSchema())}
        />
      </body>
    </html>
  );
}
