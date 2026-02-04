# DOC-012: 컴포넌트 라이브러리 명세서

> AI 재구성을 위한 상세 명세

---

## 1. 개요

AMANG 프로젝트는 **shadcn/ui**를 기반으로 한 컴포넌트 라이브러리를 사용합니다. shadcn/ui 컴포넌트를 커스터마이징하고, 도메인 특화 컴포넌트를 추가로 구현합니다.

---

## 2. 기반 라이브러리

### 2.1 주요 의존성

| 라이브러리                 | 버전  | 용도                    |
| -------------------------- | ----- | ----------------------- |
| `@radix-ui/*`              | 1.x   | 접근성 기반 headless UI |
| `class-variance-authority` | 0.7.x | 컴포넌트 variant 관리   |
| `tailwind-merge`           | 2.x   | Tailwind 클래스 병합    |
| `lucide-react`             | 0.x   | 아이콘 라이브러리       |
| `react-icons`              | 5.x   | 추가 아이콘             |
| `@tanstack/react-table`    | 8.x   | 데이터 테이블           |

### 2.2 유틸리티 함수

**파일 경로**: `apps/web/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 3. 컴포넌트 디렉토리 구조

```
apps/web/components/
├── ui/                       # shadcn/ui 기반 컴포넌트
│   ├── button.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   ├── form.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── label.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── avatar.tsx
│   ├── calendar.tsx
│   ├── command.tsx
│   ├── datetimePicker.tsx
│   ├── hover-card.tsx
│   ├── pagination.tsx
│   ├── popover.tsx
│   └── switch.tsx
├── TeamBadges/               # 도메인 특화 Badge 컴포넌트
│   ├── SessionBadge.tsx
│   ├── StatusBadge.tsx
│   ├── FreshmenFixedBadge.tsx
│   ├── SelfMadeSongBadge.tsx
│   └── BasicTeamBadge.tsx
├── Form/                     # 폼 필드 래퍼 컴포넌트
│   ├── SimpleStringField.tsx
│   ├── SimpleDateField.tsx
│   ├── SimpleImageField.tsx
│   ├── SimpleLabel.tsx
│   └── SimpleDescription.tsx
├── DataTable/                # TanStack Table 래퍼
│   ├── index.tsx
│   ├── ColumnHeader.tsx
│   ├── Pagination.tsx
│   ├── ViewOptions.tsx
│   └── Columns/
│       └── RowSelect.tsx
├── PageHeaders/              # 페이지 헤더 컴포넌트
│   ├── Default/
│   │   ├── index.tsx
│   │   └── BreadCrumb.tsx
│   └── OleoPageHeader.tsx
├── Header/                   # 앱 헤더
│   ├── index.tsx
│   └── _component/
│       ├── Profile.tsx
│       ├── MobileBackButton.tsx
│       └── Sidebar/
├── Footer.tsx
├── Search.tsx
├── Filter.tsx
├── NavLink.tsx
├── ImageLoader.tsx
├── DescribeToJSX.tsx
├── RootHeaderAndFooterWrapper.tsx
├── PageHeader.tsx
└── TeamDeleteButton.tsx
```

---

## 4. shadcn/ui 컴포넌트

### 4.1 Button

**파일 경로**: `apps/web/components/ui/button.tsx`

```typescript
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Button Variants

| Variant       | 설명               | 스타일                   |
| ------------- | ------------------ | ------------------------ |
| `default`     | 기본 버튼          | 네이비 배경, 흰색 텍스트 |
| `destructive` | 삭제/위험 액션     | 빨간 배경                |
| `outline`     | 테두리만 있는 버튼 | 테두리, 투명 배경        |
| `secondary`   | 보조 버튼          | 회색 배경                |
| `ghost`       | 배경 없는 버튼     | hover 시만 배경          |
| `link`        | 링크 스타일        | 밑줄 텍스트              |

#### Button Sizes

| Size      | 높이      | 패딩      |
| --------- | --------- | --------- |
| `default` | h-10      | px-4 py-2 |
| `sm`      | h-9       | px-3      |
| `lg`      | h-11      | px-8      |
| `icon`    | h-10 w-10 | -         |

#### 사용 예시

```typescript
// 기본 버튼
<Button>저장</Button>

// Variant와 Size
<Button variant="destructive" size="sm">삭제</Button>

// Link로 사용 (asChild)
<Button asChild>
  <Link href="/create">생성하기</Link>
</Button>

// 로딩 상태
<Button disabled={isPending}>
  {isPending ? "처리 중..." : "제출"}
</Button>
```

### 4.2 Badge

**파일 경로**: `apps/web/components/ui/badge.tsx`

```typescript
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### 4.3 Input

**파일 경로**: `apps/web/components/ui/input.tsx`

```typescript
import * as React from "react"

import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:shadow-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

### 4.4 Form 컴포넌트

**파일 경로**: `apps/web/components/ui/form.tsx`

react-hook-form과 통합된 폼 컴포넌트입니다.

```typescript
// 주요 export
export {
  Form, // FormProvider (react-hook-form)
  FormControl, // 폼 입력 래퍼 (aria 속성 자동 설정)
  FormDescription, // 필드 설명
  FormField, // Controller 래퍼
  FormItem, // 필드 컨테이너
  FormLabel, // 레이블 (에러 시 빨간색)
  FormMessage, // 에러 메시지
  useFormField, // 폼 필드 상태 접근
};
```

#### 사용 예시

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="이름을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">저장</Button>
      </form>
    </Form>
  )
}
```

---

## 5. 도메인 특화 Badge 컴포넌트

### 5.1 SessionBadge

악기 세션을 표시하는 배지입니다.

**파일 경로**: `apps/web/components/TeamBadges/SessionBadge.tsx`

```typescript
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SessionBadgeProps {
  session: string   // 예: "기타1", "보컬2"
  className?: string
}

const SessionBadge = ({ session, className }: SessionBadgeProps) => {
  return (
    <Badge
      className={cn(
        "h-5 rounded bg-slate-200 hover:bg-slate-200 text-xs font-normal text-neutral-600 text-nowrap px-2 select-none",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
```

### 5.2 StatusBadge

활성/비활성 상태를 표시하는 배지입니다.

**파일 경로**: `apps/web/components/TeamBadges/StatusBadge.tsx`

```typescript
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "Inactive" | "Active"
  className?: string
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "Inactive"
          ? "bg-red-100 text-destructive"
          : "bg-green-100 text-green-600",
        "text-md rounded-full border-none px-4 py-0.5 lg:py-1 font-semibold",
        className
      )}
    >
      <span className="me-2 text-[0.5rem]">●</span>
      {status}
    </Badge>
  )
}

export default StatusBadge
```

### 5.3 기타 Team Badge

| 컴포넌트             | 파일                                | 용도               |
| -------------------- | ----------------------------------- | ------------------ |
| `FreshmenFixedBadge` | `TeamBadges/FreshmenFixedBadge.tsx` | 새내기 고정팀 표시 |
| `SelfMadeSongBadge`  | `TeamBadges/SelfMadeSongBadge.tsx`  | 자작곡 표시        |
| `BasicTeamBadge`     | `TeamBadges/BasicTeamBadge.tsx`     | 기본 팀 배지       |

---

## 6. 폼 필드 컴포넌트

### 6.1 SimpleStringField

**파일 경로**: `apps/web/components/Form/SimpleStringField.tsx`

```typescript
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import SimpleDescription from "./SimpleDescription"
import SimpleLabel from "./SimpleLabel"

interface Prop {
  form: any
  name: string
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  inputType?: "text" | "password" | "email" | "number" | "url" | "tel" | "date"
}

const SimpleStringField = ({
  form,
  name,
  label,
  placeholder,
  description,
  required,
  inputType
}: Prop) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field: { value, ...fieldProps } }) => (
      <FormItem>
        <SimpleLabel required={required}>{label}</SimpleLabel>

        <FormControl>
          <Input
            placeholder={placeholder}
            {...fieldProps}
            style={{ marginTop: "0.2rem" }}
            type={inputType}
            className="border-slate-300 shadow-sm"
          />
        </FormControl>

        <SimpleDescription>{description}</SimpleDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default SimpleStringField
```

### 6.2 기타 폼 컴포넌트

| 컴포넌트            | 파일                         | 용도                 |
| ------------------- | ---------------------------- | -------------------- |
| `SimpleDateField`   | `Form/SimpleDateField.tsx`   | 날짜/시간 선택       |
| `SimpleImageField`  | `Form/SimpleImageField.tsx`  | 이미지 업로드        |
| `SimpleLabel`       | `Form/SimpleLabel.tsx`       | 필수(\*) 표시 레이블 |
| `SimpleDescription` | `Form/SimpleDescription.tsx` | 필드 설명 텍스트     |

---

## 7. Search 컴포넌트

**파일 경로**: `apps/web/components/Search.tsx`

```typescript
import { SearchIcon } from "lucide-react"
import React from "react"

import { cn } from "@/lib/utils"

const Search = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex h-10 w-80 items-center gap-x-2.5 rounded-lg border border-gray-200 bg-white px-[13px] py-2 text-sm ring-offset-background drop-shadow-[0_1px_2px_rgb(64,63,84,0.1)] transition duration-300 focus-within:ring-0 focus-within:ring-offset-0 focus-within:drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <SearchIcon size={24} className="text-gray-500" strokeWidth={1.25} />
      <input
        {...props}
        placeholder="검색"
        type="search"
        ref={ref}
        className="w-full placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{ caretColor: "#111827" }}
      />
    </div>
  )
})

Search.displayName = "Search"

export default Search
```

---

## 8. DataTable 컴포넌트

### 8.1 메인 DataTable

**파일 경로**: `apps/web/components/DataTable/index.tsx`

TanStack Table을 래핑한 데이터 테이블입니다.

```typescript
"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from "@tanstack/react-table"
import React from "react"

import { DataTablePagination } from "@/components/DataTable/Pagination"
import { DataTableViewOptions } from "@/components/DataTable/ViewOptions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection
    }
  })

  return (
    <div className="rounded-md border-none">
      <DataTableViewOptions table={table} />

      <Table className="my-5">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination table={table} />
    </div>
  )
}
```

### 8.2 DataTable 사용 예시

```typescript
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/DataTable"

// 컬럼 정의
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "이름"
  },
  {
    accessorKey: "email",
    header: "이메일"
  },
  {
    accessorKey: "createdAt",
    header: "가입일",
    cell: ({ row }) => formatDate(row.getValue("createdAt"))
  }
]

// 사용
const UserList = () => {
  const { data: users } = useUsers()

  return <DataTable columns={columns} data={users ?? []} />
}
```

---

## 9. 페이지 헤더 컴포넌트

### 9.1 DefaultPageHeader

목록 페이지용 헤더 (제목 + Breadcrumb)

```typescript
import DefaultPageHeader, { DefaultHomeIcon } from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"

<DefaultPageHeader
  title="공연 목록"
  routes={[
    { display: <DefaultHomeIcon />, href: ROUTES.HOME },
    { display: "아카이브" },
    { display: "공연 목록", href: ROUTES.PERFORMANCE.LIST }
  ]}
/>
```

### 9.2 OleoPageHeader

상세 페이지용 헤더 (특수 폰트 + 뒤로가기)

```typescript
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import ROUTES from "@/constants/routes"

<OleoPageHeader
  title="Join Your Team"
  goBackHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
  className="relative mb-10"
/>
```

---

## 10. 아이콘 사용

### 10.1 lucide-react (기본)

```typescript
import { Home, Search, ChevronLeft, Plus, Trash2 } from "lucide-react"

<Home size={20} strokeWidth={1.67} />
<SearchIcon size={24} className="text-gray-500" strokeWidth={1.25} />
```

### 10.2 react-icons (추가)

```typescript
import { CiCirclePlus } from "react-icons/ci"

<CiCirclePlus size={20} />
```

---

## 11. 컴포넌트 패턴

### 11.1 forwardRef 패턴

```typescript
const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("base-styles", className)}
        {...props}
      />
    )
  }
)
MyComponent.displayName = "MyComponent"
```

### 11.2 CVA Variants 패턴

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        secondary: "secondary-classes"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

const Component = ({ className, variant, size, ...props }: ComponentProps) => {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### 11.3 cn() 유틸리티 사용

```typescript
// 기본 사용
className={cn("base-class", className)}

// 조건부 클래스
className={cn(
  "base-class",
  condition && "conditional-class",
  className
)}

// 객체 조건
className={cn(
  "base-class",
  {
    "active-class": isActive,
    "disabled-class": isDisabled
  },
  className
)}
```

---

## 12. shadcn/ui 컴포넌트 전체 목록

| 컴포넌트       | 파일                    | Radix 의존성                                    |
| -------------- | ----------------------- | ----------------------------------------------- |
| Button         | `ui/button.tsx`         | `@radix-ui/react-slot`                          |
| Badge          | `ui/badge.tsx`          | -                                               |
| Input          | `ui/input.tsx`          | -                                               |
| Textarea       | `ui/textarea.tsx`       | -                                               |
| Label          | `ui/label.tsx`          | `@radix-ui/react-label`                         |
| Form           | `ui/form.tsx`           | `@radix-ui/react-label`, `@radix-ui/react-slot` |
| Checkbox       | `ui/checkbox.tsx`       | `@radix-ui/react-checkbox`                      |
| Switch         | `ui/switch.tsx`         | `@radix-ui/react-switch`                        |
| Select         | `ui/select.tsx`         | `@radix-ui/react-select`                        |
| Dialog         | `ui/dialog.tsx`         | `@radix-ui/react-dialog`                        |
| Sheet          | `ui/sheet.tsx`          | `@radix-ui/react-dialog`                        |
| Dropdown Menu  | `ui/dropdown-menu.tsx`  | `@radix-ui/react-dropdown-menu`                 |
| Popover        | `ui/popover.tsx`        | `@radix-ui/react-popover`                       |
| Hover Card     | `ui/hover-card.tsx`     | `@radix-ui/react-hover-card`                    |
| Tabs           | `ui/tabs.tsx`           | `@radix-ui/react-tabs`                          |
| Card           | `ui/card.tsx`           | -                                               |
| Table          | `ui/table.tsx`          | -                                               |
| Separator      | `ui/separator.tsx`      | `@radix-ui/react-separator`                     |
| Avatar         | `ui/avatar.tsx`         | `@radix-ui/react-avatar`                        |
| Calendar       | `ui/calendar.tsx`       | `react-day-picker`                              |
| DateTimePicker | `ui/datetimePicker.tsx` | `react-day-picker`                              |
| Command        | `ui/command.tsx`        | `cmdk`                                          |
| Pagination     | `ui/pagination.tsx`     | -                                               |
| Toast          | `ui/toast.tsx`          | `@radix-ui/react-toast`                         |
| Toaster        | `ui/toaster.tsx`        | -                                               |

---

## 13. AI 구현 체크리스트

### 13.1 새 컴포넌트 생성 시

- [ ] `apps/web/components/` 적절한 위치에 파일 생성
- [ ] `forwardRef` 패턴 적용 (DOM 접근 필요 시)
- [ ] `cn()` 유틸리티로 className 병합
- [ ] TypeScript Props 인터페이스 정의
- [ ] `displayName` 설정

### 13.2 shadcn/ui 컴포넌트 추가 시

- [ ] `npx shadcn-ui@latest add [component]` 실행
- [ ] `apps/web/components/ui/` 에 생성됨
- [ ] 필요시 커스터마이징

### 13.3 Variant 컴포넌트 생성 시

- [ ] `class-variance-authority` 사용
- [ ] `variants`와 `defaultVariants` 정의
- [ ] `VariantProps` 타입 확장

### 13.4 폼 필드 생성 시

- [ ] `FormField`, `FormItem`, `FormControl` 구조 사용
- [ ] `SimpleLabel`, `SimpleDescription` 활용
- [ ] `FormMessage`로 에러 표시

---

## 14. 관련 파일 목록

| 파일 경로                          | 역할               |
| ---------------------------------- | ------------------ |
| `apps/web/components/ui/`          | shadcn/ui 컴포넌트 |
| `apps/web/components/TeamBadges/`  | 도메인 Badge       |
| `apps/web/components/Form/`        | 폼 필드 래퍼       |
| `apps/web/components/DataTable/`   | 데이터 테이블      |
| `apps/web/components/PageHeaders/` | 페이지 헤더        |
| `apps/web/lib/utils.ts`            | cn() 유틸리티      |
