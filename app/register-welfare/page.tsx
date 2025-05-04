"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Heart,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function RegisterWelfare() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    description: "",
    website: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    // Validate form data
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.address ||
      !formData.description
    ) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Register with backend
      console.log("Registering with backend...")
      const response = await fetch("http://localhost:5001/api/welfare/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          blockchainTxHash: null,
          blockchainAddress: null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to register with backend")
      }

      setSuccessMessage("Registration successful! Please wait for admin approval before logging in.")
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error) {
      console.error("Registration error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen py-16 overflow-hidden">
        {/* Background with gradient and pattern */}
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

        <div className="max-w-6xl mx-auto px-4 my-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left side - Information */}
            <div className="w-full lg:w-1/2 text-white">
              <div className="mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium">
                <Users className="h-4 w-4 text-purple-400" />
                <span>JOIN OUR COMMUNITY</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Register Your <span className="text-purple-400">Animal Welfare</span> Organization
              </h1>

              <p className="text-gray-300 text-lg mb-8">
                Join our network of dedicated animal welfare organizations making a difference in the lives of animals
                in need. Registration is free and gives you access to our platform's resources and donor network.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-gray-200">Connect with donors and supporters</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-gray-200">Receive donations through secure blockchain technology</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-gray-200">Share your rescue stories and impact with the community</span>
                </div>
              </div>

              <div className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-5 w-5 text-pink-400" />
                  <h3 className="text-xl font-semibold text-white">Why Register With Us?</h3>
                </div>
                <p className="text-gray-300">
                  Our platform uses blockchain technology to ensure transparency and security in all donations. Donors
                  can track their contributions, and you can build trust with your supporters through verified
                  transactions and impact reporting.
                </p>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2">
              <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-6 px-8">
                  <h2 className="text-2xl font-bold text-white">Organization Registration</h2>
                  <p className="text-white/80 mt-1">Fill in your details to get started</p>
                </div>

                <div className="p-8">
                  {errorMessage && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-xl flex items-center gap-3 animate-pulse">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 text-green-200 rounded-xl flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <p>{successMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-purple-400" />
                        Organization Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          placeholder="Enter your organization name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full p-3 pl-10 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                        />
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-400" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full p-3 pl-10 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-purple-400" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="password"
                          placeholder="Create a secure password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full p-3 pl-10 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-purple-400" />
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full p-3 pl-10 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        Address
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="address"
                          placeholder="Enter your organization address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          className="w-full p-3 pl-10 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-400" />
                        Organization Description
                      </label>
                      <div className="relative">
                        <textarea
                          name="description"
                          placeholder="Tell us about your organization, mission, and the animals you help"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="w-full p-3 pl-10 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                        />
                        <FileText className="absolute left-3 top-6 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-purple-400" />
                        Website (optional)
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          name="website"
                          placeholder="https://yourorganization.com"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full p-3 pl-10 bg-slate-800/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                        />
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-700/20"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Users className="h-5 w-5" />
                          Register Organization
                        </>
                      )}
                    </button>

                    <div className="mt-6 text-center">
                      <Link
                        href="/login"
                        className="text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Already have an account? Sign in
                      </Link>
                    </div>
                  </form>
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
