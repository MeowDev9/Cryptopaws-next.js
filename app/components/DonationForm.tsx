"use client"

import { useState } from "react"
import { useDonationContract } from "@/hooks/useDonationContract"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface DonationFormProps {
  organizationAddress: string
  onSuccess?: () => void
}

export default function DonationForm({ organizationAddress, onSuccess }: DonationFormProps) {
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { donate } = useDonationContract()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsLoading(true)
    try {
      const tx = await donate(organizationAddress, Number(amount), message)
      await tx.wait()
      toast.success("Donation successful!")
      setAmount("")
      setMessage("")
      onSuccess?.()
    } catch (error) {
      console.error("Error making donation:", error)
      toast.error("Failed to make donation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount (ETH)
        </label>
        <Input
          id="amount"
          type="number"
          step="0.001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in ETH"
          required
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message (Optional)
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a message with your donation"
          rows={3}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Processing..." : "Donate"}
      </Button>
    </form>
  )
} 