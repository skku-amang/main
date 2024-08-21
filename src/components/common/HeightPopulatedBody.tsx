import { cn } from "@/lib/utils";
import Header from "./Header";
import Footer from "./Footer";


const HeightPopulatedBody = (
  { headerHeight, footerHeight, children, className, style }:
  { headerHeight: string, footerHeight: string,
    children: React.ReactNode, className?: string,
    style?: object
  }
) => {
  return (
    <body className={cn(className, "h-screen overflow-hidden")} style={style}>
      <Header position="fixed" height={headerHeight} />
      <div
        className="h-auto"
        style={{
          paddingTop: headerHeight,
          minHeight: "100%",
          paddingBottom: footerHeight
        }}
      >
        {children}
      </div>
      <Footer height={footerHeight} />
    </body>
  )
}

export default HeightPopulatedBody