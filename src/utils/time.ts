export function getDisplayPeriod(periodInMilliseconds: number): string {
  const numberOfMinutes = Math.floor(periodInMilliseconds / 1000 / 60)
  const days = Math.floor(numberOfMinutes / 24 / 60)
  if (days > 0) return `${days}d ago`
  const hours = Math.floor(numberOfMinutes / 60)
  if (hours > 0) {
    const extraMinute = Math.floor(numberOfMinutes - hours * 60)

    return `${hours}h${extraMinute >= 1 ? `${extraMinute}m` : ''} ago`
  }
  if (numberOfMinutes <= 0) return 'Just recently'
  return `${Math.floor(numberOfMinutes)}m ago`
}

export const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
