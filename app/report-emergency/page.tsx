"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  AlertTriangle,
  MapPin,
  Phone,
  Camera,
  Send,
  CheckCircle,
  Loader2,
  X,
  Upload,
  AlertCircle,
  Heart,
  Shield,
  PawPrintIcon as Paw,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
// ConnectWalletButton removed

export default function ReportEmergency() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    description: "",
    animalType: "",
    condition: "",
    images: [] as File[],
  })

  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isLocationLoading, setIsLocationLoading] = useState(true)
  // Wallet connection state removed

  // Get current location using Geolocation API
  const getCurrentLocation = () => {
    setIsLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handlePosition, handleError)
    } else {
      setError("Geolocation is not supported by this browser.")
      setIsLocationLoading(false)
    }
  }

  // Handle position response and reverse geocode to get the location
  const handlePosition = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords

    // Using the provided Google API key
    const apiKey = "AIzaSyBPjBHXmDnGvJULgTBQFScAlMCqGZUe16g"
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const address = data.results[0]?.formatted_address
        if (address) {
          setFormData((prevData) => ({
            ...prevData,
            location: address,
          }))
        } else {
          setError("Could not fetch the location.")
        }
      })
      .catch((error) => {
        console.error("Error fetching location:", error)
        setError("Unable to fetch location data.")
      })
      .finally(() => {
        setIsLocationLoading(false)
      })
  }

  // Handle error if location access is denied
  const handleError = (error: GeolocationPositionError) => {
    console.error("Error code:", error.code, "Error message:", error.message)
    setError("Failed to retrieve location. Please enter it manually.")
    setIsLocationLoading(false)
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)

      // Add new files to the existing array
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }))

      // Create preview URLs for the new images
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setImagePreview((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    // Remove the image from the formData
    const updatedImages = [...formData.images]
    updatedImages.splice(index, 1)

    // Remove the preview
    const updatedPreviews = [...imagePreview]
    URL.revokeObjectURL(updatedPreviews[index]) // Clean up the URL object
    updatedPreviews.splice(index, 1)

    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }))
    setImagePreview(updatedPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.phone ||
        !formData.location ||
        !formData.description ||
        !formData.animalType ||
        !formData.condition
      ) {
        setError("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      const form = new FormData()

      // Add all required fields from formData state
      form.append("name", formData.name)
      form.append("phone", formData.phone)
      form.append("location", formData.location)
      form.append("description", formData.description)
      form.append("animalType", formData.animalType)
      form.append("condition", formData.condition)

      // Add images if they exist
      if (formData.images.length > 0) {
        formData.images.forEach((file) => {
          form.append("images", file)
        })
      }

      // Send the form data to the backend API
      const response = await fetch("http://localhost:5001/api/emergency", {
        method: "POST",
        body: form,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit emergency report")
      }

      const data = await response.json()
      console.log("Emergency reported successfully:", data)

      setSuccess(true)

      // Clean up image preview URLs
      imagePreview.forEach((url) => URL.revokeObjectURL(url))

      // Reset form
      setFormData({
        name: "",
        phone: "",
        location: "",
        description: "",
        animalType: "",
        condition: "",
        images: [],
      })
      setImagePreview([])
    } catch (err) {
      console.error("Error submitting emergency report:", err)
      setError(err instanceof Error ? err.message : "Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen py-16 overflow-hidden">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 z-[-1]">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950"></div>
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          {/* Page Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Report an Animal Emergency</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Help us rescue animals in distress by providing detailed information about the emergency situation
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">
            {success ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Emergency Reported!</h2>
                <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                  Thank you for reporting this emergency. Our team has been notified and will respond as quickly as
                  possible. You'll receive updates on the status of your report.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 flex items-center gap-2"
                  >
                    <AlertTriangle size={18} />
                    Report Another Emergency
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {error && (
                  <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-xl flex items-start animate-pulse">
                    <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Paw size={16} className="mr-2 text-purple-400" />
                      Animal Type
                    </label>
                    <select
                      name="animalType"
                      value={formData.animalType}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                    >
                      <option value="">Select animal type</option>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="wildlife">Wildlife</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Shield size={16} className="mr-2 text-purple-400" />
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                    >
                      <option value="">Select condition</option>
                      <option value="injured">Injured</option>
                      <option value="sick">Sick</option>
                      <option value="trapped">Trapped</option>
                      <option value="abandoned">Abandoned</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                    <MapPin size={16} className="mr-2 text-purple-400" />
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder={
                        isLocationLoading ? "Fetching your location..." : "Enter address or describe the location"
                      }
                      required
                      className="w-full p-3 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white pr-10 transition-all"
                    />
                    {isLocationLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={20} className="animate-spin text-purple-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-1">
                    We use your location to dispatch help quickly. You can edit it if needed.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                    <AlertCircle size={16} className="mr-2 text-purple-400" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the emergency situation and the animal's condition in detail"
                    rows={4}
                    required
                    className="w-full p-3 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  ></textarea>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                    <Camera size={16} className="mr-2 text-purple-400" />
                    Photos (if available)
                  </label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-purple-500/30 rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-14 h-14 mb-3 rounded-full bg-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload size={24} className="text-purple-400" />
                        </div>
                        <p className="mb-2 text-sm text-gray-300">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB each)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                    </label>
                  </div>

                  {imagePreview.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {imagePreview.map((src, index) => (
                        <div key={index} className="relative group">
                          <div className="relative h-28 w-full rounded-xl overflow-hidden border border-purple-500/30 shadow-lg transition-transform group-hover:scale-[1.02]">
                            <Image
                              src={src || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1.5 shadow-lg opacity-90 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                            <span className="sr-only">Remove image</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-800/50 p-6 rounded-xl border border-purple-500/30 shadow-inner">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Phone size={18} className="mr-2 text-purple-400" />
                    Your Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all flex items-center disabled:opacity-70 shadow-lg shadow-purple-700/20 transform hover:-translate-y-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin mr-3" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="mr-3" />
                        Submit Emergency Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Emergency Contact Information */}
          <div className="mt-12 bg-slate-900/80 backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-600/5 rounded-full"></div>
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-pink-600/5 rounded-full"></div>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <AlertTriangle size={24} className="mr-3 text-purple-400" />
              Emergency Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start group">
                <div className="bg-purple-900/30 p-3 rounded-xl mr-4 border border-purple-500/30 shadow-lg group-hover:bg-purple-900/50 transition-colors">
                  <Phone size={24} className="text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Emergency Hotline</h3>
                  <p className="text-purple-300 text-xl font-bold mb-1">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-400">Available 24/7 for animal emergencies</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="bg-purple-900/30 p-3 rounded-xl mr-4 border border-purple-500/30 shadow-lg group-hover:bg-purple-900/50 transition-colors">
                  <MapPin size={24} className="text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Rescue Center</h3>
                  <p className="text-purple-300 text-lg font-bold mb-1">123 Animal Care Lane</p>
                  <p className="text-sm text-gray-400">Open 8 AM - 8 PM daily</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <p className="text-center text-gray-300">
                <span className="text-purple-300 font-semibold">Remember:</span> Your quick action can save an animal's
                life. Please provide as much detail as possible to help our rescue teams respond effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
