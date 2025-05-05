"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Home,
  CreditCard,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Filter,
  Bookmark,
  MessageSquare,
  Star,
  PawPrint,
  Clock,
  ChevronDown,
  ExternalLink,
  CheckCircle,
  Loader2,
  AlertCircle,
  AlertTriangle,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import ConnectWalletButton from "@/components/ConnectWalletButton"
import CaseCard from "@/components/CaseCard"
import DonationModal from "@/components/DonationModal"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from '@/components/ui/button'
import { ethers } from 'ethers'
import { toast } from 'sonner'

const COLORS = ["#8b5cf6", "#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444"]

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  phone?: string;
  address?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    telegram?: string;
  };
}

interface Case {
  _id: string;
  title: string;
  description: string;
  targetAmount: string;
  amountRaised: string;
  imageUrl: string;
  welfare: string;
  welfareId: string;  // Added this field
  welfareAddress: string | null;
  category: string;
  status: string;
  createdAt: string;
}

interface DonationData {
  amount: string;
  txHash?: string;
}

interface DonationHistory {
  id: string;
  welfare: string;
  case: string;
  amount: string;
  amountUsd: string;
  date: string;
  status: string;
  txHash: string;
}

interface SavedWelfare {
  id: string;
  name: string;
  description: string;
  image: string;
  welfareAddress?: string;
}

interface Message {
  id: string;
  welfare: string;
  title: string;
  message: string;
  date: string;
  image: string;
}

interface SuccessStory {
  id: string;
  title: string;
  description: string;
  image: string;
  welfare?: string;
}

interface Emergency {
  _id: string;
  animalType: string;
  condition: string;
  location: string;
  description: string;
  status: string;
  createdAt: string;
  images?: string[];
}

interface Adoption {
  _id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  images: string[];
  location: string;
  health: string;
  behavior: string;
  status: string;
  postedBy: string;
  adoptedBy?: string;
  createdAt: string;
}

// Add to the interface section
interface AdoptionRequest {
  _id: string;
  adoptionId: string;
  adoption: {
    name: string;
    type: string;
    breed: string;
    images: string[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'payment pending' | 'under review';
  reason: string;
  preferredContact: string;
  createdAt: string;
  paymentProof?: string;
}

export default function DonorDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    category: "all",
    status: "all",
    dateRange: "all",
  })
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([])
  const [savedWelfares, setSavedWelfares] = useState<SavedWelfare[]>([])
  const [allWelfares, setAllWelfares] = useState<SavedWelfare[]>([])
  const [isSavingWelfare, setIsSavingWelfare] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([])
  const [donationStats, setDonationStats] = useState({
    totalDonated: 0,
    casesSupported: 0,
    welfaresSupported: 0,
    monthlyChange: {
      donations: 0,
      cases: 0,
      welfares: 0
    },
    byWelfare: [] as { name: string; value: number }[],
    byCategory: [] as { name: string; value: number }[]
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const [profileUpdateError, setProfileUpdateError] = useState("")
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null)
  const [viewEmergencyDialogOpen, setViewEmergencyDialogOpen] = useState(false)
  const [emergencyAssignedWelfare, setEmergencyAssignedWelfare] = useState<SavedWelfare | null>(null)
  const [adoptions, setAdoptions] = useState<Adoption[]>([])
  const [showAddAdoption, setShowAddAdoption] = useState(false)
  const [newAdoption, setNewAdoption] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    description: "",
    location: "",
    health: "",
    behavior: "",
    images: [] as (string[] | File[])
  })
  const [adoptionImagePreviews, setAdoptionImagePreviews] = useState<string[]>([]);
  const { toast } = useToast()
  // 1. Add status filter state
  const [adoptionStatusFilter, setAdoptionStatusFilter] = useState<string>('available');
  // 1. Add state for adoption request modal and form fields
  const [showAdoptionRequestModal, setShowAdoptionRequestModal] = useState(false);
  const [adoptionRequestAdoptionId, setAdoptionRequestAdoptionId] = useState<string | null>(null);
  const [adoptionRequestForm, setAdoptionRequestForm] = useState({
    donorName: userProfile?.name || '',
    contactNumber: userProfile?.phone || '',
    email: userProfile?.email || '',
    reason: '',
    preferredContact: 'Email',
  });
  const [adoptionRequestLoading, setAdoptionRequestLoading] = useState(false);
  const [adoptionRequestSuccess, setAdoptionRequestSuccess] = useState<string | null>(null);
  const [adoptionRequestError, setAdoptionRequestError] = useState<string | null>(null);
  // Add to the state section
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const USDT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';

  const fetchCases = async () => {
    try {
      setLoading(true)

      // Check if we're in the browser environment
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("donorToken")
        if (!token) {
          router.push("/login")
          return
        }
        
        // Fetch cases from API
        const response = await fetch("http://localhost:5001/api/auth/cases/all", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch cases")
        }

        const data = await response.json()
        
        // Log raw data
        console.log('Raw cases data:', data)
        
        // Transform the data to match our Case interface
        const transformedCases = data.map((caseItem: any) => {
          // Log each case's welfare data
          console.log('Case welfare data:', {
            caseId: caseItem._id,
            createdBy: caseItem.createdBy,
            blockchainAddress: caseItem.createdBy?.blockchainAddress
          })
          
          return {
            _id: caseItem._id,
            title: caseItem.title,
            description: caseItem.description,
            targetAmount: caseItem.targetAmount.toString(),
            amountRaised: caseItem.amountRaised ? caseItem.amountRaised.toString() : "0",
            imageUrl: caseItem.imageUrl && caseItem.imageUrl.length > 0 ? caseItem.imageUrl[0] : "/images/placeholder.jpg",
            welfare: caseItem.createdBy ? caseItem.createdBy.name || "Unknown Welfare" : "Unknown Welfare",
            welfareId: caseItem.createdBy?._id || "",  // Added this field
            welfareAddress: caseItem.createdBy?.blockchainAddress || null,
            category: caseItem.medicalIssue || "General",
            status: caseItem.status || "Active",
            createdAt: new Date(caseItem.createdAt).toISOString().split('T')[0]
          }
        })
        
        // Log transformed cases
        console.log('Transformed cases:', transformedCases)
        
        setCases(transformedCases)
      }
      setLoading(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch cases"
      console.error("Error fetching cases:", errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  }

  // Initial fetch of cases
  useEffect(() => {
    fetchCases()
  }, [router])

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("donorToken")
          if (!token) {
            router.push("/login")
            return
          }
          
          // Fetch user profile from API
          const response = await fetch("http://localhost:5001/api/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error("Failed to fetch profile")
          }

          const data = await response.json()
          
          // Transform the data to match our UserProfile interface
          const profile: UserProfile = {
            name: data.name || "Anonymous Donor",
            email: data.email || "",
            bio: data.bio || "",
            phone: data.phone || "",
            address: data.address || "",
            socialLinks: {
              twitter: data.socialLinks?.twitter || "",
              linkedin: data.socialLinks?.linkedin || "",
              facebook: data.socialLinks?.facebook || "",
              telegram: data.socialLinks?.telegram || ""
            }
          }
          
          setUserProfile(profile)
          setEditedProfile(profile)
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        console.error("Error fetching profile:", errorMessage)
      }
    }

    fetchUserProfile()
  }, [router])

  // Fetch donation stats
  useEffect(() => {
    const fetchDonationStats = async () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("donorToken")
          if (!token) return
          
          const response = await fetch("http://localhost:5001/api/donor/donations/stats", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          if (!response.ok) {
            throw new Error("Failed to fetch donation stats")
          }
          
          const data = await response.json()
          setDonationStats(data)
        }
      } catch (error) {
        console.error("Error fetching donation stats:", error)
      }
    }
    
    fetchDonationStats()
  }, [])

  // Fetch donation history
  useEffect(() => {
    const fetchDonationHistory = async () => {
      try {
        if (typeof window !== "undefined" && activeTab === "donations") {
          const token = localStorage.getItem("donorToken")
          if (!token) return
          
          const response = await fetch("http://localhost:5001/api/donor/donations/history", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          if (!response.ok) {
            throw new Error("Failed to fetch donation history")
          }
          
          const data = await response.json()
          
          // Transform the data to match our DonationHistory interface
          const transformedHistory = data.map((donation: any) => ({
            id: donation._id,
            welfare: donation.welfare?.name || "Unknown Welfare",
            case: donation.case?.title || "Unknown Case",
            amount: donation.amount.toString(),
            amountUsd: donation.amountUsd.toString(),
            date: new Date(donation.createdAt).toLocaleDateString(),
            status: donation.status,
            txHash: donation.txHash
          }))
          
          setDonationHistory(transformedHistory)
        }
      } catch (error) {
        console.error("Error fetching donation history:", error)
      }
    }
    
    fetchDonationHistory()
  }, [activeTab])

  // Fetch saved welfares
  useEffect(() => {
    const fetchSavedWelfares = async () => {
      try {
        if (typeof window !== "undefined" && activeTab === "saved") {
          const token = localStorage.getItem("donorToken")
          if (!token) return
          
          const response = await fetch("http://localhost:5001/api/donor/saved-welfares", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          if (!response.ok) {
            throw new Error("Failed to fetch saved welfares")
          }
          
          const data = await response.json()
          
          // Transform the data to match our SavedWelfare interface
          const transformedWelfares = data.map((welfare: any) => ({
            id: welfare._id,
            name: welfare.name,
            description: welfare.description,
            image: welfare.profileImage && welfare.profileImage.startsWith('/') 
              ? `http://localhost:5001${welfare.profileImage}` 
              : welfare.profileImage || "/images/placeholder.jpg",
            welfareAddress: welfare.welfareAddress
          }))
          
          setSavedWelfares(transformedWelfares)
        }
      } catch (error) {
        console.error("Error fetching saved welfares:", error)
      }
    }
    
    fetchSavedWelfares()
  }, [activeTab])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (typeof window !== "undefined" && activeTab === "messages") {
          console.log("Fetching messages for donor...");
          const token = localStorage.getItem("donorToken")
          if (!token) {
            console.log("No donor token found");
            return;
          }
          
          console.log("Making API call to fetch messages...");
          const response = await fetch("http://localhost:5001/api/donor/messages", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          if (!response.ok) {
            console.error("Failed to fetch messages:", response.status, response.statusText);
            throw new Error("Failed to fetch messages")
          }
          
          const data = await response.json()
          console.log("Received messages data:", data);
          
          // Transform the data to match our Message interface
          const transformedMessages = data.map((msg: any) => ({
            id: msg._id,
            welfare: msg.from?.name || "Unknown Welfare",
            title: msg.title,
            message: msg.content,
            date: new Date(msg.createdAt).toLocaleDateString(),
            image: msg.from?.profileImage || "/images/placeholder.jpg"
          }))
          
          console.log("Transformed messages:", transformedMessages);
          setMessages(transformedMessages)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }
    
    fetchMessages()
  }, [activeTab])

  // Fetch success stories
  useEffect(() => {
    const fetchSuccessStories = async () => {
      try {
        if (typeof window !== "undefined" && activeTab === "stories") {
          const response = await fetch("http://localhost:5001/api/welfare/public/success-stories")
          
          if (!response.ok) {
            throw new Error("Failed to fetch success stories")
          }
          
          const data = await response.json()
          
          // Transform the data to match our SuccessStory interface
          const transformedStories = data.successStories.map((story: any) => ({
            id: story._id,
            title: story.title,
            description: story.content,
            image: story.imageUrl && story.imageUrl.length > 0 
              ? `http://localhost:5001/uploads/${story.imageUrl[0]}`
              : "/images/placeholder.jpg",
            welfare: story.postedBy.name
          }))
          
          setSuccessStories(transformedStories)
        }
      } catch (error) {
        console.error("Error fetching success stories:", error)
      }
    }
    
    fetchSuccessStories()
  }, [activeTab])

  // Add this useEffect to fetch all welfares
  useEffect(() => {
    const fetchAllWelfares = async () => {
      try {
        // Only fetch all welfares when the saved tab is active
        if (activeTab !== "saved") return
        
        if (typeof window !== "undefined") {
          // We don't need a token for the public endpoint
          // Fetch all approved welfares from API with the correct endpoint
          const response = await fetch("http://localhost:5001/api/welfare/public/approved")

          if (!response.ok) {
            throw new Error("Failed to fetch approved welfares")
          }

          const data = await response.json()
          
          // Transform the data to match our SavedWelfare interface
          const transformedWelfares = data.map((welfare: any) => ({
            id: welfare._id,
            name: welfare.name,
            description: welfare.description || "No description provided",
            image: welfare.profilePicture ? `http://localhost:5001${welfare.profilePicture}` : "/images/placeholder.jpg"
          }))
          
          // Filter out welfares that are already saved
          const savedWelfareIds = savedWelfares.map((w: SavedWelfare) => w.id)
          const unsavedWelfares = transformedWelfares.filter((w: any) => !savedWelfareIds.includes(w.id))
          
          setAllWelfares(unsavedWelfares)
        }
      } catch (error) {
        console.error("Error fetching approved welfares:", error)
      }
    }

    fetchAllWelfares()
  }, [activeTab, savedWelfares])

  // Above the handleWalletConnect function, add a useEffect to check if endpoints exist
  useEffect(() => {
    // Check if the backend API is available
    const checkApi = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/health-check");
        if (!response.ok) {
          console.warn("Backend API may not be available. Some features may not work correctly.");
        }
      } catch (error) {
        console.warn("Backend API connection failed. Using fallback data where needed.");
      }
    };
    
    checkApi();
  }, []);

  // Fetch emergency reports
  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        if (typeof window !== "undefined" && activeTab === "emergencies") {
          // No need for token for public endpoint
          const response = await fetch("http://localhost:5001/api/emergency/public");

          if (!response.ok) {
            throw new Error("Failed to fetch emergency reports");
          }

          const data = await response.json();
          console.log("Fetched emergency data:", data);
          setEmergencies(data);
        }
      } catch (error) {
        console.error("Error fetching emergency reports:", error);
      }
    };
    
    fetchEmergencies();
  }, [activeTab, router]);

  const handleWalletConnect = (address: string) => {
    setWalletConnected(true)
    setWalletAddress(address)
  }

  const handleDonate = async (caseData: Case) => {
    console.log('Donation initiated for case:', {
      caseId: caseData._id,
      welfare: caseData.welfare,
      welfareAddress: caseData.welfareAddress
    })

    if (!walletConnected || !walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    console.log('Setting selected case:', caseData)
    setSelectedCase(caseData);
    setShowDonationModal(true);
  };

  const handleDonationComplete = async (data: { amount: string; txHash: string }) => {
    try {
      // Show success message in the UI
      toast({
        title: "Donation Successful",
        description: `Successfully donated ${data.amount} ETH! Transaction hash: ${data.txHash}`,
        variant: "default",
      });
      
      // Get the token
      const token = localStorage.getItem("donorToken")
      if (!token) {
        throw new Error("Not authenticated")
      }

      if (!walletAddress) {
        throw new Error("Wallet address not found")
      }

      if (!selectedCase?.welfareAddress) {
        throw new Error("Welfare organization address not found")
      }

      // Record the donation in our backend
      const response = await fetch("http://localhost:5001/api/donor/donate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          caseId: selectedCase?._id,
          welfareId: selectedCase?.welfareId,
          amount: data.amount,
          txHash: data.txHash,
          amountUsd: parseFloat(data.amount) * 3000, // Using the same ETH to USD rate as in DonationModal
          blockchainData: {
            donorAddress: walletAddress,
            organizationAddress: selectedCase.welfareAddress,
            timestamp: Math.floor(Date.now() / 1000)
          }
        })
      })

      if (!response.ok) {
        throw new Error("Failed to record donation")
      }

      setShowDonationModal(false);
      
      // Wait for a short delay to ensure the backend has processed the donation and created the message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Switch to messages tab
      setActiveTab("messages");
      
      // Fetch messages
      const messagesResponse = await fetch("http://localhost:5001/api/donor/messages", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        const transformedMessages = messagesData.map((msg: any) => ({
          id: msg._id,
          welfare: msg.from?.name || "Unknown Welfare",
          title: msg.title,
          message: msg.content,
          date: new Date(msg.createdAt).toLocaleDateString(),
          image: msg.from?.profileImage || "/images/placeholder.jpg"
        }));
        setMessages(transformedMessages);
      }
      
      // Refresh the cases to show updated amounts
      await fetchCases();
      
      // Refresh donation history if on donations tab
      if (activeTab === "donations") {
        const historyResponse = await fetch("http://localhost:5001/api/donor/donations/history", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          const transformedHistory = historyData.map((donation: any) => ({
            id: donation._id,
            welfare: donation.welfare?.name || "Unknown Welfare",
            case: donation.case?.title || "Unknown Case",
            amount: donation.amount.toString(),
            amountUsd: donation.amountUsd.toString(),
            date: new Date(donation.createdAt).toLocaleDateString(),
            status: donation.status,
            txHash: donation.txHash
          }))
          setDonationHistory(transformedHistory)
        }
      }
    } catch (error) {
      console.error("Error recording donation:", error)
      toast({
        title: "Warning",
        description: "Donation was successful on blockchain but failed to record in our system. Please contact support.",
        variant: "destructive",
      })
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      // Comment out token removal for development
      // localStorage.removeItem("donorToken")
      router.push("/login")
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const toggleFilter = () => {
    setFilterOpen(!filterOpen)
  }

  const applyFilter = (type: 'category' | 'status' | 'dateRange', value: string) => {
    setSelectedFilters({
      ...selectedFilters,
      [type]: value,
    })
  }

  // Add this function to save a welfare
  const saveWelfare = async (welfareId: string) => {
    try {
      setIsSavingWelfare(true)
      
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("donorToken")
        if (!token) {
          return
        }

        // Save welfare via API
        const response = await fetch("http://localhost:5001/api/donor/save-welfare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ welfareId })
        })

        if (!response.ok) {
          throw new Error("Failed to save welfare")
        }

        // Find the welfare in allWelfares and add it to savedWelfares
        const welfareToSave = allWelfares.find(w => w.id === welfareId)
        if (welfareToSave) {
          setSavedWelfares(prev => [...prev, welfareToSave])
          // Remove from allWelfares
          setAllWelfares(prev => prev.filter(w => w.id !== welfareId))
        }
      }
    } catch (error) {
      console.error("Error saving welfare:", error)
    } finally {
      setIsSavingWelfare(false)
    }
  }

  // Add this function to unsave a welfare
  const unsaveWelfare = async (welfareId: string) => {
    try {
      setIsSavingWelfare(true)
      
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("donorToken")
        if (!token) {
          return
        }

        // Unsave welfare via API
        const response = await fetch(`http://localhost:5001/api/donor/unsave-welfare/${welfareId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to unsave welfare")
        }

        // Find the welfare in savedWelfares and add it to allWelfares
        const welfareToUnsave = savedWelfares.find(w => w.id === welfareId)
        if (welfareToUnsave) {
          setAllWelfares(prev => [...prev, welfareToUnsave])
          // Remove from savedWelfares
          setSavedWelfares(prev => prev.filter(w => w.id !== welfareId))
        }
      }
    } catch (error) {
      console.error("Error unsaving welfare:", error)
    } finally {
      setIsSavingWelfare(false)
    }
  }

  // Add a new function to handle profile edit changes
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    if (!editedProfile) return
    
    if (field.startsWith("socialLinks.")) {
      const socialField = field.split(".")[1] as keyof UserProfile['socialLinks']
      setEditedProfile({
        ...editedProfile,
        socialLinks: {
          ...editedProfile.socialLinks,
          [socialField]: e.target.value
        }
      })
    } else {
      setEditedProfile({
        ...editedProfile,
        [field as keyof UserProfile]: e.target.value
      })
    }
  }

  // Add a function to save profile changes
  const saveProfileChanges = async () => {
    if (!editedProfile) return
    
    setIsSavingProfile(true)
    setProfileUpdateSuccess(false)
    setProfileUpdateError("")
    
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("donorToken")
        if (!token) return
        
        // Prepare data for API
        const profileData = {
          name: editedProfile.name,
          bio: editedProfile.bio,
          phone: editedProfile.phone,
          address: editedProfile.address,
          socialLinks: editedProfile.socialLinks
        }
        
        // Save profile via API
        const response = await fetch("http://localhost:5001/api/auth/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to update profile")
        }
        
        // Update the profile in state
        setUserProfile(editedProfile)
        setProfileUpdateSuccess(true)
        setIsEditing(false)
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setProfileUpdateSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setProfileUpdateError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleViewEmergency = async (emergency: Emergency) => {
    setSelectedEmergency(emergency)
    setViewEmergencyDialogOpen(true)
    
    // If the emergency is assigned to a welfare, fetch the welfare details
    if (emergency.status === "Assigned" || emergency.status === "In Progress") {
      try {
        const token = localStorage.getItem("donorToken")
        if (!token) return
        
        const response = await fetch(`http://localhost:5001/api/emergency/${emergency._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.assignedTo) {
            // Find this welfare in our saved welfares or all welfares
            const welfare = [...savedWelfares, ...allWelfares].find(w => w.id === data.assignedTo._id)
            if (welfare) {
              setEmergencyAssignedWelfare(welfare)
            } else {
              // Create a minimal welfare object from the response
              setEmergencyAssignedWelfare({
                id: data.assignedTo._id,
                name: data.assignedTo.name,
                description: "This welfare organization is handling this emergency case.",
                image: "/images/welfare-placeholder.jpg"
              })
            }
          }
        }
      } catch (error) {
        console.error("Error fetching emergency details:", error)
      }
    } else {
      setEmergencyAssignedWelfare(null)
    }
  }

  const handleAdoptionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const previews = Array.from(files).map(file => URL.createObjectURL(file))
      setAdoptionImagePreviews(previews)
      setNewAdoption(prev => ({ ...prev, images: Array.from(files) }))
    }
  }

  const fetchAdoptions = async () => {
    try {
      console.log('Fetching adoptions...');
      const token = localStorage.getItem('donorToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/adoption/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch adoptions');
      }
      
      const data = await response.json();
      console.log('Adoptions fetched successfully:', data);
      setAdoptions(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load adoptions';
      console.error('Error fetching adoptions:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleAddAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('donorToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('name', newAdoption.name);
      formData.append('type', newAdoption.type);
      formData.append('breed', newAdoption.breed);
      formData.append('age', newAdoption.age);
      formData.append('gender', newAdoption.gender);
      formData.append('size', newAdoption.size);
      formData.append('description', newAdoption.description);
      formData.append('location', newAdoption.location);
      formData.append('health', newAdoption.health);
      formData.append('behavior', newAdoption.behavior);
      formData.append('postedByType', 'donor');
      
      // Append each image file
      if (newAdoption.images && newAdoption.images.length > 0) {
        for (const file of newAdoption.images) {
          formData.append('images', file);
        }
      }

      const response = await fetch('http://localhost:5001/api/adoption', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create adoption listing');
      }

      const data = await response.json();
      console.log('Adoption created successfully:', data);
      
      // Reset form state
      setNewAdoption({
        name: '',
        type: '',
        breed: '',
        age: '',
        gender: '',
        size: '',
        description: '',
        location: '',
        health: '',
        behavior: '',
        images: [],
      });
      setAdoptionImagePreviews([]);
      setShowAddAdoption(false);
      
      // Refresh adoptions list
      fetchAdoptions();
    } catch (error) {
      console.error('Error creating adoption:', error);
      setError(error instanceof Error ? error.message : 'Failed to create adoption listing');
    }
  };

  const handleAdopt = async (adoptionId: string) => {
    try {
      const token = localStorage.getItem('donorToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5001/api/adoption/${adoptionId}/adopt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process adoption');
      }

      const updatedAdoption = await response.json();
      setAdoptions(adoptions.map(adoption => 
        adoption._id === adoptionId ? updatedAdoption : adoption
      ));
    } catch (error) {
      console.error('Error processing adoption:', error);
      setError(error instanceof Error ? error.message : 'Failed to process adoption');
    }
  };

  // Add this to your useEffect
  useEffect(() => {
    if (activeTab === 'adoptions') {
      fetchAdoptions();
    }
  }, [activeTab]);

  // 2. Function to open modal and set adoptionId
  const openAdoptionRequestModal = (adoptionId: string) => {
    setAdoptionRequestAdoptionId(adoptionId);
    setAdoptionRequestForm({
      donorName: userProfile?.name || '',
      contactNumber: userProfile?.phone || '',
      email: userProfile?.email || '',
      reason: '',
      preferredContact: 'Email',
    });
    setAdoptionRequestSuccess(null);
    setAdoptionRequestError(null);
    setShowAdoptionRequestModal(true);
  };

  // 3. Function to submit adoption request
  const handleSubmitAdoptionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptionRequestAdoptionId) return;
    setAdoptionRequestLoading(true);
    setAdoptionRequestSuccess(null);
    setAdoptionRequestError(null);
    try {
      const token = localStorage.getItem('donorToken');
      if (!token) throw new Error('No authentication token found');
      const response = await fetch('http://localhost:5001/api/adoption-request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adoptionId: adoptionRequestAdoptionId,
          ...adoptionRequestForm,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit adoption request');
      }
      setAdoptionRequestSuccess('Adoption request submitted successfully!');
      setTimeout(() => setShowAdoptionRequestModal(false), 1500);
    } catch (error) {
      setAdoptionRequestError(error instanceof Error ? error.message : 'Failed to submit adoption request');
    } finally {
      setAdoptionRequestLoading(false);
    }
  };

  // Add this function to fetch adoption requests
  const fetchAdoptionRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = localStorage.getItem('donorToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:5001/api/adoption-request/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch adoption requests');
      }

      const requests = await response.json();
      console.log('Raw adoption requests:', requests);

      // Fetch adoption details for each request
      const requestsWithAdoptionDetails = await Promise.all(
        requests.map(async (request: any) => {
          try {
            // Ensure adoptionId is a string
            const adoptionId = typeof request.adoptionId === 'object' ? request.adoptionId._id : request.adoptionId;
            console.log('Fetching adoption details for ID:', adoptionId);

            if (!adoptionId) {
              console.warn('No adoptionId found for request:', request);
              return request;
            }

            const adoptionResponse = await fetch(`http://localhost:5001/api/adoption/${adoptionId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (adoptionResponse.ok) {
              const adoptionData = await adoptionResponse.json();
              console.log('Fetched adoption data:', adoptionData);
              return {
                ...request,
                adoption: {
                  name: adoptionData.name,
                  type: adoptionData.type,
                  breed: adoptionData.breed,
                  images: adoptionData.images
                }
              };
            } else {
              console.error('Failed to fetch adoption details:', await adoptionResponse.text());
              return request;
            }
          } catch (error) {
            console.error('Error fetching adoption details:', error);
            return request;
          }
        })
      );

      console.log('Requests with adoption details:', requestsWithAdoptionDetails);
      setAdoptionRequests(requestsWithAdoptionDetails);
    } catch (error) {
      console.error('Error fetching adoption requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load adoption requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Add to useEffect for adoption requests
  useEffect(() => {
    if (activeTab === 'adoption-requests') {
      fetchAdoptionRequests();
    }
  }, [activeTab]);

  // Add this function to handle payment proof upload
  const handlePaymentProofUpload = async (requestId: string, file: File) => {
    try {
      const token = localStorage.getItem('donorToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('paymentProof', file);

      const response = await fetch(`http://localhost:5001/api/adoption-request/${requestId}/payment-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload payment proof');
      }

      // Refresh requests to show updated status
      fetchAdoptionRequests();
      toast({
        title: "Success",
        description: "Payment proof uploaded successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload payment proof",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (requestId: string) => {
    try {
      setIsLoading(true);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to make payments');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const senderAddress = accounts[0];

      // Create a provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Check user's balance
      const balance = await provider.getBalance(senderAddress);
      const balanceInEth = ethers.formatEther(balance);
      
      // Convert 30 USDT to ETH (assuming 1 USDT = 0.0005 ETH)
      const requiredAmount = ethers.parseEther('0.015'); // 30 * 0.0005 ETH

      if (balance < requiredAmount) {
        throw new Error('Insufficient balance. Please ensure you have enough ETH to cover the payment.');
      }

      // Send the transaction
      const tx = await signer.sendTransaction({
        to: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', // Welfare organization's wallet
        value: requiredAmount
      });

      // Send payment details to backend
      const response = await fetch(`http://localhost:5001/api/adoption-request/${requestId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('donorToken')}`
        },
        body: JSON.stringify({
          fromAddress: senderAddress,
          amount: 30 // Amount in USDT
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process payment');
      }

      // Refresh the requests list
      await fetchAdoptionRequests();
      
      toast({
        title: 'Success',
        description: 'Payment successful!'
      });
    } catch (error: unknown) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process payment'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster />
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full bg-gray-800 text-white">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-gray-800 bg-opacity-90 backdrop-blur-lg border-r border-gray-700`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-xl font-bold">C</span>
            </div>
            <h1 className="text-xl font-bold">CryptoPaws</h1>
          </div>

          <div className="mb-8">
            {walletConnected ? (
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400">Connected Wallet</p>
                <p className="text-sm font-mono truncate">{walletAddress}</p>
              </div>
            ) : (
              <ConnectWalletButton onConnect={handleWalletConnect} />
            )}
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                activeTab === "overview" ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <Home size={20} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                activeTab === "explore" ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <PawPrint size={20} />
              <span>Explore Cases</span>
            </button>
            <button
              onClick={() => setActiveTab("donations")}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                activeTab === "donations" ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <CreditCard size={20} />
              <span>My Donations</span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                activeTab === "saved" ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <Bookmark size={20} />
              <span>Saved Welfares</span>
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                activeTab === "messages" ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <MessageSquare size={20} />
              <span>Messages</span>
            </button>
            <button
              onClick={() => setActiveTab("success")}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                activeTab === "success" ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <Star size={20} />
              <span>Success Stories</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                activeTab === "profile" ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("emergencies")}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                activeTab === "emergencies" ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <AlertCircle size={20} />
              <span>Emergencies</span>
            </button>
            <button
              onClick={() => setActiveTab("adoptions")}
              className={`flex items-center w-full p-2 rounded-md ${
                activeTab === "adoptions" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Heart className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Adoptions</span>}
            </button>
            <button
              onClick={() => setActiveTab("adoption-requests")}
              className={`flex items-center w-full p-2 rounded-md ${
                activeTab === "adoption-requests" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <ClipboardList className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">My Requests</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {userProfile?.name || "Donor"}</h1>
          <p className="text-gray-400">Manage your donations and explore animal welfare cases</p>
            </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Donated</h3>
                <p className="text-3xl font-bold">${donationStats.totalDonated.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className={donationStats.monthlyChange.donations >= 0 ? "text-green-500" : "text-red-500"}>
                    {donationStats.monthlyChange.donations >= 0 ? "+" : ""}
                    {donationStats.monthlyChange.donations}%
                  </span>{" "}
                  this month
                </p>
                  </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Cases Supported</h3>
                <p className="text-3xl font-bold">{donationStats.casesSupported}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className={donationStats.monthlyChange.cases >= 0 ? "text-green-500" : "text-red-500"}>
                    {donationStats.monthlyChange.cases >= 0 ? "+" : ""}
                    {donationStats.monthlyChange.cases}
                  </span>{" "}
                  new this month
                </p>
                          </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Welfares Supported</h3>
                <p className="text-3xl font-bold">{donationStats.welfaresSupported}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className={donationStats.monthlyChange.welfares >= 0 ? "text-green-500" : "text-red-500"}>
                    {donationStats.monthlyChange.welfares >= 0 ? "+" : ""}
                    {donationStats.monthlyChange.welfares}
                  </span>{" "}
                  new this month
                </p>
                </div>
              </div>

            {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-medium mb-4">Donations by Welfare</h3>
                  <div className="h-64">
                  {donationStats.byWelfare.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donationStats.byWelfare}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {donationStats.byWelfare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No donation data available</p>
                  </div>
                  )}
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-medium mb-4">Donations by Category</h3>
                  <div className="h-64">
                  {donationStats.byCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donationStats.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {donationStats.byCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No donation data available</p>
                    </div>
                  )}
                  </div>
                </div>
              </div>

            {/* Recent Donations */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Donations</h3>
                <button
                  onClick={() => setActiveTab("donations")}
                  className="text-primary text-sm hover:underline flex items-center"
                >
                  View All <ExternalLink className="ml-1 h-3 w-3" />
                </button>
                    </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Case</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Welfare</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donationHistory.length > 0 ? (
                      donationHistory.slice(0, 5).map((donation) => (
                        <tr key={donation.id} className="border-b border-border">
                          <td className="py-3 text-sm">{donation.date}</td>
                          <td className="py-3 text-sm">{donation.case}</td>
                          <td className="py-3 text-sm">{donation.welfare}</td>
                          <td className="py-3 text-sm text-right">${donation.amountUsd}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          No donations yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                    </div>
                  </div>
                    </div>
        )}

        {/* Explore Cases Tab */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
              <div className="relative">
                <button
                  onClick={toggleFilter}
                  className="flex items-center space-x-2 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <Filter size={20} />
                  <span>Filter</span>
                  <ChevronDown size={16} />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 p-4">
                    <div className="mb-4">
                      <h4 className="font-bold mb-2">Category</h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value="all"
                            checked={selectedFilters.category === "all"}
                            onChange={() => applyFilter("category", "all")}
                            className="mr-2"
                          />
                          All
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value="medical"
                            checked={selectedFilters.category === "medical"}
                            onChange={() => applyFilter("category", "medical")}
                            className="mr-2"
                          />
                          Medical
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value="shelter"
                            checked={selectedFilters.category === "shelter"}
                            onChange={() => applyFilter("category", "shelter")}
                            className="mr-2"
                          />
                          Shelter
                        </label>
                  </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-bold mb-2">Status</h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="all"
                            checked={selectedFilters.status === "all"}
                            onChange={() => applyFilter("status", "all")}
                            className="mr-2"
                          />
                          All
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={selectedFilters.status === "active"}
                            onChange={() => applyFilter("status", "active")}
                            className="mr-2"
                          />
                          Active
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="completed"
                            checked={selectedFilters.status === "completed"}
                            onChange={() => applyFilter("status", "completed")}
                            className="mr-2"
                          />
                          Completed
                        </label>
                    </div>
                  </div>
                    <div>
                      <h4 className="font-bold mb-2">Date Range</h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="dateRange"
                            value="all"
                            checked={selectedFilters.dateRange === "all"}
                            onChange={() => applyFilter("dateRange", "all")}
                            className="mr-2"
                          />
                          All Time
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="dateRange"
                            value="week"
                            checked={selectedFilters.dateRange === "week"}
                            onChange={() => applyFilter("dateRange", "week")}
                            className="mr-2"
                          />
                          Last Week
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="dateRange"
                            value="month"
                            checked={selectedFilters.dateRange === "month"}
                            onChange={() => applyFilter("dateRange", "month")}
                            className="mr-2"
                          />
                          Last Month
                        </label>
                </div>
              </div>
            </div>
          )}
              </div>
            </div>

            {/* Cases Grid */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
              <div className="bg-red-900 text-white p-4 rounded-lg">
                <p>Error: {error}</p>
              </div>
            ) : cases.length === 0 ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-xl">No cases found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cases.map((caseItem) => (
                    <CaseCard
                      key={caseItem._id}
                      caseData={caseItem}
                    onDonate={handleDonate}
                      walletConnected={walletConnected}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Donations Tab */}
          {activeTab === "donations" && (
            <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-medium mb-6">Your Donation History</h3>
              {donationHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Case</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Welfare</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationHistory.map((donation) => (
                        <tr key={donation.id} className="border-b border-border">
                          <td className="py-3 text-sm">{donation.date}</td>
                          <td className="py-3 text-sm">{donation.case}</td>
                          <td className="py-3 text-sm">{donation.welfare}</td>
                          <td className="py-3 text-sm">${donation.amountUsd}</td>
                          <td className="py-3 text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {donation.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm">
                            <a
                              href={`https://etherscan.io/tx/${donation.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              {donation.txHash.substring(0, 6)}...{donation.txHash.substring(donation.txHash.length - 4)}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PawPrint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Donations Yet</h4>
                  <p className="text-muted-foreground mb-6">You haven't made any donations yet. Start by exploring cases.</p>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Explore Cases
                  </button>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Saved Welfares Tab */}
          {activeTab === "saved" && (
            <div className="space-y-6">
            {/* Saved welfares section */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-medium mb-6">Your Saved Welfare Organizations</h3>
              {savedWelfares.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedWelfares.map((welfare) => (
                    <div key={welfare.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="relative h-40">
                        <Image src={welfare.image} alt={welfare.name} fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-lg mb-2">{welfare.name}</h4>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{welfare.description}</p>
                        <div className="flex justify-between items-center">
                          <Link
                            href={`/welfare/${welfare.id}`}
                            className="text-primary hover:underline text-sm"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => unsaveWelfare(welfare.id)}
                            className="text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300 p-1 rounded-full transition-colors"
                          >
                            <Bookmark className="h-5 w-5 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Saved Organizations</h4>
                  <p className="text-muted-foreground">Check out the organizations below and save the ones you want to follow.</p>
                </div>
              )}
            </div>

            {/* All approved welfares section */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-medium mb-6">Discover Welfare Organizations</h3>
              {allWelfares.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allWelfares.map((welfare) => (
                    <div key={welfare.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="relative h-40">
                        <Image src={welfare.image} alt={welfare.name} fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-lg mb-2">{welfare.name}</h4>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{welfare.description}</p>
                        <div className="flex justify-between items-center">
                          <Link
                            href={`/welfare/${welfare.id}`}
                            className="text-primary hover:underline text-sm"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => saveWelfare(welfare.id)}
                            disabled={isSavingWelfare}
                            className="bg-primary hover:bg-primary/90 text-white px-2 py-1 rounded text-sm"
                          >
                            {isSavingWelfare ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : savedWelfares.length > 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">You've saved all available welfare organizations</h4>
                  <p className="text-muted-foreground">Check back later for more organizations to follow.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
                  <h4 className="text-lg font-medium mb-2">Loading welfare organizations...</h4>
                  <p className="text-muted-foreground">Please wait while we fetch available organizations.</p>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-medium mb-6">Your Messages</h3>
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={message.image}
                            alt={message.welfare}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{message.title}</h4>
                            <span className="text-xs text-muted-foreground">{message.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">From: {message.welfare}</p>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Messages Yet</h4>
                  <p className="text-muted-foreground mb-6">
                    You'll receive thank you messages here when you make donations.
                  </p>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Explore Cases
                  </button>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Success Stories Tab */}
          {activeTab === "success" && (
            <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-medium mb-6">Success Stories</h3>
              {successStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {successStories.map((story) => (
                    <div key={story.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="relative h-48">
                        <Image src={story.image} alt={story.title} fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{story.title}</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs rounded-full">
                            Success Story
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">By: {story.welfare}</p>
                        <p className="text-sm line-clamp-3 mb-3">{story.description}</p>
                        <Link
                          href={`/case/${story.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          Read Full Story
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Success Stories Yet</h4>
                  <p className="text-muted-foreground mb-6">
                    Check back later for success stories from welfare organizations.
                  </p>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Explore Cases
                  </button>
                </div>
              )}
              </div>
            </div>
          )}

        {/* Emergencies Tab */}
        {activeTab === "emergencies" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Emergency Reports</h1>
              <Link href="/report-emergency" className="bg-red-600 hover:bg-red-700 px-4 py-2 text-white rounded-md text-sm font-medium inline-flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Report Emergency
              </Link>
                  </div>
            
            {emergencies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emergencies.map((emergency) => (
                  <div key={emergency._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                    <div className="relative h-48 bg-gray-200">
                      {emergency.images && emergency.images.length > 0 ? (
                        <Image
                          src={`http://localhost:5001${emergency.images[0]}`}
                          alt={`${emergency.animalType} - ${emergency.condition}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <AlertTriangle className="h-12 w-12 text-gray-400" />
                    </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-full ${
                            emergency.status === "New" ? "bg-blue-100 text-blue-800" :
                            emergency.status === "Assigned" ? "bg-yellow-100 text-yellow-800" :
                            emergency.status === "In Progress" ? "bg-purple-100 text-purple-800" :
                            emergency.status === "Resolved" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {emergency.status}
                        </span>
                    </div>
                      </div>
                      <div className="p-4">
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">{emergency.animalType} - {emergency.condition}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {emergency.location}
                        </p>
                  </div>
                      <p className="text-gray-700 text-sm line-clamp-3 mb-4">{emergency.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{new Date(emergency.createdAt).toLocaleDateString()}</span>
                        <button 
                          onClick={() => handleViewEmergency(emergency)}
                          className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200 transition-colors"
                        >
                          View Details
                        </button>
                  </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No emergency reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No public emergency reports are available at this time.
                </p>
                <div className="mt-6">
                  <Link href="/report-emergency" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    Report an Emergency
                  </Link>
              </div>
            </div>
          )}

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    For immediate assistance with animal emergencies, please call our hotline at <span className="font-bold">+1 (555) 123-4567</span> or use the Report Emergency button.
                  </p>
                    </div>
                    </div>
                    </div>
                  </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
                  <div className="space-y-6">
            {/* Profile Header & Controls */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Profile Information</h3>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditedProfile(userProfile)
                      }}
                      className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProfileChanges}
                      disabled={isSavingProfile}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 size={14} className="animate-spin mr-1" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Edit Profile
                    </button>
                )}
                  </div>
              
              {profileUpdateSuccess && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 text-green-400 rounded-md flex items-start">
                  <CheckCircle size={16} className="mr-2 mt-0.5" />
                  <p>Profile updated successfully!</p>
                </div>
              )}
              
              {profileUpdateError && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-400 rounded-md flex items-start">
                  <AlertCircle size={16} className="mr-2 mt-0.5" />
                  <p>{profileUpdateError}</p>
                </div>
              )}
              
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditing ? (
                  /* Editable fields */
                  <>
                      <div>
                      <label className="block text-gray-400 mb-1 text-sm">Name</label>
                      <input
                        type="text"
                        value={editedProfile?.name || ""}
                        onChange={(e) => handleProfileChange(e, "name")}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
            </div>
                      <div>
                      <label className="block text-gray-400 mb-1 text-sm">Email (Not Editable)</label>
                      <input
                        type="email"
                        value={editedProfile?.email || ""}
                        disabled
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 opacity-70"
                      />
                      </div>
                    <div>
                      <label className="block text-gray-400 mb-1 text-sm">Phone</label>
                      <input
                        type="tel"
                        value={editedProfile?.phone || ""}
                        onChange={(e) => handleProfileChange(e, "phone")}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 text-sm">Address</label>
                      <input
                        type="text"
                        value={editedProfile?.address || ""}
                        onChange={(e) => handleProfileChange(e, "address")}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-400 mb-1 text-sm">Bio</label>
                      <textarea
                        value={editedProfile?.bio || ""}
                        onChange={(e) => handleProfileChange(e, "bio")}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                  </>
                ) : (
                  /* Display fields */
                  <>
                      <div>
                      <p className="text-gray-400 mb-1">Name</p>
                      <p className="text-lg">{userProfile?.name || "Not provided"}</p>
                      </div>
                      <div>
                      <p className="text-gray-400 mb-1">Email</p>
                      <p className="text-lg">{userProfile?.email || "Not provided"}</p>
                      </div>
                    <div>
                      <p className="text-gray-400 mb-1">Phone</p>
                      <p className="text-lg">{userProfile?.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Address</p>
                      <p className="text-lg">{userProfile?.address || "Not provided"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-400 mb-1">Bio</p>
                      <p className="text-lg">{userProfile?.bio || "Not provided"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-medium mb-4">Social Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditing ? (
                  /* Editable social links */
                  <>
                <div>
                      <label className="block text-gray-400 mb-1 text-sm">Twitter</label>
                      <input
                        type="text"
                        value={editedProfile?.socialLinks?.twitter || ""}
                        onChange={(e) => handleProfileChange(e, "socialLinks.twitter")}
                        placeholder="@username"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                        </div>
                        <div>
                      <label className="block text-gray-400 mb-1 text-sm">LinkedIn</label>
                      <input
                        type="text"
                        value={editedProfile?.socialLinks?.linkedin || ""}
                        onChange={(e) => handleProfileChange(e, "socialLinks.linkedin")}
                        placeholder="linkedin.com/in/username"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                        </div>
                    <div>
                      <label className="block text-gray-400 mb-1 text-sm">Facebook</label>
                      <input
                        type="text"
                        value={editedProfile?.socialLinks?.facebook || ""}
                        onChange={(e) => handleProfileChange(e, "socialLinks.facebook")}
                        placeholder="facebook.com/username"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                      </div>
                    <div>
                      <label className="block text-gray-400 mb-1 text-sm">Telegram</label>
                      <input
                        type="text"
                        value={editedProfile?.socialLinks?.telegram || ""}
                        onChange={(e) => handleProfileChange(e, "socialLinks.telegram")}
                        placeholder="@username"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                  </>
                ) : (
                  /* Display social links */
                  <>
                    <div>
                      <p className="text-gray-400 mb-1">Twitter</p>
                      <p className="text-lg">
                        {userProfile?.socialLinks?.twitter ? (
                          <a
                            href={`https://twitter.com/${userProfile.socialLinks.twitter.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {userProfile.socialLinks.twitter}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                          </p>
                        </div>
                    <div>
                      <p className="text-gray-400 mb-1">LinkedIn</p>
                      <p className="text-lg">
                        {userProfile?.socialLinks?.linkedin ? (
                          <a
                            href={userProfile.socialLinks.linkedin.startsWith("http") ? userProfile.socialLinks.linkedin : `https://${userProfile.socialLinks.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {userProfile.socialLinks.linkedin}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                      </div>
                    <div>
                      <p className="text-gray-400 mb-1">Facebook</p>
                      <p className="text-lg">
                        {userProfile?.socialLinks?.facebook ? (
                          <a
                            href={userProfile.socialLinks.facebook.startsWith("http") ? userProfile.socialLinks.facebook : `https://${userProfile.socialLinks.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {userProfile.socialLinks.facebook}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Telegram</p>
                      <p className="text-lg">
                        {userProfile?.socialLinks?.telegram ? (
                          <a
                            href={`https://t.me/${userProfile.socialLinks.telegram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {userProfile.socialLinks.telegram}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                  </div>
                  </>
          )}
                </div>
            </div>
          </div>
        )}

        {/* Adoptions Tab */}
        {activeTab === "adoptions" && (
                  <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Adoption Management</h2>
              <div className="flex items-center gap-4">
                <select
                  value={adoptionStatusFilter}
                  onChange={e => setAdoptionStatusFilter(e.target.value)}
                  className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="adopted">Adopted</option>
                </select>
                <button
                  onClick={() => setShowAddAdoption(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" /> Post New Adoption
                </button>
              </div>
            </div>

            {/* Add Adoption Modal */}
            {showAddAdoption && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4 overflow-y-auto">
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full border border-gray-700 my-8">
                  <div className="flex justify-between items-start mb-4 sticky top-0 bg-gray-800 z-10">
                    <h3 className="text-lg font-medium text-white">Post New Adoption</h3>
                    <button
                      onClick={() => setShowAddAdoption(false)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form id="adoption-form" onSubmit={handleAddAdoption} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <input
                          type="text"
                          value={newAdoption.name}
                          onChange={(e) => setNewAdoption({...newAdoption, name: e.target.value})}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                        <select
                          value={newAdoption.type}
                          onChange={(e) => setNewAdoption({...newAdoption, type: e.target.value})}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          required
                        >
                          <option value="">Select type</option>
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Breed</label>
                        <input
                          type="text"
                          value={newAdoption.breed}
                          onChange={(e) => setNewAdoption({...newAdoption, breed: e.target.value})}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                        <input
                          type="text"
                          value={newAdoption.age}
                          onChange={(e) => setNewAdoption({...newAdoption, age: e.target.value})}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          required
                        />
                    </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                        <select
                          value={newAdoption.gender}
                          onChange={(e) => setNewAdoption({...newAdoption, gender: e.target.value})}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Size</label>
                        <select
                          value={newAdoption.size}
                          onChange={(e) => setNewAdoption({...newAdoption, size: e.target.value})}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          required
                        >
                          <option value="">Select size</option>
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <textarea
                        value={newAdoption.description}
                        onChange={(e) => setNewAdoption({...newAdoption, description: e.target.value})}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[100px]"
                        required
                      />
                    </div>

                        <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                      <input
                        type="text"
                        value={newAdoption.location}
                        onChange={(e) => setNewAdoption({...newAdoption, location: e.target.value})}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        required
                      />
                        </div>

                        <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Health Information</label>
                      <textarea
                        value={newAdoption.health}
                        onChange={(e) => setNewAdoption({...newAdoption, health: e.target.value})}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        rows={3}
                        placeholder="Vaccination status, medical conditions, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Behavior</label>
                      <textarea
                        value={newAdoption.behavior}
                        onChange={(e) => setNewAdoption({...newAdoption, behavior: e.target.value})}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        rows={3}
                        placeholder="Temperament, training, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Images</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdoptionImageChange}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                      {adoptionImagePreviews.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {adoptionImagePreviews.map((preview, index) => (
                            <div key={index} className="relative h-24">
                              <Image
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </form>

                  <div className="flex justify-end space-x-3 mt-4 sticky bottom-0 bg-gray-800 pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowAddAdoption(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="adoption-form"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Post Adoption
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adoptions.filter(a => adoptionStatusFilter === 'all' ? true : a.status === adoptionStatusFilter).length > 0 ? adoptions.filter(a => adoptionStatusFilter === 'all' ? true : a.status === adoptionStatusFilter).map((adoption) => (
                <div key={adoption._id} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                  <div className="h-48 bg-gray-700 relative">
                    {/* 3. Status badge */}
                    <span className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold rounded-full ${adoption.status === 'available' ? 'bg-green-600 text-white' : adoption.status === 'reserved' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-500 text-white'}`}>{adoption.status.charAt(0).toUpperCase() + adoption.status.slice(1)}</span>
                    <img
                      src={`http://localhost:5001${adoption.images[0].startsWith('/') ? '' : '/'}${adoption.images[0]}`}
                      alt={adoption.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-white mb-1">{adoption.name}</h3>
                    <p className="text-purple-400 text-sm mb-3">
                      {adoption.type} • {adoption.breed} • {adoption.age}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{adoption.location}</span>
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {/* 4. Welfare org name clickable */}
                        {typeof adoption.postedBy === 'object' && adoption.postedBy !== null ? (
                          <Link href={`/welfare/${(adoption.postedBy as any)._id}`} className="text-purple-400 hover:underline">{(adoption.postedBy as any).name}</Link>
                        ) : (
                          <span>{adoption.postedBy}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => openAdoptionRequestModal(adoption._id)}
                        className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                      >
                        Adopt
                      </button>
                  </div>
                </div>
                </div>
              )) : (
                <div className="col-span-full bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700">
                  <div className="flex flex-col items-center">
                    <Heart className="h-12 w-12 text-gray-500 mb-4" />
                    <p className="text-gray-300 mb-2">No adoptions available yet.</p>
                    <p className="text-gray-400 mb-6 text-sm">Be the first to post an adoption listing!</p>
                    <button
                      onClick={() => setShowAddAdoption(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Post First Adoption
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Adoption Requests Tab */}
          {activeTab === "adoption-requests" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">My Adoption Requests</h2>
              </div>

              {loadingRequests ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : adoptionRequests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {adoptionRequests.map((request) => (
                    <div key={request._id} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-white mb-1">
                              {request.adoption?.name || 'Unknown Animal'}
                            </h3>
                            <p className="text-purple-400 text-sm">
                              {request.adoption?.type || 'Unknown'} • {request.adoption?.breed || 'Unknown'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-500 text-gray-900' :
                            request.status === 'approved' ? 'bg-green-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-400 text-sm">Reason for Adoption</p>
                            <p className="text-gray-300">{request.reason}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Preferred Contact Method</p>
                            <p className="text-gray-300">{request.preferredContact}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Requested On</p>
                            <p className="text-gray-300">{new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {request.status === 'approved' && (
                          <div className="flex justify-end mt-4">
                            <Button
                              onClick={() => handlePayment(request._id)}
                              disabled={isLoading}
                              className="mt-4"
                            >
                              {isLoading ? 'Processing Payment...' : 'Pay Adoption Fee (30 USDT)'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700">
                  <ClipboardList className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">No adoption requests yet.</p>
                  <p className="text-gray-400 mb-6 text-sm">Submit your first adoption request by clicking the Adopt button on any available animal.</p>
                  <button
                    onClick={() => setActiveTab("adoptions")}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-purple-700 transition-colors mx-auto"
                  >
                    <PawPrint className="h-4 w-4 mr-2" /> Browse Adoptions
                  </button>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Donation Modal */}
      {showDonationModal && selectedCase && (
        <DonationModal
          caseData={selectedCase}
          walletAddress={walletAddress || undefined}
          onClose={() => setShowDonationModal(false)}
          onDonationComplete={(data) => {
            if (data.txHash) {
              handleDonationComplete({ amount: data.amount, txHash: data.txHash });
            }
          }}
          fetchCases={fetchCases}
        />
      )}

      {/* Emergency Details Dialog */}
      <Dialog open={viewEmergencyDialogOpen} onOpenChange={setViewEmergencyDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Emergency Details</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Information about this emergency report
            </DialogDescription>
          </DialogHeader>

          {selectedEmergency && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-60 bg-gray-100 dark:bg-gray-700 rounded-lg relative mb-4">
                  {selectedEmergency.images && selectedEmergency.images.length > 0 ? (
                    <Image
                      src={`http://localhost:5001${selectedEmergency.images[0]}`}
                      alt={`${selectedEmergency.animalType} - ${selectedEmergency.condition}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AlertTriangle className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedEmergency.status === "New" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200" :
                        selectedEmergency.status === "Assigned" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200" :
                        selectedEmergency.status === "In Progress" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200" :
                        selectedEmergency.status === "Resolved" ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-200"
                      }`}
                    >
                      {selectedEmergency.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reported On</h3>
                    <p className="text-gray-900 dark:text-white">{new Date(selectedEmergency.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Animal Type</h3>
                    <p className="text-gray-900 dark:text-white capitalize">{selectedEmergency.animalType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Condition</h3>
                    <p className="text-gray-900 dark:text-white capitalize">{selectedEmergency.condition}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
                    <p className="text-gray-900 dark:text-white">{selectedEmergency.location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">{selectedEmergency.description}</p>
                  </div>
                </div>
                
                {emergencyAssignedWelfare && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Assigned To</h3>
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden">
                        <Image
                          src={emergencyAssignedWelfare.image}
                          alt={emergencyAssignedWelfare.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{emergencyAssignedWelfare.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{emergencyAssignedWelfare.description}</p>
                        <div className="flex gap-2">
                          <Link
                            href={`/welfare/${emergencyAssignedWelfare.id}`}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => {
                              // Create a dummy case for donation
                              const dummyCase: Case = {
                                _id: `emergency-${selectedEmergency._id}`,
                                title: `Emergency: ${selectedEmergency.animalType} - ${selectedEmergency.condition}`,
                                description: selectedEmergency.description,
                                targetAmount: "0",
                                amountRaised: "0",
                                imageUrl: selectedEmergency.images && selectedEmergency.images.length > 0 
                                  ? `http://localhost:5001${selectedEmergency.images[0]}`
                                  : "/images/placeholder.jpg",
                                welfare: emergencyAssignedWelfare.name,
                                welfareId: emergencyAssignedWelfare.id,  // Added this field
                                welfareAddress: emergencyAssignedWelfare.welfareAddress || null,
                                category: "Emergency",
                                status: "Active",
                                createdAt: selectedEmergency.createdAt
                              }
                              setSelectedCase(dummyCase)
                              setViewEmergencyDialogOpen(false)
                              setShowDonationModal(true)
                            }}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700"
                          >
                            Donate to Help
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 dark:text-yellow-300" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-200">
                        For immediate assistance with animal emergencies, please call our hotline at <span className="font-bold">+1 (555) 123-4567</span>.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setViewEmergencyDialogOpen(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Adoption Request Modal */}
      {showAdoptionRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full border border-gray-700 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Adoption Request</h3>
              <button
                onClick={() => setShowAdoptionRequestModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitAdoptionRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={adoptionRequestForm.donorName}
                  onChange={e => setAdoptionRequestForm(f => ({ ...f, donorName: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={adoptionRequestForm.contactNumber}
                  onChange={e => setAdoptionRequestForm(f => ({ ...f, contactNumber: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={adoptionRequestForm.email}
                  onChange={e => setAdoptionRequestForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason for Adoption</label>
                <textarea
                  value={adoptionRequestForm.reason}
                  onChange={e => setAdoptionRequestForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Contact Method</label>
                <select
                  value={adoptionRequestForm.preferredContact}
                  onChange={e => setAdoptionRequestForm(f => ({ ...f, preferredContact: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
              {adoptionRequestError && <div className="text-red-400 text-sm">{adoptionRequestError}</div>}
              {adoptionRequestSuccess && <div className="text-green-400 text-sm">{adoptionRequestSuccess}</div>}
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAdoptionRequestModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  disabled={adoptionRequestLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  disabled={adoptionRequestLoading}
                >
                  {adoptionRequestLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
