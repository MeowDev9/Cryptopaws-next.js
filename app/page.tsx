"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import CountUp from "react-countup"
import { Heart, Users, PawPrintIcon as Paw, Star, Shield, Coffee, Sparkles } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import AutoScrollCards from "@/components/AutoScrollCards"

const HeroSection = () => {
  return (
    <div className="relative h-screen w-full flex items-center justify-start pl-12 overflow-hidden">
      <Image
        src="/images/slideshowdog.jpg"
        alt="Hero background"
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
        fill
        priority
        quality={90}
      />
      {/* Simple dark overlay instead of gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-0"></div>

      <div className="relative z-10 text-left px-8 md:px-16 max-w-3xl text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center gap-2 mb-2"
        >
          <Paw className="h-6 w-6 text-purple-300" />
          <span className="text-xl md:text-2xl font-medium text-purple-300">Raising Hope</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-bold my-4 leading-tight"
        >
          To the <span className="text-purple-300">Homeless</span> & <span className="text-pink-300">Hopeless</span>{" "}
          Animals
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="text-gray-300 text-lg mb-8 max-w-xl"
        >
          Join our mission to rescue, rehabilitate, and rehome animals in need. Every donation makes a difference.
        </motion.p>

        <div className="flex flex-wrap gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <Link href="/report-emergency">
              <button className="bg-red-600 text-white border-none py-3 px-8 text-base font-semibold rounded-full cursor-pointer transition-all duration-300 inline-block hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Report Emergency
              </button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link href="/register-welfare">
              <button className="bg-purple-600 text-white border-none py-3 px-8 text-base font-semibold rounded-full cursor-pointer transition-all duration-300 inline-block hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-600/30 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Register Organization
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative element with solid color */}
      <div className="absolute bottom-10 right-10 z-10 hidden lg:block">
        <div className="w-32 h-32 rounded-full bg-purple-600/20 backdrop-blur-sm flex items-center justify-center">
          <Paw className="h-12 w-12 text-white" />
        </div>
      </div>
    </div>
  )
}

const StatisticsSection = () => {
  const [startAnimation, setStartAnimation] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true)
        }
      },
      { threshold: 0.5 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-24 px-[5%] text-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white/50 to-transparent"></div>
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 opacity-30 blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-white text-sm font-medium mb-4">
          <Star className="h-4 w-4" />
          <span>GREAT REVIEWS FOR OUR GREAT SERVICES</span>
        </div>

        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700 bg-clip-text text-transparent">
          Technical Statistics
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto mb-16 text-lg">
          Our impact in numbers - every statistic represents animals helped and lives changed through your generous
          support.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatBox
            imgSrc="/images/charityhand.png"
            number={60000000}
            text="Fund Raised"
            start={startAnimation}
            gradient="from-purple-500 to-indigo-600"
          />
          <StatBox
            imgSrc="/images/community.png"
            number={9200}
            text="Completed Projects"
            start={startAnimation}
            gradient="from-pink-500 to-rose-600"
          />
          <StatBox
            imgSrc="/images/donateicon.png"
            number={5800}
            text="Donations"
            start={startAnimation}
            gradient="from-amber-500 to-orange-600"
          />
          <StatBox
            imgSrc="/images/volunteer.png"
            number={2750}
            text="Volunteers"
            start={startAnimation}
            gradient="from-emerald-500 to-teal-600"
          />
        </div>
      </div>
    </section>
  )
}

const StatBox = ({
  imgSrc,
  number,
  text,
  start,
  gradient,
}: {
  imgSrc: string
  number: number
  text: string
  start: boolean
  gradient: string
}) => (
  <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
    ></div>

    <div
      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-500`}
    >
      <Image src={imgSrc || "/placeholder.svg"} alt={text} className="w-8 h-8 text-white" width={32} height={32} />
    </div>

    <div className={`text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
      <CountUp start={start ? 0 : undefined} end={start ? number : 0} duration={3} separator=",">
        {({ countUpRef }) => <span ref={countUpRef} />}
      </CountUp>
    </div>

    <p className="text-lg text-gray-700 font-medium">{text}</p>
  </div>
)

const BlockchainSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  return (
    <section className="py-32 px-[5%] relative text-white text-center overflow-hidden" ref={ref}>
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/BlockChain.jpeg" alt="Blockchain background" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-black/80 to-pink-900/90"></div>
      </div>

      {/* Animated particles */}
      <div className="absolute top-0 left-0 w-full h-full z-[1] opacity-30">
        <div className="absolute w-2 h-2 bg-white rounded-full top-1/4 left-1/4 animate-pulse"></div>
        <div className="absolute w-3 h-3 bg-purple-300 rounded-full top-1/3 left-1/2 animate-ping"></div>
        <div className="absolute w-2 h-2 bg-pink-300 rounded-full top-2/3 left-1/3 animate-pulse"></div>
        <div className="absolute w-3 h-3 bg-white rounded-full top-1/2 left-3/4 animate-ping"></div>
        <div className="absolute w-2 h-2 bg-purple-300 rounded-full top-3/4 left-1/4 animate-pulse"></div>
      </div>

      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 100 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full text-white text-lg font-medium mb-6"
        >
          <Sparkles className="h-5 w-5 text-purple-300" />
          <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">CRYPTOPAWS</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-5xl font-bold mb-8 leading-tight"
        >
          Making Animal Charity{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Easy</span> and{" "}
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Secure</span>{" "}
          through Blockchain Transparency
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-gray-300 text-lg mb-12 max-w-3xl mx-auto"
        >
          Our blockchain technology ensures complete transparency in how your donations are used, allowing you to track
          your contribution from the moment it's made to its final impact.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <Link href="/donate">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none py-4 px-8 text-lg font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Donate Now
            </button>
          </Link>

          <Link href="/register-welfare">
            <button className="bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white border-2 border-white/30 py-4 px-8 text-lg font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Register Organization
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

const DonationSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <div
      ref={ref}
      className="relative py-24 px-[5%] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/30 to-transparent"></div>
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-pink-600/10 blur-3xl"></div>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center">
        <motion.div
          className="flex-1 min-w-[300px] p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium mb-6">
            <Heart className="h-4 w-4 text-pink-400" />
            <span>MAKE A DIFFERENCE TODAY</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            We Help{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Thousands
            </span>{" "}
            of Animals to Get Their{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Shelter</span>
          </h2>

          <p className="text-base leading-relaxed mb-6 text-gray-300">
            Every year, countless animals are left homeless, hungry, and in need of care. With your support, we provide
            shelter, food, and medical aid, ensuring that every rescued animal finds a safe and loving home.
          </p>

          <p className="text-base leading-relaxed mb-8 text-gray-300">
            From abandoned pets to injured strays, we work tirelessly to give animals the care they deserve. Your
            donations help us rescue, rehabilitate, and rehome thousands of animals, offering them a future filled with
            love and security.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <div className="flex items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Image src="/images/charityhand.png" alt="Donate" width={24} height={24} className="w-6 h-6" />
              </div>
              <span className="text-white font-medium">Start Donating</span>
            </div>

            <div className="flex items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Image src="/images/community.png" alt="Community" width={24} height={24} className="w-6 h-6" />
              </div>
              <span className="text-white font-medium">Join Our Community</span>
            </div>

            <div className="flex items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Image src="/images/volunteer.png" alt="Volunteer" width={24} height={24} className="w-6 h-6" />
              </div>
              <span className="text-white font-medium">Be A Volunteer</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 min-w-[300px] p-8"
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Animal Charity
            </h2>
            <h3 className="text-xl font-normal mb-8 text-gray-300">Giving is the greatest act of grace</h3>

            <form>
              <label className="block text-sm font-semibold mb-1 text-gray-300">YOUR FULL NAME</label>
              <input
                type="text"
                placeholder="Your Full Name"
                className="w-full p-4 mb-5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />

              <label className="block text-sm font-semibold mb-1 text-gray-300">EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 mb-5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />

              <label className="block text-sm font-semibold mb-1 text-gray-300">SELECT CAUSE</label>
              <select className="w-full p-4 mb-5 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                <option>Food</option>
                <option>Shelter</option>
                <option>Health</option>
              </select>

              <label className="block text-sm font-semibold mb-1 text-gray-300">AMOUNT TO DONATE</label>
              <input
                type="text"
                placeholder="Amount"
                className="w-full p-4 mb-5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />

              <div className="flex flex-wrap gap-4 mb-6">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                  <input type="radio" name="payment" className="accent-purple-600" /> PayPal
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                  <input type="radio" name="payment" className="accent-purple-600" /> Credit Card
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                  <input type="radio" name="payment" className="accent-purple-600" /> Payoneer
                </label>
              </div>

              <button
                type="submit"
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                <Heart className="h-5 w-5" />
                Donate Now
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const AdoptionSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section
      ref={ref}
      className="relative py-24 px-[5%] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/30 to-transparent"></div>
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-pink-600/10 blur-3xl"></div>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center">
        <motion.div
          className="flex-1 min-w-[300px] p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
            <Image
              src="/images/dog-image.jpg"
              alt="Smiling Dog"
              width={600}
              height={400}
              className="w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium mb-2">
                <Paw className="h-4 w-4 text-pink-400" />
                <span>ADOPTION STORIES</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Find your perfect companion</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 min-w-[300px] p-10 flex flex-col justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium mb-4">
            <Coffee className="h-4 w-4 text-pink-400" />
            <span>Welcome to CryptoPaws Non-Profit Charity</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Do You{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Care</span>{" "}
            About Me?
          </h1>

          <p className="text-base leading-relaxed mb-5 text-gray-300">
            Give a loving home to a rescued animal today! Our platform connects you with animals in need of shelter,
            care, and companionship. By adopting from our website, you not only gain a loyal friend but also help reduce
            animal homelessness.
          </p>

          <p className="text-base leading-relaxed mb-6 text-gray-300">
            Browse through our listings of adorable pets waiting for their forever families. Each adoption gives an
            animal a second chance at life. Start your journey today and bring home a new best friend!
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/adopt-animal"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 text-base font-semibold rounded-xl self-start transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30 flex items-center gap-2"
            >
              <Paw className="h-5 w-5" />
              Start Adoption
            </Link>

            <Link
              href="/adoption-stories"
              className="inline-block bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white border border-white/20 py-4 px-8 text-base font-semibold rounded-xl self-start transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
            >
              <Heart className="h-5 w-5" />
              Success Stories
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <DonationSection />
      <StatisticsSection />
      <AutoScrollCards />
      <BlockchainSection />
      <AdoptionSection />
      <Footer />
    </>
  )
}
