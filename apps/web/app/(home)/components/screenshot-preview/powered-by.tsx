const Icon = () => (
  <svg
    className="size-4"
    fill="none"
    height="98"
    viewBox="0 0 112 98"
    width="112"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Appwrite</title>
    <path
      d="M111.1 73.47V97.96H48.87C30.74 97.96 14.91 88.11 6.44 73.47C5.21 71.34 4.13 69.11 3.23 66.79C1.45 62.25 0.34 57.38 0 52.29V45.67C0.07 44.54 0.19 43.41 0.34 42.3C0.65 40.02 1.12 37.79 1.73 35.62C7.55 15.06 26.45 0 48.87 0C71.29 0 90.19 15.06 96.01 35.62H69.4C65.03 28.92 57.47 24.49 48.87 24.49C40.27 24.49 32.71 28.92 28.34 35.62C27.01 37.66 25.98 39.91 25.3 42.3C24.7 44.43 24.38 46.67 24.38 48.98C24.38 56 27.33 62.33 32.07 66.79C36.45 70.94 42.36 73.47 48.87 73.47H111.1Z"
      fill="#FD366E"
    />
    <path
      d="M111.1 42.3V66.79H65.68C70.41 62.33 73.36 56 73.36 48.98C73.36 46.67 73.04 44.43 72.44 42.3H111.1Z"
      fill="#FD366E"
    />
  </svg>
)

export const PoweredBy = () => (
  <p className="flex items-center justify-center gap-1 text-center text-muted-foreground text-xs">
    Screenshot powered by{' '}
    <a
      className="flex items-center gap-0.5 underline underline-offset-2 transition-colors hover:text-[#FD366E]"
      href="https://appwrite.io/docs/products/avatars/screenshots"
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icon />
      Appwrite
    </a>
  </p>
)
