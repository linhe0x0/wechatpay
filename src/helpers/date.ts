export function getTimestampSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export function isOutdated(date: string | Date): boolean {
  const target = new Date(date)
  const now = Date.now()

  return target.getTime() <= now
}
