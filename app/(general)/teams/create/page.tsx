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
            <div className="flex flex-col items-center sm:items-start sm:absolute sm:left-20 sm:top-20">
              <div className="font-semibold text-lg">공연 및 곡 정보</div>
              <div className="font-medium text-base">입력 시 주의사항을 확인해주세요</div>
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
              <div className="flex flex-col items-center w-full sm:items-start sm:left-20 sm:top-20 pb-10">
                <div className="font-semibold text-lg">세션 정보</div>
                <div className="font-medium text-base">곡의 필요한 모든 세션을 체크해주세요</div>
              </div>
              <div className="w-full flex gap-20 pb-5">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium pr-[13rem]">보컬</h5>
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    보컬1
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    보컬1
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    보컬1
                  </label>
                </div>
              </div>
              <div className="w-full flex gap-20 pb-5">
                
                
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium pr-[13rem] ">기타</h5>
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    기타1
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    기타2
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    기타3
                  </label>
                </div>
              </div>
              <div className="w-full flex gap-[4.1rem] pb-5">
                
                
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium pr-[8.5rem]">베이스 및 드럼</h5>
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    베이스1
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    베이스2
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    드럼
                  </label>
                </div>
              </div>

              <div className="w-full flex gap-20 pb-5">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium pr-[13rem]">신디</h5>
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    신디1
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    신디2
                  </label>
                </div>
              </div>
              <div className="w-full flex gap-[4.5rem] pb-5">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium pr-[12.8rem]">그 외</h5>
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    현악기
                  </label>
                </div>
                <Input className="w-24 pl-52" type="email" id="songName" placeholder="악기명" />
              </div>
              <div className="flex items-center pl-[15.5rem]">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm pl-2 pr-[4.5rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    관악기
                  </label>
                  <Input className="w-24 pl-52" type="email" id="songName" placeholder="악기명"/>
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
            <div className="w-full h-[43%] border-b-[1px] border-b-zinc-200"></div>
            <div className="flex flex-col items-center w-full h-[57%]">
              <div className="w-[90%] h-[89%] bg-gray-100">
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