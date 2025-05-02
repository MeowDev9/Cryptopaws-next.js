"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { MapPin, User, Phone, Heart, Wallet } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Adoption {
  _id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  images: string[];
  location: string;
  health: string;
  behavior: string;
  status: string;
  postedBy: string;
  postedByType: string;
  contactNumber: string;
  adoptedBy?: string;
  createdAt: string;
}

export default function AdoptionDetails() {
  const router = useRouter()
  const params = useParams()
  const adoptionId = params?.id as string

  const [adoption, setAdoption] = useState<Adoption | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDonor, setIsDonor] = useState(false)
  const [showAdoptionForm, setShowAdoptionForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    reason: '',
    experience: '',
    walletAddress: ''
  })

  useEffect(() => {
    if (!adoptionId) {
      setError('Invalid adoption ID')
      setLoading(false)
      return
    }

    const checkDonorStatus = () => {
      const token = localStorage.getItem('token')
      setIsDonor(!!token)
    }

    const fetchAdoption = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/adoption/${adoptionId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Adoption not found')
          }
          throw new Error('Failed to fetch adoption details')
        }
        const data = await response.json()
        setAdoption(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load adoption details')
      } finally {
        setLoading(false)
      }
    }

    checkDonorStatus()
    fetchAdoption()
  }, [adoptionId])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAdoptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/adoption/${adoptionId}/adopt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to process adoption')
      }

      // Show success message and redirect
      alert('Adoption request submitted successfully!')
      router.push('/donor/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process adoption')
    }
  }

  const handleLoginRedirect = () => {
    // Store the current URL to redirect back after login
    localStorage.setItem('redirectAfterLogin', `/adopt-animal/${adoptionId}`)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error || !adoption) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || 'Adoption not found'}</p>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Adoption Images */}
            <div className="space-y-4">
              <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                {adoption.images && adoption.images.length > 0 ? (
                  <Image
                    src={`http://localhost:5001/${adoption.images[0]}`}
                    alt={adoption.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {adoption.images?.slice(1).map((image, index) => (
                  <div key={index} className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={`http://localhost:5001/${image}`}
                      alt={`${adoption.name} ${index + 2}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Adoption Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{adoption.name}</h1>
                <p className="text-purple-600 text-lg">
                  {adoption.type} • {adoption.breed} • {adoption.age}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{adoption.description}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Health Information</h2>
                  <p className="text-gray-600">{adoption.health}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Behavior</h2>
                  <p className="text-gray-600">{adoption.behavior}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{adoption.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Posted by: {adoption.postedBy} ({adoption.postedByType === 'donor' ? 'Donor' : 'Welfare Organization'})</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Contact: {adoption.contactNumber}</span>
                  </div>
                </div>
              </div>

              {/* Adoption Process */}
              {!showAdoptionForm ? (
                <div className="mt-8">
                  {isDonor ? (
                    <button
                      onClick={() => setShowAdoptionForm(true)}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Start Adoption Process
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        To adopt this animal, you need to login as a donor.
                      </p>
                      <button
                        onClick={handleLoginRedirect}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Login to Adopt
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleAdoptionSubmit} className="space-y-4 mt-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Why do you want to adopt this animal?
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleFormChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous experience with pets
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        name="walletAddress"
                        value={formData.walletAddress}
                        onChange={handleFormChange}
                        required
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Submit Adoption Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdoptionForm(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
} 