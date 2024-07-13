import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()}{' '}
          <Link
            href="https://pungrumpy.com"
            className="hover:text-primary hover:underline"
          >
            PunGrumpy
          </Link>
          . All rights reserved.
        </p>
      </div>
    </footer>
  )
}
