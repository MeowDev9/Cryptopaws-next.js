"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ParticlesComponent from "@/components/Particles"
import { jwtDecode } from "jwt-decode"

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

  const router = useRouter()

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
        body: JSON.stringify({ idToken })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Google authentication failed");
      }
      
      const result = await response.json();
      
      // Store the JWT token returned from our backend (not the Google token)
      localStorage.setItem("donorToken", result.token);
      
      // Redirect to Donor dashboard
      router.push("/donor/dashboard");
    } catch (error: any) {
      console.error("Google login error:", error)
      setErrorMessage("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  

  

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative min-h-screen flex items-center justify-center">
        <ParticlesComponent id="tsparticles" />
        <div className="relative z-10 w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-primary mb-6">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                required
              />
            </div>
            {!isSignUp && (
              <div>
                <label className="block text-sm font-medium text-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                >
                  <option value="Donor">Donor</option>
                  <option value="Welfare">Welfare Organization</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200 ease-in-out"
            >
              {isLoading ? (
                <span className="flex justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a10 10 0 00-10 10h2z"></path>
                  </svg>
                </span>
              ) : (
                isSignUp ? "Sign Up" : "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLogin
                onSuccess={(credentialResponse: CredentialResponse) => {
                  if (credentialResponse.credential) {
                    handleGoogleLogin(credentialResponse.credential)
                  }
                }}
                onError={() => {
                  setErrorMessage("Google sign-in failed. Please make sure you're using an allowed domain.")
                }}
                size="large"
                theme="outline"
                shape="rectangular"
                width="100%"
                locale="en"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:text-primary-dark"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-4 bg-secondary/10 text-secondary rounded-md">
              {successMessage}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
