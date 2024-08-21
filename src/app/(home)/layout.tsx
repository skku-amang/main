import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import React from "react";
import HeightPopulatedBody from "@/components/common/HeightPopulatedBody";

const inter = Inter({ subsets: ["latin"] });

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
        className={inter.className}
        style={{
          backgroundImage: `url('Music band_pixabay 1.png')`,
          backgroundPosition: 'center',
          filter: "brightness(100%)" }}
      >
        <div className="container">
          {children}
        </div>
      </HeightPopulatedBody>
    </html>
  );
}
