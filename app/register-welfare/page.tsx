"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address || !formData.description) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);

    try {
      // Register with backend
      console.log("Registering with backend...");
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register with backend");
      }

      setSuccessMessage("Registration successful! Please wait for admin approval before logging in.");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary py-4 px-6">
            <h2 className="text-2xl font-bold text-white text-center">Register as Welfare Organization</h2>
          </div>

          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded">{errorMessage}</div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-secondary/10 text-secondary rounded">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Organization Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <textarea
                  name="description"
                  placeholder="Organization Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <input
                  type="url"
                  name="website"
                  placeholder="Website (optional)"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Register"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-primary hover:text-primary-dark">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

