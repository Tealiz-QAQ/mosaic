import { useEffect, useState } from 'react'

export default function CountdownSpinner({
  timeInSeconds,
  onFinishCountdown,
  setResetTimerFunc,
  isLoading,
  color,
  size,
}: {
  timeInSeconds: number
  isLoading: boolean
  onFinishCountdown: () => void
  setResetTimerFunc: (resetFunc: () => void) => void
  color?: string
  size: number
}) {
  const [timerValue, setTimerValue] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerValue((value) => (!isLoading ? (value + 200 > timeInSeconds * 1000 ? 0 : value + 200) : 0))
    }, 200)

    return () => clearInterval(interval)
  }, [isLoading, timeInSeconds])

  useEffect(() => {
    if (timerValue === timeInSeconds * 1000) {
      onFinishCountdown()
    }
  }, [onFinishCountdown, timeInSeconds, timerValue])

  useEffect(() => {
    setResetTimerFunc(() => setTimerValue(0))
  }, [setResetTimerFunc])

  return (
    <svg id="countdown-spinner" width={size} height={size} viewBox="0 0 100 100">
      <g>
        <path
          d="M50 15A35 35 0 1 0 74.787 25.213"
          fill="none"
          stroke={color || '#9AA0A6'}
          strokeWidth="12"
          strokeOpacity="0.3"
        ></path>
        <path d="M50 0L50 30L66 15L50 0" fill={color || '#9AA0A6'} fillOpacity="0.3"></path>
      </g>
      <g>
        <path
          d="M50 15A35 35 0 1 0 74.787 25.213"
          fill="none"
          stroke={color || '#FACA20'}
          strokeWidth="12"
          pathLength={timeInSeconds * 1000}
          strokeDasharray={timeInSeconds * 1000}
          strokeDashoffset={timerValue - timeInSeconds * 1000}
        ></path>
      </g>
    </svg>
  )
}
