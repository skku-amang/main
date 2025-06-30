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
}

const TeamListTableFilter = ({
  className,
  header,
  filterValues
}: TeamListTableFilterProps) => {
  return (
    <div className={className}>
      <DesktopFilter
        className="hidden lg:block"
        header={header}
        filterValues={filterValues}
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
