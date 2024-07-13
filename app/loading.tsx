export default function Loading() {
  return (
    <div className="container mx-auto flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"></div>
      <p className="ml-4 text-lg font-semibold">Loading...</p>
    </div>
  )
}
