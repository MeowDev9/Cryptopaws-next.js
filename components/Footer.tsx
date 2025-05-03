import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center mb-4">
              <Image src="/images/logo.png" alt="CryptoPaws Logo" width={40} height={40} className="mr-2" />
              <h3 className="text-xl font-bold">CryptoPaws</h3>
            </div>
            <p className="text-gray-400 mb-4">
              CryptoPaws is a blockchain-powered platform dedicated to animal welfare. We connect donors with animal
              welfare organizations to make a real difference in the lives of animals in need.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/adopt-animal" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Adopt
                </Link>
              </li>
              <li>
                <Link href="/register-welfare" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Register Organization
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-purple-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">123 Charity Lane, Animal City, AC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-purple-500 mr-2 flex-shrink-0" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-purple-500 mr-2 flex-shrink-0" />
                <span className="text-gray-400">info@cryptopaws.org</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for updates on our animal welfare projects.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none flex-1"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-md transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} CryptoPaws. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

