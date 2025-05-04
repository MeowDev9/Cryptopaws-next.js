"use client"

import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Sparkles } from "lucide-react"
import { DonationForm } from "@/components/DonationForm"
import { OrganizationInfoCard } from "@/components/OrganizationInfo"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function DonatePage() {
  const params = useParams()
  const organizationId = params.organizationId as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl z-0"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full text-white text-lg font-medium mb-6">
              <Heart className="h-5 w-5 text-purple-400" />
              <span>MAKE A DIFFERENCE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Support This Organization</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Your donation will directly support animal welfare efforts and make a real impact
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Organization Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <OrganizationInfoCard organizationAddress={organizationId} />

                <div className="mt-6 bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Why Donate?</h3>
                  </div>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center mt-1 mr-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      </div>
                      <span>100% transparent blockchain transactions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center mt-1 mr-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      </div>
                      <span>Direct impact on animal welfare</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center mt-1 mr-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      </div>
                      <span>Regular updates on how funds are used</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Donation Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700/50 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Make Your Donation
                </h2>
                <DonationForm
                  organizationAddress={organizationId}
                  onSuccess={() => {
                    // Optionally refresh the organization info or show a success message
                    window.location.reload()
                  }}
                />
              </div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20"
              >
                <div className="flex items-start">
                  <div className="text-4xl text-purple-400 font-serif leading-none mr-4">"</div>
                  <div>
                    <p className="text-slate-300 italic">
                      Your donation helped us rescue over 50 animals last month. Every contribution, no matter how
                      small, makes a real difference in the lives of these animals.
                    </p>
                    <p className="mt-4 text-purple-300 font-medium">— Animal Welfare Organization</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
