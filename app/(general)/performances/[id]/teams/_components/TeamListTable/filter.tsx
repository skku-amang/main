import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface FilterValue {
  label: string
  // eslint-disable-next-line no-unused-vars
  onChecked: (value: boolean) => void
  checked?: boolean
}

interface TeamListTableFilterProps {
  className?: string
  header: string
  filterValues: FilterValue[]
}

const TeamListTableFilter = ({
  className,
  header,
  filterValues
}: TeamListTableFilterProps) => {
  return (
    <div className={className}>
      {/* 데스크톱 */}
      <div className="hidden lg:block">
        <div className="mb-5 font-bold text-primary">{header}</div>

        <div className="space-y-4">
          {filterValues.map((v) => (
            <div
              key={v.label}
              className="flex items-center justify-start gap-x-2"
            >
              <Checkbox
                id={`filter-${v.label}`}
                name={v.label}
                value={v.label}
                className="h-5 w-5"
                checked={v.checked}
                onCheckedChange={(checked) => v.onChecked(!!checked)}
              />
              <Label htmlFor={`filter-${v.label}`}>{v.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* 모바일 */}
      <div className="lg:hidden">
        <div className="flex items-center gap-x-3 mb-4 text-xs">
          <div className="text-neutral-500 font-semibold">{header}</div>
          {/* <button className="text-third">전체 선택</button> */}
        </div>

        <div className="grid grid-cols-4 gap-y-4 gap-x-5">
          {filterValues.map((v) => (
            <div
              key={v.label}
              className="flex items-center justify-start gap-x-3"
            >
              <Checkbox
                id={`filter-${v.label}`}
                name={v.label}
                value={v.label}
                className="h-3 w-3"
                checked={v.checked}
                onCheckedChange={(checked) => v.onChecked(!!checked)}
              />
              <Label htmlFor={`filter-${v.label}`} className="text-slate-600 text-xs">{v.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamListTableFilter
