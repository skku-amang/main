import "@/app/globals.css";

import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import React from "react";

import HeightPopulatedBody from "@/components/common/HeightPopulatedBody";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "AMANG",
  description: "SKKU AMANG official homepage",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <HeightPopulatedBody
        headerHeight="4rem"
        footerHeight="5rem"
        className={fontSans.className}
      >
        <div className="container px-1 md:px-2 lg:px-3">
          {children}
        </div>
      </HeightPopulatedBody>
    </html>
  );
}
