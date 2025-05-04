"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import Link from "next/link"
import { Heart, PawPrint, Shield, Sparkles, Users, ChevronRight } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function About() {
  const { ref: missionRef, inView: missionInView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const { ref: valuesRef, inView: valuesInView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const { ref: teamRef, inView: teamInView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
          <Image
            src="/images/animalrescue.jpg"
            alt="About CryptoPaws"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute w-2 h-2 bg-white rounded-full top-1/4 left-1/4 animate-pulse"></div>
            <div className="absolute w-3 h-3 bg-white rounded-full top-1/3 left-1/2 animate-ping"></div>
            <div className="absolute w-2 h-2 bg-white rounded-full top-2/3 left-1/3 animate-pulse"></div>
            <div className="absolute w-3 h-3 bg-white rounded-full top-1/2 left-3/4 animate-ping"></div>
            <div className="absolute w-2 h-2 bg-white rounded-full top-3/4 left-1/4 animate-pulse"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-white px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full text-white text-lg font-medium mb-6"
              >
                <PawPrint className="h-5 w-5 text-purple-300" />
                <span>ABOUT CRYPTOPAWS</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                Transforming <span className="text-purple-300">Animal Welfare</span> <br className="hidden md:block" />
                Through <span className="text-pink-300">Blockchain</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto"
              >
                Creating a transparent, efficient, and impactful platform for animal rescue
              </motion.p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section ref={missionRef} className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                animate={missionInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-1 rounded-full text-purple-800 dark:text-purple-300 text-sm font-medium mb-6">
                  <Shield className="h-4 w-4" />
                  <span>OUR PURPOSE</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Our Mission</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8"></div>

                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-6">
                  At CryptoPaws, our mission is to revolutionize animal welfare by leveraging blockchain technology to
                  create a transparent, efficient, and impactful donation platform. We believe that every animal
                  deserves care, protection, and a loving home.
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-6">
                  We connect compassionate donors with verified animal welfare organizations, ensuring that every
                  contribution makes a real difference in the lives of animals in need. Through blockchain transparency,
                  donors can track exactly how their funds are being used.
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                  Our platform empowers both donors and welfare organizations to work together more effectively,
                  maximizing the impact of every donation and helping more animals find safety, health, and happiness.
                </p>
              </motion.div>

              <motion.div
                className="lg:w-1/2 relative"
                initial={{ opacity: 0, x: 50 }}
                animate={missionInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image src="/images/BlockChain.jpeg" alt="Our Mission" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent"></div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section
          ref={valuesRef}
          className="py-24 px-4 relative bg-gradient-to-b from-white to-purple-50 dark:from-slate-900 dark:to-slate-800"
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900 dark:to-transparent z-10"></div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-900 dark:to-transparent z-10"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/10 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/10 dark:bg-pink-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto max-w-7xl relative z-20">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-1 rounded-full text-purple-800 dark:text-purple-300 text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                <span>WHAT WE STAND FOR</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Our Core Values</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6"></div>
              <p className="text-slate-700 dark:text-slate-300 text-lg max-w-3xl mx-auto">
                The principles that guide our mission and shape everything we do to help animals in need.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-slate-700"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/charityhand.png"
                      alt="Transparency"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center text-slate-900 dark:text-white">Transparency</h3>
                <div className="w-10 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
                <p className="text-slate-700 dark:text-slate-300 text-center">
                  We believe in complete transparency in how donations are collected, distributed, and utilized, enabled
                  by blockchain technology that makes every transaction verifiable.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-slate-700"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-pink-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Image src="/images/charityhand2.png" alt="Compassion" width={24} height={24} className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center text-slate-900 dark:text-white">Compassion</h3>
                <div className="w-10 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-4"></div>
                <p className="text-slate-700 dark:text-slate-300 text-center">
                  Every action we take is driven by genuine compassion for animals and a deep-rooted desire to improve
                  their welfare and create lasting positive change in their lives.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-slate-700"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Image src="/images/community.png" alt="Innovation" width={24} height={24} className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center text-slate-900 dark:text-white">Innovation</h3>
                <div className="w-10 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
                <p className="text-slate-700 dark:text-slate-300 text-center">
                  We continuously seek innovative solutions and leverage cutting-edge technology to enhance animal
                  welfare and improve the donation experience for everyone involved.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section ref={teamRef} className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={teamInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-1 rounded-full text-purple-800 dark:text-purple-300 text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                <span>THE PEOPLE BEHIND CRYPTOPAWS</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Our Team</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6"></div>
              <p className="text-slate-700 dark:text-slate-300 text-lg max-w-3xl mx-auto">
                Meet the passionate individuals dedicated to transforming animal welfare through technology.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-8">
              {[
                {
                  name: "Sana Rizwan",
                  position: "Team Lead",
                  image: "/images/sana.png",
                  description:
                    "A visionary leader with a passion for innovation and a deep commitment to improving animal welfare through technology.",
                },
                {
                  name: "Hatim Bilal",
                  position: "Developer",
                  image: "/images/hatim.jpg",
                  description:
                    "Focused on building scalable and secure solutions to bring transparency and trust to the donation process.",
                },
                {
                  name: "Taha Kayani",
                  position: "Developer",
                  image: "/images/taha.jpg",
                  description:
                    "Dedicated to crafting clean, user-friendly experiences that help donors and organizations connect meaningfully.",
                },
              ].map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={teamInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="relative w-48 h-48 mb-6 overflow-hidden">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 animate-pulse-slow"></div>
                    <div className="absolute inset-1 rounded-full overflow-hidden bg-white dark:bg-slate-800 p-1">
                      <div className="w-full h-full relative rounded-full overflow-hidden transform group-hover:scale-110 transition-transform duration-500">
                        <Image
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    {member.position}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 max-w-xs">{member.description}</p>

                  <div className="mt-4 flex gap-3">
                    <a
                      href="#"
                      className="w-8 h-8 bg-gray-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-slate-700 dark:text-slate-300"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-8 h-8 bg-gray-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-slate-700 dark:text-slate-300"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-8 h-8 bg-gray-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-slate-700 dark:text-slate-300"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-2 h-2 bg-white rounded-full top-1/4 left-1/4 animate-pulse"></div>
              <div className="absolute w-3 h-3 bg-white rounded-full top-1/3 left-1/2 animate-ping"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full top-2/3 left-1/3 animate-pulse"></div>
              <div className="absolute w-3 h-3 bg-white rounded-full top-1/2 left-3/4 animate-ping"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full top-3/4 left-1/4 animate-pulse"></div>
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-white text-lg font-medium mb-6"
              >
                <Sparkles className="h-5 w-5" />
                <span>BE PART OF THE CHANGE</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="text-4xl md:text-5xl font-bold mb-6 text-white"
              >
                Join Our Mission Today
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="text-xl text-white/90 mb-10 max-w-3xl mx-auto"
              >
                Together, we can create a better world for animals in need. Whether you donate, volunteer, or register
                your organization, your contribution makes a significant difference.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="flex flex-wrap justify-center gap-6"
              >
                <Link
                  href="/donate"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    <span>Donate Now</span>
                  </div>
                </Link>
                <Link
                  href="/register-welfare"
                  className="bg-transparent hover:bg-white/20 border-2 border-white px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Register Organization</span>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                className="mt-10"
              >
                <Link
                  href="/learn-more"
                  className="inline-flex items-center text-white/90 hover:text-white transition-colors group"
                >
                  <span>Learn more about what we do</span>
                  <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
