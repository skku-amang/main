import Link from "next/link"

import ROUTES from "@/constants/routes"

const WelcomeWindow = () => {
  return (
    <div
      className="win-window"
      style={{ width: "520px", maxWidth: "90vw" }}
    >
      {/* Title bar */}
      <div className="win-titlebar">
        <div className="flex items-center gap-1">
          <span style={{ fontSize: "12px" }}>🎵</span>
          <span style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px", fontWeight: "bold" }}>
            Amang - 성균관대학교 자유음악동아리 아망
          </span>
        </div>
        <div className="flex items-center">
          <span className="win-ctrl-btn" title="Minimize">_</span>
          <span className="win-ctrl-btn" title="Maximize">□</span>
          <span className="win-ctrl-btn" title="Close" style={{ fontWeight: "bold" }}>✕</span>
        </div>
      </div>

      {/* Menu bar */}
      <div
        style={{
          background: "#d4d0c8",
          borderBottom: "1px solid #808080",
          padding: "1px 4px",
          display: "flex",
          gap: 0
        }}
      >
        {["파일(F)", "편집(E)", "보기(V)", "즐겨찾기(A)", "도움말(H)"].map((item) => (
          <span key={item} className="win-menuitem" style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px" }}>
            {item}
          </span>
        ))}
      </div>

      {/* Content area */}
      <div className="win-sunken m-2 p-4" style={{ background: "white", minHeight: "200px" }}>
        <div className="flex flex-col items-center gap-4">
          {/* Header icon area */}
          <div className="flex items-center gap-3 w-full" style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" }}>
            <span style={{ fontSize: "32px" }}>🎵</span>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold", fontFamily: "Tahoma, sans-serif", color: "#0a246a" }}>
                Amang
              </div>
              <div style={{ fontSize: "11px", color: "#444", fontFamily: "Tahoma, sans-serif" }}>
                성균관대학교 자유음악동아리
              </div>
            </div>
          </div>

          {/* Welcome message */}
          <div style={{ width: "100%", fontFamily: "Tahoma, sans-serif", fontSize: "11px", lineHeight: "1.6" }}>
            <p style={{ color: "#000080", fontWeight: "bold", marginBottom: "6px" }}>
              아망 홈페이지에 오신 것을 환영합니다!
            </p>
            <p style={{ color: "#333", marginBottom: "8px" }}>
              성균관대학교 자유음악동아리 아망은 다양한 장르의 음악을 즐기는 동아리입니다.
              공연, 팀 모집, 공간 대여 정보를 확인하세요.
            </p>
            <marquee
              style={{
                background: "#000080",
                color: "#ffffff",
                padding: "2px 4px",
                fontSize: "11px",
                fontFamily: "Tahoma, sans-serif",
                display: "block",
                border: "1px inset #808080"
              }}
            >
              🎵 아망 정기공연 팀원 모집 중! 지금 바로 지원하세요 🎵 &nbsp;&nbsp;&nbsp; 공간 대여 및 물품 대여 서비스 운영 중 🎵
            </marquee>
          </div>

          {/* Quick links as desktop icons */}
          <div className="flex gap-4 w-full justify-center flex-wrap" style={{ paddingTop: "8px" }}>
            {[
              { icon: "🏠", label: "공간 대여", href: ROUTES.RESERVATION.CLUBROOM },
              { icon: "🎸", label: "물품 대여", href: ROUTES.RESERVATION.EQUIPMENT },
              { icon: "📁", label: "아카이브", href: ROUTES.PERFORMANCE.LIST },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1 p-2"
                style={{
                  width: "64px",
                  cursor: "pointer",
                  textDecoration: "none"
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    filter: "drop-shadow(1px 1px 0 rgba(0,0,0,0.3))"
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "Tahoma, sans-serif",
                    color: "#000080",
                    textAlign: "center",
                    lineHeight: "1.2",
                    background: "transparent"
                  }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="win-statusbar flex items-center justify-between"
        style={{ fontFamily: "Tahoma, sans-serif" }}
      >
        <div className="flex items-center gap-2">
          <div className="win-inset px-2 py-px" style={{ minWidth: "120px", fontSize: "10px" }}>
            준비됨
          </div>
          <div className="win-inset px-2 py-px" style={{ minWidth: "60px", fontSize: "10px" }}>
            🔒 인터넷
          </div>
        </div>
        <span style={{ fontSize: "10px", color: "#444" }}>아망 v1.0</span>
      </div>
    </div>
  )
}

const DesktopIcon = ({
  icon,
  label,
  href
}: {
  icon: string
  label: string
  href: string
}) => {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 p-2 group"
      style={{
        width: "72px",
        textDecoration: "none",
        cursor: "pointer"
      }}
    >
      <div
        style={{
          fontSize: "36px",
          filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.4))"
        }}
      >
        {icon}
      </div>
      <span
        className="group-hover:underline"
        style={{
          fontSize: "11px",
          fontFamily: "Tahoma, sans-serif",
          color: "white",
          textAlign: "center",
          textShadow: "1px 1px 2px black, 0 0 4px black",
          lineHeight: "1.2"
        }}
      >
        {label}
      </span>
    </Link>
  )
}

export default function Home() {
  return (
    <>
      {/* Desktop icons - left side */}
      <div
        className="fixed left-4 top-16 hidden flex-col gap-2 lg:flex"
        style={{ userSelect: "none" }}
      >
        <DesktopIcon icon="🎵" label="아망" href={ROUTES.HOME} />
        <DesktopIcon icon="📅" label="공간 대여" href={ROUTES.RESERVATION.CLUBROOM} />
        <DesktopIcon icon="🎸" label="물품 대여" href={ROUTES.RESERVATION.EQUIPMENT} />
        <DesktopIcon icon="🗂️" label="아카이브" href={ROUTES.PERFORMANCE.LIST} />
        <DesktopIcon icon="♻️" label="휴지통" href={ROUTES.HOME} />
      </div>

      {/* Central window */}
      <div
        className="fixed left-1/2 top-1/2 hidden lg:block"
        style={{
          transform: "translateY(-50%) translateX(-50%)",
          userSelect: "none",
          zIndex: 10
        }}
      >
        <WelcomeWindow />
      </div>

      {/* Mobile fallback */}
      <div className="flex flex-col items-center justify-center px-4 py-8 lg:hidden">
        <div className="win-window w-full max-w-sm">
          <div className="win-titlebar">
            <span style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px", fontWeight: "bold" }}>
              🎵 Amang
            </span>
            <div className="flex">
              <span className="win-ctrl-btn">_</span>
              <span className="win-ctrl-btn">□</span>
              <span className="win-ctrl-btn">✕</span>
            </div>
          </div>
          <div className="p-4 win-sunken m-2" style={{ background: "white" }}>
            <p style={{ fontFamily: "Tahoma, sans-serif", fontSize: "12px", fontWeight: "bold", color: "#000080" }}>
              아망에 오신 것을 환영합니다!
            </p>
            <p style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px", marginTop: "6px" }}>
              성균관대학교 자유음악동아리 아망
            </p>
          </div>
          <div className="win-statusbar" style={{ fontFamily: "Tahoma, sans-serif", fontSize: "10px" }}>
            준비됨
          </div>
        </div>
      </div>
    </>
  )
}
