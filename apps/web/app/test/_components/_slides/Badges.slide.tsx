import NewcomerMiniBadge from "../Badges/NewComerMiniBadge"
import SelfMadeSongBadge from "../Badges/SelfMadeSongBadge"
import SessionMiniBadge from "../Badges/SessionMiniBadge"

import ActiveInactiveBadge from "../Badges/ActiveInactiveBadge"
import PassFailBadge from "../Badges/PassFailBadge"
import CompletionBadge from "../Badges/CompletionBadge"

// ✅ LG badges

import SessionBadge from "../Badges/SessionBadge"
import NewcomerBadge from "../Badges/NewComerBadge"

export const BadgesSlide = {
  key: "badge",
  title: "Badge",
  content: (
    <section className="space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold"># Badge</h2>
        <p className="text-sm text-muted-foreground">
          Small, semantic badges used inline with text or metadata.
        </p>
      </div>

      {/* XS Badges */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">
          자작곡 뱃지 (xs), 신입고정 뱃지 (xs)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SelfMadeSongBadge />
          <NewcomerMiniBadge />
        </div>
      </div>

      {/* SM Badges */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">
          세션 뱃지 (sm)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SessionMiniBadge label="기타1" />
          <SessionMiniBadge label="신디1" />
          <SessionMiniBadge label="드럼" />
          <SessionMiniBadge label="베이스" />
        </div>
      </div>

      {/* BASE Badges */}
      <div className="space-y-6">
        <div className="text-sm font-medium text-muted-foreground">
          상태 뱃지 (base)
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* active / inactive */}
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              active / inactive
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ActiveInactiveBadge state="active" size="base" />
              <ActiveInactiveBadge state="inactive" size="base" />
            </div>
          </div>

          {/* pass / fail */}
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">pass / fail</div>
            <div className="flex flex-wrap items-center gap-3">
              <PassFailBadge state="pass" />
              <PassFailBadge state="fail" />
            </div>
          </div>

          {/* complete / incomplete */}
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              complete / incomplete
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CompletionBadge state="complete" />
              <CompletionBadge state="incomplete" />
            </div>
          </div>
        </div>

        {/* optional: show lg variant of active/inactive only */}
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            active / inactive (lg variant)
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ActiveInactiveBadge state="active" size="lg" />
            <ActiveInactiveBadge state="inactive" size="lg" />
          </div>
        </div>
      </div>

      {/* ✅ LG Badges */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">
          세션 뱃지 (lg), 신입고정 뱃지 (lg)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <NewcomerBadge />
          <SessionBadge label="보컬1" />
          <SessionBadge label="기타1" />
          <SessionBadge label="기타2" />
          <SessionBadge label="드럼" />
          <SessionBadge label="베이스" />
          <SessionBadge label="신디1" />
        </div>
      </div>
    </section>
  )
}
