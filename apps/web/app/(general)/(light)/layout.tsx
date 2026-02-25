import { MiniPlayer, MiniPlayerProvider } from "@/components/MiniPlayer"
import RootHeaderAndFooterWrapper from "@/components/RootHeaderAndFooterWrapper"

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MiniPlayerProvider>
      <RootHeaderAndFooterWrapper>{children}</RootHeaderAndFooterWrapper>
      <MiniPlayer />
    </MiniPlayerProvider>
  )
}
