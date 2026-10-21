import { CircleAlert, Plus, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import MemberPicker from "@/components/MemberPicker"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { getSessionDisplayName } from "@/constants/session"
import { useUsers } from "@/hooks/api/useUser"

import Description from "../Description"
import Paginator from "../Paginator"
import { memberSessionRequiredBaseSchema } from "./schema"

type SessionForm = z.infer<typeof memberSessionRequiredBaseSchema>
type SlotKey = keyof SessionForm

interface SessionMembersPageProps {
  form: ReturnType<typeof useForm<SessionForm>>
  onValid: (formData: SessionForm) => void
  onPrevious: () => void
}

/** 폼 키 순서(보컬1, 보컬2, …)대로 세션별 자리 키를 묶는다 */
function groupSlotsBySession(values: SessionForm) {
  const groups = new Map<string, SlotKey[]>()
  for (const key of Object.keys(values) as SlotKey[]) {
    const { session } = values[key]
    groups.set(session, [...(groups.get(session) ?? []), key])
  }
  return [...groups.entries()]
}

const SessionMembersPage = ({
  form,
  onValid,
  onPrevious
}: SessionMembersPageProps) => {
  const { data: users } = useUsers()
  const values = form.watch()
  const groups = groupSlotsBySession(values)
  const isActive = (key: SlotKey) => values[key].required

  // 자리는 index 순으로 앞에서부터 채운다 — 빈칸 없는 보컬1·2·3 유지
  const addSlot = (slots: SlotKey[]) => {
    const next = slots.find((key) => !isActive(key))
    if (next) form.setValue(`${next}.required`, true)
  }

  const removeSlot = (slots: SlotKey[], removed: SlotKey) => {
    const active = slots.filter(isActive)
    for (let i = active.indexOf(removed); i < active.length - 1; i++) {
      form.setValue(`${active[i]!}.member`, values[active[i + 1]!].member)
    }
    const last = active.at(-1)!
    form.setValue(`${last}.member`, null)
    form.setValue(`${last}.required`, false)
  }

  const usedGroups = groups.filter(([, slots]) => slots.some(isActive))
  const emptyGroups = groups.filter(([, slots]) => !slots.some(isActive))

  return (
    <Form {...form}>
      <form>
        <Description header="세션 · 팀원" className="mb-6">
          <ul className="space-y-1">
            {[
              "곡에 필요한 자리를 추가하고, 이미 정해진 팀원은 바로 골라 주세요",
              "비워 둔 자리는 모집 중으로 열려요"
            ].map((sentence) => (
              <li key={sentence} className="flex items-start gap-x-2">
                <CircleAlert className="mt-[3px] h-2.5 w-2.5 shrink-0 text-gray-600 md:mt-0 md:h-4 md:w-4" />
                {sentence}
              </li>
            ))}
          </ul>
        </Description>

        <div className="divide-y divide-gray-100">
          {usedGroups.map(([session, slots]) => {
            const active = slots.filter(isActive)
            const label = getSessionDisplayName(session)
            return (
              <section key={session} className="py-4 first:pt-0">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  {label}
                  <span className="ml-1.5 font-normal text-gray-500">
                    {active.length}자리
                  </span>
                </h3>

                <ul className="space-y-2">
                  {active.map((key) => (
                    <li key={key} className="flex items-center gap-x-2">
                      <span className="w-14 shrink-0 text-xs text-gray-600 md:text-sm">
                        {key}
                      </span>
                      <MemberPicker
                        mode="single"
                        users={users ?? []}
                        value={values[key].member}
                        onChange={(userId) =>
                          form.setValue(`${key}.member`, userId)
                        }
                        placeholder="모집 중"
                        clearable
                        invalid={!!form.formState.errors[key]?.member}
                        className="h-10 flex-1 md:max-w-[360px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${key} 자리 빼기`}
                        className="size-10 shrink-0 text-gray-400"
                        onClick={() => removeSlot(slots, key)}
                      >
                        <X className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>

                {active.length < slots.length && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-1 h-9 px-2 text-primary"
                    onClick={() => addSlot(slots)}
                  >
                    <Plus className="mr-1 size-4" />
                    {label} 자리 추가
                  </Button>
                )}
              </section>
            )
          })}

          {emptyGroups.length > 0 && (
            <section className="py-4 first:pt-0">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                세션 추가
              </h3>
              <div className="flex flex-wrap gap-2">
                {emptyGroups.map(([session, slots]) => (
                  <Button
                    key={session}
                    type="button"
                    variant="outline"
                    className="h-9 rounded-full px-3"
                    onClick={() => addSlot(slots)}
                  >
                    <Plus className="mr-1 size-4" />
                    {getSessionDisplayName(session)}
                  </Button>
                ))}
              </div>
            </section>
          )}
        </div>

        <Paginator
          onPrevious={onPrevious}
          onNext={form.handleSubmit(onValid)}
          totalPage={2}
          currentPage={2}
          className="mt-8 md:mt-16"
        />
      </form>
    </Form>
  )
}

export default SessionMembersPage
