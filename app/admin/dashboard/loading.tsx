export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-6">
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <nav className="px-4">
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
            <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </header>

          <main className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-4"></div>
                    <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-700 rounded animate-pulse mt-2"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
