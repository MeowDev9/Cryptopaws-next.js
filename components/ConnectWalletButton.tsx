"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Wallet } from "lucide-react"

const ConnectWalletButton = ({ onConnect, className = "" }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")

  const connectWallet = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask and try again.")
      alert("MetaMask is not installed. Please install MetaMask and try again.")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      
      // Get the signer
      const signer = await provider.getSigner()
      
      // Get the address
      const address = await signer.getAddress()
      
      // Check if the address is valid
      if (!address || address === "0x0000000000000000000000000000000000000000") {
        throw new Error("Invalid wallet address")
      }

      // Call the onConnect callback with the address
      onConnect(address)
      
      // Clear any previous errors
      setError("")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet. Please try again."
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={connectWallet}
        disabled={isConnecting}
        className={`bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors flex items-center ${className}`}
      >
        {isConnecting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
        ) : (
          <Wallet size={16} className="mr-2" />
        )}
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default ConnectWalletButton
