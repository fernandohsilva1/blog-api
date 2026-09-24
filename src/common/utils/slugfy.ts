export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[\u0300\-u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
