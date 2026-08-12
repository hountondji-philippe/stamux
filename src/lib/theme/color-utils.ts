function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return [r, g, b]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function mixHex(base: string, target: string, amount: number): string {
  const [r1, g1, b1] = hexToRgb(base)
  const [r2, g2, b2] = hexToRgb(target)
  const r = r1 + (r2 - r1) * amount
  const g = g1 + (g2 - g1) * amount
  const b = b1 + (b2 - b1) * amount
  return rgbToHex(r, g, b)
}

export function darken(hex: string, amount: number): string {
  return mixHex(hex, '#000000', amount)
}

export function lighten(hex: string, amount: number): string {
  return mixHex(hex, '#FFFFFF', amount)
}