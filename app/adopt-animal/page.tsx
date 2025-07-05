"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Heart, MapPin, User, Phone } from "lucide-react"

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
  postedBy: string | { name: string };
  postedByType: string;
  contactNumber: string;
  adoptedBy?: string;
  createdAt: string;
}

export default function AdoptAnimal() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdoptions = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/adoption/all')
        if (!response.ok) {
          throw new Error('Failed to fetch adoptions')
        }
        const data = await response.json()
        setAdoptions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load adoptions')
      } finally {
        setLoading(false)
      }
    }

    fetchAdoptions()
  }, [])

  return (
    <>
      <Navbar />
      <div className="pt-20 pb-16 bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-80 md:h-96 bg-gray-900 mb-16">
          <Image
            src="/images/slideshowdogs.jpg"
            alt="Adopt an Animal"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Companion</h1>
              <p className="text-xl max-w-2xl">
                Give a loving home to an animal in need and change both your lives forever
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Adoption Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">How Adoption Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse Available Pets</h3>
                <p className="text-gray-600">
                  Explore our gallery of animals looking for their forever homes
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Contact the Poster</h3>
                <p className="text-gray-600">
                  Get in touch with the current caretaker to learn more about the pet
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Complete Adoption</h3>
                <p className="text-gray-600">
                  Finalize the adoption process and welcome your new family member
                </p>
              </div>
            </div>
          </section>

          {/* Adoption Listings */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">Available for Adoption</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading adoptions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : adoptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No animals available for adoption at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adoptions.map((adoption) => (
                  <div key={adoption._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200 relative">
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
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{adoption.name}</h3>
                      <p className="text-purple-600 mb-4">
                        {adoption.type} • {adoption.breed} • {adoption.age}
                      </p>
                      <p className="text-gray-600 mb-4">{adoption.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{adoption.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Posted by: {typeof adoption.postedBy === 'string' ? adoption.postedBy : adoption.postedBy.name || 'Unknown'} ({adoption.postedByType === 'donor' ? 'Donor' : 'Welfare Organization'})</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Contact: {adoption.contactNumber}</span>
                        </div>
                      </div>

                      <Link
                        href={`/adopt-animal/${adoption._id}`}
                        className="block w-full bg-purple-600 text-white text-center py-2 rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
