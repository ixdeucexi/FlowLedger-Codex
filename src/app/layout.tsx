import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowLedger — Money made visible",
  description: "A calm, clear view of your cash flow, bills, and goals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

