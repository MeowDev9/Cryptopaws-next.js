"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ClipboardList,
  UserCircle,
  Clock,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Activity,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Case {
  _id: string
  title: string
  description: string
  status: string
  isUrgent?: boolean
  medicalIssue?: string
  costBreakdown?:
    | { surgery: string; medicine: string; recovery: string; other: string }
    | { item: string; cost: number }[]
  imageUrl?: string[]
}

interface DoctorProfile {
  _id: string
  name: string
  email: string
  specialization: string
}

interface DonorObj {
  _id?: string;
  name: string;
  email: string;
}

interface Donation {
  _id: string;
  donor: string | DonorObj;
  donorEmail?: string;
  amount: number;
  amountUsd: number;
  transactionHash?: string;
  date: string;

}

interface CaseUpdate {
  _id: string;
  title: string;
  content: string;
  authorRole: string;
  postedBy: { name: string };
  spent: { surgery: number; medicine: number; recovery: number; other: number; total: number };
  animalStatus?: string;
  createdAt: string;
}

// Type guard for donor
function isDonorObj(donor: unknown): donor is DonorObj {
  return typeof donor === 'object' && donor !== null && 'name' in donor && 'email' in donor;
}
// Helper to check if date is valid
function isValidDate(date: string | number | Date): boolean {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<"cases" | "profile" | "history">("cases")
  const [cases, setCases] = useState<Case[]>([])
  const [history, setHistory] = useState<Case[]>([])
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [editProfile, setEditProfile] = useState<DoctorProfile | null>(null)
  const [profilePassword, setProfilePassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [profileMsg, setProfileMsg] = useState("")
  const [viewModal, setViewModal] = useState<Case | null>(null)
  const [editModal, setEditModal] = useState<Case | null>(null)
  // Donations & updates state
  const [donations, setDonations] = useState<Donation[]>([])
  const [donationsLoading, setDonationsLoading] = useState(false)
  const [donationsError, setDonationsError] = useState("")
  const [updates, setUpdates] = useState<CaseUpdate[]>([])
  const [updatesLoading, setUpdatesLoading] = useState(false)
  const [updatesError, setUpdatesError] = useState("")
  const [showDonations, setShowDonations] = useState(false)
  const [showUpdates, setShowUpdates] = useState(false)
  const [showAddUpdate, setShowAddUpdate] = useState(false)
  // Add update form
  const [updateTitle, setUpdateTitle] = useState("")
  const [updateContent, setUpdateContent] = useState("")
  const [updateAnimalStatus, setUpdateAnimalStatus] = useState("")
  const [updateSpent, setUpdateSpent] = useState({ surgery: "", medicine: "", recovery: "", other: "" })
  const [addUpdateMsg, setAddUpdateMsg] = useState("")

  // Fetch donations for a case
  const fetchDonations = async (caseId: string) => {
    setDonationsLoading(true)
    setDonationsError("")
    const token = localStorage.getItem("doctorToken")
    try {
      const res = await fetch(`http://localhost:5001/api/donations/case/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch donations")
      const data = await res.json()
      setDonations(data.donations)
    } catch (e) {
      setDonationsError("Could not fetch donations for this case.")
    } finally {
      setDonationsLoading(false)
    }
  }

  // Fetch updates for a case
  const fetchUpdates = async (caseId: string) => {
    setUpdatesLoading(true)
    setUpdatesError("")
    const token = localStorage.getItem("doctorToken")
    try {
      const res = await fetch(`http://localhost:5001/api/case-updates/${caseId}`)
      if (!res.ok) throw new Error("Failed to fetch updates")
      const data = await res.json()
      setUpdates(data.updates)
    } catch (e) {
      setUpdatesError("Could not fetch updates for this case.")
    } finally {
      setUpdatesLoading(false)
    }
  }

  // Submit a new update for a case
  const submitUpdate = async (caseId: string) => {
    setAddUpdateMsg("")
    const token = localStorage.getItem("doctorToken")
    try {
      const spent = {
        surgery: Number.parseFloat(updateSpent.surgery) || 0,
        medicine: Number.parseFloat(updateSpent.medicine) || 0,
        recovery: Number.parseFloat(updateSpent.recovery) || 0,
        other: Number.parseFloat(updateSpent.other) || 0,
        total:
          (Number.parseFloat(updateSpent.surgery) || 0) +
          (Number.parseFloat(updateSpent.medicine) || 0) +
          (Number.parseFloat(updateSpent.recovery) || 0) +
          (Number.parseFloat(updateSpent.other) || 0),
      }
      const formData = new FormData();
      formData.append('caseId', caseId);
      formData.append('title', updateTitle);
      formData.append('content', updateContent);
      formData.append('animalStatus', updateAnimalStatus);
      formData.append('spent[surgery]', spent.surgery.toString());
      formData.append('spent[medicine]', spent.medicine.toString());
      formData.append('spent[recovery]', spent.recovery.toString());
      formData.append('spent[other]', spent.other.toString());
      formData.append('spent[total]', spent.total.toString());
      if (updateImages && updateImages.length > 0) {
        updateImages.forEach((file) => {
          formData.append('images', file);
        });
      }
      const res = await fetch("http://localhost:5001/api/case-updates", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // let browser set Content-Type
        body: formData,
      })
      if (!res.ok) throw new Error("Failed to submit update")
      setAddUpdateMsg("Update submitted successfully!")
      setUpdateTitle("")
      setUpdateContent("")
      setUpdateAnimalStatus("")
      setUpdateSpent({ surgery: "", medicine: "", recovery: "", other: "" })
      fetchUpdates(caseId)
    } catch (e) {
      setAddUpdateMsg("Failed to submit update.")
    }
  }
  const [editDiagnosis, setEditDiagnosis] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)
  const [editCost, setEditCost] = useState<{ surgery: string; medicine: string; recovery: string; other: string }>({
    surgery: "",
    medicine: "",
    recovery: "",
    other: "",
  })
  const [editMsg, setEditMsg] = useState("")

  // For image uploads in updates
  const [updateImages, setUpdateImages] = useState<File[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("doctorToken")
    if (!token) {
      router.push("/login")
      return
    }
    setLoading(true)
    // Fetch assigned cases
    fetch("http://localhost:5001/api/doctor/cases", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch cases")))
      .then((data) => {
        setCases(data.filter((c: Case) => c.status !== "completed" && c.status !== "closed"))
        setHistory(data.filter((c: Case) => c.status === "completed" || c.status === "closed"))
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to fetch cases")
        setLoading(false)
      })
    // Fetch profile
    fetch("http://localhost:5001/api/doctor/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch profile")))
      .then((data) => {
        setProfile(data)
        setEditProfile(data)
      })
      .catch(() => setError("Failed to fetch profile"))
  }, [router])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editProfile) return
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value })
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg("")
    const token = localStorage.getItem("doctorToken")
    if (!token || !editProfile) return
    const body: any = { ...editProfile }
    if (profilePassword) body.password = profilePassword
    const res = await fetch("http://localhost:5001/api/doctor/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const data = await res.json()
      setProfile(data.doctor)
      setProfileMsg("Profile updated successfully!")
      setProfilePassword("")
    } else {
      setProfileMsg("Failed to update profile.")
    }
  }

  // Helper to parse cost breakdown
  function parseCostBreakdown(cb: any): { surgery: string; medicine: string; recovery: string; other: string } {
    if (Array.isArray(cb)) {
      // [{item, cost}] format
      const map: any = {}
      cb.forEach((c: any) => {
        map[c.item?.toLowerCase()] = c.cost?.toString() || ""
      })
      return {
        surgery: map.surgery || "",
        medicine: map.medicine || "",
        recovery: map.recovery || "",
        other: map.other || "",
      }
    }
    return cb || { surgery: "", medicine: "", recovery: "", other: "" }
  }

  // Open edit modal and prefill fields
  const handleEditCase = (caseItem: Case) => {
    setEditModal(caseItem)
    setEditDiagnosis(caseItem.medicalIssue || "")
    setEditStatus(caseItem.status || "")
    setIsUrgent(caseItem.isUrgent || false)
    setEditCost(parseCostBreakdown(caseItem.costBreakdown))
    setEditMsg("")
  }

  // Handle edit form submit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal) return
    setEditMsg("")
    const token = localStorage.getItem("doctorToken")
    if (!token) return
    // Prepare cost breakdown as array
    const costBreakdown = [
      { item: "Surgery", cost: Number.parseFloat(editCost.surgery) || 0 },
      { item: "Medicine", cost: Number.parseFloat(editCost.medicine) || 0 },
      { item: "Recovery", cost: Number.parseFloat(editCost.recovery) || 0 },
      { item: "Other", cost: Number.parseFloat(editCost.other) || 0 },
    ]
    const res = await fetch(`http://localhost:5001/api/doctor/cases/${editModal._id}/diagnosis`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        medicalIssue: editDiagnosis,
        costBreakdown,
        status: editStatus,
        isUrgent: isUrgent,
      }),
    })
    if (res.ok) {
      setEditMsg("Case updated successfully!")
      // Refresh cases
      fetch("http://localhost:5001/api/doctor/cases", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch cases")))
        .then((data) => {
          setCases(data.filter((c: Case) => c.status !== "completed" && c.status !== "closed"))
          setHistory(data.filter((c: Case) => c.status === "completed" || c.status === "closed"))
        })
      setTimeout(() => setEditModal(null), 1200)
    } else {
      // Log the error details for debugging
      console.error("Error updating case:");
      try {
        // Try to parse as JSON first
        const errorData = await res.json();
        console.error(errorData);
        setEditMsg(`Failed to update case: ${errorData.message || 'Unknown error'}`);
      } catch (jsonError) {
        // If not JSON, get the text response
        const textError = await res.text();
        console.error("Server returned non-JSON response:", textError);
        setEditMsg(`Failed to update case: Server error (${res.status})`);
      }
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-900/30 text-blue-400 border-blue-800/50"
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-800/50"
      case "completed":
        return "bg-green-900/30 text-green-400 border-green-800/50"
      case "closed":
        return "bg-gray-900/30 text-gray-400 border-gray-800/50"
      default:
        return "bg-purple-900/30 text-purple-400 border-purple-800/50"
    }
  }

  // Calculate total cost
  const calculateTotalCost = (costBreakdown: any) => {
    if (Array.isArray(costBreakdown)) {
      return costBreakdown.reduce((sum, item) => sum + (Number.parseFloat(item.cost) || 0), 0)
    } else if (costBreakdown) {
      return (
        Number.parseFloat(costBreakdown.surgery || "0") +
        Number.parseFloat(costBreakdown.medicine || "0") +
        Number.parseFloat(costBreakdown.recovery || "0") +
        Number.parseFloat(costBreakdown.other || "0")
      )
    }
    return 0
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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background gradient blurs */}
      <div className="fixed top-0 left-0 right-0 bottom-0 z-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto p-6">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Doctor Dashboard
              </h1>
              {profile && (
                <p className="text-gray-400 mt-1">
                  Welcome back, Dr. {profile.name} | {profile.specialization}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50"
                onClick={() => router.push("/")}
              >
                Home
              </Button>
              <Button
                variant="destructive"
                className="bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/50"
                onClick={() => {
                  localStorage.removeItem("doctorToken")
                  router.push("/login")
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        <Tabs defaultValue="cases" className="w-full" onValueChange={(value) => setTab(value as any)}>
          <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <TabsTrigger value="cases" className="data-[state=active]:bg-purple-900/50">
              <ClipboardList className="w-4 h-4 mr-2" />
              Active Cases
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-900/50">
              <Clock className="w-4 h-4 mr-2" />
              Case History
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-900/50">
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 p-4 rounded-lg mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <TabsContent value="cases" className="focus-visible:outline-none focus-visible:ring-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
                <ClipboardList className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No Active Cases</h3>
                <p className="text-gray-400">You don't have any active cases assigned to you at the moment.</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {cases.map((caseItem) => (
                  <motion.div key={caseItem._id} variants={itemVariants}>
                    <Card className="h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-semibold text-white">{caseItem.title}</CardTitle>
                          <Badge className={getStatusColor(caseItem.status)}>{caseItem.status}</Badge>
                        </div>
                        <CardDescription className="text-gray-400 line-clamp-2">{caseItem.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {caseItem.medicalIssue && (
                          <div className="flex items-start space-x-2">
                            <Activity className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-300">Medical Issue</p>
                              <p className="text-sm text-gray-400">{caseItem.medicalIssue}</p>
                            </div>
                          </div>
                        )}

                        {caseItem.costBreakdown && (
                          <div className="flex items-start space-x-2">
                            <DollarSign className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-300">
                                Total Cost: ${calculateTotalCost(caseItem.costBreakdown).toFixed(2)}
                              </p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                {Array.isArray(caseItem.costBreakdown) ? (
                                  caseItem.costBreakdown.map((c: any, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-400">
                                      {c.item}: ${Number.parseFloat(c.cost).toFixed(2)}
                                    </p>
                                  ))
                                ) : (
                                  <>
                                    {Number.parseFloat(caseItem.costBreakdown.surgery) > 0 && (
                                      <p className="text-xs text-gray-400">
                                        Surgery: ${Number.parseFloat(caseItem.costBreakdown.surgery).toFixed(2)}
                                      </p>
                                    )}
                                    {Number.parseFloat(caseItem.costBreakdown.medicine) > 0 && (
                                      <p className="text-xs text-gray-400">
                                        Medicine: ${Number.parseFloat(caseItem.costBreakdown.medicine).toFixed(2)}
                                      </p>
                                    )}
                                    {Number.parseFloat(caseItem.costBreakdown.recovery) > 0 && (
                                      <p className="text-xs text-gray-400">
                                        Recovery: ${Number.parseFloat(caseItem.costBreakdown.recovery).toFixed(2)}
                                      </p>
                                    )}
                                    {Number.parseFloat(caseItem.costBreakdown.other) > 0 && (
                                      <p className="text-xs text-gray-400">
                                        Other: ${Number.parseFloat(caseItem.costBreakdown.other).toFixed(2)}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {caseItem.imageUrl && caseItem.imageUrl.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {caseItem.imageUrl.slice(0, 3).map((img, idx) => (
                              <div
                                key={idx}
                                className="relative w-20 h-20 rounded-md overflow-hidden border border-slate-700/50"
                              >
                                <Image
                                  src={`http://localhost:5001/${img}`}
                                  alt="Case"
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).style.display = "none"
                                  }}
                                />
                              </div>
                            ))}
                            {caseItem.imageUrl.length > 3 && (
                              <div className="relative w-20 h-20 rounded-md overflow-hidden border border-slate-700/50 flex items-center justify-center bg-slate-700/50">
                                <span className="text-sm font-medium text-white">+{caseItem.imageUrl.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50"
                          onClick={() => setViewModal(caseItem)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-800/50 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40"
                          onClick={() => handleEditCase(caseItem)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-800/50 bg-green-900/20 text-green-400 hover:bg-green-900/40"
                          onClick={() => {
                            fetchDonations(caseItem._id)
                            setShowDonations(true)
                          }}
                        >
                          <DollarSign className="w-4 h-4 mr-2" /> Donations
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-800/50 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40"
                          onClick={() => {
                            fetchUpdates(caseItem._id)
                            setShowUpdates(true)
                          }}
                        >
                          <ClipboardList className="w-4 h-4 mr-2" /> Updates
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-pink-800/50 bg-pink-900/20 text-pink-400 hover:bg-pink-900/40"
                          onClick={() => {
                            setViewModal(caseItem)
                            setShowAddUpdate(true)
                            setUpdateTitle("")
                            setUpdateContent("")
                            setUpdateAnimalStatus("")
                            setUpdateSpent({ surgery: "", medicine: "", recovery: "", other: "" })
                            setAddUpdateMsg("")
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Add Update
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="history" className="focus-visible:outline-none focus-visible:ring-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
                <Clock className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No Case History</h3>
                <p className="text-gray-400">You don't have any completed or closed cases yet.</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {history.map((caseItem) => (
                  <motion.div key={caseItem._id} variants={itemVariants}>
                    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-semibold text-white">{caseItem.title}</CardTitle>
                          <Badge className={getStatusColor(caseItem.status)}>{caseItem.status}</Badge>
                        </div>
                        <CardDescription className="text-gray-400 line-clamp-2">{caseItem.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {caseItem.medicalIssue && (
                          <div className="flex items-start space-x-2">
                            <Activity className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-300">Medical Issue</p>
                              <p className="text-sm text-gray-400">{caseItem.medicalIssue}</p>
                            </div>
                          </div>
                        )}

                        {caseItem.costBreakdown && (
                          <div className="flex items-start space-x-2">
                            <DollarSign className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-300">
                                Total Cost: ${calculateTotalCost(caseItem.costBreakdown).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50"
                          onClick={() => setViewModal(caseItem)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="focus-visible:outline-none focus-visible:ring-0">
            {profile && editProfile ? (
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                      Doctor Profile
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your personal information and credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300" htmlFor="name">
                              Full Name
                            </label>
                            <Input
                              id="name"
                              name="name"
                              value={editProfile.name}
                              onChange={handleProfileChange}
                              className="bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300" htmlFor="email">
                              Email Address
                            </label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={editProfile.email}
                              onChange={handleProfileChange}
                              className="bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300" htmlFor="specialization">
                            Specialization
                          </label>
                          <Input
                            id="specialization"
                            name="specialization"
                            value={editProfile.specialization}
                            onChange={handleProfileChange}
                            className="bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300" htmlFor="password">
                            Password
                          </label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={profilePassword}
                            onChange={(e) => setProfilePassword(e.target.value)}
                            className="bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                            placeholder="Leave blank to keep current password"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Save Changes
                        </Button>
                      </div>

                      {profileMsg && (
                        <div className="bg-green-900/30 border border-green-800/50 text-green-400 p-4 rounded-lg flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {profileMsg}
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Case Modal */}
      <Dialog open={viewModal !== null} onOpenChange={(open) => !open && setViewModal(null)}>
        <DialogContent className="bg-slate-800 border-slate-700/50 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              {viewModal?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">Detailed information about this case</DialogDescription>
          </DialogHeader>

          {viewModal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                  <p className="text-white bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
                    {viewModal.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                  <Badge className={`${getStatusColor(viewModal.status)} text-sm px-3 py-1`}>{viewModal.status}</Badge>
                </div>

                {viewModal.medicalIssue && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Medical Issue</h3>
                    <p className="text-white bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
                      {viewModal.medicalIssue}
                    </p>
                  </div>
                )}

                {viewModal.costBreakdown && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Cost Breakdown</h3>
                    <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Total Cost:</span>
                        <span className="text-lg font-semibold text-green-400">
                          ${calculateTotalCost(viewModal.costBreakdown).toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {Array.isArray(viewModal.costBreakdown) ? (
                          viewModal.costBreakdown.map((c: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-gray-400">{c.item}:</span>
                              <span className="text-white">${Number.parseFloat(c.cost).toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            {Number.parseFloat(viewModal.costBreakdown.surgery) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Surgery:</span>
                                <span className="text-white">
                                  ${Number.parseFloat(viewModal.costBreakdown.surgery).toFixed(2)}
                                </span>
                              </div>
                            )}
                            {Number.parseFloat(viewModal.costBreakdown.medicine) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Medicine:</span>
                                <span className="text-white">
                                  ${Number.parseFloat(viewModal.costBreakdown.medicine).toFixed(2)}
                                </span>
                              </div>
                            )}
                            {Number.parseFloat(viewModal.costBreakdown.recovery) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Recovery:</span>
                                <span className="text-white">
                                  ${Number.parseFloat(viewModal.costBreakdown.recovery).toFixed(2)}
                                </span>
                              </div>
                            )}
                            {Number.parseFloat(viewModal.costBreakdown.other) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Other:</span>
                                <span className="text-white">
                                  ${Number.parseFloat(viewModal.costBreakdown.other).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {viewModal.imageUrl && viewModal.imageUrl.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Case Images</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {viewModal.imageUrl.map((img, idx) => {
                        // Skip invalid image paths
                        if (!img || typeof img !== 'string') {
                          console.error('Invalid image path:', img);
                          return null;
                        }
                        
                        // Construct URL safely
                        let imageUrl;
                        try {
                          imageUrl = `http://localhost:5001${img.startsWith('/') ? '' : '/'}${img}`;
                        } catch (error) {
                          console.error('Error constructing image URL:', error);
                          return null;
                        }
                        
                        return (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-md overflow-hidden border border-slate-600/50"
                          >
                            <Image
                              src={imageUrl}
                              alt={`Case image ${idx + 1}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                console.error(`Failed to load image: ${imageUrl}`);
                                ;(e.target as HTMLImageElement).style.display = "none"
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-slate-700/30 rounded-md border border-slate-600/50 p-6">
                    <FileText className="w-12 h-12 text-gray-500 mb-2" />
                    <p className="text-gray-400 text-center">No images available for this case</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50"
              onClick={() => setViewModal(null)}
            >
              Close
            </Button>
            {viewModal && viewModal.status !== "completed" && viewModal.status !== "closed" && (
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => {
                  setViewModal(null)
                  handleEditCase(viewModal)
                }}
              >
                <Edit className="w-4 h-4 mr-2" /> Update Case
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Case Modal */}
      <Dialog open={editModal !== null} onOpenChange={(open) => !open && setEditModal(null)}>
        <DialogContent className="bg-slate-800 border-slate-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Update Case Diagnosis
            </DialogTitle>
            <DialogDescription className="text-gray-400">{editModal?.title}</DialogDescription>
          </DialogHeader>

          {editModal && (
            <form onSubmit={handleEditSave} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300" htmlFor="diagnosis">
                    Diagnosis / Medical Issue
                  </label>
                  <Input
                    id="diagnosis"
                    value={editDiagnosis}
                    onChange={(e) => setEditDiagnosis(e.target.value)}
                    className="bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300" htmlFor="status">
                    Status
                  </label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isUrgent"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-600"
                    />
                    <label htmlFor="isUrgent" className="ml-2 text-sm font-medium text-gray-300">
                      Mark as Urgent Case
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Cost Breakdown</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="surgery">
                        Surgery
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          id="surgery"
                          type="number"

                          min="0"
                          value={editCost.surgery}
                          onChange={(e) => setEditCost({ ...editCost, surgery: e.target.value })}
                          className="pl-8 bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="medicine">
                        Medicine
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          id="medicine"
                          type="number"

                          min="0"
                          value={editCost.medicine}
                          onChange={(e) => setEditCost({ ...editCost, medicine: e.target.value })}
                          className="pl-8 bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="recovery">
                        Recovery
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          id="recovery"
                          type="number"

                          min="0"
                          value={editCost.recovery}
                          onChange={(e) => setEditCost({ ...editCost, recovery: e.target.value })}
                          className="pl-8 bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400" htmlFor="other">
                        Other
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          id="other"
                          type="number"

                          min="0"
                          value={editCost.other}
                          onChange={(e) => setEditCost({ ...editCost, other: e.target.value })}
                          className="pl-8 bg-slate-700/50 border-slate-600/50 focus:border-purple-500/50 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center bg-slate-700/30 p-2 rounded-md">
                    <span className="text-sm text-gray-300">Total Cost:</span>
                    <span className="text-lg font-semibold text-green-400">
                      $
                      {(
                        Number.parseFloat(editCost.surgery || "0") +
                        Number.parseFloat(editCost.medicine || "0") +
                        Number.parseFloat(editCost.recovery || "0") +
                        Number.parseFloat(editCost.other || "0")
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {editMsg && (
                <div
                  className={`p-3 rounded-md ${
                    editMsg.includes("success")
                      ? "bg-green-900/30 border border-green-800/50 text-green-400"
                      : "bg-red-900/30 border border-red-800/50 text-red-400"
                  } flex items-center`}
                >
                  {editMsg.includes("success") ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  {editMsg}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50"
                  onClick={() => setEditModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Donations Modal */}
      <Dialog open={showDonations} onOpenChange={setShowDonations}>
        <DialogContent className="bg-slate-800 border-slate-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Donations</DialogTitle>
            <DialogDescription>All confirmed donations for this case</DialogDescription>
          </DialogHeader>
          {donationsLoading ? (
            <div className="text-center py-6">Loading donations...</div>
          ) : donationsError ? (
            <div className="text-red-400">{donationsError}</div>
          ) : donations.length === 0 ? (
            <div className="text-gray-400">No donations for this case yet.</div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {donations.map((d) => (
                <div key={d._id} className="flex flex-col border-b border-slate-700/50 pb-2 mb-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-green-400">${Number(d.amount).toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{isValidDate(d.date) ? new Date(d.date).toLocaleString() : "Date unavailable"}</span>
                  </div>
                  <div className="text-xs text-gray-200">
  Donor: {isDonorObj(d.donor) ? d.donor.name : d.donor || "Anonymous"}
  ({isDonorObj(d.donor) ? d.donor.email : d.donorEmail || "N/A"})
</div>
                  {d.transactionHash && <div className="text-xs text-gray-500">Tx: {d.transactionHash}</div>}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDonations(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Updates Modal */}
      <Dialog open={showUpdates} onOpenChange={setShowUpdates}>
        <DialogContent className="bg-slate-800 border-slate-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Case Updates</DialogTitle>
            <DialogDescription>All updates for this case</DialogDescription>
          </DialogHeader>
          {updatesLoading ? (
            <div className="text-center py-6">Loading updates...</div>
          ) : updatesError ? (
            <div className="text-red-400">{updatesError}</div>
          ) : updates.length === 0 ? (
            <div className="text-gray-400">No updates for this case yet.</div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {updates.map((u) => (
                <div key={u._id} className="flex flex-col border-b border-slate-700/50 pb-2 mb-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-400">{u.title}</span>
                    <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-200">By: {u.postedBy?.name || u.authorRole}</div>
                  <div className="text-sm text-gray-300 mt-1">{u.content}</div>
                  {u.animalStatus && <div className="text-xs text-gray-400 mt-1">Animal Status: {u.animalStatus}</div>}
                  {u.spent && (u.spent.surgery > 0 || u.spent.medicine > 0 || u.spent.recovery > 0 || u.spent.other > 0) && (
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="font-semibold text-gray-300">Spent:</span>
                      {u.spent.surgery > 0 && ` Surgery: $${u.spent.surgery}`}
                      {u.spent.medicine > 0 && ` Medicine: $${u.spent.medicine}`}
                      {u.spent.recovery > 0 && ` Recovery: $${u.spent.recovery}`}
                      {u.spent.other > 0 && ` Other: $${u.spent.other}`}
                      {u.spent.total > 0 && ` (Total: $${u.spent.total})`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUpdates(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Update Modal */}
      <Dialog open={showAddUpdate} onOpenChange={setShowAddUpdate}>
        <DialogContent className="bg-slate-800 border-slate-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Case Update</DialogTitle>
            <DialogDescription>Submit an update for this case</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!viewModal) return
              const formData = new FormData()
              formData.append('title', updateTitle)
              formData.append('content', updateContent)
              formData.append('animalStatus', updateAnimalStatus)
              formData.append('surgerySpent', updateSpent.surgery)
              formData.append('medicineSpent', updateSpent.medicine)
              formData.append('recoverySpent', updateSpent.recovery)
              formData.append('otherSpent', updateSpent.other)
              for (const image of updateImages) {
                formData.append('images', image)
              }
              await submitUpdate(viewModal._id, formData)
            }}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setUpdateImages(Array.from(e.target.files || []))}
              className="block w-full text-sm text-gray-200 bg-slate-700/50 border border-slate-600/50 rounded-md p-2 mb-2"
            />
            <Input
              placeholder="Title"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 text-white"
              required
            />
            <textarea
              placeholder="Update content"
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-md p-2 min-h-[80px]"
              required
            />
            <Input
              placeholder="Animal Status (optional)"
              value={updateAnimalStatus}
              onChange={(e) => setUpdateAnimalStatus(e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Surgery Spent"
                type="number"
                min="0"
                value={updateSpent.surgery}
                onChange={(e) => setUpdateSpent({ ...updateSpent, surgery: e.target.value })}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
              <Input
                placeholder="Medicine Spent"
                type="number"
                min="0"
                value={updateSpent.medicine}
                onChange={(e) => setUpdateSpent({ ...updateSpent, medicine: e.target.value })}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
              <Input
                placeholder="Recovery Spent"
                type="number"
                min="0"
                value={updateSpent.recovery}
                onChange={(e) => setUpdateSpent({ ...updateSpent, recovery: e.target.value })}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
              <Input
                placeholder="Other Spent"
                type="number"
                min="0"
                value={updateSpent.other}
                onChange={(e) => setUpdateSpent({ ...updateSpent, other: e.target.value })}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            {addUpdateMsg && <div className="text-center text-sm text-green-400">{addUpdateMsg}</div>}
            <DialogFooter>
              <Button type="submit">Submit Update</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddUpdate(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
