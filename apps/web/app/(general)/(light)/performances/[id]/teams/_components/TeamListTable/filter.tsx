import DesktopFilter from "@/app/(general)/(light)/performances/[id]/teams/_components/TeamListTable/Filter/Desktop"
import MobileFilter from "@/app/(general)/(light)/performances/[id]/teams/_components/TeamListTable/Filter/Mobile"

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
  onSelectAll?: () => void
}

const TeamListTableFilter = ({
  className,
  header,
  filterValues,
  onSelectAll
}: TeamListTableFilterProps) => {
  return (
    <div className={className}>
      <DesktopFilter
        className="hidden lg:block"
        header={header}
        filterValues={filterValues}
        onSelectAll={onSelectAll}
      />
      <MobileFilter
        className="lg:hidden"
        header={header}
        filterValues={filterValues}
      />
    </div>
  )
}

export default TeamListTableFilter
