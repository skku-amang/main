import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface FilterValue {
  label: string
  // eslint-disable-next-line no-unused-vars
  onChecked: (value: boolean) => void
  checked?: boolean
}

interface TeamListTableFilterProps {
  header: string
  filterValues: FilterValue[]
}

const TeamListTableFilter = ({
  header,
  filterValues
}: TeamListTableFilterProps) => {
  return (
    <div>
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
  )
}

export default TeamListTableFilter
