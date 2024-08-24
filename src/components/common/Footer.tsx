import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Footer = ({ position }: { position: "static" | "relative" | "absolute" | "fixed" | "sticky" }) => {
  return (
    <footer
      className={cn(position, "w-full bottom-0 flex justify-center h-24 items-center gap-x-10")}
    >
      <Link href="/">
        <Image src="/Logo.png" alt="logo" width={47} height={47} />
      </Link>
      <p className="font-extrabold" style={{ color: "#7E7E7E" }}>
        성균관대학교 자유음악동아리 아망
      </p>

      <div className="flex gap-x-5">
        <Link href="/">
          <FaYoutube size={30} style={{ color: "#BEBEBE" }} />
        </Link>
        <Link href="/">
          <FaInstagram size={30} style={{ color: "#BEBEBE" }} />
        </Link>
      </div>
    </footer>
  )
}

export default Footer