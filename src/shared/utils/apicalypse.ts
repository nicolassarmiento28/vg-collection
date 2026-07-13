/** Strips characters that could break out of a quoted APICalypse string value. */
export function sanitizeApicalypseTerm(input: string): string {
  return input
    .replace(/[\\"]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f]/g, '')
    .slice(0, 200)
}
