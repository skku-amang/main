"use client"

import { useState } from "react"
import AvatarCustomed from "./_components/AvatarCustomed"
import BadgeCustomed from "./_components/BadgeCustomed"
import BreadcumbCustomed from "./_components/BreadcumbCustomed"
import CardCustomed from "./_components/CardCustomed"
import CheckboxCustomed from "./_components/CheckboxCustomed"
import HeaderCustomed from "./_components/Header"
import PaginationCustomed from "./_components/PaginationCustomed"
import SearchBarCustomed from "./_components/SearchBarCustomed"
import { Separator } from "@/components/ui/separator" // ✅ shadcn separator import
import { Tabs } from "@/components/ui/tabs"
import { TabCustomed } from "./_components/TabCustomed"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import TooltipCustomed from "./_components/TooltipCustomed"
import ToastCustomed from "./_components/ToastCustomed"
import YoutubePlayer from "@/lib/youtube/Player"
import VideoCustomed from "./_components/VideoCustomed"

export default function TestPage() {
  const [page, setPage] = useState(20)
  const totalPages = 70

  return (
    <div className="p-10 flex flex-col gap-8">
      {/* Avatar */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Avatar</h1>
        <AvatarCustomed
          generation={31}
          name="오정환"
          time={new Date("2025-09-28T21:00:00Z")}
        />
        <Separator className="mt-16" />
      </section>

      {/* Badge */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Badge ⭐</h1>
        <BadgeCustomed />
        <Separator className="mt-16" />
      </section>

      {/* Breadcumb */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Breadcumb</h1>
        <BreadcumbCustomed
          indexList={["모집", "2025-1 정기공연", "공연팀 목록"]}
        />
        <Separator className="mt-16" />
      </section>

      {/* Button */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Button ⭐</h1>
        <BadgeCustomed />
        <Separator className="mt-16" />
      </section>

      {/* Calendar */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Calendar</h1>
        <Link href="/reservations/clubroom">
          <Button className="w-fit h-10">
            자원예약 페이지에서 확인해주세요
          </Button>
        </Link>

        <Separator className="mt-16" />
      </section>

      {/* Card */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Card</h1>
        <CardCustomed className="p-12">
          동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화
          삼천리 화려강산 대한사람 대한으로 길이 보전하세 ...
        </CardCustomed>
        <Separator className="mt-16" />
      </section>

      {/* Checkbox */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Checkbox</h1>
        <CheckboxCustomed label="Checkbox Label" />
        <Separator className="mt-16" />
      </section>

      {/* Dropdown */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Dropdown</h1>
        <span className="text-gray-500">
          이건 Input Area 컴포넌트의 Select랑 같은거 같아서 일단 보류해 놓을게용
        </span>
        <Separator className="mt-16" />
      </section>

      {/* Header */}
      <section className="w-full h-auto">
        <h1 className="text-xl font-semibold mb-16"># Header</h1>
        <HeaderCustomed
          heightClassName="h-[250px] md:h-[400px]"
          paddingTop="pt-[40px] md:pt-[80px]"
          title="Join Your Team"
          goBackHref="/test"
        />
        <Separator className="mt-16" />
      </section>

      {/* Input Area */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Input Area ⭐</h1>
        <Separator className="mt-16" />
      </section>

      {/* Media Uploader */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Media Uploader ⭐</h1>
        <Separator className="mt-16" />
      </section>

      {/* Modal */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Modal ⭐</h1>
        <Separator className="mt-16" />
      </section>

      {/* Navigation Bar */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Navigation Bar</h1>
        <span className="text-gray-500">
          네비게이션 바는 제가 컴포넌트화 하기에는 이미 잘 정리되어 있고, 재사용
          할 여지가 없어서 일단 보류하겠습니다.
        </span>
        <Separator className="mt-16" />
      </section>

      {/* Pagination */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Pagination</h1>
        <PaginationCustomed
          onPageChange={setPage}
          totalPages={totalPages}
          currentPage={page}
        />
        <Separator className="mt-16" />
      </section>

      {/* Scroll Bar */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Scroll Bar</h1>
        <span className="text-gray-500">
          이건 컴포넌트화 할 수가 없어서 바로 적용했습니다. 오른쪽 스크롤바를
          확인해주세요.
        </span>
        <Separator className="mt-16" />
      </section>

      {/* SearchBar */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># SearchBar</h1>
        <SearchBarCustomed />
        <Separator className="mt-16" />
      </section>

      {/* Tab */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Tab</h1>
        <p className="text-gray-600 leading-relaxed">
          Shadcn의 <code>Tabs</code> 컴포넌트는 단순히 탭 버튼만 있는 구조가
          아니라, 각 탭을 눌렀을 때 함께 렌더링되는 <code>TabsList</code>,{" "}
          <code>TabsTrigger</code>, <code>TabsContent</code>
          등의 요소가 모두 하나의 구조로 정의되어 있습니다. 따라서 이를 다시
          컴포넌트화하면 오히려 구조가 복잡해질 듯 합니다. 나중에 쓸 때, 디자인
          참고해서 className만 잘 고쳐주면 될 거 같습니다.
        </p>
        <Separator className="mt-16" />
      </section>

      {/* Table */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Table</h1>
        <p className="text-gray-600 leading-relaxed">
          Shadcn의 <code>Table</code> 컴포넌트는 <code>TableHeader</code>,{" "}
          <code>TableBody</code>,<code>TableRow</code>, <code>TableCell</code>{" "}
          등 여러 하위 요소들이 서로 구조적으로 밀접하게 연결되어 있습니다.
          따라서 단순히 헤더만 별도의 컴포넌트로 분리하는게 좀 힘들거
          같습니다...
        </p>
        <Separator className="mt-16" />
      </section>

      {/* Tooltip */}
      <section>
        <div className="mb-16">
          <h1 className="text-xl font-semibold mb-4"># Tooltip</h1>
          <span>세요 라는 말이 나오면 자동 줄바꿈 / 50자 이상이면 줄바꿈</span>
        </div>
        <TooltipCustomed
          message="곡명, 아티스트명을 정확히 입력해주세요
・커버곡의 경우 아래의 예시와 같이 작성해주세요
(예) 곡명: 화장을 고치고(Cover by 태연) / 아티스트명: 왁스"
        />
        <Separator className="mt-16" />
      </section>

      {/* Toast */}
      <section>
        <h1 className="text-xl font-semibold mb-16"># Toast</h1>
        <div className="flex flex-col gap-8">
          <ToastCustomed
            variant="success"
            title="축하합니다!"
            description="회원가입이 성공적으로 완료되었습니다"
          />

          <ToastCustomed
            variant="alert"
            title="회원가입을 완료할 수 없습니다"
            description="비밀번호 확인을 완료해주세요"
          />

          <ToastCustomed
            variant="alert"
            title="아이디 또는 비밀번호가 일치하지 않습니다"
            description="다시 한 번 시도해주세요"
          />
        </div>

        <Separator className="mt-16" />
      </section>
      <section>
        <h1 className="text-xl font-semibold mb-16"># Video</h1>
        <div className="flex flex-col gap-3">
          <VideoCustomed
            videoUrl="https://www.youtube.com/watch?v=NrWetMWq2fc&list=RDz3aS5AwhJSU&index=11"
            variant="sm"
          />
          <VideoCustomed
            videoUrl="https://www.youtube.com/watch?v=NrWetMWq2fc&list=RDz3aS5AwhJSU&index=11"
            variant="lg"
          />
        </div>
        <Separator className="mt-16" />
      </section>
    </div>
  )
}
