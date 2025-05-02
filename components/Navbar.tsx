"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white bg-opacity-90 backdrop-blur-md shadow-md py-2"
          : "bg-white bg-opacity-80 py-4" // Changed from transparent to semi-transparent white
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="CryptoPaws Logo" width={40} height={40} className="mr-2" />
          <span className={`font-bold text-xl ${isScrolled ? "text-gray-800" : "text-gray-900"}`}>
            CryptoPaws
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`font-medium hover:text-purple-500 transition-colors ${
              isScrolled ? "text-gray-800" : "text-gray-900"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`font-medium hover:text-purple-500 transition-colors ${
              isScrolled ? "text-gray-800" : "text-gray-900"
            }`}
          >
            About
          </Link>
          <Link
            href="/donate"
            className={`font-medium hover:text-purple-500 transition-colors ${
              isScrolled ? "text-gray-800" : "text-gray-900"
            }`}
          >
            Donate
          </Link>
          <Link
            href="/adopt-animal"
            className={`font-medium hover:text-purple-500 transition-colors ${
              isScrolled ? "text-gray-800" : "text-gray-900"
            }`}
          >
            Adopt
          </Link>
          <Link
            href="/register-welfare"
            className={`font-medium hover:text-purple-500 transition-colors ${
              isScrolled ? "text-gray-800" : "text-gray-900"
            }`}
          >
            Register Organization
          </Link>
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors"
          >
            Login / Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X className={isScrolled ? "text-gray-800" : "text-white"} />
          ) : (
            <Menu className={isScrolled ? "text-gray-800" : "text-white"} />
          )}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white z-50 p-5">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="font-medium text-gray-800 hover:text-purple-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="font-medium text-gray-800 hover:text-purple-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/donate"
                className="font-medium text-gray-800 hover:text-purple-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Donate
              </Link>
              <Link
                href="/adopt-animal"
                className="font-medium text-gray-800 hover:text-purple-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Adopt
              </Link>
              <Link
                href="/register-welfare"
                className="font-medium text-gray-800 hover:text-purple-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register Organization
              </Link>
              <Link
                href="/login"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login / Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
