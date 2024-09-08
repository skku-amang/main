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


const TeamCreate = () => {
  return (
    <>

      <div className="relative flex flex-col items-center w-full h-auto overflow-x-hidden">
        <div className="fixed w-screen h-64 bg-primary">
        </div>
        <div className="flex flex-col items-center mt-24 z-10">
          <h1 className="font-medium text-3xl sm:text-5xl text-white pb-6">Create New Team</h1>
          <div className="w-[15rem] h-[0.1rem] sm:w-[25rem] sm:h-[0.15rem] bg-white"></div>
        </div>
        <div className="relative w-4/5 h-[80rem] lg:h-[70rem] shadow-xl rounded-lg mt-10 mb-12 bg-gray-50 z-10">
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

        </div>
     </div>
    </>

  ) 
}

export default TeamCreate