/** Cover-art fallback: first letter of the first two words, uppercased. */
export function getInitials(title: string): string {
  return title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}
