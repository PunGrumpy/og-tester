export default function Loading() {
  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      <p className="ml-4 text-lg font-semibold">Loading...</p>
    </div>
  )
}
