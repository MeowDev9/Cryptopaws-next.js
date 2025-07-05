"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, Globe, MapPin, ChevronLeft, Calendar, Clock, ExternalLink, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

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
      const welfareCases = data.filter((caseItem: any) => caseItem.createdBy._id === welfareId)
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

  const handleCaseClick = (caseItem: Case) => {
    setSelectedCase(caseItem)
    setShowDonationModal(true)
  }

  const filteredWelfares = welfares.filter(
    (welfare) =>
      welfare.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      welfare.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate progress percentage for a case
  const calculateProgress = (raised: string, target: string) => {
    const raisedNum = Number.parseFloat(raised) || 0
    const targetNum = Number.parseFloat(target) || 1
    return Math.min(Math.round((raisedNum / targetNum) * 100), 100)
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden">
        {/* Background gradient blurs */}
        <div className="absolute top-40 -left-64 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-64 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Welfare Organizations
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Discover and support trusted welfare organizations making a difference in the lives of those in need.
            </p>
          </motion.div>

          {/* Search bar */}
          {!selectedWelfare && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-md mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-purple-500"
                />
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 backdrop-blur-sm bg-slate-900/30 rounded-xl border border-slate-800 p-8">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchWelfares} variant="default" className="bg-purple-600 hover:bg-purple-700">
                Retry
              </Button>
            </div>
          ) : selectedWelfare ? (
            <div>
              <Button
                onClick={() => setSelectedWelfare(null)}
                variant="ghost"
                className="mb-6 text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Back to Organizations
              </Button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-sm bg-slate-900/30 rounded-xl border border-slate-800 p-6 mb-8"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                  <div className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-purple-500/20 shadow-lg shadow-purple-500/10">
                    <Image
                      src={
                        selectedWelfare.profilePicture
                          ? `http://localhost:5001${selectedWelfare.profilePicture}`
                          : "/placeholder.svg?height=96&width=96"
                      }
                      alt={selectedWelfare.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                      {selectedWelfare.name}
                    </h3>
                    <p className="text-slate-300">{selectedWelfare.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Address</p>
                      <p className="text-white">{selectedWelfare.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Website</p>
                      <a
                        href={selectedWelfare.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        {selectedWelfare.website}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Active Cases
                  </h3>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                    {welfareCases.length} {welfareCases.length === 1 ? "Case" : "Cases"}
                  </Badge>
                </div>

                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {welfareCases.length > 0 ? (
                    welfareCases.map((caseItem) => (
                      <motion.div key={caseItem._id} variants={item}>
                        <Card
                          className="overflow-hidden hover:border-purple-500/50 transition-all duration-300 bg-slate-900/30 backdrop-blur-sm border-slate-800 text-white h-full flex flex-col"
                          onClick={() => handleCaseClick(caseItem)}
                        >
                          <div className="h-64 relative group">
                            <Image
                              src={
                                caseItem.imageUrl && caseItem.imageUrl.length > 0
                                  ? `http://localhost:5001/uploads/${caseItem.imageUrl[0]}`
                                  : "/placeholder.svg?height=256&width=384"
                              }
                              alt={caseItem.title}
                              fill
                              style={{ objectFit: "cover" }}
                              className="group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                            <Badge className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-600">
                              {caseItem.status}
                            </Badge>
                          </div>
                          <CardContent className="p-6 flex-1">
                            <h3 className="text-xl font-semibold mb-2 text-white">{caseItem.title}</h3>
                            <p className="text-slate-300 mb-4 line-clamp-2">{caseItem.description}</p>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                              <Calendar size={14} />
                              <span>Created on {formatDate(caseItem.createdAt)}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-2">
                              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  style={{
                                    width: `${calculateProgress(caseItem.amountRaised, caseItem.targetAmount)}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-slate-400 mt-1 text-right">
                                {calculateProgress(caseItem.amountRaised, caseItem.targetAmount)}% funded
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-6 pt-0 border-t border-slate-800 flex justify-between items-center">
                            <div>
                              <p className="text-xs text-slate-400">Target</p>
                              <p className="text-lg font-semibold text-purple-400">${caseItem.targetAmount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Raised</p>
                              <p className="text-lg font-semibold text-green-400">${caseItem.amountRaised}</p>
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 backdrop-blur-sm bg-slate-900/30 rounded-xl border border-slate-800 p-8">
                      <Clock size={48} className="mx-auto text-slate-500 mb-4" />
                      <p className="text-slate-300">No active cases at the moment.</p>
                      <p className="text-slate-400 text-sm mt-2">
                        Check back later for new cases from this organization.
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredWelfares.length > 0 ? (
                filteredWelfares.map((welfare) => (
                  <motion.div key={welfare._id} variants={item}>
                    <Card
                      className="backdrop-blur-sm bg-slate-900/30 border-slate-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden cursor-pointer text-white h-full"
                      onClick={() => handleWelfareClick(welfare)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
                            <Image
                              src={
                                welfare.profilePicture
                                  ? `http://localhost:5001${welfare.profilePicture}`
                                  : "/placeholder.svg?height=64&width=64"
                              }
                              alt={welfare.name}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{welfare.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin size={12} />
                              <span className="truncate max-w-[180px]">{welfare.address}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 line-clamp-3">{welfare.description}</p>
                      </CardContent>
                      <CardFooter className="pt-2 border-t border-slate-800 flex justify-between">
                        <div className="flex items-center gap-1 text-purple-400 text-sm">
                          <Building2 size={14} />
                          <span>View Organization</span>
                        </div>
                        <ExternalLink size={14} className="text-slate-400" />
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 backdrop-blur-sm bg-slate-900/30 rounded-xl border border-slate-800 p-8">
                  <Search size={48} className="mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-300">No organizations found matching "{searchQuery}"</p>
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Want to Help?
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              To donate to this case, please log in to your donor account.
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="w-12 h-12 relative rounded-md overflow-hidden">
                  <Image
                    src={
                      selectedCase.imageUrl && selectedCase.imageUrl.length > 0
                        ? `http://localhost:5001/uploads/${selectedCase.imageUrl[0]}`
                        : "/placeholder.svg?height=48&width=48"
                    }
                    alt={selectedCase.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-white">{selectedCase.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                      {selectedCase.status}
                    </Badge>
                    <span className="text-xs text-slate-400">Target: ${selectedCase.targetAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-4 sm:flex-col">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link href="/login">Log In to Donate</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDonationModal(false)}
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  )
}
