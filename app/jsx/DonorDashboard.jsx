"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import ConnectWalletButton from "../../../components/ConnectWalletButton"
import CaseCard from "../../../components/CaseCard"
import DonationModal from "../../../components/DonationModal"
import ProfilePage from "../../ProfilePage"
import { Home, CreditCard, Heart, User, LogOut, Menu, X } from "react-feather"

const DonorDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("explore")
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  // Fetch cases from API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("donorToken")
        const response = await fetch("http://localhost:5001/api/auth/cases/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch cases")
        }

        const data = await response.json()
        setCases(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching cases:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("donorToken")
        const response = await fetch("http://localhost:5001/api/profile/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setUserProfile(data)
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    fetchUserProfile()
  }, [])

  const handleWalletConnect = (address) => {
    setWalletConnected(true)
    setWalletAddress(address)
  }

  const handleDonate = (caseData) => {
    if (!walletConnected) {
      alert("Please connect your wallet first")
      return
    }
    setSelectedCase(caseData)
    setShowDonationModal(true)
  }

  const handleDonationComplete = (donationData) => {
    // In a real app, you would update the case with the new donation
    console.log("Donation completed:", donationData)
    setShowDonationModal(false)

    // Refresh cases after donation
    const updatedCases = cases.map((c) => {
      if (c._id === selectedCase._id) {
        return {
          ...c,
          amountRaised: (Number.parseFloat(c.amountRaised || 0) + Number.parseFloat(donationData.amount)).toString(),
        }
      }
      return c
    })

    setCases(updatedCases)
  }

  const handleLogout = () => {
    localStorage.removeItem("donorToken")
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full bg-gray-800 text-white">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-gray-800 bg-opacity-90 backdrop-blur-lg border-r border-gray-700`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-xl font-bold">C</span>
            </div>
            <h1 className="text-xl font-bold">CryptoPaws</h1>
          </div>

          <div className="mb-8">
            {walletConnected ? (
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400">Connected Wallet</p>
                <p className="text-sm font-mono truncate">{walletAddress}</p>
              </div>
            ) : (
              <ConnectWalletButton onConnect={handleWalletConnect} />
            )}
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === "explore" ? "bg-purple-600" : "hover:bg-gray-700"}`}
            >
              <Home size={18} className="mr-3" />
              <span>Explore Cases</span>
            </button>

            <button
              onClick={() => setActiveTab("donations")}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === "donations" ? "bg-purple-600" : "hover:bg-gray-700"}`}
            >
              <Heart size={18} className="mr-3" />
              <span>My Donations</span>
            </button>

            <button
              onClick={() => setActiveTab("wallet")}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === "wallet" ? "bg-purple-600" : "hover:bg-gray-700"}`}
            >
              <CreditCard size={18} className="mr-3" />
              <span>Wallet</span>
            </button>

            {/* <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === "history" ? "bg-purple-600" : "hover:bg-gray-700"}`}
            >
              <History size={18} className="mr-3" />
              <span>Transaction History</span>
            </button> */}

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === "profile" ? "bg-purple-600" : "hover:bg-gray-700"}`}
            >
              <User size={18} className="mr-3" />
              <span>Profile</span>
            </button>
          </nav>

          <div className="absolute bottom-8 left-0 w-full px-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-6">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {activeTab === "explore" && "Explore Donation Cases"}
              {activeTab === "donations" && "My Donations"}
              {activeTab === "wallet" && "My Wallet"}
              {activeTab === "history" && "Transaction History"}
              {activeTab === "profile" && "My Profile"}
            </h1>
            <p className="text-gray-400">
              {activeTab === "explore" && "Discover and support causes that matter"}
              {activeTab === "donations" && "Track your impact"}
              {activeTab === "wallet" && "Manage your crypto assets"}
              {activeTab === "history" && "View your transaction history"}
              {activeTab === "profile" && "Manage your personal information"}
            </p>
          </div>

          {userProfile && (
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="font-medium">{userProfile.name}</p>
                <p className="text-sm text-gray-400">{userProfile.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <main>
          {/* Explore Cases Tab */}
          {activeTab === "explore" && (
            <div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg text-center">
                  <p>{error}</p>
                  <button className="mt-2 px-4 py-2 bg-red-500 rounded-lg" onClick={() => window.location.reload()}>
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cases.map((caseItem) => (
                    <CaseCard
                      key={caseItem._id}
                      caseData={caseItem}
                      onDonate={() => handleDonate(caseItem)}
                      walletConnected={walletConnected}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Donations Tab */}
          {activeTab === "donations" && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Your Donations</h2>
              <p className="text-gray-400">
                You haven't made any donations yet. Explore cases to make your first donation!
              </p>
              <button
                onClick={() => setActiveTab("explore")}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Explore Cases
              </button>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Wallet</h2>
              {walletConnected ? (
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-400">Connected Wallet</p>
                    <p className="font-mono">{walletAddress}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400">ETH Balance</p>
                      <p className="text-2xl font-bold">0.42 ETH</p>
                      <p className="text-sm text-gray-400">≈ $1,260.00</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400">USDC Balance</p>
                      <p className="text-2xl font-bold">250 USDC</p>
                      <p className="text-sm text-gray-400">≈ $250.00</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Total Donated</p>
                      <p className="text-2xl font-bold">0.15 ETH</p>
                      <p className="text-sm text-gray-400">≈ $450.00</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                      Send
                    </button>
                    <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      Receive
                    </button>
                    <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                      Swap
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Connect your wallet to view your balance and transactions</p>
                  <ConnectWalletButton onConnect={handleWalletConnect} />
                </div>
              )}
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === "history" && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              {walletConnected ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tx Hash
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">2023-06-15</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">Donation</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">0.05 ETH</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">Confirmed</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">0x1a2b...3c4d</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">2023-06-10</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">Donation</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">0.1 ETH</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">Confirmed</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">0x5e6f...7g8h</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Connect your wallet to view your transaction history</p>
                  <ConnectWalletButton onConnect={handleWalletConnect} />
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
              {userProfile ? (
                <ProfilePage userProfile={userProfile} setUserProfile={setUserProfile} />
              ) : (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Donation Modal */}
      {showDonationModal && selectedCase && (
        <DonationModal
          caseData={selectedCase}
          walletAddress={walletAddress}
          onClose={() => setShowDonationModal(false)}
          onDonationComplete={handleDonationComplete}
        />
      )}
    </div>
  )
}

export default DonorDashboard

