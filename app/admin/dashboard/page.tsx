"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { Home, Building2, PawPrint, FolderOpen, AlertTriangle, Wallet, BarChart3, LogOut, Search, CheckCircle, XCircle, Eye, Edit, Trash2, Filter, Bell, ChevronUp, Users, Clock, ArrowUpRight, Sparkles, Mail, Phone, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface WelfareRequest {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  description: string
  website?: string
  status: string
  approved?: boolean
  casesCount?: number
}

interface Case {
  _id: string
  title: string
  welfare: string
  type: string
  status: string
  goal: number
  raised: number
}

interface Emergency {
  _id: string
  title: string
  reporter: string
  location: string
  status: string
  assignedTo: string
  reportedOn: string
  animalType?: string
  condition?: string
  description?: string
  phone?: string
  images?: string[]
}

interface Donation {
  _id: string
  transactionId: string
  from: string
  to: string
  case: string
  amountCrypto: string
  amountUSD: number
  date: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [welfareRequests, setWelfareRequests] = useState<WelfareRequest[]>([])
  const [welfares, setWelfares] = useState<WelfareRequest[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [selectedWelfare, setSelectedWelfare] = useState<WelfareRequest | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewEmergencyDialogOpen, setViewEmergencyDialogOpen] = useState(false)
  const [selectedViewEmergency, setSelectedViewEmergency] = useState<Emergency | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        if (!token) {
          alert("Session expired. Please log in again.")
          localStorage.removeItem("adminToken")
          router.push("/login")
          return
        }

        // Fetch pending welfare requests
        if (activeTab === "welfare-requests" || activeTab === "dashboard") {
          try {
            const response = await axios.get("http://localhost:5001/api/admin/organizations/pending", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            setWelfareRequests(response.data)
          } catch (error) {
            console.error("Error fetching welfare requests:", error)
          }
        }

       
        if (activeTab === "manage-welfares" || activeTab === "dashboard") {
          try {
            const response = await axios.get("http://localhost:5001/api/admin/organizations/approved", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setWelfares(response.data);
          } catch (error) {
            console.error("Error fetching approved welfares:", error);
          }
        }

        if (activeTab === "manage-cases" || activeTab === "dashboard") {
          try {
            const response = await axios.get("http://localhost:5001/api/auth/cases/all", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setCases(response.data); // Set the fetched cases to state
          } catch (error) {
            console.error("Error fetching cases:", error);
          }
        }
      
        if (activeTab === "emergencies" || activeTab === "dashboard") {
          try {
            const response = await axios.get("http://localhost:5001/api/emergency", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            // Transform emergency data to match our interface
            const formattedEmergencies = response.data.map((emergency: any) => ({
              _id: emergency._id,
              title: emergency.animalType && emergency.condition 
                ? `${emergency.animalType} - ${emergency.condition}` 
                : "Emergency Report",
              reporter: emergency.name || "Anonymous",
              location: emergency.location || "Unknown location",
              status: emergency.status,
              assignedTo: emergency.assignedTo ? emergency.assignedTo.name : "Unassigned",
              reportedOn: new Date(emergency.createdAt).toLocaleString(),
              animalType: emergency.animalType,
              condition: emergency.condition,
              description: emergency.description,
              phone: emergency.phone,
              images: emergency.images || [],
            }));
            
            setEmergencies(formattedEmergencies);
          } catch (error) {
            console.error("Error fetching emergencies:", error);
            // Fallback to hardcoded data in case of error
          setEmergencies([
            {
              _id: "1",
              title: "Injured Dog on Highway",
              reporter: "John Doe",
              location: "Highway 101, Mile 24",
              status: "Urgent",
              assignedTo: "Paws Rescue",
              reportedOn: "2 hours ago",
            },
            {
              _id: "2",
              title: "Abandoned Kittens",
              reporter: "Jane Smith",
              location: "123 Main St, Apt 4B",
              status: "In Progress",
              assignedTo: "Animal Haven",
              reportedOn: "Yesterday",
            },
            ]);
          }
        }

        if (activeTab === "donations" || activeTab === "dashboard") {
          setDonations([
            {
              _id: "1",
              transactionId: "0x7a...3d4f",
              from: "0x3f...8e2c",
              to: "Paws Rescue",
              case: "Rescue Injured Puppy",
              amountCrypto: "0.5 ETH",
              amountUSD: 1450,
              date: "Apr 8, 2023",
            },
            {
              _id: "2",
              transactionId: "0x9c...1a7b",
              from: "0x5d...2e1a",
              to: "Animal Haven",
              case: "Shelter Renovation",
              amountCrypto: "0.25 ETH",
              amountUSD: 725,
              date: "Apr 7, 2023",
            },
          ])
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.")
          localStorage.removeItem("adminToken")
          router.push("/login")
        }
      }
    }

    fetchData()
  }, [activeTab, router])

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        console.error("No token found. Please log in again.")
        return
      }

      const response = await axios.post(
        `http://localhost:5001/api/admin/organizations/${id}/approve`,
        {}, // No body needed for approval
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update the UI after approval
      setWelfareRequests(welfareRequests.filter((request) => request._id !== id))
      alert(response.data.message || "Welfare approved successfully!")
    } catch (error: any) {
      console.error("Error approving welfare:", error)
      alert(error.response?.data?.message || "Failed to approve welfare.")
    }
  }

  // Handle reject
  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        console.error("No token found. Please log in again.")
        return
      }

      const response = await axios.post(
        `http://localhost:5001/api/admin/organizations/${id}/reject`,
        {}, // No body needed for rejection
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update the UI after rejection
      setWelfareRequests(welfareRequests.filter((request) => request._id !== id))
      alert(response.data.message || "Welfare rejected successfully!")
    } catch (error: any) {
      console.error("Error rejecting welfare:", error)
      alert(error.response?.data?.message || "Failed to reject welfare.")
    }
  }

  // View welfare details
  const handleViewWelfare = (welfare: WelfareRequest) => {
    setSelectedWelfare(welfare)
    setViewDialogOpen(true)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/login")
  }

  // Filter welfares based on search query and status
  const filteredWelfares = welfares.filter((welfare) => {
    const matchesSearch =
      welfare.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      welfare.email.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    return matchesSearch && welfare.status === filterStatus
  })

  // Handle viewing an emergency
  const handleViewEmergency = (emergency: Emergency) => {
    setSelectedViewEmergency(emergency)
    setViewEmergencyDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl z-0"></div>
      </div>

      <div className="flex h-screen relative z-10">
        {/* Mobile menu toggle */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-slate-800/80 backdrop-blur-sm border-slate-700 hover:bg-slate-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <ChevronUp size={18} /> : <PawPrint size={18} />}
          </Button>
        </div>

        {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'fixed inset-0 z-40' : 'hidden md:block'} w-64 bg-slate-800/80 backdrop-blur-sm border-r border-slate-700/50 overflow-y-auto`}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CryptoPaws Admin
            </h2>
          </div>
          <nav className="px-4 pb-6">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("dashboard")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "dashboard" 
                      ? "bg-purple-900/60 text-purple-300 border border-purple-700/50" 
                      : "hover:bg-slate-700/60 text-slate-300"
                  }`}
                >
                  <Home size={18} />
                  <span>Dashboard Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("welfare-requests")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "welfare-requests" 
                      ? "bg-purple-900/60 text-purple-300 border border-purple-700/50" 
                      : "hover:bg-slate-700/60 text-slate-300"
                  }`}
                >
                  <Building2 size={18} />
                  <span>Welfare Requests</span>
                  {welfareRequests.length > 0 && (
                    <span className="ml-auto bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {welfareRequests.length}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("manage-welfares")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "manage-welfares" 
                      ? "bg-purple-900/60 text-purple-300 border border-purple-700/50" 
                      : "hover:bg-slate-700/60 text-slate-300"
                  }`}
                >
                  <PawPrint size={18} />
                  <span>Manage Welfares</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("manage-cases")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "manage-cases" 
                      ? "bg-purple-900/60 text-purple-300 border border-purple-700/50" 
                      : "hover:bg-slate-700/60 text-slate-300"
                  }`}
                >
                  <FolderOpen size={18} />
                  <span>Manage Cases</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("emergencies")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "emergencies" 
                      ? "bg-purple-900/60 text-purple-300 border border-purple-700/50" 
                      : "hover:bg-slate-700/60 text-slate-300"
                  }`}
                >
                  <AlertTriangle size={18} />
                  <span>Emergencies</span>
                  {emergencies.filter(e => e.status === "Urgent").length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {emergencies.filter(e => e.status === "Urgent").length}
                    </span>
                  )}
                </button>
              </li>
              <li className="pt-4 mt-4 border-t border-slate-700/50">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 rounded-md flex items-center gap-3 text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold ml-12 md:ml-0">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "welfare-requests" && "Pending Welfare Requests"}
              {activeTab === "manage-welfares" && "Manage Welfares"}
              {activeTab === "manage-cases" && "Manage Cases"}
              {activeTab === "emergencies" && "Emergency Reports"}
            </h1>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 hover:text-purple-300"
              >
                <Bell size={18} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white font-medium">A</span>
                </div>
                <span className="hidden md:inline">Admin</span>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6">
            {/* Dashboard Home */}
            {activeTab === "dashboard" && (
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                  variants={itemVariants}
                >
                  <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg hover:shadow-purple-900/10 transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Total Welfares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold">{welfares.length}</div>
                          <p className="text-xs text-green-400 mt-1">+12% from last month</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Users size={20} className="text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg hover:shadow-purple-900/10 transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Active Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold">{cases.length}</div>
                          <p className="text-xs text-green-400 mt-1">+5% from last month</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <FolderOpen size={20} className="text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg hover:shadow-purple-900/10 transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Total Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold">$24,389</div>
                          <div className="text-xs text-slate-400 mt-1">≈ 8.45 ETH</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Wallet size={20} className="text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg hover:shadow-purple-900/10 transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold">{welfareRequests.length}</div>
                          <p className="text-xs text-yellow-400 mt-1">Requires attention</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Clock size={20} className="text-yellow-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants}>
                    <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg h-full">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Recent Welfare Requests</CardTitle>
                            <CardDescription className="text-slate-400">
                              You have {welfareRequests.length} pending requests
                            </CardDescription>
                          </div>
                          {welfareRequests.length > 0 && (
                            <Link href="#" onClick={() => setActiveTab("welfare-requests")}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                              >
                                <span>View all</span>
                                <ArrowUpRight size={14} className="ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {welfareRequests.length > 0 ? (
                          <div className="space-y-4">
                            {welfareRequests.slice(0, 3).map((request) => (
                              <div
                                key={request._id}
                                className="flex items-center justify-between p-3 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/30 hover:border-purple-500/30 transition-colors"
                              >
                                <div>
                                  <h3 className="font-medium">{request.name}</h3>
                                  <p className="text-sm text-slate-400">{request.email}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent border-slate-600 hover:bg-slate-600 hover:text-purple-300"
                                    onClick={() => handleViewWelfare(request)}
                                  >
                                    <Eye size={14} className="mr-1" /> View
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400 bg-slate-700/30 rounded-lg border border-slate-700/50">
                            <Building2 className="h-12 w-12 mx-auto text-slate-500 mb-2" />
                            <p>No pending welfare requests</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg h-full">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Recent Donations</CardTitle>
                            <CardDescription className="text-slate-400">Latest transactions on the platform</CardDescription>
                          </div>
                          <Link href="#" onClick={() => setActiveTab("donations")}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                            >
                              <span>View all</span>
                              <ArrowUpRight size={14} className="ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {donations.slice(0, 3).map((donation) => (
                            <div
                              key={donation._id}
                              className="flex items-center justify-between p-3 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/30 hover:border-green-500/30 transition-colors">
                              <div>
                                <h3 className="font-medium">{donation.transactionId}</h3>
                                <p className="text-sm text-slate-400">To: {donation.to}</p>
                              </div>
                              <div>
                                <p className="font-medium text-right">{donation.amountCrypto}</p>
                                <p className="text-sm text-slate-400 text-right">≈ ${donation.amountUSD}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Recent Emergencies</CardTitle>
                          <CardDescription className="text-slate-400">Latest emergency reports</CardDescription>
                        </div>
                        <Link href="#" onClick={() => setActiveTab("emergencies")}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                          >
                            <span>View all</span>
                            <ArrowUpRight size={14} className="ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {emergencies.slice(0, 3).map((emergency) => (
                          <div
                            key={emergency._id}
                            className="bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/30 hover:border-red-500/30 transition-colors overflow-hidden"
                          >
                            <div className="h-24 bg-slate-600/50 relative">
                              {emergency.images && emergency.images.length > 0 ? (
                                <div className="relative h-full w-full">
                                  <Image 
                                    src={emergency.images[0].startsWith('http') 
                                      ? emergency.images[0] 
                                      : `http://localhost:5001${emergency.images[0]}`}
                                    alt={emergency.title || "Emergency Report"}
                                    fill
                                    className="object-cover"
                                    onError={() => {
                                      console.error(`Failed to load image: ${emergency.images && emergency.images[0]}`);
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <AlertTriangle className="h-8 w-8 text-slate-500" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <span
                                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                                    emergency.status === "New"
                                      ? "bg-blue-900/60 text-blue-200"
                                      : emergency.status === "Assigned"
                                      ? "bg-yellow-900/60 text-yellow-200"
                                      : emergency.status === "In Progress"
                                      ? "bg-purple-900/60 text-purple-200"
                                      : emergency.status === "Resolved"
                                      ? "bg-green-900/60 text-green-200"
                                      : emergency.status === "Urgent"
                                      ? "bg-red-900/60 text-red-200"
                                      : "bg-slate-900/60 text-slate-200"
                                  }`}
                                >
                                  {emergency.status}
                                </span>
                              </div>
                            </div>
                            <div className="p-3">
                              <h3 className="text-sm font-medium line-clamp-1">{emergency.title}</h3>
                              <p className="text-xs text-slate-400 mb-2">{emergency.location}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">{emergency.reportedOn}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-0 h-auto"
                                  onClick={() => handleViewEmergency(emergency)}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* Welfare Requests */}
            {activeTab === "welfare-requests" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg">
                  <CardHeader>
                    <CardTitle>Pending Welfare Requests</CardTitle>
                    <CardDescription className="text-slate-400">
                      Review and approve new welfare organization registrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {welfareRequests.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                          <thead className="bg-slate-700/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Phone
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
                            {welfareRequests.map((request) => (
                              <tr key={request._id} className="hover:bg-slate-700/30">
                                <td className="px-6 py-4 whitespace-nowrap">{request.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{request.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{request.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{request.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-transparent border-slate-600 hover:bg-slate-600 hover:text-purple-300"
                                      onClick={() => handleViewWelfare(request)}
                                    >
                                      <Eye size={14} className="mr-1" /> View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-green-900/20 text-green-400 border-green-800 hover:bg-green-900/40"
                                      onClick={() => handleApprove(request._id)}
                                    >
                                      <CheckCircle size={14} className="mr-1" /> Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/40"
                                      onClick={() => handleReject(request._id)}
                                    >
                                      <XCircle size={14} className="mr-1" /> Reject
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-700/30 rounded-lg border border-slate-700/50">
                        <Building2 className="h-12 w-12 mx-auto text-slate-500 mb-2" />
                        <h3 className="text-lg font-medium text-white mb-2">No pending requests</h3>
                        <p className="text-slate-400">All welfare requests have been processed.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Manage Welfares */}
            {activeTab === "manage-welfares" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <CardTitle>Manage Welfares</CardTitle>
                        <CardDescription className="text-slate-400">
                          View and manage all registered welfare organizations
                        </CardDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            type="search"
                            placeholder="Search welfares..."
                            className="pl-8 bg-slate-700/50 border-slate-600/50 text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-700">
                              <Filter size={16} className="mr-2" /> Filter
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                            <DropdownMenuItem
                              className="hover:bg-slate-700 cursor-pointer"
                              onClick={() => setFilterStatus("all")}
                            >
                              All
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="hover:bg-slate-700 cursor-pointer"
                              onClick={() => setFilterStatus("active")}
                            >
                              Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="hover:bg-slate-700 cursor-pointer"
                              onClick={() => setFilterStatus("inactive")}
                            >
                              Inactive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredWelfares.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                          <thead className="bg-slate-700/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Cases
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
                            {filteredWelfares.map((welfare) => (
                              <tr key={welfare._id} className="hover:bg-slate-700/30">
                                <td className="px-6 py-4 whitespace-nowrap">{welfare.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{welfare.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{welfare.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge
                                    className={
                                      welfare.status === "approved"
                                        ? "bg-green-900/20 text-green-400 hover:bg-green-900/40"
                                        : "bg-red-900/20 text-red-400 hover:bg-red-900/40"
                                    }
                                  >
                                    {welfare.status === "approved" ? "Active" : "Inactive"}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{welfare.casesCount || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-transparent border-slate-600 hover:bg-slate-600 hover:text-purple-300"
                                      onClick={() => handleViewWelfare(welfare)}
                                    >
                                      <Eye size={14} className="mr-1" /> View
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-700/30 rounded-lg border border-slate-700/50">
                        <PawPrint className="h-12 w-12 mx-auto text-slate-500 mb-2" />
                        <h3 className="text-lg font-medium text-white mb-2">No welfares found</h3>
                        <p className="text-slate-400">No welfare organizations match your search criteria.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Manage Cases */}
            {activeTab === "manage-cases" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 text-white shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <CardTitle>Manage Cases</CardTitle>
                        <CardDescription className="text-slate-400">
                          View and manage all cases across the platform
                        </CardDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            type="search"
                            placeholder="Search cases..."
                            className="pl-8 bg-slate-700/50 border-slate-600/50 text-white"
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-700">
                              <Filter size={16} className="mr-2" /> Filter
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                            <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">All Cases</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">Pending</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">Funded</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">Completed</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Case Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Welfare
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Goal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Raised
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
                          {cases
                            .filter((c) => {
                              // Filter by search query if any
                              return c.title.toLowerCase().includes(searchQuery.toLowerCase());
                            })
                            .map((c) => (
                              <tr key={c._id} className="hover:bg-slate-700/30">
                                <td className="px-6 py-4 whitespace-nowrap">{c.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{c.welfare}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{c.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge
                                    className={
                                      c.status === "In Progress"
                                        ? "bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40"
                                        : c.status === "Funded"
                                        ? "bg-green-900/20 text-green-400 hover:bg-green-900/40"
                                        : "bg-blue-900/20 text-blue-400 hover:bg-blue-900/40"
                                    }
                                  >
                                    {c.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">${c.goal}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm">${c.raised}</span>
                                      <span className="text-sm text-slate-400">
                                        {Math.round((c.raised / c.goal) * 100)}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                                        style={{ width: `${Math.min(100, Math.round((c.raised / c.goal) * 100))}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-transparent border-slate-600 hover:bg-slate-600 hover:text-purple-300"
                                    >
                                      <Eye size={14} className="mr-1" /> View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-transparent border-slate-600 hover:bg-slate-600 hover:text-purple-300"
                                    >
                                      <Edit size={14} className="mr-1" /> Edit
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Emergencies Tab */}
            {activeTab === "emergencies" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Emergency Reports
                  </h1>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search emergencies..."
                        className="pl-8 bg-slate-700/50 border-slate-600/50 text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-700">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                        <DropdownMenuItem onClick={() => setFilterStatus("all")} className="hover:bg-slate-700">All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("New")} className="hover:bg-slate-700">New</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Assigned")} className="hover:bg-slate-700">Assigned</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("In Progress")} className="hover:bg-slate-700">In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Resolved")} className="hover:bg-slate-700">Resolved</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Closed")} className="hover:bg-slate-700">Closed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {emergencies.filter(emergency => 
                  (filterStatus === "all" || emergency.status === filterStatus) &&
                  (emergency.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   emergency.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   emergency.location.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {emergencies
                      .filter(emergency => 
                        (filterStatus === "all" || emergency.status === filterStatus) &&
                        (emergency.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emergency.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emergency.location.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((emergency, index) => (
                        <motion.div 
                          key={emergency._id} 
                          variants={itemVariants}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-slate-800/70 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-slate-700/50 hover:border-red-500/30 transition-colors"
                        >
                          <div className="relative h-48 bg-slate-700/50">
                            {emergency.images && emergency.images.length > 0 ? (
                              <div className="relative h-full w-full">
                                <Image 
                                  src={emergency.images[0].startsWith('http') 
                                    ? emergency.images[0] 
                                    : `http://localhost:5001${emergency.images[0]}`}
                                  alt={emergency.title || "Emergency Report"}
                                  fill
                                  className="object-cover"
                                  onError={() => {
                                    console.error(`Failed to load image: ${emergency.images && emergency.images[0]}`);
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <AlertTriangle className="h-12 w-12 text-slate-500" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <span
                                className={`px-2 py-1 text-xs font-bold rounded-full ${
                                  emergency.status === "New"
                                    ? "bg-blue-900/60 text-blue-200"
                                    : emergency.status === "Assigned"
                                    ? "bg-yellow-900/60 text-yellow-200"
                                    : emergency.status === "In Progress"
                                    ? "bg-purple-900/60 text-purple-200"
                                    : emergency.status === "Resolved"
                                    ? "bg-green-900/60 text-green-200"
                                    : emergency.status === "Urgent"
                                    ? "bg-red-900/60 text-red-200"
                                    : "bg-slate-900/60 text-slate-200"
                                }`}
                              >
                                {emergency.status}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-medium text-white mb-1">{emergency.title}</h3>
                            <p className="text-sm text-slate-400 mb-1">Reported by: {emergency.reporter}</p>
                            <p className="text-sm text-slate-400 mb-3">Location: {emergency.location}</p>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-xs text-slate-500">{emergency.reportedOn}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-slate-600 hover:bg-slate-600 hover:text-purple-300"
                                  onClick={() => handleViewEmergency(emergency)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-10 bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-lg">
                    <AlertTriangle className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No emergencies found</h3>
                    <p className="text-slate-400 max-w-md mx-auto">No emergency reports match your current filters.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* View Emergency Dialog */}
            <Dialog open={viewEmergencyDialogOpen} onOpenChange={setViewEmergencyDialogOpen}>
              <DialogContent className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 text-white max-w-4xl shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Emergency Details
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Detailed information about the emergency report
                  </DialogDescription>
                </DialogHeader>
                {selectedViewEmergency && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="h-60 bg-slate-700/50 rounded-lg relative mb-4 overflow-hidden border border-slate-600/50">
                        {selectedViewEmergency.images && selectedViewEmergency.images.length > 0 ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={selectedViewEmergency.images[0].startsWith('http') 
                                ? selectedViewEmergency.images[0] 
                                : `http://localhost:5001${selectedViewEmergency.images[0]}`}
                              alt={selectedViewEmergency.title || "Emergency Report"}
                              fill
                              className="object-cover rounded-lg"
                              onError={() => {
                                // Let the fallback div show when image fails to load
                                console.error(`Failed to load image: ${selectedViewEmergency.images && selectedViewEmergency.images[0]}`);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <AlertTriangle className="h-16 w-16 text-slate-500" />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-1">Status</h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              selectedViewEmergency.status === "New"
                                ? "bg-blue-900/60 text-blue-200"
                                : selectedViewEmergency.status === "Assigned"
                                ? "bg-yellow-900/60 text-yellow-200"
                                : selectedViewEmergency.status === "In Progress"
                                ? "bg-purple-900/60 text-purple-200"
                                : selectedViewEmergency.status === "Resolved"
                                ? "bg-green-900/60 text-green-200"
                                : selectedViewEmergency.status === "Urgent"
                                ? "bg-red-900/60 text-red-200"
                                : "bg-slate-900/60 text-slate-200"
                            }`}
                          >
                            {selectedViewEmergency.status}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-1">Reported On</h3>
                          <p className="text-white">{selectedViewEmergency.reportedOn}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-1">Animal Type</h3>
                          <p className="text-white capitalize">{selectedViewEmergency.animalType || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-1">Condition</h3>
                          <p className="text-white capitalize">{selectedViewEmergency.condition || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-1">Location</h3>
                          <p className="text-white">{selectedViewEmergency.location}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-1">Reported By</h3>
                          <p className="text-white">{selectedViewEmergency.reporter}</p>
                          {selectedViewEmergency.phone && (
                            <p className="text-sm text-slate-400">{selectedViewEmergency.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Description</h3>
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50">
                          <p className="text-white whitespace-pre-line">{selectedViewEmergency.description || "No description provided."}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Assigned To</h3>
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50">
                          <div className="flex items-center gap-3">
                            {selectedViewEmergency.assignedTo ? (
                              <>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                  <PawPrint size={16} className="text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{selectedViewEmergency.assignedTo}</p>
                                  <p className="text-xs text-slate-400">Welfare Organization</p>
                                </div>
                              </>
                            ) : (
                              <p className="text-slate-400">Not assigned yet</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between gap-2">
                        <Button
                          variant="outline"
                          className="bg-purple-900/20 text-purple-400 border-purple-800 hover:bg-purple-900/40"
                        >
                          <Edit size={16} className="mr-2" /> Update Status
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-700"
                          onClick={() => setViewEmergencyDialogOpen(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* View Welfare Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
              <DialogContent className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 text-white max-w-4xl shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Welfare Organization Details
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Detailed information about the welfare organization
                  </DialogDescription>
                </DialogHeader>
                {selectedWelfare && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Organization Name</h3>
                        <p className="text-white text-lg font-medium">{selectedWelfare.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Contact Information</h3>
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50 space-y-2">
                          <div className="flex items-start gap-2">
                            <Mail size={16} className="text-slate-400 mt-0.5" />
                            <p className="text-white">{selectedWelfare.email}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone size={16} className="text-slate-400 mt-0.5" />
                            <p className="text-white">{selectedWelfare.phone}</p>
                          </div>
                          {selectedWelfare.website && (
                            <div className="flex items-start gap-2">
                              <Globe size={16} className="text-slate-400 mt-0.5" />
                              <p className="text-white">{selectedWelfare.website}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Address</h3>
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50">
                          <p className="text-white">{selectedWelfare.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Description</h3>
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50 h-40 overflow-y-auto">
                          <p className="text-white whitespace-pre-line">{selectedWelfare.description}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Status</h3>
                        <Badge
                          className={
                            selectedWelfare.status === "approved"
                              ? "bg-green-900/20 text-green-400"
                              : "bg-red-900/20 text-red-400"
                          }
                        >
                          {selectedWelfare.status === "approved" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="pt-4 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-700"
                          onClick={() => setViewDialogOpen(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </div>
  )
}
