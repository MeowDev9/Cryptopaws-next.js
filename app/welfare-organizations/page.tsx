"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

interface WelfareOrganization {
  _id: string
  name: string
  description: string
  address: string
  website: string
  profilePicture?: string
  blockchainAddress?: string
}

interface Case {
  _id: string
  title: string
  description: string
  targetAmount: string
  amountRaised: string
  imageUrl: string[]
  status: string
  createdAt: string
}

export default function WelfareOrganizations() {
  const [welfares, setWelfares] = useState<WelfareOrganization[]>([])
  const [selectedWelfare, setSelectedWelfare] = useState<WelfareOrganization | null>(null)
  const [welfareCases, setWelfareCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDonationModal, setShowDonationModal] = useState(false)

  useEffect(() => {
    fetchWelfares()
  }, [])

  const fetchWelfares = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5001/api/welfare/public/approved")
      if (!response.ok) {
        throw new Error("Failed to fetch welfare organizations")
      }
      const data = await response.json()
      setWelfares(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching welfares:", error)
      setError("Failed to load welfare organizations")
      setLoading(false)
    }
  }

  const fetchWelfareCases = async (welfareId: string) => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5001/api/auth/cases/all")
      if (!response.ok) {
        throw new Error("Failed to fetch cases")
      }
      const data = await response.json()
      // Filter cases for the selected welfare organization
      const welfareCases = data.filter((caseItem: any) => 
        caseItem.createdBy._id === welfareId
      )
      setWelfareCases(welfareCases)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching cases:", error)
      setError("Failed to load cases")
      setLoading(false)
    }
  }

  const handleWelfareClick = (welfare: WelfareOrganization) => {
    setSelectedWelfare(welfare)
    fetchWelfareCases(welfare._id)
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gradient-to-b from-purple-50 to-white min-h-screen">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-purple-900">Welfare Organizations</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchWelfares}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Retry
              </button>
            </div>
          ) : selectedWelfare ? (
            <div>
              <button
                onClick={() => setSelectedWelfare(null)}
                className="mb-6 text-purple-600 hover:text-purple-700 flex items-center"
              >
                ← Back to Organizations
              </button>
              
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 relative rounded-full overflow-hidden">
                    <Image
                      src={selectedWelfare.profilePicture ? `http://localhost:5001${selectedWelfare.profilePicture}` : "/placeholder.jpg"}
                      alt={selectedWelfare.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900">{selectedWelfare.name}</h3>
                    <p className="text-gray-600">{selectedWelfare.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p>{selectedWelfare.address}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Website</p>
                    <a 
                      href={selectedWelfare.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {selectedWelfare.website}
                    </a>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-6 text-purple-900">Active Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {welfareCases.length > 0 ? (
                  welfareCases.map((caseItem) => (
                    <div
                      key={caseItem._id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => setShowDonationModal(true)}
                    >
                      <div className="h-64 relative">
                        <Image
                          src={caseItem.imageUrl && caseItem.imageUrl.length > 0 
                            ? `http://localhost:5001/uploads/${caseItem.imageUrl[0]}` 
                            : "/placeholder.jpg"}
                          alt={caseItem.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-purple-900">{caseItem.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{caseItem.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Target</p>
                            <p className="text-lg font-semibold text-purple-600">${caseItem.targetAmount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Raised</p>
                            <p className="text-lg font-semibold text-green-500">${caseItem.amountRaised}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No active cases at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {welfares.map((welfare) => (
                <div
                  key={welfare._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleWelfareClick(welfare)}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 relative rounded-full overflow-hidden">
                        <Image
                          src={welfare.profilePicture ? `http://localhost:5001${welfare.profilePicture}` : "/placeholder.jpg"}
                          alt={welfare.name}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-purple-900">{welfare.name}</h3>
                        <p className="text-sm text-gray-500">{welfare.address}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 line-clamp-3">{welfare.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Want to Help?</h3>
              <p className="text-gray-600 mb-6">
                To donate to this case, please log in to your donor account.
              </p>
              <div className="flex flex-col gap-4">
                <Link 
                  href="/login"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Log In to Donate
                </Link>
                <button
                  onClick={() => setShowDonationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
} 