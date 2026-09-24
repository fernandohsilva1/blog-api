import { generateRandomSuffix } from './generate-random-suffix'
import { slugify } from './slugfy'

export function createSlugFromText(text: string) {
  const slug = slugify(text)
  return `${slug}-${generateRandomSuffix()}`
}
