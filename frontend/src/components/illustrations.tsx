import type { ComponentType, SVGProps } from 'react'

type Illustration = ComponentType<SVGProps<SVGSVGElement>>

const shared = {
  viewBox: '0 0 120 120',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/**
 * Monochrome-tinted line-art (design.md §8, §11.3) rendered in white at low
 * opacity inside the flat colored cards. Never introduces new hues.
 */
export const ILLUSTRATIONS: Record<string, Illustration> = {
  spiral: (props) => (
    <svg {...shared} {...props}>
      <path d="M60 60 m-22 0 a22 22 0 1 1 44 0 a32 32 0 1 1 -64 0 a42 42 0 1 1 84 0 a52 52 0 1 1 -104 0" />
    </svg>
  ),
  leaf: (props) => (
    <svg {...shared} {...props}>
      <path d="M28 92 C 52 82, 78 56, 96 22" />
      <path d="M34 84 C 56 76, 74 58, 88 34" />
      <path d="M52 88 C 66 78, 78 66, 88 52" opacity="0.7" />
      <path d="M70 90 C 78 82, 84 74, 88 64" opacity="0.7" />
    </svg>
  ),
  sun: (props) => (
    <svg {...shared} {...props}>
      <circle cx="60" cy="60" r="18" />
      <path d="M60 28v-8 M60 100v-8 M28 60h-8 M100 60h-8 M37 37l-6-6 M89 89l-6-6 M83 37l6-6 M31 89l6-6" />
    </svg>
  ),
  health: (props) => (
    <svg {...shared} {...props}>
      <path d="M38 24h44v60a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6Z" opacity="0.6" />
      <path d="M60 42v26 M47 55h26" />
    </svg>
  ),
  flower: (props) => (
    <svg {...shared} {...props}>
      <circle cx="60" cy="60" r="8" />
      <path d="M60 28a12 12 0 0 1 12 12 12 12 0 0 1-12 12 12 12 0 0 1-12-12 12 12 0 0 1 12-12Z" />
      <path d="M60 68a12 12 0 0 1 12 12 12 12 0 0 1-12 12 12 12 0 0 1-12-12 12 12 0 0 1 12-12Z" />
      <path d="M28 48a12 12 0 0 1 12 12 12 12 0 0 1-12 12 12 12 0 0 1-12-12 12 12 0 0 1 12-12Z" />
      <path d="M92 48a12 12 0 0 1 12 12 12 12 0 0 1-12 12 12 12 0 0 1-12-12 12 12 0 0 1 12-12Z" />
    </svg>
  ),
  coins: (props) => (
    <svg {...shared} {...props}>
      <circle cx="52" cy="52" r="18" />
      <circle cx="52" cy="52" r="9" />
      <path d="M70 64a18 18 0 0 1 10 6 16 16 0 0 1-10 10Z" />
      <path d="M86 80a18 18 0 0 1-10-6 16 16 0 0 1 10-10Z" />
    </svg>
  ),
}
