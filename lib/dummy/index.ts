import type { LocaleDefinition } from '@faker-js/faker'
import { base, Faker, ko } from '@faker-js/faker'

const customLocale: LocaleDefinition = {
  internet: {
    domainSuffix: ['test']
  }
}

export const FAKER_SEED = 123
let customFaker = new Faker({
  locale: [customLocale, ko, base]
})
customFaker.seed(FAKER_SEED)
export { customFaker }

export const generateDummys = <T>(count: number, createFn: (id: number) => T): T[] => {
  return Array.from({ length: count }, (_, index) => createFn(index + 1))
}
