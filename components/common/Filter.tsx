import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '../../lib/utils';

// 타입 정의
type FilterLabel = {
  id: number;
  label: string;
}; 

export type FilterLabelArray = FilterLabel[];

{/* 일단 제목 필터 기준이 보이는 부분 (ex. 세션, 모집상태 등) */}
export const FilterHeader = ({ header, className }: { header?: string; className?: string }) => {
  return (
    <div className={`absolute left-9 top-5 font-semibold text-blue-950 text-lg ${className}`}>
      {header}
    </div>
  );
};

{/* 체크박스를 감싸는 네모 박스를 정의하는 부분 */}
export const FilterCheckBoxContainer = ({ id, label }: { id: number; label: string }) => {
  return (
    <div className='flex gap-2 items-center font-medium w-full h-[2.6rem]'>
      <Checkbox />
      <label>{label}</label>
    </div>
  );
};

{/* 정의된 체크박스를 생성하는 컴포넌트 prop으로 filterlabel_array 형식을 입력해줘야 함*/}
export const FilterCheckBoxContainerGeneration = ({ filterlabel_array }: { filterlabel_array: FilterLabelArray }) => {
  return (
    <div className='grid grid-rows-6 grid-flow-col' >
      { filterlabel_array.map((filterLabel) => (
        <FilterCheckBoxContainer key={filterLabel.id} id={filterLabel.id} label={filterLabel.label} />
      ))}
    </div>
  );
};

{/* 위에서 정의한 GENERATOR를 바탕으로 필터에서 보이는 한 줄을 정의함 (한 줄에 6개의 CHECKBOX가 들어감) */}
const FilterSection = ({Filter_obj, header, className}: {Filter_obj: FilterLabelArray, header?: string, className?: string}) => {
  return (
    <div className = "relative w-full h-full">
        <div>
            <FilterHeader header={header}/>
        </div>
        <div className="absolute h-full w-full justify-center left-9 top-16">
            <FilterCheckBoxContainerGeneration filterlabel_array={Filter_obj}/>
        </div>
    </div>
  );
};

export default FilterSection;
{/*
    사용법 예시 FilterLabelArray 타입의 배열을 Filter_obj으로 입력하고, 분류 기준이 되는 header를 입력하면 완성
    외각의 div로 틀을 짜주긴 해야 함

    <div className='flex absolute rounded-sm right-0 top-11 w-[30rem] h-[21rem] shadow-xl z-50 bg-white'>
        <FilterSection header="세션" Filter_obj={Example_Filter_array}/>
        <FilterSection header="모집상태" Filter_obj={Example_Filter_array2}/>
    </div>
*/}



