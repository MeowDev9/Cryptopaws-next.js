"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import CountUp from "react-countup"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import AutoScrollCards from "@/components/AutoScrollCards"

const HeroSection = () => {
  return (
    <div className="hero-section">
      <Image
        src="/images/slideshowdog.jpg"
        alt="Hero background"
        className="hero-background"
        fill
        priority
        quality={90}
        style={{ objectFit: "cover" }}
      />
      <div className="hero-overlay"></div>
      <div className="hero-content text-left px-8 md:px-16 max-w-3xl">
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-xl md:text-2xl font-medium"
        >
          Raising Hope
        </motion.h3>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold my-4"
        >
          To the Homeless & Hopeless Animals
        </motion.h1>
        <div className="flex flex-wrap gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <Link href="/report-emergency">
              <button className="hero-button bg-red-600 hover:bg-red-700">Report Emergency</button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link href="/register-welfare">
              <button className="hero-button">Register Organization</button>
            </Link>
          </motion.div>
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
    <section ref={sectionRef} className="statistics-section">
      <div className="container1">
        <h3 className="technicalstatistics-h3">GREAT REVIEWS FOR OUR GREAT SERVICES</h3>
        <h2 className="section-title">Technical Statistics</h2>
        <div className="stats-grid">
          <StatBox imgSrc="/images/charityhand.png" number={60000000} text="Fund Raised" start={startAnimation} />
          <StatBox imgSrc="/images/community.png" number={9200} text="Completed Projects" start={startAnimation} />
          <StatBox imgSrc="/images/donateicon.png" number={5800} text="Donations" start={startAnimation} />
          <StatBox imgSrc="/images/volunteer.png" number={2750} text="Volunteers" start={startAnimation} />
        </div>
      </div>
    </section>
  )
}

const StatBox = ({ imgSrc, number, text, start }: { imgSrc: string; number: number; text: string; start: boolean }) => (
  <div className="stat-box">
    <Image src={imgSrc || "/placeholder.svg"} alt={text} className="stat-icon" width={50} height={50} />
    <CountUp start={start ? 0 : undefined} end={start ? number : 0} duration={3} separator=",">
      {({ countUpRef }) => <span ref={countUpRef} />}
    </CountUp>
    <p>{text}</p>
  </div>
)

const BlockchainSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  return (
    <section className="blockchain-section" ref={ref}>
      <motion.div
        className="blockchain-container"
        initial={{ opacity: 0, y: 100 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h3
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          CRYPTOPAWS
        </motion.h3>

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Making Animal Charity Easy and Secure through Blockchain Transparency
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Link href="/donate">
            <button>Donate Now</button>
          </Link>

          <Link href="/register-welfare">
            <button id="blockchain-container-btn2">Register Organization</button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />

      <div className="donation-section">
        <div className="content-column">
          <h2>We Help Thousands of Animals to Get Their Shelter</h2>
          <p>
            Every year, countless animals are left homeless, hungry, and in need of care. With your support, we provide
            shelter, food, and medical aid, ensuring that every rescued animal finds a safe and loving home.
          </p>
          <p>
            From abandoned pets to injured strays, we work tirelessly to give animals the care they deserve. Your
            donations help us rescue, rehabilitate, and rehome thousands of animals, offering them a future filled with
            love and security.
          </p>
          <div className="buttons-container">
            <div className="image-button">
              <Image src="/images/charityhand.png" alt="Donate" width={30} height={30} />
              <span>Start Donating</span>
            </div>
            <div className="image-button">
              <Image src="/images/community.png" alt="Community" width={30} height={30} />
              <span>Join Our Community</span>
            </div>
            <div className="image-button">
              <Image src="/images/volunteer.png" alt="Volunteer" width={30} height={30} />
              <span>Be A Volunteer</span>
            </div>
          </div>
        </div>

        <div className="form-column">
          <div className="donation-form">
            <h2>Animal Charity</h2>
            <h3>Giving is the greatest act of grace</h3>
            <form>
              <label>YOUR FULL NAME</label>
              <input type="text" placeholder="Your Full Name" />

              <label>EMAIL ADDRESS</label>
              <input type="email" placeholder="Email" />

              <label>SELECT CAUSE</label>
              <select>
                <option>Food</option>
                <option>Shelter</option>
                <option>Health</option>
              </select>

              <label>AMOUNT TO DONATE</label>
              <input type="text" placeholder="Amount" />

              <div className="payment-methods">
                <label>
                  <input type="radio" name="payment" /> PayPal
                </label>
                <label>
                  <input type="radio" name="payment" /> Credit Card
                </label>
                <label>
                  <input type="radio" name="payment" /> Payoneer
                </label>
              </div>

              <button type="submit" className="donate-btn">
                Donate Now
              </button>
            </form>
          </div>
        </div>
      </div>

      <StatisticsSection />
      <AutoScrollCards />
      <BlockchainSection />

      <section className="adoption-section">
        <div className="adoption-image">
          <Image
            src="/images/dog-image.jpg"
            alt="Smiling Dog"
            width={600}
            height={400}
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="adoption-content">
          <p className="adoption-subtitle">Welcome to CryptoPaws Non-Profit Charity</p>
          <h1 className="adoption-title">Do You Care About Me?</h1>
          <p className="adoption-text">
            Give a loving home to a rescued animal today! Our platform connects you with animals in need of shelter,
            care, and companionship. By adopting from our website, you not only gain a loyal friend but also help reduce
            animal homelessness.
          </p>
          <p className="adoption-text">
            Browse through our listings of adorable pets waiting for their forever families. Each adoption gives an
            animal a second chance at life. Start your journey today—click "Adopt Now" and bring home a new best friend!
          </p>
          <Link href="/adopt-animal" className="adoption-button">
            Start Adoption
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}

