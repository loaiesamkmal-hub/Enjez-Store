import type { Metadata } from "next";
import "./globals.css"; // تأكد إن ملف الـ CSS مربوط هنا
import { CartProvider } from "../context/CartContext";

export const metadata: Metadata = {
  title: "أنجز | مستلزمات الأسنان",
  description: "متجر أنجز - الشريك المعتمد لعيادات الأسنان",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}