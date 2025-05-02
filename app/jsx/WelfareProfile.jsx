"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { User, Upload, Facebook, Instagram, Save, ArrowLeft, Loader2 } from "lucide-react"

const WelfareProfile = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("welfareToken")

  const [profile, setProfile] = useState({})
  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    bio: "",
    phone: "",
    address: "",
    website: "",
    socialLinks: { facebook: "", instagram: "" },
  })

  const [profilePic, setProfilePic] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [loading, setLoading] = useState(false)

  // Fetch latest profile data
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/welfare/profile?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (res.ok) {
        setProfile(data)
        setFormData({
          organizationName: data.organizationName || "",
          email: data.email || "",
          bio: data.bio || "",
          phone: data.phone || "",
          address: data.address || "",
          website: data.website || "",
          socialLinks: data.socialLinks || { facebook: "", instagram: "" },
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setMessage({ text: "Failed to load profile data.", type: "error" })
    }
  }, [token])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

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
        // Update state
        setProfile((prev) => ({
          ...prev,
          ...formData,
        }))

        // Force refresh latest profile data from backend
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
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePic(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle profile picture upload
  const handleUploadPicture = async (e) => {
    e.preventDefault()
    if (!profilePic) {
      setMessage({ text: "Please select a file to upload.", type: "error" })
      return
    }

    setLoading(true)
    setMessage({ text: "", type: "" })

    const imageData = new FormData()
    imageData.append("profilePic", profilePic)

    try {
      const res = await fetch("http://localhost:5001/api/welfare/profile/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: imageData,
      })

      const data = await res.json()

      if (res.ok && data.profilePicture) {
        setMessage({ text: data.message || "Profile picture updated!", type: "success" })
        setProfile((prev) => ({ ...prev, profilePicture: data.profilePicture }))
        setPreviewUrl(null)
        setProfilePic(null)

        // Force refresh latest profile data
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={() => navigate("/welfare/dashboard")} className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Welfare Profile</h1>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-primary-500 p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {profile.profilePicture ? (
                  <img
                    src={`http://localhost:5001${profile.profilePicture}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>

              {/* Preview overlay if there's a new image selected */}
              {previewUrl && (
                <div className="absolute inset-0 h-32 w-32 rounded-full overflow-hidden border-4 border-white">
                  <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{profile.organizationName || "Organization Name"}</h2>
            <p className="text-primary-100">{profile.email || "email@example.com"}</p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`p-4 ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
            >
              {message.text}
            </div>
          )}

          <div className="p-6">
            {/* Profile Picture Upload */}
            <div className="mb-8 p-4 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-4">Update Profile Picture</h3>
              <form onSubmit={handleUploadPicture} className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="profile-pic"
                    className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{profilePic ? profilePic.name : "Choose a file..."}</span>
                  </label>
                  <input id="profile-pic" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <button
                  type="submit"
                  disabled={loading || !profilePic}
                  className={`btn ${!profilePic ? "bg-gray-300 cursor-not-allowed" : "btn-primary"} flex items-center`}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Upload
                </button>
              </form>
            </div>

            {/* Profile Update Form */}
            <h3 className="text-lg font-medium mb-4">Profile Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="input" />
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium mb-4">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                      Facebook
                    </label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.socialLinks.facebook}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                        }))
                      }
                      className="input"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.socialLinks.instagram}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                        }))
                      }
                      className="input"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn btn-primary flex items-center">
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

export default WelfareProfile

