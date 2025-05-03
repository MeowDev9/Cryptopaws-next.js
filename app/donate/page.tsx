"use client"
import Link from "next/link"
import { Heart, Users, ArrowRight, Gift } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
export default function Donate() {
  return (
    <>
      <Navbar />
      <div className="pt-20 donate-page-container">
        {/* Attractive Heading Section */}
        <div className="relative py-16 bg-gradient-to-r from-purple-700 via-purple-600 to-pink-800">
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)",
                backgroundSize: "100px 100px",
              }}
            ></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-4">
                <Gift className="h-16 w-16 text-white mx-auto mb-2" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center px-4 main-heading tracking-tight">
                Make a <span className="text-yellow-300">Difference</span> With Your Donation
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 donate-columns">
            {/* Donate by Case Box */}
            <div className="rounded-xl overflow-hidden shadow-xl group donate-column bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mb-6 mx-auto">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-center text-purple-800">Donate by Case</h2>
                <div className="w-16 h-1 bg-purple-400 mx-auto mb-6 rounded-full"></div>
                <p className="mb-6 text-center text-gray-700">
                  Help specific animals in urgent need by donating directly to their rescue and medical care. Your
                  contribution makes an immediate impact on an animal's life.
                </p>
                <div className="flex justify-center mt-8">
                  <Link href="/donate2">
                    <button className="group bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center font-medium text-lg">
                      View Cases
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Donate to Welfare Organization Box */}
            <div className="rounded-xl overflow-hidden shadow-xl group donate-column bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center mb-6 mx-auto">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-center text-pink-800">Donate to Organizations</h2>
                <div className="w-16 h-1 bg-pink-400 mx-auto mb-6 rounded-full"></div>
                <p className="mb-6 text-center text-gray-700">
                  Support trusted animal welfare organizations in their efforts to save and protect animals. Your
                  donation helps fund ongoing rescue operations and care facilities.
                </p>
                <div className="flex justify-center mt-8">
                  <Link href="/welfare-organizations">
                    <button className="group bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center font-medium text-lg">
                      View Organizations
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Attractive Element */}
          <div className="mt-16 text-center">
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-xl border border-purple-200">
              <h3 className="text-2xl font-bold text-purple-800 mb-4">Every Donation Counts</h3>
              <p className="text-gray-700 mb-6">
                Whether big or small, your contribution makes a real difference in the lives of animals in need. Join
                our community of compassionate donors today!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white px-6 py-3 rounded-lg shadow-md border border-purple-200">
                  <span className="block text-sm text-gray-500">Rescued</span>
                  <span className="block text-2xl font-bold text-purple-700">500+</span>
                  <span className="block text-sm text-gray-500">Animals</span>
                </div>
                <div className="bg-white px-6 py-3 rounded-lg shadow-md border border-purple-200">
                  <span className="block text-sm text-gray-500">Active</span>
                  <span className="block text-2xl font-bold text-purple-700">50+</span>
                  <span className="block text-sm text-gray-500">Organizations</span>
                </div>
                <div className="bg-white px-6 py-3 rounded-lg shadow-md border border-purple-200">
                  <span className="block text-sm text-gray-500">Generous</span>
                  <span className="block text-2xl font-bold text-purple-700">10K+</span>
                  <span className="block text-sm text-gray-500">Donors</span>
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
