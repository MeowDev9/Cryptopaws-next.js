export default function Loading() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        {/* Sidebar Skeleton */}
        <div className="bg-gray-800 shadow-lg fixed h-full z-10 w-64">
          <div className="p-4 flex items-center justify-between border-b border-gray-700">
            <div className="h-8 w-36 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
  
          <div className="p-4">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="ml-3">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-700 rounded animate-pulse mt-2"></div>
              </div>
            </div>
  
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Main Content Skeleton */}
        <div className="ml-64">
          <header className="bg-gray-800 shadow-sm p-4 flex justify-between items-center sticky top-0 z-5">
            <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </header>
  
          <main className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-4"></div>
                    <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-700 rounded animate-pulse mt-2"></div>
                  </div>
                ))}
              </div>
  
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <div className="h-6 w-48 bg-gray-700 rounded animate-pulse mb-4"></div>
                    <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }
  