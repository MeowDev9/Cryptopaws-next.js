"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const ImageTest = () => {
  const [imagePath, setImagePath] = useState("")
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Fetch a case to get an image path
    const fetchImagePath = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/welfare/cases/latest")
        if (!response.ok) {
          throw new Error("Failed to fetch cases")
        }
        const data = await response.json()
        console.log("Test API Response:", data)
        
        if (data.length > 0 && data[0].imageUrl && data[0].imageUrl.length > 0) {
          setImagePath(`/uploads/${data[0].imageUrl[0]}`)
          console.log("Test Image Path:", `/uploads/${data[0].imageUrl[0]}`)
        } else {
          setImageError(true)
        }
      } catch (err) {
        console.error("Error fetching test image:", err)
        setImageError(true)
      }
    }

    fetchImagePath()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Image Test</h2>
      
      {imageError ? (
        <div className="text-red-500">Failed to load test image</div>
      ) : !imagePath ? (
        <div>Loading test image...</div>
      ) : (
        <div>
          <p className="mb-2">Testing image path: {imagePath}</p>
          <div className="relative w-64 h-64 border border-gray-300">
            <Image 
              src={imagePath} 
              alt="Test Image" 
              fill 
              style={{ objectFit: "cover" }}
              onError={() => {
                console.error("Image failed to load:", imagePath)
                setImageError(true)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageTest 