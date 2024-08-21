import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { cn } from "@/lib/utils";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AMANG",
  description: "SKKU AMANG official homepage",
  icons: {
    icon: '/favicon.ico'
  }
};

const HeightPopulatedBody = (
  { headerHeight, footerHeight, children }:
  { headerHeight: string, footerHeight: string, children: React.ReactNode }
) => {
  return (
    <body className={cn(inter.className, "h-screen")}>
      <Header position="fixed" height={headerHeight} />
      <div
        className="h-auto"
        style={{
          paddingTop: headerHeight,
          minHeight: "100%",
          paddingBottom: footerHeight
        }}
      >{children}
      </div>
      <Footer height={footerHeight} />
      </body>
  );
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
      >
        <div className="container">
          {children}
        </div>
      </HeightPopulatedBody>
    </html>
  );
}
