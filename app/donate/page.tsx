"use client"

import Link from "next/link"
import { Heart, Users, ArrowRight, Gift, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ParticlesComponent from "@/components/Particles"

export default function Donate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 z-0">
          <ParticlesComponent id="tsparticles" />
        </div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl z-0"></div>
      </div>

      <div className="relative z-10 pt-20 donate-page-container">
        {/* Attractive Heading Section */}
        <div className="relative py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 overflow-hidden">
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

          {/* Animated particles */}
          <div className="absolute top-0 left-0 w-full h-full z-[1] opacity-30">
            <div className="absolute w-2 h-2 bg-white rounded-full top-1/4 left-1/4 animate-pulse"></div>
            <div className="absolute w-3 h-3 bg-purple-300 rounded-full top-1/3 left-1/2 animate-ping"></div>
            <div className="absolute w-2 h-2 bg-pink-300 rounded-full top-2/3 left-1/3 animate-pulse"></div>
            <div className="absolute w-3 h-3 bg-white rounded-full top-1/2 left-3/4 animate-ping"></div>
            <div className="absolute w-2 h-2 bg-purple-300 rounded-full top-3/4 left-1/4 animate-pulse"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full text-white text-lg font-medium mb-6">
                <Gift className="h-5 w-5 text-purple-300" />
                <span>MAKE A DIFFERENCE</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center px-4 main-heading tracking-tight mb-6">
                Make a <span className="text-purple-300">Difference</span> With Your{" "}
                <span className="text-pink-300">Donation</span>
              </h1>

              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                Your generosity can transform lives and create a better world for animals in need
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 donate-columns">
            {/* Donate by Case Box */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl overflow-hidden shadow-xl group donate-column bg-slate-800/70 backdrop-blur-sm border border-purple-500/30 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-center text-white">Donate by Case</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6 rounded-full"></div>
                <p className="mb-6 text-center text-gray-300">
                  Help specific animals in urgent need by donating directly to their rescue and medical care. Your
                  contribution makes an immediate impact on an animal's life.
                </p>
                <div className="flex justify-center mt-8">
                  <Link href="/donate2">
                    <button className="group bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center font-medium text-lg shadow-lg shadow-purple-900/30 hover:-translate-y-1">
                      View Cases
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Donate to Welfare Organization Box */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-xl overflow-hidden shadow-xl group donate-column bg-slate-800/70 backdrop-blur-sm border border-pink-500/30 hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-pink-800 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-center text-white">Donate to Organizations</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
                <p className="mb-6 text-center text-gray-300">
                  Support trusted animal welfare organizations in their efforts to save and protect animals. Your
                  donation helps fund ongoing rescue operations and care facilities.
                </p>
                <div className="flex justify-center mt-8">
                  <Link href="/welfare-organizations">
                    <button className="group bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-700 hover:to-pink-900 text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center font-medium text-lg shadow-lg shadow-pink-900/30 hover:-translate-y-1">
                      View Organizations
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Attractive Element */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20 shadow-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>OUR IMPACT</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">Every Donation Counts</h3>
              <p className="text-gray-300 mb-8">
                Whether big or small, your contribution makes a real difference in the lives of animals in need. Join
                our community of compassionate donors today!
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="bg-slate-900/50 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <span className="block text-sm text-gray-400">Rescued</span>
                  <span className="block text-3xl font-bold text-purple-400">500+</span>
                  <span className="block text-sm text-gray-400">Animals</span>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg border border-pink-500/20 hover:border-pink-500/40 transition-colors">
                  <span className="block text-sm text-gray-400">Active</span>
                  <span className="block text-3xl font-bold text-pink-400">50+</span>
                  <span className="block text-sm text-gray-400">Organizations</span>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <span className="block text-sm text-gray-400">Generous</span>
                  <span className="block text-3xl font-bold text-purple-400">10K+</span>
                  <span className="block text-sm text-gray-400">Donors</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
