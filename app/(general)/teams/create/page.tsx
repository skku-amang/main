"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState } from "react"
import { CheckboxCustom } from "@/components/ui/checkbox-custom"
import { Textarea } from "@/components/ui/textarea"

const TeamCreate = () => {

  const [currentPage, setCurrentPage] = useState(1);

  return (
    <>
      <div className="relative flex flex-col items-center w-full h-auto overflow-x-hidden">
        <div className="fixed w-screen h-64 bg-primary">
        </div>
        <div className="flex flex-col items-center mt-24 z-10">
          <h1 className="font-medium text-3xl sm:text-5xl text-white pb-6">Create New Team</h1>
          <div className="w-[15rem] h-[0.1rem] sm:w-[25rem] sm:h-[0.15rem] bg-white"></div>
        </div>
        <div className={`${currentPage === 2 ? "h-0 hidden" : ""}
         relative w-4/5 h-[80rem] lg:h-[70rem] shadow-xl rounded-lg mt-10 mb-12 bg-gray-50 z-10}`}
         >
          <div className="flex flex-col justify-center items-center gap-11 sm:w-full h-[45%] lg:h-[43%] border-b-zinc-200 border-b-[1px]">
            <div className="flex flex-col gap-2 items-center sm:items-start sm:absolute sm:left-20 sm:top-20">
              <div className="font-semibold text-lg text-slate-900">공연 및 곡 정보</div>
                <div className="relative group">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex justify-center items-center rounded-full bg-gray-600 text-white">
                    !
                    </div>
                  <div className="font-medium text-sm text-gray-500">입력 시 주의사항을 확인해주세요</div>
                  <div className="w-96 h-28 rounded-xl bg-zinc-800 absolute z-10 left-64 opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-2 shadow-lg">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-16 bg-gray transform rotate-90 bg-pink-400"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[70%] sm:absolute sm:left-20 sm:top-44"> 공연선택
              <Select>
                <SelectTrigger className="w-full sm:w-80 md:w-96 lg:w-72 xl:w-96">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select</SelectLabel>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[70%] sm:absolute sm:left-20 sm:top-72 grid gap-1.5">
             <Label htmlFor="songName">곡명</Label>
             <Input className="w-full sm:w-80 md:w-96 lg:w-72 xl:w-96" type="email" id="songName" placeholder="Input Text" />
             <div className="flex pt-2 items-center space-x-2">
               <Checkbox id="terms" />
               <Label htmlFor="terms">신입고정곡입니다.</Label>
              </div>
            </div>
            <div className="w-[70%] sm:absolute sm:left-20 sm:top-[26rem] lg:left-[50%] lg:top-72 grid gap-1.5">
             <Label htmlFor="songName">아티스트명</Label>
             <Input className="w-full sm:w-80 md:w-96 lg:w-72 xl:w-96" type="email" id="songName" placeholder="Input Text" />
             <div className="flex pt-2 items-center space-x-2">
               <Checkbox id="terms" />
               <Label htmlFor="terms">자작곡입니다.</Label>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col bottom-0 justify-center items-center sm:absolute sm:w-full h-[55%] lg:h-[57%]">
            <div className="w-full h-full flex flex-col pl-[4.8rem] pt-[4rem]">
              <div className="flex flex-col gap-2 items-center w-full sm:items-start sm:left-20 sm:top-20 pb-10">
                <div className="font-semibold text-lg text-slate-900">세션 정보</div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex justify-center items-center rounded-full bg-gray-600 text-white">
                    !
                    </div>
                  <div className="font-medium text-sm text-gray-500">곡에 필요한 모든 세션을 체크해주세요</div>
                </div>
              </div>
              <div className="w-[68%] h-full ">
                <div className="grid grid-cols-4 gap-8">
                  <div className="">보컬</div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">보컬1</div>
                  </div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">보컬2</div>
                  </div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">보컬3</div>
                  </div>
                  <div className="">기타</div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">기타1</div>
                  </div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">기타2</div>
                  </div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">기타3</div>
                  </div>
                  <div className="">베이스 및 드럼</div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">베이스1</div>
                  </div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">베이스2</div>
                  </div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">드럼</div>
                  </div>
                  <div className="">신디</div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">신디1</div>
                  </div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">신디2</div>
                  </div>
                  <div>
                  </div>
                  <div className="">그 외</div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">현악기</div>
                  </div>
                  <div className="flex items-center">
                    <CheckboxCustom />
                    <div className="pl-3">관악기</div>
                  </div>
                </div>
              </div>
              
              </div>
              <Pagination className="pb-9">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious/>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem onClick={() => setCurrentPage(2)}>
                    <PaginationLink href="#">
                      2
                    </PaginationLink>
                  </PaginationItem >
                  <PaginationItem onClick={() => setCurrentPage(2)}>
                    <PaginationNext href="#"/>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

        <div className={`${currentPage=== 1 ? "h-0 hidden" : ""}
         flex flex-col items-center relative w-4/5 h-[80rem] lg:h-[70rem] shadow-xl rounded-lg mt-10 mb-12 bg-gray-50 z-10}`}
         >
            <div className="flex justify-center w-full h-[43%] border-b-[1px] border-b-zinc-200 pt-[4.5rem]">
              <div className="w-[83%]">
                <div className="flex flex-col gap-2 items-start">
                  <div className="font-semibold text-lg text-slate-900">팀원 정보</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex justify-center items-center rounded-full bg-gray-600 text-white">
                      !
                      </div>
                    <div className="font-medium text-sm text-gray-500">이미 멤버가 확정된 세션의 경우, 해당 세션에 체크표시 
                    후 멤버를 선택해주세요.<br/>멤버모집이 필요한 세션의 경우, 체크표시가 되어 있지 않아야 합니다</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-full h-[57%]">
              <div className="w-[100%] h-[89%]">
                <div className="flex flex-col items-center gap-9 justify-start w-[100%] h-[90%] pt-12">
                  <div className="flex w-[83%] justify-start">
                    <div className="flex flex-col gap-2 items-start">
                      <div className="font-semibold text-lg text-slate-900">게시글 작성</div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 flex justify-center items-center rounded-full bg-gray-600 text-white">
                          !
                        </div>
                        <div className="font-medium text-sm text-gray-500">자유롭게 팀을 홍보해 주세요</div>
                      </div>
                    </div>
                  </div>
                  <Textarea className="w-[83%] h-48" placeholder="Type your message here"/>
                    <div className="flex w-[83%] justify-start">
                      <div className="flex gap-2">
                        <div className="flex justify-center items-center gap-2 w-28 h-7 bg-slate-100 text-base font-extrabold text-neutral-600 rounded-2xl">
                          유튜브 링크 
                          <div className="relative w-3 h-[1.7px] rounded-lg bg-blue-600">
                            <div className="absolute left-[5.06px] w-[1.9px] top-[-4.8px] h-[12.6px] rounded-lg bg-blue-600"/>
                          </div>
                        </div>
                        <div className="flex justify-center items-center gap-2 w-28 h-7 bg-slate-100 text-base font-extrabold text-neutral-600 rounded-2xl">
                          이미지 첨부 
                          <div className="relative w-3 h-[1.7px] rounded-lg bg-blue-600">
                            <div className="absolute left-[5.06px] w-[1.9px] top-[-4.8px] h-[12.6px] rounded-lg bg-blue-600"/>
                          </div>
                        </div>
                        <div className="flex justify-center items-center gap-2 w-28 h-7 bg-slate-100 text-base font-extrabold text-neutral-600 rounded-2xl">
                          영상 첨부
                          <div className="relative w-3 h-[1.7px] rounded-lg bg-blue-600">
                            <div className="absolute left-[5.06px] w-[1.9px] top-[-4.8px] h-[12.6px] rounded-lg bg-blue-600"/>
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
                        <PaginationPrevious href="#"/>
                      </PaginationItem>
                      <PaginationItem onClick={() => setCurrentPage(1)}>
                        <PaginationLink href="#">
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">
                          2
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href=""/>
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

export default TeamCreate