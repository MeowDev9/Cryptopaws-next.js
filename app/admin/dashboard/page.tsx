"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Home,
  Building2,
  PawPrint,
  FolderOpen,
  AlertTriangle,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Admin Dashboard</h2>
          </div>
          <nav className="px-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "dashboard" ? "bg-purple-900 text-purple-300" : "hover:bg-gray-700"
                  }`}
                >
                  <Home size={18} />
                  <span>Dashboard Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("welfare-requests")}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "welfare-requests" ? "bg-purple-900 text-purple-300" : "hover:bg-gray-700"
                  }`}
                >
                  <Building2 size={18} />
                  <span>Welfare Requests</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("manage-welfares")}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "manage-welfares" ? "bg-purple-900 text-purple-300" : "hover:bg-gray-700"
                  }`}
                >
                  <PawPrint size={18} />
                  <span>Manage Welfares</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("manage-cases")}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "manage-cases" ? "bg-purple-900 text-purple-300" : "hover:bg-gray-700"
                  }`}
                >
                  <FolderOpen size={18} />
                  <span>Manage Cases</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("emergencies")}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "emergencies" ? "bg-purple-900 text-purple-300" : "hover:bg-gray-700"
                  }`}
                >
                  <AlertTriangle size={18} />
                  <span>Emergencies</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("donations")}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "donations" ? "bg-purple-900 text-purple-300" : "hover:bg-gray-700"
                  }`}
                >
                  <Wallet size={18} />
                  <span>Donations Overview</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "analytics" ? "bg-purple-900 text-purple-300" : "hover:bg-gray-700"
                  }`}
                >
                  <BarChart3 size={18} />
                  <span>Analytics & Reports</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full py-2 px-4 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === "settings" ? "bg-purple-900 text-purple-300" : "hover:bg-gray-700"
                  }`}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 rounded-md flex items-center gap-3 text-red-400 hover:bg-gray-700 transition-colors"
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
          <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "welfare-requests" && "Pending Welfare Requests"}
              {activeTab === "manage-welfares" && "Manage Welfares"}
              {activeTab === "manage-cases" && "Manage Cases"}
              {activeTab === "emergencies" && "Emergency Reports"}
              {activeTab === "donations" && "Donations Overview"}
              {activeTab === "analytics" && "Analytics & Reports"}
              {activeTab === "settings" && "Admin Settings"}
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell size={18} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">A</div>
                <span>Admin</span>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Dashboard Home */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Welfares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{welfares.length}</div>
                      <p className="text-xs text-green-400 mt-1">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Active Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{cases.length}</div>
                      <p className="text-xs text-green-400 mt-1">+5% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$24,389</div>
                      <div className="text-xs text-gray-400 mt-1">≈ 8.45 ETH</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{welfareRequests.length}</div>
                      <p className="text-xs text-yellow-400 mt-1">Requires attention</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader>
                      <CardTitle>Recent Welfare Requests</CardTitle>
                      <CardDescription className="text-gray-400">
                        You have {welfareRequests.length} pending requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {welfareRequests.length > 0 ? (
                        <div className="space-y-4">
                          {welfareRequests.slice(0, 3).map((request) => (
                            <div
                              key={request._id}
                              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                            >
                              <div>
                                <h3 className="font-medium">{request.name}</h3>
                                <p className="text-sm text-gray-400">{request.email}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-gray-600 hover:bg-gray-600"
                                  onClick={() => handleViewWelfare(request)}
                                >
                                  <Eye size={14} className="mr-1" /> View
                                </Button>
                              </div>
                            </div>
                          ))}
                          {welfareRequests.length > 3 && (
                            <Button
                              variant="link"
                              className="text-purple-400 w-full"
                              onClick={() => setActiveTab("welfare-requests")}
                            >
                              View all requests
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">No pending welfare requests</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader>
                      <CardTitle>Recent Donations</CardTitle>
                      <CardDescription className="text-gray-400">Latest transactions on the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {donations.slice(0, 3).map((donation) => (
                          <div
                            key={donation._id}
                            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium">{donation.transactionId}</h3>
                              <p className="text-sm text-gray-400">To: {donation.to}</p>
                            </div>
                            <div>
                              <p className="font-medium">{donation.amountCrypto}</p>
                              <p className="text-sm text-gray-400">≈ ${donation.amountUSD}</p>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="link"
                          className="text-purple-400 w-full"
                          onClick={() => setActiveTab("donations")}
                        >
                          View all donations
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Welfare Requests */}
            {activeTab === "welfare-requests" && (
              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle>Pending Welfare Requests</CardTitle>
                  <CardDescription className="text-gray-400">
                    Review and approve new welfare organization registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {welfareRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {welfareRequests.map((request) => (
                            <tr key={request._id} className="hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">{request.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{request.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{request.phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{request.address}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent border-gray-600 hover:bg-gray-600"
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
                    <div className="text-center py-10 text-gray-400">
                      <p>No pending welfare requests found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Manage Welfares */}
            {activeTab === "manage-welfares" && (
              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manage Welfares</CardTitle>
                      <CardDescription className="text-gray-400">
                        View and manage all registered welfare organizations
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Search welfares..."
                          className="pl-8 bg-gray-700 border-gray-600 text-white"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="bg-gray-700 border-gray-600">
                            <Filter size={16} className="mr-2" /> Filter
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                          <DropdownMenuItem
                            className="hover:bg-gray-700 cursor-pointer"
                            onClick={() => setFilterStatus("all")}
                          >
                            All
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-gray-700 cursor-pointer"
                            onClick={() => setFilterStatus("active")}
                          >
                            Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-gray-700 cursor-pointer"
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
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Cases
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {filteredWelfares.map((welfare) => (
                            <tr key={welfare._id} className="hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">{welfare.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{welfare.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{welfare.address}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge
                                  className={
                                    welfare.status === "active"
                                      ? "bg-green-900/20 text-green-400 hover:bg-green-900/40"
                                      : "bg-red-900/20 text-red-400 hover:bg-red-900/40"
                                  }
                                >
                                  {welfare.status === "active" ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{welfare.casesCount || 0}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent border-gray-600 hover:bg-gray-600"
                                    onClick={() => handleViewWelfare(welfare)}
                                  >
                                    <Eye size={14} className="mr-1" /> View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent border-gray-600 hover:bg-gray-600"
                                  >
                                    <Edit size={14} className="mr-1" /> Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/40"
                                  >
                                    <Trash2 size={14} className="mr-1" /> Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <p>No welfares found matching your search criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Manage Cases */}
            {activeTab === "manage-cases" && (
  <Card className="bg-gray-800 border-gray-700 text-white">
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Manage Cases</CardTitle>
          <CardDescription className="text-gray-400">
            View and manage all cases across the platform
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search cases..."
              className="pl-8 bg-gray-700 border-gray-600 text-white"
              onChange={(e) => setSearchQuery(e.target.value)} // Handle search input
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-700 border-gray-600">
                <Filter size={16} className="mr-2" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">All Cases</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">Pending</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">Funded</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">Completed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Case Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Welfare
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Goal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Raised
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {cases
              .filter((c) => {
                // Filter by search query if any
                return c.title.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((c) => (
                <tr key={c._id} className="hover:bg-gray-700">
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
                    ${c.raised} ({Math.round((c.raised / c.goal) * 100)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-gray-600 hover:bg-gray-600"
                      >
                        <Eye size={14} className="mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-gray-600 hover:bg-gray-600"
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
)}

            {/* Emergencies Tab */}
            {activeTab === "emergencies" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-semibold">Emergency Reports</h1>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search emergencies..."
                        className="pl-8 bg-gray-700 border-gray-600 text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-gray-700 border-gray-600">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                        <DropdownMenuItem onClick={() => setFilterStatus("all")} className="hover:bg-gray-700">All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("New")} className="hover:bg-gray-700">New</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Assigned")} className="hover:bg-gray-700">Assigned</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("In Progress")} className="hover:bg-gray-700">In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Resolved")} className="hover:bg-gray-700">Resolved</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Closed")} className="hover:bg-gray-700">Closed</DropdownMenuItem>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {emergencies
                      .filter(emergency => 
                        (filterStatus === "all" || emergency.status === filterStatus) &&
                        (emergency.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emergency.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emergency.location.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((emergency) => (
                        <div key={emergency._id} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
                          <div className="relative h-48 bg-gray-700">
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
                                    // Let the fallback div show when image fails to load
                                    console.error(`Failed to load image: ${emergency.images && emergency.images[0]}`);
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <AlertTriangle className="h-12 w-12 text-gray-500" />
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
                                    : "bg-gray-900/60 text-gray-200"
                                }`}
                              >
                                {emergency.status}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-medium text-white mb-1">{emergency.title}</h3>
                            <p className="text-sm text-gray-400 mb-1">Reported by: {emergency.reporter}</p>
                            <p className="text-sm text-gray-400 mb-3">Location: {emergency.location}</p>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-xs text-gray-500">{emergency.reportedOn}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-gray-600 hover:bg-gray-700 text-purple-400"
                                  onClick={() => handleViewEmergency(emergency)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
                    <AlertTriangle className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No emergencies found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">No emergency reports match your current filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* View Emergency Dialog */}
            <Dialog open={viewEmergencyDialogOpen} onOpenChange={setViewEmergencyDialogOpen}>
              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Emergency Details</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Detailed information about the emergency report
                  </DialogDescription>
                </DialogHeader>
                {selectedViewEmergency && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                      <div className="h-60 bg-gray-700 rounded-lg relative mb-4">
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
                            <AlertTriangle className="h-16 w-16 text-gray-500" />
                          </div>
                        )}
                    </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
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
                                : "bg-gray-900/60 text-gray-200"
                            }`}
                          >
                            {selectedViewEmergency.status}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Reported On</h3>
                          <p className="text-white">{selectedViewEmergency.reportedOn}</p>
                        </div>
                    </div>

                      <div className="space-y-3">
                    <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Animal Type</h3>
                          <p className="text-white capitalize">{selectedViewEmergency.animalType}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Condition</h3>
                          <p className="text-white capitalize">{selectedViewEmergency.condition}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Location</h3>
                          <p className="text-white">{selectedViewEmergency.location}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Reported By</h3>
                          <p className="text-white">{selectedViewEmergency.reporter}</p>
                          {selectedViewEmergency.phone && (
                            <p className="text-sm text-gray-400">{selectedViewEmergency.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-white whitespace-pre-line">{selectedViewEmergency.description}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Assigned To</h3>
                        <p className="text-white">
                          {selectedViewEmergency.assignedTo || "Not assigned yet"}
                        </p>
                      </div>

                      <div className="pt-4 flex justify-end gap-2">
                          <Button
                            variant="outline"
                          className="bg-gray-700 border-gray-600 hover:bg-gray-600"
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
          </main>
        </div>
      </div>
    </div>
  )
}
