import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Image from "next/image"
import Link from "next/link"

export default function About() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        {/* Hero Section */}
        <div className="relative h-80 md:h-96 bg-gray-900">
          <Image
            src="/images/animalrescue.jpg"
            alt="About CryptoPaws"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About CryptoPaws</h1>
              <p className="text-xl max-w-2xl">
                Transforming animal welfare through blockchain technology and compassion
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-foreground">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  At CryptoPaws, our mission is to revolutionize animal welfare by leveraging blockchain technology to
                  create a transparent, efficient, and impactful donation platform. We believe that every animal
                  deserves care, protection, and a loving home.
                </p>
                <p className="text-muted-foreground mb-4">
                  We connect compassionate donors with verified animal welfare organizations, ensuring that every
                  contribution makes a real difference in the lives of animals in need. Through blockchain transparency,
                  donors can track exactly how their funds are being used.
                </p>
                <p className="text-muted-foreground">
                  Our platform empowers both donors and welfare organizations to work together more effectively,
                  maximizing the impact of every donation and helping more animals find safety, health, and happiness.
                </p>
              </div>
              <div className="md:w-1/2 relative h-80 md:h-96 rounded-xl overflow-hidden shadow-xl">
                <Image src="/images/BlockChain.jpeg" alt="Our Mission" fill style={{ objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Image src="/images/charityhand.png" alt="Transparency" width={32} height={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Transparency</h3>
                <p className="text-muted-foreground text-center">
                  We believe in complete transparency in how donations are collected, distributed, and utilized, enabled
                  by blockchain technology.
                </p>
              </div>

              <div className="bg-background p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Image src="/images/charityhand2.png" alt="Compassion" width={32} height={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Compassion</h3>
                <p className="text-muted-foreground text-center">
                  Every action we take is driven by genuine compassion for animals and a desire to improve their
                  welfare.
                </p>
              </div>

              <div className="bg-background p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Image src="/images/community.png" alt="Innovation" width={32} height={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Innovation</h3>
                <p className="text-muted-foreground text-center">
                  We continuously seek innovative solutions to enhance animal welfare and improve the donation
                  experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((member) => (
                <div key={member} className="text-center">
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
                    <Image
                      src="/images/placeholder-user.jpg"
                      alt={`Team Member ${member}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Team Member {member}</h3>
                  <p className="text-primary">Position</p>
                  <p className="text-muted-foreground mt-2">
                    Passionate about animal welfare and dedicated to making a difference.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Together, we can create a better world for animals. Donate, volunteer, or register your organization
              today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/donate"
                className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Donate Now
              </Link>
              <Link
                href="/register-welfare"
                className="bg-transparent hover:bg-primary-dark border-2 border-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Register Organization
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

