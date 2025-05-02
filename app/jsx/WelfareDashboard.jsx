"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Home, PieChart, FileText, Users, Settings, LogOut, Plus, Edit, Trash2, ChevronDown, User } from "lucide-react"

// Mock data for charts
const donationData = [
  { month: "Jan", amount: 4000 },
  { month: "Feb", amount: 3000 },
  { month: "Mar", amount: 2000 },
  { month: "Apr", amount: 2780 },
  { month: "May", amount: 1890 },
  { month: "Jun", amount: 2390 },
]

const caseData = [
  { name: "Shelter Renovation", donations: 12 },
  { name: "Medical Treatment", donations: 19 },
  { name: "Food Supply", donations: 5 },
  { name: "Rescue Operation", donations: 8 },
]

const WelfareDashboard = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({})
  const [activeTab, setActiveTab] = useState("dashboard")
  const [cases, setCases] = useState([])
  const [showAddCase, setShowAddCase] = useState(false)
  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    targetAmount: "",
    imageUrl: "",
  })
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  const token = localStorage.getItem("welfareToken")

  useEffect(() => {
    // Fetch profile data
    fetch("http://localhost:5001/api/welfare/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Profile Data:", data)
        setProfile(data)
      })
      .catch((err) => console.error("Error fetching profile:", err))

    // Fetch cases data
    fetch("http://localhost:5001/api/welfare/cases", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Cases Data:", data)
        setCases(data || [])
      })
      .catch((err) => console.error("Error fetching cases:", err))
  }, [token])

  const handleAddCase = (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("title", newCase.title)
    formData.append("description", newCase.description)
    formData.append("targetAmount", newCase.targetAmount)
    if (newCase.image) {
      formData.append("image", newCase.image)
    }

    // Debugging: Log the FormData values
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1])
    }

    fetch("http://localhost:5001/api/welfare/cases", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // DO NOT add 'Content-Type': 'application/json' for FormData
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Added new case:", data)
        setCases([...cases, data]) // Update UI
        setShowAddCase(false)
        setNewCase({
          title: "",
          description: "",
          targetAmount: "",
          image: null, // Reset file input
        })
      })
      .catch((err) => console.error("Error adding case:", err))
  }

  const handleDeleteCase = async (id) => {
    const token = localStorage.getItem("welfareToken")

    try {
      const response = await fetch(`http://localhost:5001/api/welfare/cases/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      console.log("Delete Response:", result)

      if (response.ok) {
        setCases(cases.filter((c) => c._id !== id)) // Remove from UI
      } else {
        console.error("Failed to delete case:", result.message)
      }
    } catch (error) {
      console.error("Error deleting case:", error)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
        <div className="p-4 flex items-center justify-between border-b">
          {isSidebarOpen && <h2 className="text-xl font-bold text-primary">CryptoPaws</h2>}
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100">
            <ChevronDown className={`h-5 w-5 transition-transform ${isSidebarOpen ? "rotate-0" : "rotate-180"}`} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              {profile.profilePicture ? (
                <img
                  src={`http://localhost:5001${profile.profilePicture}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="font-medium">{profile.organizationName || "Welfare Name"}</p>
                <p className="text-xs text-gray-500">Welfare Trust</p>
              </div>
            )}
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "dashboard" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            >
              <Home className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab("cases")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "cases" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            >
              <FileText className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Donation Cases</span>}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "analytics" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            >
              <PieChart className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Analytics</span>}
            </button>

            <button
              onClick={() => setActiveTab("donors")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "donors" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            >
              <Users className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Donors</span>}
            </button>

            <button
              onClick={() => navigate("/welfare/profile")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "profile" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            >
              <Settings className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Profile Settings</span>}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("welfareToken")
                navigate("/welfare/login")
              }}
              className="flex items-center w-full p-2 rounded-md text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "cases" && "Donation Cases"}
            {activeTab === "analytics" && "Analytics"}
            {activeTab === "donors" && "Donors"}
            {activeTab === "profile" && "Profile Settings"}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome, {profile.organizationName || "User"}</span>
          </div>
        </header>

        <main className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Total Donations</h3>
                  <p className="text-3xl font-bold">$12,345</p>
                  <p className="text-green-500 text-sm mt-2">+12% from last month</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Active Cases</h3>
                  <p className="text-3xl font-bold">{cases.length || 0}</p>
                  <p className="text-green-500 text-sm mt-2">+3 new this month</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Total Donors</h3>
                  <p className="text-3xl font-bold">87</p>
                  <p className="text-green-500 text-sm mt-2">+5 new this month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Donation Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={donationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Case Performance</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={caseData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="donations" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Recent Donations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Donor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Case
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                        <td className="px-6 py-4 whitespace-nowrap">Shelter Renovation</td>
                        <td className="px-6 py-4 whitespace-nowrap">$250</td>
                        <td className="px-6 py-4 whitespace-nowrap">2023-06-15</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                        <td className="px-6 py-4 whitespace-nowrap">Medical Treatment</td>
                        <td className="px-6 py-4 whitespace-nowrap">$100</td>
                        <td className="px-6 py-4 whitespace-nowrap">2023-06-14</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Bob Johnson</td>
                        <td className="px-6 py-4 whitespace-nowrap">Food Supply</td>
                        <td className="px-6 py-4 whitespace-nowrap">$75</td>
                        <td className="px-6 py-4 whitespace-nowrap">2023-06-12</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === "cases" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Donation Cases</h2>
                <button
                  onClick={() => setShowAddCase(true)}
                  className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add New Case
                </button>
              </div>

              {showAddCase && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Add New Donation Case</h3>
                  <form onSubmit={handleAddCase} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={newCase.title}
                        onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newCase.description}
                        onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="4"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($)</label>
                      <input
                        type="number"
                        value={newCase.targetAmount}
                        onChange={(e) => setNewCase({ ...newCase, targetAmount: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={(e) => setNewCase({ ...newCase, image: e.target.files[0] })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddCase(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                        Save Case
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.length > 0 ? (
                  cases.map((c) => (
                    <div key={c._id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="h-48 bg-gray-200">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl ? `http://localhost:5001/uploads/${c.imageUrl}` : "/placeholder.svg"}
                            alt={c.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{c.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-primary font-medium">${c.targetAmount}</span>
                          <div className="flex space-x-2">
                            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCase(c._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">No donation cases found. Create your first case!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Analytics</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Monthly Donations</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={donationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Case Performance</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={caseData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="donations" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Donation Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-gray-500 mb-1">Average Donation</h4>
                    <p className="text-2xl font-bold">$85.50</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-gray-500 mb-1">Largest Donation</h4>
                    <p className="text-2xl font-bold">$500.00</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-gray-500 mb-1">Recurring Donors</h4>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Donors Tab */}
          {activeTab === "donors" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Donors</h2>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">All Donors</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search donors..."
                        className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Donated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Donation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">John Doe</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">john@example.com</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">$750</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">2023-06-15</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">jane@example.com</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">$350</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">2023-06-10</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Bob Johnson</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">bob@example.com</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">$125</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">2023-05-28</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Inactive
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default WelfareDashboard

