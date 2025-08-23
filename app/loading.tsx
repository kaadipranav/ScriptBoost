export default function RootLoading() {
  return (
    <div className="container mx-auto max-w-5xl py-10">
      <div className="grid gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-5/6 bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
