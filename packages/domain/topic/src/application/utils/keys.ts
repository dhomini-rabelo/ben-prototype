const DEFAULT_SLUG = 'conversa'

export function toKebabSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function toKebabSlugOrDefault(text: string): string {
  return toKebabSlug(text) || DEFAULT_SLUG
}
