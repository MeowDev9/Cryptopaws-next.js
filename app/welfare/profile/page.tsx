"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { User, Upload, Facebook, Instagram, Save, ArrowLeft, Loader2, Wallet } from "lucide-react"
import { useDonationContract } from "@/hooks/useDonationContract"
import { ethers } from "ethers"

// Import the Profile interface from the dashboard page
interface Profile {
  name: string
  email: string
  phone: string
  address: string
  description: string
  website: string
  profilePicture?: string
  bio?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
  }
  status?: "pending" | "approved" | "rejected"
  createdAt?: Date
  blockchainAddress?: string
}

interface BlockchainInfo {
  totalDonations: string | null
  uniqueDonors: number | null
  isActive: boolean | null
}

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  description: string
  website: string
  bio: string
  socialLinks: {
    facebook: string
    instagram: string
  }
}

interface Message {
  text: string
  type: string
}

export default function WelfareProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: "",
  })
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: "",
    bio: "",
    socialLinks: { facebook: "", instagram: "" },
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<Message>({ text: "", type: "" })
  const [loading, setLoading] = useState(false)
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(null)
  const { getOrganizationInfo } = useDonationContract()

  // Get token from localStorage (client-side only)
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("welfareToken")
    }
    return null
  }

  // Fetch blockchain info
  const fetchBlockchainInfo = async (address: string) => {
    try {
      const info = await getOrganizationInfo(address)
      setBlockchainInfo({
        totalDonations: info.totalDonations,
        uniqueDonors: info.uniqueDonors || 0,
        isActive: info.isActive || false
      })
    } catch (error) {
      console.error("Error fetching blockchain info:", error)
      setBlockchainInfo({
        totalDonations: "0",
        uniqueDonors: 0,
        isActive: false
      })
    }
  }

  // Fetch latest profile data
  const fetchProfile = async () => {
    const token = getToken()
    if (!token) {
      router.push("/welfare/login")
      return
    }

    try {
      const res = await fetch(`http://localhost:5001/api/welfare/profile?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (res.ok) {
        const welfareData = data.welfare || data
        setProfile(welfareData)
        setFormData({
          name: welfareData.name || "",
          email: welfareData.email || "",
          phone: welfareData.phone || "",
          address: welfareData.address || "",
          description: welfareData.description || "",
          website: welfareData.website || "",
          bio: welfareData.bio || "",
          socialLinks: welfareData.socialLinks || { facebook: "", instagram: "" },
        })

        // Fetch blockchain info if address is available
        if (welfareData.blockchainAddress) {
          fetchBlockchainInfo(welfareData.blockchainAddress)
        }
      } else {
        setMessage({ text: data.message || "Failed to load profile data.", type: "error" })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setMessage({ text: "Failed to load profile data.", type: "error" })
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Handle form input changes
  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle profile update
  const handleUpdateProfile = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    const token = getToken()
    if (!token) {
      router.push("/welfare/login")
      return
    }

    try {
      const res = await fetch("http://localhost:5001/api/welfare/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message || "Profile updated successfully!", type: "success" })
        
        // Check if data.welfare exists, otherwise use data directly
        const welfareData = data.welfare || data
        setProfile(welfareData)
        
        setTimeout(fetchProfile, 500)
      } else {
        setMessage({ text: data.message || "Failed to update profile.", type: "error" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ text: "Failed to update profile.", type: "error" })
    }

    setLoading(false)
  }

  // Handle profile picture selection
  const handleFileChange = (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle profile picture upload
  const handleUploadPicture = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!selectedFile) {
      setMessage({ text: "Please select a file to upload.", type: "error" })
      return
    }

    setLoading(true)
    setMessage({ text: "", type: "" })

    const token = getToken()
    if (!token) {
      router.push("/welfare/login")
      return
    }

    try {
      const imageData = new FormData()
      imageData.append("profilePic", selectedFile)

      const res = await fetch("http://localhost:5001/api/welfare/profile/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: imageData,
      })

      const data = await res.json()

      if (res.ok && data.profilePicture) {
        setMessage({ text: data.message || "Profile picture updated!", type: "success" })
        
        // Check if data.welfare exists, otherwise use data directly
        const welfareData = data.welfare || data
        setProfile(prev => ({ ...prev, profilePicture: welfareData.profilePicture }))
        
        setPreviewUrl(null)
        setSelectedFile(null)
        setTimeout(fetchProfile, 500)
      } else {
        setMessage({ text: data.message || "Failed to upload profile picture.", type: "error" })
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      setMessage({ text: "Failed to upload profile picture.", type: "error" })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm p-4 flex items-center">
        <Link href="/welfare/dashboard" className="mr-4 p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Welfare Profile</h1>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-primary-600 p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="h-32 w-32 rounded-full bg-card flex items-center justify-center overflow-hidden border-4 border-card shadow-lg">
                {profile.profilePicture ? (
                  <Image
                    src={`http://localhost:5001${profile.profilePicture.startsWith('/') ? '' : '/'}${profile.profilePicture}`}
                    alt="Profile"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground" />
                )}
              </div>

              {/* Preview overlay if there's a new image selected */}
              {previewUrl && (
                <div className="absolute inset-0 h-32 w-32 rounded-full overflow-hidden border-4 border-card">
                  <Image src={previewUrl} alt="Preview" fill style={{ objectFit: "cover" }} />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-card">{profile.name || "Organization Name"}</h2>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`p-4 ${message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}
            >
              {message.text}
            </div>
          )}

          {/* Blockchain Information */}
          {profile.blockchainAddress && blockchainInfo && (
            <div className="p-6 border-t border-border">
              <h3 className="text-lg font-medium mb-4 text-foreground flex items-center">
                <Wallet className="h-5 w-5 mr-2" />
                Blockchain Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Wallet Address</h4>
                  <p className="text-foreground break-all">
                    {profile.blockchainAddress}
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Donations</h4>
                  <p className="text-foreground">
                    {blockchainInfo.totalDonations || "0"} ETH
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Unique Donors</h4>
                  <p className="text-foreground">{blockchainInfo.uniqueDonors || 0}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    blockchainInfo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {blockchainInfo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Profile Picture Upload */}
            <div className="mb-8 p-4 border border-dashed rounded-lg border-input">
              <h3 className="text-lg font-medium mb-4 text-foreground">Update Profile Picture</h3>
              <form onSubmit={handleUploadPicture} className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="profile-picture"
                    className="flex items-center justify-center w-full p-3 border border-input rounded-md cursor-pointer hover:bg-muted"
                  >
                    <Upload className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedFile ? selectedFile.name : "Choose a file..."}</span>
                  </label>
                  <input id="profile-picture" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className={`btn ${!selectedFile ? "bg-muted cursor-not-allowed" : "bg-primary hover:bg-primary-600 text-primary-foreground"} flex items-center px-4 py-2 rounded-md`}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Upload
                </button>
              </form>
            </div>

            {/* Profile Update Form */}
            <h3 className="text-lg font-medium mb-4 text-foreground">Profile Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Organization Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-md font-medium mb-4 text-foreground">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-foreground mb-1">
                      <Facebook className="h-4 w-4 mr-2 text-primary-600" />
                      Facebook
                    </label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.socialLinks.facebook}
                      onChange={handleChange}
                      className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-foreground mb-1">
                      <Instagram className="h-4 w-4 mr-2 text-secondary-600" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleChange}
                      className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-md flex items-center"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

