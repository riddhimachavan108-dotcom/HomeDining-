import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Dining",
  description: "Order food to your hotel room — no phone calls needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
