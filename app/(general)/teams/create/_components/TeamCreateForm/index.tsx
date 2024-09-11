"use client"

import { useState } from "react"

import CustomCheckbox from "@/app/(general)/teams/create/_components/TeamCreateForm/CustomCheckbox"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Performance } from "@/types/Performance"

interface TeamCreateFormProps {
  initialData?: any
  performanceOptions: Performance[]
}

const TeamCreateForm = ({ performanceOptions }: TeamCreateFormProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const defaultPerformanceOption = performanceOptions[0]

  return (
    <>
      <div className="relative flex h-auto w-full flex-col items-center overflow-x-hidden">
        <div className="fixed h-64 w-screen bg-primary"></div>
        <div className="z-10 mt-24 flex flex-col items-center">
          <h1 className="pb-6 text-3xl font-medium text-white sm:text-5xl">
            Create New Team
          </h1>
          <div className="h-[0.1rem] w-[15rem] bg-white sm:h-[0.15rem] sm:w-[25rem]"></div>
        </div>
        <div
          className={`${currentPage === 2 ? "hidden h-0" : ""}
         z-10} relative mb-12 mt-10 h-[80rem] w-4/5 rounded-lg bg-gray-50 shadow-xl lg:h-[70rem]`}
        >
          <div className="flex h-[45%] flex-col items-center justify-center gap-11 border-b-[1px] border-b-zinc-200 sm:w-full lg:h-[43%]">
            <div className="flex flex-col items-center gap-2 sm:absolute sm:left-20 sm:top-20 sm:items-start">
              <div className="text-lg font-semibold text-slate-900">
                공연 및 곡 정보
              </div>
              <div className="group relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white">
                    !
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    입력 시 주의사항을 확인해주세요
                  </div>
                  <div className="absolute left-64 z-10 h-28 w-96 rounded-xl bg-zinc-800 p-2 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                    <div className="border-l-16 bg-gray h-0 w-0 rotate-90 transform border-b-8 border-t-8 border-b-transparent border-t-transparent bg-pink-400"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[70%] sm:absolute sm:left-20 sm:top-44">
              {" "}
              공연선택
              <Select>
                <SelectTrigger className="w-full sm:w-80 md:w-96 lg:w-72 xl:w-96">
                  <SelectValue placeholder={defaultPerformanceOption.name} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {performanceOptions.map((performance) => (
                      <SelectItem
                        key={performance.id}
                        value={performance.id.toString()}
                      >
                        {performance.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-[70%] gap-1.5 sm:absolute sm:left-20 sm:top-72">
              <Label htmlFor="songName">곡명</Label>
              <Input
                className="w-full sm:w-80 md:w-96 lg:w-72 xl:w-96"
                type="email"
                id="songName"
                placeholder="Input Text"
              />
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">신입고정곡입니다.</Label>
              </div>
            </div>
            <div className="grid w-[70%] gap-1.5 sm:absolute sm:left-20 sm:top-[26rem] lg:left-[50%] lg:top-72">
              <Label htmlFor="songName">아티스트명</Label>
              <Input
                className="w-full sm:w-80 md:w-96 lg:w-72 xl:w-96"
                type="email"
                id="songName"
                placeholder="Input Text"
              />
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">자작곡입니다.</Label>
              </div>
            </div>
          </div>

          <div className="bottom-0 flex h-[55%] flex-col items-center justify-center sm:absolute sm:w-full lg:h-[57%]">
            <div className="flex h-full w-full flex-col pl-[4.8rem] pt-[4rem]">
              <div className="flex w-full flex-col items-center gap-2 pb-10 sm:left-20 sm:top-20 sm:items-start">
                <div className="text-lg font-semibold text-slate-900">
                  세션 정보
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white">
                    !
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    곡에 필요한 모든 세션을 체크해주세요
                  </div>
                </div>
              </div>
              <div className="h-full w-[68%] ">
                <div className="grid grid-cols-4 gap-8">
                  <div className="">보컬</div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">보컬1</div>
                  </div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">보컬2</div>
                  </div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">보컬3</div>
                  </div>
                  <div className="">기타</div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">기타1</div>
                  </div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">기타2</div>
                  </div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">기타3</div>
                  </div>
                  <div className="">베이스 및 드럼</div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">베이스1</div>
                  </div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">베이스2</div>
                  </div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">드럼</div>
                  </div>
                  <div className="">신디</div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">신디1</div>
                  </div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">신디2</div>
                  </div>
                  <div></div>
                  <div className="">그 외</div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">현악기</div>
                  </div>
                  <div className="flex items-center">
                    <CustomCheckbox />
                    <div className="pl-3">관악기</div>
                  </div>
                </div>
              </div>
            </div>
            <Pagination className="pb-9">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem onClick={() => setCurrentPage(2)}>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem onClick={() => setCurrentPage(2)}>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <div
          className={`${currentPage === 1 ? "hidden h-0" : ""}
         z-10} relative mb-12 mt-10 flex h-[80rem] w-4/5 flex-col items-center rounded-lg bg-gray-50 shadow-xl lg:h-[70rem]`}
        >
          <div className="flex h-[43%] w-full justify-center border-b-[1px] border-b-zinc-200 pt-[4.5rem]">
            <div className="w-[83%]">
              <div className="flex flex-col items-start gap-2">
                <div className="text-lg font-semibold text-slate-900">
                  팀원 정보
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white">
                    !
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    이미 멤버가 확정된 세션의 경우, 해당 세션에 체크표시 후
                    멤버를 선택해주세요.
                    <br />
                    멤버모집이 필요한 세션의 경우, 체크표시가 되어 있지 않아야
                    합니다
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-[57%] w-full flex-col items-center justify-center">
            <div className="h-[89%] w-[100%]">
              <div className="flex h-[90%] w-[100%] flex-col items-center justify-start gap-9 pt-12">
                <div className="flex w-[83%] justify-start">
                  <div className="flex flex-col items-start gap-2">
                    <div className="text-lg font-semibold text-slate-900">
                      게시글 작성
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white">
                        !
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        자유롭게 팀을 홍보해 주세요
                      </div>
                    </div>
                  </div>
                </div>
                <Textarea
                  className="h-48 w-[83%]"
                  placeholder="Type your message here"
                />
                <div className="flex w-[83%] justify-start">
                  <div className="flex gap-2">
                    <div className="flex h-7 w-28 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-neutral-600">
                      유튜브 링크
                      <div className="relative h-[1.7px] w-3 rounded-lg bg-blue-600">
                        <div className="absolute left-[5.06px] top-[-4.8px] h-[12.6px] w-[1.9px] rounded-lg bg-blue-600" />
                      </div>
                    </div>
                    <div className="flex h-7 w-28 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-neutral-600">
                      이미지 첨부
                      <div className="relative h-[1.7px] w-3 rounded-lg bg-blue-600">
                        <div className="absolute left-[5.06px] top-[-4.8px] h-[12.6px] w-[1.9px] rounded-lg bg-blue-600" />
                      </div>
                    </div>
                    <div className="flex h-7 w-28 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-neutral-600">
                      영상 첨부
                      <div className="relative h-[1.7px] w-3 rounded-lg bg-blue-600">
                        <div className="absolute left-[5.06px] top-[-4.8px] h-[12.6px] w-[1.9px] rounded-lg bg-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Pagination className="pb-9">
                <PaginationContent>
                  <PaginationItem onClick={() => setCurrentPage(1)}>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem onClick={() => setCurrentPage(1)}>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TeamCreateForm
