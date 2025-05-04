"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import Image from "next/image"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ParticlesComponent from "@/components/Particles"
import {
  Mail,
  Lock,
  User,
  UserCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  Stethoscope,
  ShieldCheck,
} from "lucide-react"

const GOOGLE_CLIENT_ID = "939434414505-na4go0ebln3se9ms9m3sfl41edie3una.apps.googleusercontent.com"

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState("Donor") // Default role
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    let url = ""
    let data: Record<string, string> = { email, password }

    if (isSignUp) {
      url = "http://localhost:5001/api/auth/signup"
      // For signup, always set role to "Donor" - only donors can sign up
      data = { name, email, password, role: "Donor" }
    } else {
      switch (role) {
        case "Admin":
          url = "http://localhost:5001/api/admin/login"
          break
        case "Welfare":
          url = "http://localhost:5001/api/welfare/login"
          break
        case "Doctor":
          url = "http://localhost:5001/api/doctor/login"
          break
        default:
          url = "http://localhost:5001/api/auth/signin"
          // Include role for donor signin
          data = { email, password, role }
      }
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      console.log("API Response:", result)

      if (res.ok && result.token) {
        setSuccessMessage(isSignUp ? "Signup successful!" : "Signin successful!")
        if (!isSignUp) {
          // Store token based on role
          if (role === "Admin") {
            localStorage.setItem("adminToken", result.token)
            router.push("/admin/dashboard")
          } else if (role === "Welfare") {
            localStorage.setItem("welfareToken", result.token)
            router.push("/welfare/dashboard")
          } else if (role === "Doctor") {
            localStorage.setItem("doctorToken", result.token)
            router.push("/doctor/dashboard")
          } else {
            localStorage.setItem("donorToken", result.token)
            router.push("/donor/dashboard")
          }
        }
      } else {
        setErrorMessage(result.message || "Login failed")
      }
    } catch (error: any) {
      console.error(error)
      setErrorMessage("Server error: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      // Send idToken to backend for verification and JWT creation
      const response = await fetch("http://localhost:5001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Google authentication failed")
      }

      const result = await response.json()

      // Store the JWT token returned from our backend (not the Google token)
      localStorage.setItem("donorToken", result.token)

      // Redirect to Donor dashboard
      router.push("/donor/dashboard")
    } catch (error: any) {
      console.error("Google login error:", error)
      setErrorMessage("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = () => {
    switch (role) {
      case "Admin":
        return <ShieldCheck className="h-5 w-5 text-purple-400" />
      case "Welfare":
        return <Building2 className="h-5 w-5 text-purple-400" />
      case "Doctor":
        return <Stethoscope className="h-5 w-5 text-purple-400" />
      default:
        return <UserCheck className="h-5 w-5 text-purple-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <div className="relative min-h-screen flex items-center justify-center px-4 py-20 my-24">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <ParticlesComponent id="tsparticles" />
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card container with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <h2 className="text-3xl font-bold text-center">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
              <p className="text-center mt-2 text-white/80">
                {isSignUp ? "Join our community and make a difference" : "Sign in to continue your journey"}
              </p>
            </div>

            {/* Form section */}
            <div className="p-8">
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder={isSignUp ? "Create a password" : "Enter your password"}
                      required
                    />
                  </div>
                </div>

                {!isSignUp && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sign in as</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {getRoleIcon()}
                      </div>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="Donor">Donor</option>
                        <option value="Welfare">Welfare Organization</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? "Create Account" : "Sign In"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google login */}
              {mounted && (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={(credentialResponse: CredentialResponse) => {
                      if (credentialResponse.credential) {
                        handleGoogleLogin(credentialResponse.credential)
                      }
                    }}
                    onError={() => {
                      setErrorMessage("Google sign-in failed. Please try again.")
                    }}
                    size="large"
                    theme="outline"
                    shape="rectangular"
                    width="100%"
                    locale="en"
                  />
                </div>
              )}

              {/* Toggle between signup and signin */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setErrorMessage("")
                    setSuccessMessage("")
                  }}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              </div>

              {/* Error and success messages */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-red-800 dark:text-red-300 text-sm">{errorMessage}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-green-800 dark:text-green-300 text-sm">{successMessage}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Decorative logo element */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center border-4 border-purple-100 dark:border-slate-700">
              <Image src="/images/cplogo.png" alt="CryptoPaws Logo" width={150} height={150} className="rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
