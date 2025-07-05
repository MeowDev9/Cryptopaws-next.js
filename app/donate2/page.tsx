"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ethers } from "ethers"
import { CreditCard, Wallet, Target, TrendingUp, Calendar, Tag, AlertCircle, Loader2 } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function Donate2() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState("")
  const [currency, setCurrency] = useState("USDT")
  const [ethBtcAmount, setEthBtcAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
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
          imageUrl:
            caseItem.imageUrl && caseItem.imageUrl.length > 0
              ? `http://localhost:5001/uploads/${caseItem.imageUrl[0]}`
              : "/placeholder.svg?height=400&width=600",
          welfare: caseItem.createdBy ? caseItem.createdBy.name || "Unknown Welfare" : "Unknown Welfare",
          welfareAddress: caseItem.createdBy?.blockchainAddress || null,
          category: caseItem.medicalIssue || "General",
          status: caseItem.status || "Active",
          createdAt: new Date(caseItem.createdAt).toISOString().split("T")[0],
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

  const handleCurrencyChange = (value) => {
    setCurrency(value)

    if (value === "ETH" || value === "BTC") {
      const rate = exchangeRates[value]
      setEthBtcAmount(donationAmount ? (donationAmount / rate).toFixed(6) : "")
    } else {
      setEthBtcAmount("")
    }
  }

  const openModal = (caseItem) => {
    // Instead of opening the modal, show a message about registering as a donor
    setSelectedCase(caseItem)
    setIsModalOpen(true)

    // Uncomment this for the original behavior
    /*
    const message = "Please register as a donor to make donations. Would you like to go to the login page?";
    if (window.confirm(message)) {
      window.location.href = "/login";
    }
    */
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCase(null)
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

  // Calculate progress percentage
  const calculateProgress = (raised, target) => {
    const raisedNum = Number.parseFloat(raised)
    const targetNum = Number.parseFloat(target)
    if (isNaN(raisedNum) || isNaN(targetNum) || targetNum === 0) return 0
    return Math.min(Math.round((raisedNum / targetNum) * 100), 100)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl -z-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Make a Difference Today
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Your donation can change lives. Choose a cause below and contribute to making the world a better place.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 mb-4">Error: {error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Retry
              </Button>
            </div>
          ) : cases.length === 0 ? (
            <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-slate-300">No cases available at the moment.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {cases.map((caseItem) => {
                const progress = calculateProgress(caseItem.amountRaised, caseItem.targetAmount)

                return (
                  <motion.div key={caseItem._id} variants={itemVariants} className="group">
                    <Card className="h-full overflow-hidden bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-purple-500/50 transition-all duration-300">
                      <div className="h-56 relative overflow-hidden">
                        <Image
                          src={caseItem.imageUrl || "/placeholder.svg"}
                          alt={caseItem.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                        <Badge className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-700">
                          {caseItem.category}
                        </Badge>
                      </div>

                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl text-slate-100">{caseItem.title}</CardTitle>
                          <Badge variant={caseItem.status === "Active" ? "default" : "secondary"}>
                            {caseItem.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {caseItem.createdAt}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <p className="text-slate-300 mb-4 line-clamp-2">{caseItem.description}</p>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-purple-400 font-medium">{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Target className="h-3.5 w-3.5" /> Target
                              </p>
                              <p className="text-lg font-semibold text-slate-200">
                                ${Number.parseFloat(caseItem.targetAmount).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5" /> Raised
                              </p>
                              <p className="text-lg font-semibold text-purple-400">
                                ${Number.parseFloat(caseItem.amountRaised).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                              <Tag className="h-3.5 w-3.5" /> Organization
                            </p>
                            <p className="text-sm text-slate-300 truncate">{caseItem.welfare}</p>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                          onClick={() => openModal(caseItem)}
                        >
                          Donate Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              {selectedCase ? `Donate to ${selectedCase.title}` : "Make a Donation"}
            </DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 relative rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedCase.imageUrl || "/placeholder.svg"}
                    alt={selectedCase.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-slate-100">{selectedCase.title}</h3>
                  <p className="text-sm text-slate-400">{selectedCase.welfare}</p>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="receiverAddress"
                    className="text-sm font-medium text-slate-300 flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4" /> Receiver Address
                  </label>
                  <Input
                    id="receiverAddress"
                    value={receiverAddress}
                    readOnly
                    className="font-mono text-xs bg-slate-900/50 border-slate-700 text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="donationAmount"
                    className="text-sm font-medium text-slate-300 flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" /> Donation Amount (USD)
                  </label>
                  <Input
                    type="number"
                    id="donationAmount"
                    value={donationAmount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount in USD"
                    required
                    className="bg-slate-900/50 border-slate-700 text-slate-100 focus-visible:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="currency" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Select Currency
                  </label>
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100 focus:ring-purple-500">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(currency === "ETH" || currency === "BTC") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> {currency} Equivalent
                    </label>
                    <Input
                      value={ethBtcAmount}
                      readOnly
                      className="font-mono bg-slate-900/50 border-slate-700 text-slate-400"
                    />
                  </div>
                )}

                <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                  >
                    Confirm Donation
                  </Button>

                  {!walletAddress ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                      onClick={connectWallet}
                    >
                      <Image
                        src="/images/metamask.svg"
                        alt="MetaMask"
                        width={20}
                        height={20}
                        className="mr-2"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                      Connect Wallet
                    </Button>
                  ) : (
                    <div className="w-full p-3 bg-slate-900/50 rounded-md border border-slate-700">
                      <p className="text-xs text-slate-400">Wallet Connected:</p>
                      <p className="font-mono text-xs truncate text-slate-300">{walletAddress}</p>
                    </div>
                  )}
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  )
}
