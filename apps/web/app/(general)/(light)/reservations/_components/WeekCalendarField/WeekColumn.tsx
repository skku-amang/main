export default function WeekColumn() {
  return (
    <div className="w-[14.28%] border-x-[1.5px] border-gray-100">
      <div className="w-full bg-gray-50 h-[42px] border-t-[1.5px] border-gray-100 text-xs text-black font-medium flex justify-center items-center">
        Sun 6
      </div>
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="h-[42px] border-t-[1.5px] last:border-b-[1.5px] border-gray-100"
        ></div>
      ))}
    </div>
  )
}
