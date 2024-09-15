import { parseUnits } from 'viem'
import { BigintIsh, Fraction } from './fraction'

// n = "10000000000000000000", decimals = 9 => Fraction("10000000000000000000", 1e9)
export function divpowToFraction(n: BigintIsh, decimals: number): Fraction {
  return new Fraction(n, Math.pow(10, decimals))
}

// Float in string form to Fraction.
// s = "0.000000000000001", multiplier = 18 => Fraction("1000", 1e18)
export function mulpowToFraction(s: string, multiplier = 18): Fraction {
  const f = new Fraction(parseUnits(truncateValue(s, multiplier), multiplier).toString(), Math.pow(10, multiplier))
  return f
}

export function truncateValue(value: string, decimals: number): string {
  const parts = value.split(/[.]/)
  if (parts.length > 1 && parts[1].length > decimals) {
    parts[0] = parts[0].replace(/^0+(?=\d)/, '') // Remove leading zeros.

    parts[1] = parts[1].slice(0, decimals)
    parts[1] = parts[1].replace(/^(\d*?[1-9])0+$/, '$1') // Remove trailing zeros.

    const res = parts[0] + '.' + parts[1]
    if (res.endsWith('.')) return res.slice(0, res.length - 1)
    return res
  }
  value = value.replace(/^0+(?=\d)/, '') // Remove leading zeros.
  return value
}

export const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function numberWithCommas(x: string, keepDot = true, truncateDecimals: number | undefined = undefined) {
  const whole = x.split('.')[0]
  const fraction = x.split('.')[1]
  let res = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (fraction) {
    res += '.' + fraction
  } else if (keepDot && x.includes('.')) {
    res += '.'
  }
  if (truncateDecimals) {
    res = truncateValue(res, truncateDecimals)
  }
  return res
}

// Test
// console.log(`numberWithCommas("1")`, numberWithCommas("1"))
// console.log(`numberWithCommas("123")`, numberWithCommas("123"))
// console.log(`numberWithCommas("123456")`, numberWithCommas("123456"))
// console.log(`numberWithCommas("123456.789")`, numberWithCommas("123456.789"))
// console.log(`numberWithCommas("123456.789123")`, numberWithCommas("123456.789123"))
