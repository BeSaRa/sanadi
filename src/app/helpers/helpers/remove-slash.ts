export function removeSlash(text: string) {
  return text.replace(/^\/+|\/+$/g, '')
}
