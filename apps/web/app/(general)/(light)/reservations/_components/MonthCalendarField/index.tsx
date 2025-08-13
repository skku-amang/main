export default function MonthCalendarField() {
  const WeekLabelList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="w-full mt-7 flex bg-white">
      {WeekLabelList.map((WeekLabel, i) => (
        <div
          className="flex-1 flex justify-center h-10 bg-gray-100 text-black text-[13px] font-medium items-center "
          key={WeekLabelList[i]}
        >
          {WeekLabelList[i]}
        </div>
      ))}
    </div>
  )
}
