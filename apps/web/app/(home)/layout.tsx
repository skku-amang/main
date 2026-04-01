import RootHeaderAndFooterWrapper from "@/components/RootHeaderAndFooterWrapper"

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RootHeaderAndFooterWrapper
      headerMode="light"
      mainStyle={{
        background: "#3a6ea5",
        backgroundImage: `
          radial-gradient(ellipse at 20% 20%, rgba(100,150,220,0.2) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(10,36,106,0.3) 0%, transparent 50%)
        `
      }}
      mainClassName=""
    >
      {children}
    </RootHeaderAndFooterWrapper>
  )
}
