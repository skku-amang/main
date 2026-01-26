import RootHeaderAndFooterWrapper from "@/components/RootHeaderAndFooterWrapper"

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RootHeaderAndFooterWrapper
      headerMode="transparent"
      mainStyle={{
        backgroundImage: `url('/Music band_pixabay 1.png')`,
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}
      mainClassName=""
    >
      {children}
    </RootHeaderAndFooterWrapper>
  )
}
