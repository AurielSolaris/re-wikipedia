import { h } from 'preact'

// Inline Lucide icons (lucide-static, ISC licensed). Kept as tiny inline SVGs
// on purpose: no runtime dependency and no extra requests on KaiOS.
// https://lucide.dev

const Icon = ({ children, size = 20, class: className = 'icon', ...rest }) => (
  <svg
    class={className}
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    stroke-width='2'
    stroke-linecap='round'
    stroke-linejoin='round'
    aria-hidden='true'
    focusable='false'
    {...rest}
  >{children}</svg>
)

export const LanguagesIcon = props => (
  <Icon {...props}>
    <path d='m5 8 6 6' />
    <path d='m4 14 6-6 2-3' />
    <path d='M2 5h12' />
    <path d='M7 2h1' />
    <path d='m22 22-5-10-5 10' />
    <path d='M14 18h6' />
  </Icon>
)

export const TouchIcon = props => (
  <Icon {...props}>
    <path d='M14 4.1 12 6' />
    <path d='m5.1 8-2.9-.8' />
    <path d='m6 12-1.9 2' />
    <path d='M7.2 2.2 8 5.1' />
    <path d='M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z' />
  </Icon>
)

export const FeedbackIcon = props => (
  <Icon {...props}>
    <path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z' />
  </Icon>
)

export const InfoIcon = props => (
  <Icon {...props}>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 16v-4' />
    <path d='M12 8h.01' />
  </Icon>
)

export const PrivacyIcon = props => (
  <Icon {...props}>
    <path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' />
    <path d='m9 12 2 2 4-4' />
  </Icon>
)

export const AppIcon = props => (
  <Icon {...props}>
    <rect width='14' height='20' x='5' y='2' rx='2' ry='2' />
    <path d='M12 18h.01' />
  </Icon>
)

export const LinkIcon = props => (
  <Icon {...props}>
    <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
    <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
  </Icon>
)

export const WarningIcon = props => (
  <Icon {...props}>
    <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' />
    <path d='M12 9v4' />
    <path d='M12 17h.01' />
  </Icon>
)

export const ChevronRightIcon = props => (
  <Icon {...props}>
    <path d='m9 18 6-6-6-6' />
  </Icon>
)

export const SunIcon = props => (  <Icon {...props}>
    <circle cx='12' cy='12' r='4' />
    <path d='M12 2v2' />
    <path d='M12 20v2' />
    <path d='m4.93 4.93 1.41 1.41' />
    <path d='m17.66 17.66 1.41 1.41' />
    <path d='M2 12h2' />
    <path d='M20 12h2' />
    <path d='m6.34 17.66-1.41 1.41' />
    <path d='m19.07 4.93-1.41 1.41' />
  </Icon>
)

export const MoonIcon = props => (
  <Icon {...props}>
    <path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401' />
  </Icon>
)

export const SunMoonIcon = props => (
  <Icon {...props}>
    <path d='M12 2v2' />
    <path d='M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715' />
    <path d='M16 12a4 4 0 0 0-4-4' />
    <path d='m19 5-1.256 1.256' />
    <path d='M20 12h2' />
  </Icon>
)

export const SearchIcon = props => (
  <Icon {...props}>
    <path d='m21 21-4.34-4.34' />
    <circle cx='11' cy='11' r='8' />
  </Icon>
)

export const HistoryIcon = props => (
  <Icon {...props}>
    <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
    <path d='M3 3v5h5' />
    <path d='M12 7v5l4 2' />
  </Icon>
)

export const ListIcon = props => (
  <Icon {...props}>
    <path d='M3 5h.01' />
    <path d='M3 12h.01' />
    <path d='M3 19h.01' />
    <path d='M8 5h13' />
    <path d='M8 12h13' />
    <path d='M8 19h13' />
  </Icon>
)

export const TextSizeIcon = props => (
  <Icon {...props}>
    <path d='M21 5H3' />
    <path d='M15 12H3' />
    <path d='M17 19H3' />
  </Icon>
)

export const TableIcon = props => (
  <Icon {...props}>
    <path d='M12 3v18' />
    <rect width='18' height='18' x='3' y='3' rx='2' />
    <path d='M3 9h18' />
    <path d='M3 15h18' />
  </Icon>
)

export const ImageIcon = props => (
  <Icon {...props}>
    <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
    <circle cx='9' cy='9' r='2' />
    <path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
  </Icon>
)

export const ShareIcon = props => (
  <Icon {...props}>
    <circle cx='18' cy='5' r='3' />
    <circle cx='6' cy='12' r='3' />
    <circle cx='18' cy='19' r='3' />
    <line x1='8.59' x2='15.42' y1='13.51' y2='17.49' />
    <line x1='15.41' x2='8.59' y1='6.51' y2='10.49' />
  </Icon>
)

export const BookIcon = props => (
  <Icon {...props}>
    <path d='M12 5v16' />
    <path d='M20.001 19A2 2 0 0 0 22 17V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0 0 12 5a5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 1.999 2H8a5 5 0 0 1 4 2 5 5 0 0 1 4-2z' />
  </Icon>
)

export const ScaleIcon = props => (
  <Icon {...props}>
    <path d='M12 3v18' />
    <path d='m19 8 3 8a5 5 0 0 1-6 0zV7' />
    <path d='M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1' />
    <path d='m5 8 3 8a5 5 0 0 1-6 0zV7' />
    <path d='M7 21h10' />
  </Icon>
)

export const WifiOffIcon = props => (
  <Icon {...props}>
    <path d='M12 20h.01' />
    <path d='M8.5 16.429a5 5 0 0 1 7 0' />
    <path d='M5 12.859a10 10 0 0 1 5.17-2.69' />
    <path d='M19 12.859a10 10 0 0 0-2.007-1.523' />
    <path d='M2 8.82a15 15 0 0 1 4.177-2.643' />
    <path d='M22 8.82a15 15 0 0 0-11.288-3.764' />
    <path d='m2 2 20 20' />
  </Icon>
)
