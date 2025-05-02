"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ethers } from "ethers"

export default function Donate2() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState("")
  const [currency, setCurrency] = useState("USDT")
  const [ethBtcAmount, setEthBtcAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const receiverAddress = "0x1234567890abcdef1234567890abcdef12345678" // Fixed receiver address

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:5001/api/auth/cases/all")
        
        if (!response.ok) {
          throw new Error("Failed to fetch cases")
        }

        const data = await response.json()
        
        // Transform the data to match our Case interface
        const transformedCases = data.map((caseItem) => ({
          _id: caseItem._id,
          title: caseItem.title,
          description: caseItem.description,
          targetAmount: caseItem.targetAmount.toString(),
          amountRaised: caseItem.amountRaised ? caseItem.amountRaised.toString() : "0",
          imageUrl: caseItem.imageUrl && caseItem.imageUrl.length > 0 
            ? `http://localhost:5001/uploads/${caseItem.imageUrl[0]}` 
            : "/placeholder.jpg",
          welfare: caseItem.createdBy ? caseItem.createdBy.name || "Unknown Welfare" : "Unknown Welfare",
          welfareAddress: caseItem.createdBy?.blockchainAddress || null,
          category: caseItem.medicalIssue || "General",
          status: caseItem.status || "Active",
          createdAt: new Date(caseItem.createdAt).toISOString().split('T')[0]
        }))
        
        setCases(transformedCases)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching cases:", error)
        setError(error.message)
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  // Hardcoded exchange rates for demonstration
  const exchangeRates = {
    ETH: 3500, // 1 ETH = 3500 USD
    BTC: 90000, // 1 BTC = 90000 USD
  }

  const handleAmountChange = (e) => {
    const usdAmount = e.target.value
    setDonationAmount(usdAmount)

    if (currency === "ETH" || currency === "BTC") {
      const rate = exchangeRates[currency]
      setEthBtcAmount((usdAmount / rate).toFixed(6))
    }
  }

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value)
    setEthBtcAmount("")
  }

  const openModal = () => {
    // Instead of opening the modal, show a message about registering as a donor
    const message = "Please register as a donor to make donations. Would you like to go to the login page?";
    if (window.confirm(message)) {
      window.location.href = "/login";
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert("Donation Submitted")
    closeModal()
  }

  // Connect Wallet Function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask and try again.")
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      // Set the wallet address in state
      setWalletAddress(address)
      alert(`Wallet connected: ${address}`)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen donate-container">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Choose a Case to Donate</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 donate-cards">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Retry
                </button>
              </div>
            ) : cases.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No cases available at the moment.</p>
              </div>
            ) : (
              cases.map((caseItem) => (
                <div
                  key={caseItem._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all donate-card"
                >
                  <div className="h-64 relative">
                    <Image
                      src={caseItem.imageUrl}
                      alt={caseItem.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="p-6 card-details">
                    <h3 className="text-xl font-semibold mb-2">{caseItem.title}</h3>
                    <p className="text-gray-600 mb-4">{caseItem.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Target Amount</p>
                        <p className="text-lg font-semibold text-purple-600">${caseItem.targetAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Raised</p>
                        <p className="text-lg font-semibold text-green-500">${caseItem.amountRaised}</p>
                      </div>
                    </div>
                    <button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition-colors donate2-button"
                      onClick={openModal}
                    >
                      Donate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Donation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal">
            <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto modal-content">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Donate to Animal Rescue</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl close">
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="receiverAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Receiver Address
                  </label>
                  <input
                    type="text"
                    id="receiverAddress"
                    value={receiverAddress}
                    readOnly
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Donation Amount (USD)
                  </label>
                  <input
                    type="number"
                    id="donationAmount"
                    value={donationAmount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount in USD"
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Currency
                  </label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={handleCurrencyChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="USDT">USDT</option>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>

                {(currency === "ETH" || currency === "BTC") && (
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{currency} Equivalent</label>
                    <input
                      type="text"
                      value={ethBtcAmount}
                      readOnly
                      className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition-colors donate2-button"
                >
                  Confirm Donation
                </button>
              </form>

              {/* Wallet Connect Button */}
              {!walletAddress ? (
                <button
                  className="w-full mt-4 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-md transition-colors flex items-center justify-center donate2-button"
                  onClick={connectWallet}
                >
                  <Image src="/images/metamask.svg" alt="MetaMask" width={24} height={24} className="mr-2" />
                  Connect Wallet
                </button>
              ) : (
                <div className="mt-4 p-3 bg-gray-100 rounded-md wallet-connected">
                  <p className="text-sm text-gray-500">Wallet Connected:</p>
                  <p className="font-mono text-sm truncate">{walletAddress}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

