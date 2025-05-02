"use client"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function Donate() {
  return (
    <>
      <Navbar />
      <div className="pt-20 donate-page-container">
        {/* Background Image */}
        <div className="relative h-96">
          <Image
            src="/images/blockchain.jpg"
            alt="Background"
            fill
            style={{ objectFit: "cover" }}
            className="background-image-page"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4 main-heading">
              Make a Difference with Your Donation
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 donate-columns">
            {/* Donate by Case Column */}
            <div className="relative rounded-xl overflow-hidden shadow-xl h-96 group donate-column">
              <Image
                src="/images/case.jpg"
                alt="Donate by Case"
                fill
                style={{ objectFit: "cover" }}
                className="background-image-donate transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 overlay"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center text-content">
                <h2 className="text-2xl font-bold mb-4">Donate by Case</h2>
                <p className="mb-6">
                  Help specific animals in urgent need by donating directly to their rescue and medical care.
                </p>
                <Link href="/donate2">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors view-button">
                    View Cases
                  </button>
                </Link>
              </div>
            </div>

            {/* Donate to Welfare Organization Column */}
            <div className="relative rounded-xl overflow-hidden shadow-xl h-96 group donate-column">
              <Image
                src="/images/organization.jpg"
                alt="Donate to Organization"
                fill
                style={{ objectFit: "cover" }}
                className="background-image-donate transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 overlay"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center text-content">
                <h2 className="text-2xl font-bold mb-4">Donate to Welfare Organization</h2>
                <p className="mb-6">
                  Support trusted animal welfare organizations in their efforts to save and protect animals.
                </p>
                <Link href="/welfare-organizations">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors view-button">
                    View Organizations
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

