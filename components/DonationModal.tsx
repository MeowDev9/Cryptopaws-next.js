"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, AlertCircle, Loader2 } from "lucide-react"
import { ethers } from "ethers"
import { DONATION_CONTRACT_ADDRESS, DONATION_CONTRACT_ABI } from "@/app/config/contracts"
import { useDonationContract } from "@/hooks/useDonationContract"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface DonationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  caseData: {
    _id: string;
    title: string;
    description: string;
    targetAmount: string;
    amountRaised: string;
    imageUrl: string;
    welfare: string;
    welfareAddress: string | null;
    category: string;
    status: string;
    createdAt: string;
  };
  walletAddress?: string;
  onDonationComplete?: (data: { amount: string; txHash?: string }) => void;
  fetchCases?: () => Promise<void>;
}

export default function DonationModal({
  isOpen = true,
  onClose,
  caseData,
  walletAddress,
  onDonationComplete,
  fetchCases,
}: DonationModalProps) {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("ETH")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { donate, donationStatus } = useDonationContract()
  
  // ETH to USD conversion rate (example rate, should be fetched from an API in production)
  const ethToUsdRate = 3000 // 1 ETH = $3000 USD

  const exchangeRates = {
    ETH: 1,
    USDC: 0.0005, // 1 USDC = 0.0005 ETH
    USDT: 0.0005, // 1 USDT = 0.0005 ETH
  }

  // Calculate USD equivalent
  const calculateUsdEquivalent = () => {
    if (!amount || isNaN(parseFloat(amount))) return "0.00"
    
    const amountInEth = parseFloat(amount) * exchangeRates[currency as keyof typeof exchangeRates]
    const usdAmount = amountInEth * ethToUsdRate
    return usdAmount.toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsProcessing(true)

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (!caseData.welfareAddress) {
        throw new Error("This case cannot receive donations because the welfare organization's blockchain address is not set up. Please contact the welfare organization.")
      }

      // Convert amount to ETH based on selected currency
      const amountInEth = parseFloat(amount) * exchangeRates[currency as keyof typeof exchangeRates]
      
      // Convert ETH amount to Wei
      const amountInWei = ethers.parseEther(amountInEth.toString())

      // Attempt donation
      const tx = await donate(amountInWei, caseData.welfareAddress, "")
      
      // Wait for transaction confirmation
      await tx.wait()

      // Call the completion callback if provided
      if (onDonationComplete) {
        onDonationComplete({
          amount: amount,
          txHash: tx.hash
        })
      }

      // Refresh cases after successful donation
      if (fetchCases) {
        await fetchCases()
      }

      // Reset form and close modal
      setAmount("")
      setCurrency("ETH")
      onClose()
    } catch (err: any) {
      console.error("Donation error:", err)
      setError(
        err.message || "Failed to process donation. Please try again."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  // Calculate progress percentage
  const progressPercentage = Math.min(
    (parseFloat(caseData.amountRaised) / parseFloat(caseData.targetAmount)) * 100, 
    100
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full overflow-hidden">
        {/* Header with close button */}
        <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Make a Donation</h2>
          <button 
            onClick={onClose} 
            className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Case information */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-lg text-foreground">{caseData.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{caseData.description}</p>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Raised: ${parseFloat(caseData.amountRaised).toFixed(2)}</span>
            <span className="font-medium text-foreground">${parseFloat(caseData.targetAmount).toFixed(2)}</span>
          </div>
          <div className="mt-2">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          {caseData.welfareAddress && (
            <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Welfare Address:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(caseData.welfareAddress);
                      // You could add a toast notification here
                    }}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="font-mono text-xs text-muted-foreground break-all">
                  {caseData.welfareAddress}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Donation form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Donation Amount
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                  className="pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-muted-foreground text-sm">{currency}</span>
                </div>
              </div>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                ≈ ${calculateUsdEquivalent()} USD
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Processing your donation...</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Donate Now'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

