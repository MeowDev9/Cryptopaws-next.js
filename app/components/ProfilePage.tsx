"use client"

import { useState } from "react"
import axios from "axios"
import { Save, Edit2, Trash2, AlertCircle, Check } from "lucide-react"

export default function ProfilePage({ userProfile, setUserProfile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    bio: userProfile?.bio || "",
    phone: userProfile?.phone || "",
    address: userProfile?.address || "",
    socialLinks: userProfile?.socialLinks || { twitter: "", telegram: "" },
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      // Handle nested objects like socialLinks.twitter
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const token = localStorage.getItem("donorToken")
      const response = await axios.put("http://localhost:5001/api/profile/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUserProfile(response.data)
      setMessage({ text: "Profile updated successfully!", type: "success" })
      setIsEditing(false)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setMessage({
        text: error.response?.data?.message || "Failed to update profile",
        type: "error",
      })
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("donorToken")
      await axios.delete("http://localhost:5001/api/profile/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      localStorage.removeItem("donorToken")
      window.location.href = "/login"
    } catch (error) {
      console.error("Error deleting account:", error)
      setMessage({
        text: error.response?.data?.message || "Failed to delete account",
        type: "error",
      })
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Message display */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start ${
            message.type === "error"
              ? "bg-red-900 bg-opacity-30 border border-red-800"
              : "bg-green-900 bg-opacity-30 border border-green-800"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          ) : (
            <Check size={20} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
          )}
          <p className={message.type === "error" ? "text-red-400" : "text-green-400"}>{message.text}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Personal Information</h3>
          <p className="text-sm text-gray-400">Update your personal details</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Edit2 size={16} className="mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="p-3 bg-gray-700 rounded-lg">{userProfile?.name || "Not set"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="p-3 bg-gray-700 rounded-lg">{userProfile?.email || "Not set"}</p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell us a bit about yourself..."
            ></textarea>
          ) : (
            <p className="p-3 bg-gray-700 rounded-lg">{userProfile?.bio || "No bio provided"}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="p-3 bg-gray-700 rounded-lg">{userProfile?.phone || "Not set"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="p-3 bg-gray-700 rounded-lg">{userProfile?.address || "Not set"}</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-medium mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Twitter</label>
              {isEditing ? (
                <input
                  type="text"
                  name="socialLinks.twitter"
                  value={formData.socialLinks?.twitter || ""}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="@username"
                />
              ) : (
                <p className="p-3 bg-gray-700 rounded-lg">{userProfile?.socialLinks?.twitter || "Not set"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telegram</label>
              {isEditing ? (
                <input
                  type="text"
                  name="socialLinks.telegram"
                  value={formData.socialLinks?.telegram || ""}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="@username"
                />
              ) : (
                <p className="p-3 bg-gray-700 rounded-lg">{userProfile?.socialLinks?.telegram || "Not set"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-10 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-medium text-red-500 mb-4">Danger Zone</h3>
          <p className="text-sm text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-900 hover:bg-red-800 text-red-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <Trash2 size={16} className="mr-2" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

