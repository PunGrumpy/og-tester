export function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} OG Tester. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
