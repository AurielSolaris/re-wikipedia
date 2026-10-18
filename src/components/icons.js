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
