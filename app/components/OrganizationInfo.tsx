"use client"

import { useEffect, useState } from "react"
import { useDonationContract } from "@/hooks/useDonationContract"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface OrganizationInfoProps {
  organizationAddress: string
}

interface OrganizationDetails {
  name: string
  description: string
  totalDonations: string
  uniqueDonors: number
  isActive: boolean
}

export default function OrganizationInfo({ organizationAddress }: OrganizationInfoProps) {
  const [details, setDetails] = useState<OrganizationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getOrganizationInfo } = useDonationContract()

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const info = await getOrganizationInfo(organizationAddress)
        setDetails(info)
      } catch (error) {
        console.error("Error fetching organization details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [organizationAddress, getOrganizationInfo])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (!details) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Organization not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{details.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{details.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Donations</p>
            <p className="text-lg font-semibold">{details.totalDonations} ETH</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Unique Donors</p>
            <p className="text-lg font-semibold">{details.uniqueDonors}</p>
          </div>
        </div>
        <div className="mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            details.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {details.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
} 