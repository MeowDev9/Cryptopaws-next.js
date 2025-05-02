"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AlertTriangle, MapPin, Phone, Camera, Send, CheckCircle, Loader2, X, Upload, AlertCircle } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ConnectWalletButton from "@/components/ConnectWalletButton"


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
  const [walletConnected, setWalletConnected] = useState(false)

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
    const apiKey = 'AIzaSyBPjBHXmDnGvJULgTBQFScAlMCqGZUe16g'
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
      if (!formData.name || !formData.phone || !formData.location || 
          !formData.description || !formData.animalType || !formData.condition) {
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
        method: 'POST',
        body: form
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

  const handleWalletConnect = (connected: boolean) => {
    setWalletConnected(connected)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gray-800 border border-purple-500/30 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-purple-700 to-purple-500 p-6 text-white">
              <div className="flex items-center">
                <AlertTriangle size={32} className="mr-4" />
                <div>
                  <h1 className="text-2xl font-bold">Report an Animal Emergency</h1>
                  <p className="text-white/80">
                    Use this form to report animals in distress or danger that need immediate help
                  </p>
                </div>
              </div>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Emergency Reported!</h2>
                <p className="text-gray-300 mb-6">
                  Thank you for reporting this emergency. Our team has been notified and will respond as quickly as
                  possible.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Report Another Emergency
                  </button>
                  <button
                    onClick={() => router.push("/donor/dashboard")}
                    className="px-6 py-2 border border-purple-500 text-white rounded-md hover:bg-purple-700/20 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-md flex items-start">
                    <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Animal Type</label>
                    <select
                      name="animalType"
                      value={formData.animalType}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    >
                      <option value="">Select animal type</option>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="wildlife">Wildlife</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Condition</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      Location
                    </div>
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
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white pr-10"
                    />
                    {isLocationLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={20} className="animate-spin text-purple-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    We use your location to dispatch help quickly. You can edit it if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the emergency situation and the animal's condition"
                    rows={4}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <div className="flex items-center">
                      <Camera size={16} className="mr-1" />
                      Photos (if available)
                    </div>
                  </label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB each)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                    </label>
                  </div>

                  {imagePreview.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {imagePreview.map((src, index) => (
                        <div key={index} className="relative group">
                          <div className="relative h-24 w-full rounded-md overflow-hidden border border-gray-700">
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
                            className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 shadow-lg opacity-90 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                            <span className="sr-only">Remove image</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-700/50 p-4 rounded-md border border-gray-600">
                  <h3 className="text-lg font-medium text-white mb-3">Your Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        <div className="flex items-center">
                          <Phone size={16} className="mr-1" />
                          Phone Number
                        </div>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/20 p-4 rounded-md border border-purple-500/30">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                    <span className="mr-2">🔗</span> Connect Wallet (Optional)
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Connecting your wallet allows us to verify your identity on the blockchain and track the status of
                    your emergency report.
                  </p>
                  <ConnectWalletButton onConnect={handleWalletConnect} />
                  {walletConnected && (
                    <p className="text-green-400 text-sm mt-2">
                      ✓ Wallet connected successfully! Your report will be linked to your wallet address.
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-md hover:from-purple-700 hover:to-purple-600 transition-colors flex items-center disabled:opacity-70 shadow-lg shadow-purple-700/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Submit Emergency Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 bg-gray-800 border border-purple-500/30 rounded-xl shadow-lg p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <AlertTriangle size={20} className="mr-2 text-purple-400" />
              Emergency Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-purple-900/50 p-2 rounded-full mr-3 border border-purple-500/50">
                  <Phone size={20} className="text-purple-300" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Emergency Hotline</h3>
                  <p className="text-purple-300">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-400">Available 24/7 for animal emergencies</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-purple-900/50 p-2 rounded-full mr-3 border border-purple-500/50">
                  <MapPin size={20} className="text-purple-300" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Rescue Center</h3>
                  <p className="text-purple-300">123 Animal Care Lane, City, State</p>
                  <p className="text-sm text-gray-400">Open 8 AM - 8 PM daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
