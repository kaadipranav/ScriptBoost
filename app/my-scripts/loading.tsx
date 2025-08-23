export default function MyScriptsLoading() {
  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="h-3 w-72 bg-muted rounded mt-2 animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-3 w-48 bg-muted rounded"/>
              <div className="h-8 w-28 bg-muted rounded"/>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full bg-muted rounded"/>
              <div className="h-3 w-5/6 bg-muted rounded"/>
              <div className="h-3 w-2/3 bg-muted rounded"/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
