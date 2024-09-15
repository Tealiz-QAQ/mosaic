import { useMediaQuery } from 'usehooks-ts'

export function useIs2Xl() {
  return useMediaQuery('(max-width: 1535px)')
}

export function useIsXl() {
  return useMediaQuery('(max-width: 1279px)')
}

export function useIsLg() {
  return useMediaQuery('(max-width: 1023px)')
}

export function useIsMd() {
  return useMediaQuery('(max-width: 767px)')
}

export function useIsSm() {
  return useMediaQuery('(max-width: 639px)')
}
