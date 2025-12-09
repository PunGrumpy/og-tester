import type { HTMLAttributes } from 'react'

type IconProps = HTMLAttributes<SVGElement>

export const Icons = {
  logo: (props: IconProps) => (
    <svg
      fill="none"
      height="64"
      viewBox="0 0 64 64"
      width="64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>OG Tester</title>
      <g clipPath="url(#clip0_266_28)">
        <path
          d="M28.0787 -0.415528C72.7176 -5.39935 77.2329 61.6882 33.2758 63.2927C-7.86442 64.7914 -12.302 4.09812 28.0787 -0.415528ZM36.7924 5.76135C34.5377 6.1081 30.9613 7.81247 29.1432 9.20536C24.7475 12.573 13.546 23.6984 9.99351 28.0357C-3.70196 44.7327 18.2766 66.819 35.9551 52.5846C39.992 49.3345 54.7101 34.912 56.5641 30.8979C62.7659 17.4686 51.5643 3.49865 36.7924 5.76135Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_266_28">
          <rect fill="currentColor" height="64" width="64" />
        </clipPath>
      </defs>
    </svg>
  )
}
