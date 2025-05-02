"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

const AutoScrollCards = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [cases, setCases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch the latest 6 cases from welfare organizations
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://localhost:5001/api/welfare/cases/latest")
        if (!response.ok) {
          throw new Error("Failed to fetch cases")
        }
        const data = await response.json()
        console.log("API Response:", data) // Log the API response
        setCases(data.cases.slice(0, 6)) // Get only the latest 6 cases from the cases array
      } catch (err) {
        console.error("Error fetching cases:", err)
        setError("Failed to load featured cases. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [])

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer || isHovered || cases.length === 0) return

    let animationId: number
    let scrollPosition = 0

    const scroll = () => {
      if (!scrollContainer || isHovered) return

      scrollPosition += 0.5
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }

      scrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isHovered, cases])

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-primary font-semibold mb-2">FEATURED CASES</h3>
          <h2 className="text-3xl font-bold text-foreground">Help Animals In Need</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Browse through our current cases and choose a cause that resonates with you. Every donation makes a
            difference in an animal's life.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No cases available at the moment.</p>
          </div>
        ) : (
          <div
            className="overflow-x-auto hide-scrollbar"
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ scrollBehavior: "smooth" }}
          >
            <div className="flex space-x-6 py-4 min-w-max">
              {cases.map((card: any) => (
                <div
                  key={card._id}
                  className="flex-shrink-0 w-80 bg-card rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105"
                >
                  <div className="h-48 relative">
                    <Image 
                      src={card.imageUrl && card.imageUrl.length > 0 
                        ? `http://localhost:5001/uploads/${card.imageUrl[0]}` 
                        : "/placeholder.svg"} 
                      alt={card.title} 
                      fill 
                      style={{ objectFit: "cover" }} 
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-card-foreground">{card.title}</h3>
                    <p className="text-muted-foreground mb-4">{card.description}</p>

                    <div className="mb-4">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(card.amountRaised / card.targetAmount) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {Math.round((card.amountRaised / card.targetAmount) * 100)}% Funded
                        </span>
                        <span className="font-medium text-card-foreground">
                          ${card.amountRaised}/${card.targetAmount}
                        </span>
                      </div>
                    </div>

                    <Link href={`/donate/${card._id}`}>
                      <button className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md transition-colors">
                        Donate Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default AutoScrollCards

