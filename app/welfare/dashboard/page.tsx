"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Home,
  PieChartIcon,
  FileText,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  User,
  Wallet,
  AlertTriangle,
  Stethoscope,
  DollarSign,
  Bell,
  FileBarChart,
  ExternalLink,
  X,
  Mail,
  Phone,
  Heart,
  MapPin,
  Menu,
  ClipboardList,
} from "lucide-react"
import ConnectWalletButton from "@/components/ConnectWalletButton"
import Link from "next/link"
import { useDonationContract } from "@/hooks/useDonationContract"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import { DONATION_CONTRACT_ADDRESS, DONATION_CONTRACT_ABI } from "@/app/config/contracts"
import { Button } from "@/components/ui/button"

// Mock data for charts
const donationData = [
  { month: "Jan", amount: 4000 },
  { month: "Feb", amount: 3000 },
  { month: "Mar", amount: 2000 },
  { month: "Apr", amount: 2780 },
  { month: "May", amount: 1890 },
  { month: "Jun", amount: 2390 },
]

const caseData = [
  { name: "Shelter Renovation", donations: 12 },
  { name: "Medical Treatment", donations: 19 },
  { name: "Food Supply", donations: 5 },
  { name: "Rescue Operation", donations: 8 },
]

// Sample doctors data
const doctors = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "General Veterinarian",
    phone: "+1 (555) 123-4567",
    email: "sarah.johnson@example.com",
    image: "/images/doctor1.jpg",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Surgery Specialist",
    phone: "+1 (555) 987-6543",
    email: "michael.chen@example.com",
    image: "/images/doctor2.jpg",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Emergency Care",
    phone: "+1 (555) 456-7890",
    email: "emily.rodriguez@example.com",
    image: "/images/doctor3.jpg",
  },
]

interface Case {
  _id: string
  title: string
  description: string
  targetAmount: string
  amountRaised: string
  imageUrl: string
  category: string
  status: string
  createdAt: string
  assignedDoctor?: {
    _id: string
    name: string
    specialization: string
  }
  medicalIssue?: string
  costBreakdown?: {
    surgery: string
    medicine: string
    recovery: string
    other: string
  }
  image?: File | null
}

interface Emergency {
  _id: string;
  animalType: string;
  condition: string;
  location: string;
  description: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  assignedTo?: string;
  medicalIssue?: string;
  estimatedCost?: number;
  treatmentPlan?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  convertedToCase?: boolean;
  caseId?: string;
}

interface Profile {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  phone?: string;
  address?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  };
  profilePicture?: string;
  blockchainAddress: string;
}

interface EmergencyDiagnosis {
  assignedDoctor: string
  medicalIssue: string
  estimatedCost: string
}

interface NewCase {
  title: string
  description: string
  targetAmount: string
  imageUrl: string
  images: File[]
  assignedDoctor?: string  // This should be the doctor's _id
  medicalIssue?: string
  costBreakdown: {
    surgery: string
    medicine: string
    recovery: string
    other: string
  }
}

interface CaseUpdate {
  _id: string
  caseId: string
  title: string
  content: string
  imageUrl: string[]
  isSuccessStory: boolean
  createdAt: string
}

// Add Doctor interface based on the schema
interface Doctor {
  _id: string
  name: string
  email: string
  specialization: string
  welfareId: string
  assignedCases?: string[]
  createdAt?: string
}

// Interface for adding a new doctor
interface NewDoctor {
  name: string
  email: string
  password: string
  specialization: string
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
  postedByType: string;
  contactNumber: string;
  adoptedBy?: string;
  createdAt: string;
}

interface MonthlyDonation {
  month: string;
  amount: number;
}

interface CasePerformance {
  name: string;
  donations: number;
}

interface RecentDonation {
  _id: string;
  donor: string;
  donorAddress: string;
  amount: number;
  amountUsd: number;
  caseId: string;
  caseTitle: string;
  transactionHash: string;
  date: string;
}

interface Donation {
  amount: string;
  timestamp: number;
  message: string;
  caseId: string;
  donor: string;
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
  donor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'payment pending' | 'under review';
  reason: string;
  preferredContact: string;
  createdAt: string;
  paymentProof?: string;
}

export default function WelfareDashboard() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [profile, setProfile] = useState<Profile>({
    _id: '',
    name: '',
    email: '',
    bio: '',
    phone: '',
    address: '',
    website: '',
    socialLinks: {
      facebook: '',
      instagram: ''
    },
    blockchainAddress: '',
    profilePicture: ''
  })
  const [cases, setCases] = useState<Case[]>([])
  const [showAddCase, setShowAddCase] = useState(false)
  const [newCase, setNewCase] = useState<NewCase>({
    title: "",
    description: "",
    targetAmount: "",
    imageUrl: "",
    images: [],
    costBreakdown: {
      surgery: "",
      medicine: "",
      recovery: "",
      other: "",
    },
  })
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null)
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(false)
  const [emergencyDiagnosis, setEmergencyDiagnosis] = useState<EmergencyDiagnosis>({
    assignedDoctor: "",
    medicalIssue: "",
    estimatedCost: "",
  })
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([])
  const [showAddUpdate, setShowAddUpdate] = useState(false)
  const [newUpdate, setNewUpdate] = useState<{
    caseId: string
    title: string
    content: string
    images: File[]
    isSuccessStory: boolean
  }>({
    caseId: "",
    title: "",
    content: "",
    images: [],
    isSuccessStory: false,
  })
  const [donations, setDonations] = useState<{
    items: Array<{
      _id: string;
      donor: string;
      donorAddress: string;
      amount: number;
      amountUsd: number;
      caseId: string;
      caseTitle: string;
      transactionHash: string;
      date: string;
    }>;
    total: number;
    totalUsd: number;
    thisMonth: number;
    thisMonthUsd: number;
    percentChange: number;
    uniqueDonors: number;
    newDonorsThisMonth: number;
    donorPercentChange: number;
  }>({
    items: [],
    total: 0,
    totalUsd: 0,
    thisMonth: 0,
    thisMonthUsd: 0,
    percentChange: 0,
    uniqueDonors: 0,
    newDonorsThisMonth: 0,
    donorPercentChange: 0
  })
  const [donorsCount, setDonorsCount] = useState({
    total: 0,
    thisMonth: 0,
    percentChange: 0
  })
  const [dashboardCharts, setDashboardCharts] = useState({
    donationsByMonth: [] as Array<{month: string; amount: number}>,
    casePerformance: [] as Array<{name: string; donations: number}>
  })

  // Add doctor state variables
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [showEditDoctor, setShowEditDoctor] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [newDoctor, setNewDoctor] = useState<NewDoctor>({
    name: "",
    email: "",
    password: "",
    specialization: ""
  })

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
    images: [] as File[],
    location: "",
    health: "",
    behavior: "",
    contactNumber: "",
  })
  const [adoptionImagePreviews, setAdoptionImagePreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAdoption, setSelectedAdoption] = useState<Adoption | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const { registerOrganization } = useDonationContract();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [welfareToken, setWelfareToken] = useState<string | null>(null);

  const [monthlyDonations, setMonthlyDonations] = useState<MonthlyDonation[]>([]);
  const [casePerformance, setCasePerformance] = useState<CasePerformance[]>([]);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);

  // 1. Add status filter state
  const [adoptionStatusFilter, setAdoptionStatusFilter] = useState<string>('all');

  // Add to the state section
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred';
  };

  // Initialize welfare token and check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('welfareToken');
      setWelfareToken(token);
      
      if (!token) {
        router.push('/welfare/login');
        return;
      }

      // Check wallet connection
      if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts && accounts[0]) {
              setWalletAddress(accounts[0]);
              setWalletConnected(true);
            }
          })
          .catch(console.error);
      }
    }
  }, [router]);

  // Fetch cases when component mounts or active tab changes
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem('welfareToken');
        if (!token) return;

        const response = await fetch('http://localhost:5001/api/welfare/cases', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cases');
        }

        const cases = await response.json();
        setCases(cases);
      } catch (error: unknown) {
        console.error('Error fetching cases:', error);
        toast({
          title: "Error",
          description: handleError(error),
          variant: "destructive",
        });
      }
    };

    // Only fetch cases when on dashboard or cases tab
    if (activeTab === 'dashboard' || activeTab === 'cases') {
      fetchCases();
    }
  }, [activeTab, router]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('welfareToken');
      if (!token) {
      router.push('/welfare/login');
      return;
    }

    // Fetch welfare profile
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/welfare/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();

    // Check wallet connection
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
          }
        })
        .catch(console.error);
    }
  }, [router]);

  const handleWalletConnect = async (address: string) => {
    try {
      if (!welfareToken) {
        router.push('/welfare/login');
        return;
      }

      // Update blockchain address in backend
      const response = await fetch('http://localhost:5001/api/welfare/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${welfareToken}`
        },
        body: JSON.stringify({ blockchainAddress: address })
      });

      if (!response.ok) {
        throw new Error('Failed to update blockchain address');
      }

      const data = await response.json();

      // Register the organization in the smart contract
      await registerOrganization(
        data.welfare.name,
        data.welfare.description || '',
        address
      );

      setWalletAddress(address);
      toast({
        title: "Success",
        description: "Wallet connected successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating blockchain address:', error);
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleAddCase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("title", newCase.title)
    formData.append("description", newCase.description)
    formData.append("targetAmount", newCase.targetAmount)
    formData.append("welfareAddress", walletAddress)
    if (newCase.images && newCase.images.length > 0) {
      newCase.images.forEach((image) => {
        formData.append("images", image)
      })
    }
    // Append assignedDoctor if selected
    if (newCase.assignedDoctor) {
      formData.append("assignedDoctor", newCase.assignedDoctor)
    }

    const token = localStorage.getItem("welfareToken")
    if (!token) {
      alert("Please log in to create a case")
      return
    }

    fetch("http://localhost:5001/api/welfare/cases", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to create case');
        }
        return res.json();
      })
      .then((data) => {
        console.log("Added new case:", data)
        // Fetch updated cases list
        fetch("http://localhost:5001/api/welfare/cases", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then((updatedCases) => {
            setCases(updatedCases);
            toast({
              title: "Success",
              description: "Case created successfully",
              variant: "default",
            });
          })
          .catch((err: Error) => {
            console.error("Error fetching updated cases:", err);
            toast({
              title: "Error",
              description: "Failed to fetch updated cases",
              variant: "destructive",
            });
          });
        
        setShowAddCase(false)
        setNewCase({
          title: "",
          description: "",
          targetAmount: "",
          imageUrl: "",
          images: [],
          assignedDoctor: "",
          medicalIssue: "",
          costBreakdown: {
            surgery: "",
            medicine: "",
            recovery: "",
            other: "",
          },
        })
      })
      .catch((err: Error) => {
        console.error("Error adding case:", err)
        toast({
          title: "Error",
          description: "Failed to create case. Please try again.",
          variant: "destructive",
        });
      })
  }

  const handleDeleteCase = async (id: string) => {
    const token = localStorage.getItem("welfareToken")

    try {
      const response = await fetch(`http://localhost:5001/api/welfare/cases/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        },
      })

      const result = await response.json()
      console.log("Delete Response:", result)

      if (response.ok) {
        setCases(cases.filter((c) => c._id !== id)) // Remove from UI
      } else {
        console.error("Failed to delete case:", result.message)
      }
    } catch (error) {
      console.error("Error deleting case:", error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleEmergencySelect = (emergency: Emergency) => {
    setSelectedEmergency(emergency)
    setShowEmergencyDetails(true)
    // Pre-fill diagnosis form if already assigned
    if (emergency.assignedTo) {
      setEmergencyDiagnosis({
        medicalIssue: emergency.medicalIssue || "",
        estimatedCost: emergency.estimatedCost?.toString() || "",
        assignedDoctor: emergency.assignedTo,
      })
    } else {
      setEmergencyDiagnosis({
        medicalIssue: "",
        estimatedCost: "",
        assignedDoctor: "",
      })
    }
  }

  const handleDiagnosisChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEmergencyDiagnosis((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCostBreakdownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCase((prev) => ({
      ...prev,
      costBreakdown: {
        ...prev.costBreakdown,
        [name]: value,
      },
    }))
  }

  const handleSubmitDiagnosis = async () => {
    if (!selectedEmergency) return

    try {
      const result = await updateEmergencyStatus(
        selectedEmergency._id, 
        "In Progress",
        {
          medicalIssue: emergencyDiagnosis.medicalIssue,
          estimatedCost: Number(emergencyDiagnosis.estimatedCost),
          treatmentPlan: "Treatment in progress"
        }
      )
      
      console.log("Updated emergency with diagnosis:", result)
      
      // Close the dialog
      setShowEmergencyDetails(false)
      
      // Reset form
      setEmergencyDiagnosis({
        assignedDoctor: "",
        medicalIssue: "",
        estimatedCost: ""
      })
      
      // Update the selected emergency
      setSelectedEmergency(null)
    } catch (error) {
      console.error("Error submitting diagnosis:", error)
    }
  }

  const selfAssignEmergency = async (emergencyId: string) => {
    try {
      const token = localStorage.getItem("welfareToken");
      if (!token) {
        console.error("No token found");
        return false;
      }

      // Get welfare ID from token
      let welfareId = null;
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          welfareId = payload.id || payload._id || payload.userId;
        }
      } catch (e) {
        console.error("Could not decode token:", e);
        return false;
      }

      if (!welfareId) {
        console.error("Could not extract welfare ID from token");
        return false;
      }

      console.log("Attempting to assign emergency", emergencyId, "to welfare", welfareId);

      // Update the emergency to be assigned to this welfare
      const response = await fetch(`http://localhost:5001/api/emergency/${emergencyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assignedTo: welfareId,
          status: "Assigned"
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Self-assign error:", errorData);
        return false;
      }

      const result = await response.json();
      console.log("Emergency self-assigned:", result);
      
      // Fetch the emergency again to get the updated version
      const emergencyResponse = await fetch(`http://localhost:5001/api/emergency/${emergencyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!emergencyResponse.ok) {
        console.error("Failed to fetch updated emergency");
        return false;
      }
      
      const updatedEmergency = await emergencyResponse.json();
      console.log("Updated emergency data:", updatedEmergency);

      // Update the local state with the freshly fetched data
      setEmergencies(emergencies.map(e => 
        e._id === emergencyId ? updatedEmergency : e
      ));
      
      // Wait a moment to ensure the state update is processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If this is the selected emergency, update that too
      if (selectedEmergency && selectedEmergency._id === emergencyId) {
        setSelectedEmergency(updatedEmergency);
      }
      
      return true;
    } catch (error) {
      console.error("Error self-assigning emergency:", error);
      return false;
    }
  };

  const createEmergencyCase = async () => {
    try {
      if (!selectedEmergency) {
        throw new Error('Please select an emergency first');
      }

      const token = localStorage.getItem('welfareToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const welfareId = profile?._id;
      if (!welfareId) {
        throw new Error('Welfare ID not found');
      }

      // Create a new case from the emergency
      const response = await fetch(`http://localhost:5001/api/emergency/${selectedEmergency._id}/convert-to-case`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: selectedEmergency.animalType + " Emergency",
          description: selectedEmergency.description,
          targetAmount: selectedEmergency.estimatedCost?.toString() || "0",
          category: "Emergency",
          welfareId: welfareId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create case');
      }

      const data = await response.json();

      // Update the emergency status
      const updatedEmergencies = emergencies.map(emergency =>
        emergency._id === selectedEmergency._id
          ? {
              ...emergency,
              convertedToCase: true,
              caseId: data.case._id,
              assignedTo: welfareId,
              status: "Resolved"
            }
          : emergency
      );

      setEmergencies(updatedEmergencies);
      setSelectedEmergency(null);

      // Refresh the cases list
      const fetchCases = async () => {
        try {
          const response = await fetch('http://localhost:5001/api/welfare/cases', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch cases');
          }

          const casesData = await response.json();
          setCases(casesData.cases);
        } catch (error: unknown) {
          console.error('Error fetching cases:', error);
          toast({
            title: "Error",
            description: handleError(error),
            variant: "destructive",
          });
        }
      };

      await fetchCases();

      toast({
        title: "Success",
        description: "Emergency successfully converted to case!",
        variant: "default",
      });
    } catch (error: unknown) {
      console.error("Error creating case:", error);
      toast({
        title: "Error",
        description: handleError(error),
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setNewCase({ ...newCase, images: Array.from(files) })
    }
  }

  const handleUpdateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setNewUpdate({ ...newUpdate, images: Array.from(files) })
    }
  }

  const handleAddUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const token = localStorage.getItem("welfareToken")
    const formData = new FormData()
    formData.append("caseId", newUpdate.caseId)
    formData.append("title", newUpdate.title)
    formData.append("content", newUpdate.content)
    formData.append("isSuccessStory", String(newUpdate.isSuccessStory))

    // Append multiple images
    if (newUpdate.images && newUpdate.images.length > 0) {
      newUpdate.images.forEach((image) => {
        formData.append("images", image)
      })
    }

    try {
      const response = await fetch("http://localhost:5001/api/welfare/case-updates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      console.log("Added new update:", data)

      // Reset form and fetch updated list
      setNewUpdate({
        caseId: "",
        title: "",
        content: "",
        images: [],
        isSuccessStory: false,
      })
      setShowAddUpdate(false)
      fetchCaseUpdates()
    } catch (err) {
      console.error("Error adding update:", err)
    }
  }

  const fetchCaseUpdates = async () => {
    const token = localStorage.getItem("welfareToken")
    
    try {
      const response = await fetch("http://localhost:5001/api/welfare/my-updates", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
        throw new Error(`Failed to fetch updates: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Fetched case updates:", data);
      if (data && Array.isArray(data.updates)) {
        setCaseUpdates(data.updates)
      } else if (data && Array.isArray(data)) {
        setCaseUpdates(data)
      } else {
        console.error("Invalid data format for case updates:", data);
        setCaseUpdates([]) // Set empty array as fallback
      }
    } catch (err) {
      console.error("Error fetching case updates:", err)
      setCaseUpdates([]) // Set empty array as fallback
    }
  }

  const updateEmergencyStatus = async (emergencyId: string, status: string, treatmentInfo?: {
    medicalIssue?: string,
    estimatedCost?: number,
    treatmentPlan?: string
  }) => {
    const token = localStorage.getItem("welfareToken")
    try {
      const updateData = {
        status,
        ...treatmentInfo
      }
      
      const response = await fetch(`http://localhost:5001/api/emergency/${emergencyId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error("Failed to update emergency status")
      }
      
      const updatedEmergency = await response.json()
      
      // Update in state
      setEmergencies(emergencies.map(e => 
        e._id === emergencyId ? { ...e, ...updatedEmergency.emergency } : e
      ))
      
      return updatedEmergency
    } catch (err) {
      console.error("Error updating emergency:", err)
      throw err
    }
  }

  // Add a new function to directly create a case from emergency data
  const createCaseDirectly = async () => {
    try {
      if (!selectedEmergency) {
        alert("Please select an emergency first");
        return;
      }

      if (!walletAddress) {
        alert("Please connect your wallet first");
        return;
      }

      const token = localStorage.getItem("welfareToken");
      if (!token) {
        alert("Please log in to create a case");
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("title", selectedEmergency.animalType + " Emergency Case");
      formData.append("description", selectedEmergency.description);
      formData.append("targetAmount", emergencyDiagnosis.estimatedCost);
      formData.append("welfareAddress", walletAddress);
      formData.append("medicalIssue", emergencyDiagnosis.medicalIssue);

      // Only append assignedDoctor if it's a valid ObjectId
      if (emergencyDiagnosis.assignedDoctor && /^[0-9a-fA-F]{24}$/.test(emergencyDiagnosis.assignedDoctor)) {
        formData.append("assignedDoctor", emergencyDiagnosis.assignedDoctor);
      }

      // Append cost breakdown
      formData.append("surgery", emergencyDiagnosis.estimatedCost);
      formData.append("medicine", "0");
      formData.append("recovery", "0");
      formData.append("other", "0");

      // If emergency has images, include them
      if (selectedEmergency.images && selectedEmergency.images.length > 0) {
        selectedEmergency.images.forEach(img => {
          formData.append("images", img);
        });
      }

      // Debug logging
      console.log("Creating case with data:", {
        title: formData.get("title"),
        description: formData.get("description"),
        targetAmount: formData.get("targetAmount"),
        surgery: formData.get("surgery"),
        medicine: formData.get("medicine"),
        recovery: formData.get("recovery"),
        other: formData.get("other"),
        welfareAddress: formData.get("welfareAddress"),
        assignedDoctor: formData.get("assignedDoctor"),
        medicalIssue: formData.get("medicalIssue"),
        images: selectedEmergency.images
      });
      
      // Create the case
      const response = await fetch("http://localhost:5001/api/welfare/cases", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server response:", errorData);
        console.error("Response status:", response.status);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
        throw new Error(`Failed to create case: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Case created successfully:", result);
      
      // Update the emergency to mark it as resolved and link it to the new case
      await updateEmergencyStatus(selectedEmergency._id, "Resolved", {
        medicalIssue: emergencyDiagnosis.medicalIssue,
        estimatedCost: Number(emergencyDiagnosis.estimatedCost),
        treatmentPlan: `Converted to case: ${result._id}`
      });
      
      // Update cases list
      setCases([...cases, result]);
      
      // Close the modal and reset the selected emergency
      setShowEmergencyDetails(false);
      setSelectedEmergency(null);
      setEmergencyDiagnosis({
        assignedDoctor: "",
        medicalIssue: "",
        estimatedCost: ""
      });
      
      toast({
        title: "Success",
        description: "Case created successfully!",
        variant: "default",
      });
    } catch (error: unknown) {
      console.error("Error creating case:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      toast({
        title: "Error",
        description: `Failed to create case: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  // Function to handle adding a new doctor
  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const token = localStorage.getItem("welfareToken");
    if (!token) {
      console.error("No token found");
      return;
    }
    
    try {
      // Get welfare ID from token
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const welfareId = payload.id;

      const response = await fetch("http://localhost:5001/api/doctor/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newDoctor,
          welfareId // Include the welfare organization's ID
        })
      });
      
      let responseData;
      try {
        // Try to parse the response as JSON first
        responseData = await response.json();
      } catch (e) {
        // If JSON parsing fails, get the response as text
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add doctor');
      }

      if (!response.ok) {
        // If we have a JSON error response, use its message
        throw new Error(responseData.message || 'Failed to add doctor');
      }
      
      console.log("Added new doctor:", responseData);
      
      // Add the new doctor to the list
      setDoctors([...doctors, responseData]);
      
      // Reset form and close dialog
      setNewDoctor({
        name: "",
        email: "",
        password: "",
        specialization: ""
      });
      setShowAddDoctor(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert(error instanceof Error ? error.message : "Failed to add doctor. Please try again.");
    }
  };
  
  // Function to handle editing a doctor
  const handleEditDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;
    
    const token = localStorage.getItem("welfareToken");
    if (!token) {
      console.error("No token found");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/doctor/${selectedDoctor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newDoctor.name,
          email: newDoctor.email,
          specialization: newDoctor.specialization,
          // Only include password if it's been changed (not empty)
          ...(newDoctor.password ? { password: newDoctor.password } : {})
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update doctor: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Updated doctor:", data);
      
      // Update the doctor in the list
      setDoctors(doctors.map(doc => doc._id === selectedDoctor._id ? data : doc));
      
      // Reset form and close dialog
      setNewDoctor({
        name: "",
        email: "",
        password: "",
        specialization: ""
      });
      setSelectedDoctor(null);
      setShowEditDoctor(false);
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert("Failed to update doctor. Please try again.");
    }
  };
  
  // Function to handle deleting a doctor
  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) {
      return;
    }
    
    const token = localStorage.getItem("welfareToken");
    if (!token) {
      console.error("No token found");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/doctor/${doctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete doctor: ${errorText}`);
      }
      
      console.log("Deleted doctor successfully");
      
      // Remove the doctor from the list
      setDoctors(doctors.filter(doc => doc._id !== doctorId));
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Failed to delete doctor. Please try again.");
    }
  };
  
  // Function to open the edit doctor dialog
  const openEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setNewDoctor({
      name: doctor.name,
      email: doctor.email,
      password: "", // Don't include the current password
      specialization: doctor.specialization
    });
    setShowEditDoctor(true);
  };

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
      const token = localStorage.getItem('welfareToken');
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
      console.error('Error fetching adoptions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load adoptions');
    }
  };

  const handleAddAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('welfareToken');
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
      formData.append('postedByType', 'WelfareOrganization');
      
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
        images: [],
        location: '',
        health: '',
        behavior: '',
        contactNumber: '',
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

  const handleAdopt = async (adoption: Adoption) => {
    setSelectedAdoption(adoption);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    try {
      setPaymentStatus('pending');
      const token = localStorage.getItem('welfareToken');
      if (!token) throw new Error('No authentication token found');

      // Here you would integrate with your payment system
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing

      // Update adoption status to 'adopted'
      const response = await fetch(`http://localhost:5001/api/adoption/${selectedRequest?.adoptionId}/adopt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          adoptedBy: selectedRequest?.donor._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update adoption status');
      }

      setPaymentStatus('success');
      toast({
        title: "Payment Successful",
        description: "The adoption has been completed successfully.",
        variant: "default",
      });

      // Close modals and refresh data
      setShowPaymentModal(false);
      setShowRequestModal(false);
      setSelectedRequest(null);
      fetchAdoptionRequests();
      fetchAdoptions();
    } catch (error) {
      setPaymentStatus('failed');
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  // Add this to your useEffect
  useEffect(() => {
    if (activeTab === 'adoptions') {
      fetchAdoptions();
    }
  }, [activeTab]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const saveProfileChanges = async () => {
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('bio', profile.bio || '');
      formData.append('phone', profile.phone || '');
      formData.append('address', profile.address || '');
      formData.append('website', profile.website || '');
      formData.append('blockchainAddress', profile.blockchainAddress || ''); // Add this field
      if (profile.socialLinks) {
        formData.append('socialLinks', JSON.stringify(profile.socialLinks));
      }
      if (profileImage) {
        formData.append('profilePicture', profileImage);
      }

      const response = await fetch('http://localhost:5001/api/welfare/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${welfareToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsUpdating(false);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsUpdating(false);
      // Show error message
    }
  };

  // Add useEffect for fetching doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem("welfareToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        // Get welfare ID from token
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const welfareId = payload.id;

        const response = await fetch(`http://localhost:5001/api/doctor/welfare/${welfareId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }

        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch emergencies when component mounts or active tab changes
  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const token = localStorage.getItem('welfareToken');
        if (!token) {
          router.push('/welfare/login');
          return;
        }

        const response = await fetch('http://localhost:5001/api/emergency', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch emergencies');
        }

        const data = await response.json();
        console.log('Fetched emergencies:', data);
        setEmergencies(data);
      } catch (error) {
        console.error('Error fetching emergencies:', error);
        setError('Failed to fetch emergencies');
      }
    };

    // Only fetch emergencies when on dashboard or emergencies tab
    if (activeTab === 'dashboard' || activeTab === 'emergencies') {
      fetchEmergencies();
    }
  }, [activeTab, router]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('welfareToken');
      if (!token) {
      router.push('/welfare/login');
      return;
    }

    // Fetch welfare profile
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/welfare/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();

    // Check wallet connection
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
          }
        })
        .catch(console.error);
    }
  }, [router]);

  // Add useEffect for fetching dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("welfareToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        // Fetch donations data
        const donationsResponse = await fetch("http://localhost:5001/api/welfare/donations", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!donationsResponse.ok) {
          throw new Error('Failed to fetch donations data');
        }

        const donationsData = await donationsResponse.json();
        setDonations(donationsData.stats);
        setDonorsCount({
          total: donationsData.stats.uniqueDonors,
          thisMonth: donationsData.stats.newDonorsThisMonth,
          percentChange: donationsData.stats.donorPercentChange
        });
        setDashboardCharts({
          donationsByMonth: donationsData.charts.byMonth,
          casePerformance: donationsData.charts.byCase
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    // Only fetch dashboard data when on dashboard tab
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab]);

  // Add useEffect for fetching blockchain data
  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        if (!profile?.blockchainAddress) {
          console.error("No blockchain address found");
          return;
        }

        const provider = new ethers.JsonRpcProvider("http://localhost:8545");
        const contract = new ethers.Contract(
          DONATION_CONTRACT_ADDRESS,
          DONATION_CONTRACT_ABI,
          provider
        );

        const [name, description, walletAddress, isActive, totalDonations, uniqueDonors] = 
          await contract.getOrganizationInfo(profile.blockchainAddress);

        const donorHistory = await contract.getDonorHistory(profile.blockchainAddress);
        const { monthlyDonations, casePerformance, recentDonations } = processDonationData(donorHistory);

        setDonations({
          total: parseFloat(ethers.formatEther(totalDonations)),
          totalUsd: parseFloat(ethers.formatEther(totalDonations)) * 3000,
          thisMonth: monthlyDonations[monthlyDonations.length - 1]?.amount || 0,
          thisMonthUsd: (monthlyDonations[monthlyDonations.length - 1]?.amount || 0) * 3000,
          percentChange: monthlyDonations.length > 1 
            ? ((monthlyDonations[monthlyDonations.length - 1]?.amount || 0) - (monthlyDonations[monthlyDonations.length - 2]?.amount || 0)) / (monthlyDonations[monthlyDonations.length - 2]?.amount || 1) * 100
            : 0,
          uniqueDonors: Number(uniqueDonors),
          newDonorsThisMonth: 0,
          donorPercentChange: 0,
          items: recentDonations
        });

        setDashboardCharts({
          donationsByMonth: monthlyDonations,
          casePerformance: casePerformance
        });

      } catch (error: unknown) {
        console.error("Error fetching blockchain data:", error);
        setError(handleError(error));
      }
    };

    // Only fetch blockchain data when on dashboard tab
    if (activeTab === 'dashboard' && profile?.blockchainAddress) {
      fetchBlockchainData();
    }
  }, [activeTab, profile?.blockchainAddress]);

  // Add useEffect for fetching donation data
  useEffect(() => {
    const fetchDonationData = async () => {
      try {
        const token = localStorage.getItem('welfareToken');
        if (!token) return;

        // Fetch backend data
        const response = await fetch('http://localhost:5001/api/welfare/donations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch donation data');
        }

        const data = await response.json();
        
        // Update donations state
        setDonations({
          items: data.donations || [],
          total: data.stats.total || 0,
          totalUsd: data.stats.totalUsd || 0,
          thisMonth: data.stats.thisMonth || 0,
          thisMonthUsd: data.stats.thisMonthUsd || 0,
          percentChange: data.stats.percentChange || 0,
          uniqueDonors: data.stats.uniqueDonors || 0,
          newDonorsThisMonth: data.stats.newDonorsThisMonth || 0,
          donorPercentChange: data.stats.donorPercentChange || 0
        });

        // Update donors count
        setDonorsCount({
          total: data.stats.uniqueDonors || 0,
          thisMonth: data.stats.newDonorsThisMonth || 0,
          percentChange: data.stats.donorPercentChange || 0
        });

        // Update charts
        setDashboardCharts({
          donationsByMonth: data.charts.byMonth || [],
          casePerformance: data.charts.byCase || []
        });

        // If we have a blockchain address, also fetch blockchain data
        if (profile?.blockchainAddress) {
          const provider = new ethers.JsonRpcProvider("http://localhost:8545");
          const contract = new ethers.Contract(
            DONATION_CONTRACT_ADDRESS,
            DONATION_CONTRACT_ABI,
            provider
          );

          // Get organization info from blockchain
          const [name, description, walletAddress, isActive, totalDonations, uniqueDonors] = 
            await contract.getOrganizationInfo(profile.blockchainAddress);

          // Update blockchain-specific stats
          setDonations(prev => ({
            ...prev,
            total: parseFloat(ethers.formatEther(totalDonations)),
            totalUsd: parseFloat(ethers.formatEther(totalDonations)) * 3000,
            uniqueDonors: Number(uniqueDonors)
          }));

          setDonorsCount(prev => ({
            ...prev,
            total: Number(uniqueDonors)
          }));
        }
      } catch (error) {
        console.error('Error fetching donation data:', error);
      }
    };

    // Initial fetch
    fetchDonationData();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(fetchDonationData, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [profile?.blockchainAddress]);

  const processDonationData = (donations: Donation[]) => {
    const monthlyDonations: MonthlyDonation[] = [];
    const casePerformance: CasePerformance[] = [];
    const recentDonations: RecentDonation[] = [];

    const monthMap = new Map<string, number>();
    const caseMap = new Map<string, { name: string; donations: number }>();

    donations.forEach((donation) => {
      const date = new Date(Number(donation.timestamp) * 1000);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      const amount = parseFloat(ethers.formatEther(donation.amount));
      
      // Update monthly donations
      const currentAmount = monthMap.get(monthYear) || 0;
      monthMap.set(monthYear, currentAmount + amount);

      // Update case performance
      const caseTitle = donation.message || "General Donation";
      const currentCase = caseMap.get(donation.caseId) || { name: caseTitle, donations: 0 };
      caseMap.set(donation.caseId, {
        name: caseTitle,
        donations: currentCase.donations + amount
      });

      // Add to recent donations
      recentDonations.push({
        _id: `${donation.timestamp}-${donation.donor}`,
        donor: donation.donor,
        donorAddress: donation.donor,
        amount: amount,
        amountUsd: amount * 3000,
        caseId: donation.caseId,
        caseTitle: caseTitle,
        transactionHash: "0x", // Blockchain transactions don't have hash in this format
        date: date.toISOString()
      });
    });

    // Convert monthMap to monthlyDonations array
    monthMap.forEach((amount, month) => {
      monthlyDonations.push({ month, amount });
    });

    // Convert caseMap to casePerformance array
    const casePerformanceArray: CasePerformance[] = Array.from(caseMap.values());

    return { 
      monthlyDonations, 
      casePerformance: casePerformanceArray, 
      recentDonations 
    };
  };

  // Add this function to fetch adoption requests
  const fetchAdoptionRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = localStorage.getItem('welfareToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:5001/api/adoption-request/welfare', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch adoption requests');
      }

      const data = await response.json();
      setAdoptionRequests(data);
    } catch (error) {
      console.error('Error fetching adoption requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load adoption requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Add function to update request status
  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('welfareToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:5001/api/adoption-request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          adoptedBy: selectedRequest?.donor._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      // Update the local state
      setAdoptionRequests(prev => prev.map(request => 
        request._id === requestId ? { ...request, status } : request
      ));

      // Update the adoption status if approved
      if (status === 'approved') {
        const adoptionResponse = await fetch(`http://localhost:5001/api/adoption/${selectedRequest?.adoptionId}/adopt`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            adoptedBy: selectedRequest?.donor._id
          })
        });

        if (!adoptionResponse.ok) {
          throw new Error('Failed to update adoption status');
        }
      }

      toast({
        title: "Success",
        description: `Adoption request ${status} successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  // Add to useEffect for adoption requests
  useEffect(() => {
    if (activeTab === 'adoption-requests') {
      fetchAdoptionRequests();
    }
  }, [activeTab]);

  const handleVerifyPayment = async (requestId: string, verified: boolean) => {
    try {
      // Get the request to check its current status
      const request = adoptionRequests.find((r: AdoptionRequest) => r._id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      if (request.status !== 'under review') {
        throw new Error('Payment is not under review');
      }

      const response = await fetch(`http://localhost:5001/api/adoption-request/${requestId}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('welfareToken')}`
        },
        body: JSON.stringify({ verified })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify payment');
      }

      // Refresh the requests list
      await fetchAdoptionRequests();
      toast({
        title: "Success",
        description: `Payment ${verified ? 'verified' : 'rejected'} successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive",
      });
    }
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
      >
        <Menu className="h-6 w-6" />
          </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-gray-800 bg-opacity-90 backdrop-blur-lg border-r border-gray-700`}
      >
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white relative">
              {profile.profilePicture ? (
                <Image
                  src={`http://localhost:5001${profile.profilePicture.startsWith('/') ? '' : '/'}${profile.profilePicture}`}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="font-medium">{profile.name || "Welfare Name"}</p>
                <p className="text-xs text-gray-400">Welfare Trust</p>
              </div>
            )}
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "dashboard" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <Home className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Dashboard</span>}
            </button>

            <Link
              href="/welfare/profile"
              className={`flex items-center w-full p-2 rounded-md hover:bg-gray-700 text-gray-300`}
            >
              <User className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Profile</span>}
            </Link>

            <button
              onClick={() => setActiveTab("cases")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "cases" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <FileText className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Manage Cases</span>}
            </button>

            <button
              onClick={() => setActiveTab("emergencies")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "emergencies" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <AlertTriangle className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Emergencies</span>}
            </button>

            <button
              onClick={() => setActiveTab("doctors")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "doctors" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <Stethoscope className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Doctors</span>}
            </button>

            <button
              onClick={() => setActiveTab("donations")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "donations" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <DollarSign className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Donations</span>}
            </button>

            <button
              onClick={() => setActiveTab("updates")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "updates" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <Bell className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Updates</span>}
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "reports" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <FileBarChart className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Reports</span>}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "analytics" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <PieChartIcon className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Analytics</span>}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "settings" ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <Settings className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Settings</span>}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("welfareToken")
                router.push("/login")
              }}
              className="flex items-center w-full p-2 rounded-md text-red-400 hover:bg-gray-700"
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
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
              {isSidebarOpen && <span className="ml-3">Adoption Requests</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-6">
        <header className="bg-gray-800 shadow-sm p-4 flex justify-between items-center sticky top-0 z-5">
          <h1 className="text-xl font-semibold text-white">
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "profile" && "Profile Settings"}
            {activeTab === "cases" && "Manage Donation Cases"}
            {activeTab === "emergencies" && "Emergency Reports"}
            {activeTab === "doctors" && "Manage Doctors"}
            {activeTab === "donations" && "Donation Tracking"}
            {activeTab === "updates" && "Post Updates"}
            {activeTab === "reports" && "Reports & Receipts"}
            {activeTab === "analytics" && "Analytics"}
            {activeTab === "settings" && "Account Settings"}
            {activeTab === "adoptions" && "Adoption Management"}
            {activeTab === "adoption-requests" && "Adoption Requests"}
          </h1>
          <div className="flex items-center space-x-4">
            {!walletConnected ? (
              <ConnectWalletButton onConnect={handleWalletConnect} />
            ) : (
              <div className="flex items-center bg-gray-700 rounded-lg px-3 py-1">
                <Wallet className="h-4 w-4 mr-2 text-purple-400" />
                <span className="text-sm font-mono truncate max-w-[150px]">{walletAddress}</span>
              </div>
            )}
            <span className="text-sm text-gray-300">Welcome, {profile.name || "User"}</span>
          </div>
        </header>

        <main className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Total Donations</h3>
                    <p className="text-3xl font-bold text-white">
                      ${donations?.totalUsd?.toLocaleString(undefined, {maximumFractionDigits: 2}) || "0.00"}
                    </p>
                    <div className={`flex items-center text-sm mt-2 ${(donations?.percentChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                          d={(donations?.percentChange || 0) >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                      ></path>
                    </svg>
                      <span>{Math.abs(donations?.percentChange || 0)}% from last month</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Active Cases</h3>
                    <p className="text-3xl font-bold text-white">{cases?.length || 0}</p>
                  <div className="flex items-center text-green-500 text-sm mt-2">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      ></path>
                    </svg>
                      <span>{cases?.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))?.length || 0} new this month</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Total Donors</h3>
                    <p className="text-3xl font-bold text-white">{donorsCount?.total || 0}</p>
                    <div className={`flex items-center text-sm mt-2 ${(donorsCount?.percentChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                          d={(donorsCount?.percentChange || 0) >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                      ></path>
                    </svg>
                      <span>{donorsCount?.thisMonth || 0} new this month</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                  <h3 className="text-lg font-medium mb-4 text-white">Donation Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardCharts?.donationsByMonth || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#8B5CF6" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                  <h3 className="text-lg font-medium mb-4 text-white">Case Performance</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardCharts?.casePerformance || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }} />
                        <Legend />
                        <Bar dataKey="donations" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                <h3 className="text-lg font-medium mb-4 text-white">Recent Donations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Donor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Case
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Transaction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {donations?.items && donations.items.length > 0 ? (
                          donations.items.slice(0, 5).map((donation) => (
                            <tr key={donation._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{donation.donor}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{donation.caseTitle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                                  <span className="text-purple-400 mr-1">{donation.amount} ETH</span>
                                  <span className="text-gray-500 text-xs">(${donation.amountUsd})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {new Date(donation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <a
                                  href={`https://explorer.zksync.io/tx/${donation.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center"
                          >
                            View <ExternalLink size={12} className="ml-1" />
                          </a>
                        </td>
                      </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                              No donations received yet.
                        </td>
                      </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === "cases" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Donation Cases</h2>
                <button
                  onClick={() => setShowAddCase(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add New Case
                </button>
              </div>

              {showAddCase && (
                <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700 max-w-4xl mx-auto">
                  <h3 className="text-lg font-medium mb-4 text-white">Add New Donation Case</h3>
                  <form onSubmit={handleAddCase} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={newCase.title}
                        onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <textarea
                        value={newCase.description}
                        onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[100px]"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Target Amount ($)</label>
                      <input
                        type="number"
                        value={newCase.targetAmount}
                        onChange={(e) => setNewCase({ ...newCase, targetAmount: e.target.value })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Assigned Doctor</label>
                      <select
                        value={newCase.assignedDoctor}
                        onChange={(e) => setNewCase({ ...newCase, assignedDoctor: e.target.value })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      >
                        <option value="">Select a doctor (optional)</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Medical Issue</label>
                      <textarea
                        value={newCase.medicalIssue}
                        onChange={(e) => setNewCase({ ...newCase, medicalIssue: e.target.value })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        rows={3}
                        placeholder="Describe the medical issue or diagnosis (optional)"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Cost Breakdown</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Surgery ($)</label>
                          <input
                            type="number"
                            name="surgery"
                            value={newCase.costBreakdown.surgery}
                            onChange={handleCostBreakdownChange}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Medicine ($)</label>
                          <input
                            type="number"
                            name="medicine"
                            value={newCase.costBreakdown.medicine}
                            onChange={handleCostBreakdownChange}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Recovery ($)</label>
                          <input
                            type="number"
                            name="recovery"
                            value={newCase.costBreakdown.recovery}
                            onChange={handleCostBreakdownChange}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Other ($)</label>
                          <input
                            type="number"
                            name="other"
                            value={newCase.costBreakdown.other}
                            onChange={handleCostBreakdownChange}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Images</label>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handleImageChange}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        multiple
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddCase(false)}
                          className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Save Case
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(cases) && cases.length > 0 ? (
                  cases.map((c) => (
                    <div key={c._id || `case-${c.title}-${c.createdAt}`} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                      <div className="h-48 bg-gray-700 relative">
                        {c.imageUrl ? (
                          <Image
                            src={`http://localhost:5001/uploads/${c.imageUrl}`}
                            alt={c.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-white">{c.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{c.description}</p>

                        {c.assignedDoctor && (
                          <div className="mb-3 bg-gray-700 p-2 rounded-md">
                            <div className="flex items-center text-sm text-purple-400 mb-1">
                              <Stethoscope size={14} className="mr-1" />
                              <span>Verified by {typeof c.assignedDoctor === 'object' ? c.assignedDoctor.name : 'Doctor'}</span>
                            </div>
                            {c.medicalIssue && (
                              <p className="text-xs text-gray-300 line-clamp-2">
                                <span className="font-medium">Doctor's Note:</span> {c.medicalIssue}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 font-medium">${c.targetAmount}</span>
                          <div className="flex space-x-2">
                            <button className="p-2 text-blue-400 hover:bg-gray-700 rounded-full">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCase(c._id)}
                              className="p-2 text-red-400 hover:bg-gray-700 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700">
                    <p className="text-gray-400">No donation cases found. Create your first case!</p>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Emergencies Tab */}
            {activeTab === "emergencies" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Assigned Emergency Reports</h2>
                </div>

          {showEmergencyDetails && selectedEmergency && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-white">Emergency Details</h3>
                        <button
                          onClick={() => setShowEmergencyDetails(false)}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <X className="h-5 w-5" />
                    </button>
                  </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                            <p className="text-sm text-gray-400">Animal Type</p>
                          <p className="text-white">{selectedEmergency.animalType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Condition</p>
                          <p className="text-white">{selectedEmergency.condition}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Location</p>
                          <p className="text-white">{selectedEmergency.location}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Status</p>
                            <p className="text-white">{selectedEmergency.status}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400">Description</p>
                          <p className="text-white">{selectedEmergency.description}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400">Reporter Contact</p>
                          <p className="text-white">{selectedEmergency.name} - {selectedEmergency.phone}</p>
                        </div>

                        {selectedEmergency.images && selectedEmergency.images.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Images</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {selectedEmergency.images.map((img, i) => (
                                <div key={i} className="h-24 bg-gray-700 rounded-md relative">
                                  <Image
                                    src={`http://localhost:5001${img.startsWith('/') ? '' : '/'}${img}`}
                                    alt={`Emergency ${i+1}`}
                                    fill
                                    style={{ objectFit: "cover" }}
                                    className="rounded-md"
                                  />
                        </div>
                              ))}
                      </div>
                    </div>
                        )}

                        <div className="border-t border-gray-700 pt-4">
                          <h4 className="text-white font-medium mb-2">Diagnosis & Treatment</h4>
                          <form className="space-y-3">
                        <div>
                              <label className="block text-sm text-gray-400 mb-1">Assigned Doctor</label>
                          <select
                            name="assignedDoctor"
                            value={emergencyDiagnosis.assignedDoctor}
                            onChange={handleDiagnosisChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          >
                            <option value="">Select a doctor</option>
                            {doctors.map((doctor) => (
                              <option key={doctor._id} value={doctor.name}>
                                {doctor.name} - {doctor.specialization}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                              <label className="block text-sm text-gray-400 mb-1">Medical Issue</label>
                          <textarea
                            name="medicalIssue"
                            value={emergencyDiagnosis.medicalIssue}
                            onChange={handleDiagnosisChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[80px]"
                            placeholder="Describe the medical issue or diagnosis"
                          ></textarea>
                        </div>

                        <div>
                              <label className="block text-sm text-gray-400 mb-1">Estimated Cost ($)</label>
                          <input
                            type="number"
                            name="estimatedCost"
                            value={emergencyDiagnosis.estimatedCost}
                            onChange={handleDiagnosisChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                placeholder="0.00"
                          />
                            </div>
                          </form>
                        </div>

                        <div className="flex justify-end space-x-3 mt-4">
                          <button
                            onClick={() => setShowEmergencyDetails(false)}
                            className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSubmitDiagnosis}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Update Diagnosis
                          </button>
                          <button
                            onClick={createCaseDirectly}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                          >
                            Create Donation Case
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {emergencies.length > 0 ? (
                    emergencies
                      .filter(emergency => !emergency.convertedToCase)
                      .map((emergency) => (
                        <div
                          key={emergency._id}
                          className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700"
                        >
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg text-white">{emergency.animalType} - {emergency.condition}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                emergency.status === "New" ? "bg-blue-900 text-blue-300" :
                                emergency.status === "Assigned" ? "bg-yellow-900 text-yellow-300" :
                                emergency.status === "In Progress" ? "bg-purple-900 text-purple-300" : 
                                emergency.status === "Resolved" ? "bg-green-900 text-green-300" : 
                                "bg-gray-900 text-gray-300"
                              }`}>
                                {emergency.status}
                              </span>
              </div>
                            
                            <p className="text-gray-400 mb-3">{emergency.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="text-sm text-gray-300">{emergency.location}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Reported On</p>
                                <p className="text-sm text-gray-300">{new Date(emergency.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            {emergency.medicalIssue && (
                              <div className="bg-gray-700 p-3 rounded-md mb-3">
                                <p className="text-xs text-purple-400 mb-1">Diagnosis</p>
                                <p className="text-sm text-white">{emergency.medicalIssue}</p>
                                {emergency.estimatedCost && (
                                  <p className="text-xs text-purple-400 mt-1">Est. Cost: ${emergency.estimatedCost}</p>
                                )}
                              </div>
                            )}
                            
                            {emergency.images && emergency.images.length > 0 && (
                              <div className="flex space-x-2 overflow-x-auto py-2 mb-3">
                                {emergency.images.map((img, i) => (
                                  <div key={i} className="w-20 h-20 flex-shrink-0 bg-gray-700 rounded-md relative">
                                    <Image
                                      src={`http://localhost:5001${img.startsWith('/') ? '' : '/'}${img}`}
                                      alt={`Image ${i+1}`}
                                      fill
                                      style={{ objectFit: "cover" }}
                                      className="rounded-md"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleEmergencySelect(emergency)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                              >
                                View & Update
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="col-span-full bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700">
                      <p className="text-gray-400">No emergencies assigned to your organization.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add other content tabs here as needed */}
            {activeTab === "doctors" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Doctor Management</h2>
                  <button
                    onClick={() => setShowAddDoctor(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Doctor
                  </button>
                </div>
                
                {/* Add Doctor Modal */}
                {showAddDoctor && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full border border-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-white">Add New Doctor</h3>
                        <button
                          onClick={() => setShowAddDoctor(false)}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <form onSubmit={handleAddDoctor} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                          <input
                            type="text"
                            value={newDoctor.name}
                            onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                          <input
                            type="email"
                            value={newDoctor.email}
                            onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                          <input
                            type="password"
                            value={newDoctor.password}
                            onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Specialization</label>
                          <select
                            value={newDoctor.specialization}
                            onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          >
                            <option value="">Select specialization</option>
                            <option value="General Veterinarian">General Veterinarian</option>
                            <option value="Surgery Specialist">Surgery Specialist</option>
                            <option value="Emergency Care">Emergency Care</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Ophthalmology">Ophthalmology</option>
                          </select>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowAddDoctor(false)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                          >
                            Add Doctor
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                
                {/* Edit Doctor Modal */}
                {showEditDoctor && selectedDoctor && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full border border-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-white">Edit Doctor</h3>
                        <button
                          onClick={() => {
                            setShowEditDoctor(false);
                            setSelectedDoctor(null);
                          }}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <form onSubmit={handleEditDoctor} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                          <input
                            type="text"
                            value={newDoctor.name}
                            onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                          <input
                            type="email"
                            value={newDoctor.email}
                            onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Password <span className="text-xs text-gray-400">(Leave blank to keep current password)</span>
                          </label>
                          <input
                            type="password"
                            value={newDoctor.password}
                            onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Specialization</label>
                          <select
                            value={newDoctor.specialization}
                            onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          >
                            <option value="">Select specialization</option>
                            <option value="General Veterinarian">General Veterinarian</option>
                            <option value="Surgery Specialist">Surgery Specialist</option>
                            <option value="Emergency Care">Emergency Care</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Ophthalmology">Ophthalmology</option>
                          </select>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditDoctor(false);
                              setSelectedDoctor(null);
                            }}
                            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                          >
                            Update Doctor
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.length > 0 ? doctors.map((doctor) => (
                    <div key={doctor._id || `doctor-${doctor.name}-${doctor.email}`} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                      <div className="p-5">
                        <h3 className="font-semibold text-lg text-white mb-1">{doctor.name}</h3>
                        <p className="text-purple-400 text-sm mb-3">{doctor.specialization}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-300 text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{doctor.email}</span>
                          </div>
                          {doctor.assignedCases && doctor.assignedCases.length > 0 && (
                            <div className="flex items-center text-gray-300 text-sm">
                              <FileText className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{doctor.assignedCases.length} Assigned Cases</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => openEditDoctor(doctor)}
                            className="p-2 text-blue-400 hover:bg-gray-700 rounded-full"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDoctor(doctor._id)}
                            className="p-2 text-red-400 hover:bg-gray-700 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700">
                      <div className="flex flex-col items-center">
                        <Stethoscope className="h-12 w-12 text-gray-500 mb-4" />
                        <p className="text-gray-300 mb-2">No doctors found for your organization.</p>
                        <p className="text-gray-400 mb-6 text-sm">Add doctors to assign them to emergency cases and treatments.</p>
                        <button
                          onClick={() => setShowAddDoctor(true)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add First Doctor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === "donations" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Total Received</h3>
                    <p className="text-3xl font-bold text-white">
                      ${donations?.totalUsd?.toLocaleString(undefined, {maximumFractionDigits: 2}) || "0.00"}
                    </p>
                    <div className={`flex items-center text-sm mt-2 ${(donations?.percentChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={(donations?.percentChange || 0) >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                        ></path>
                      </svg>
                      <span>{Math.abs(donations?.percentChange || 0)}% from last month</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Monthly Donations</h3>
                    <p className="text-3xl font-bold text-white">
                      ${donations?.thisMonthUsd?.toLocaleString(undefined, {maximumFractionDigits: 2}) || "0.00"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Current month's total
                    </p>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Unique Donors</h3>
                    <p className="text-3xl font-bold text-white">{donorsCount?.total || 0}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {donorsCount?.thisMonth || 0} new this month
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-medium text-white">All Donations</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Donor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Case
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Transaction
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {donations?.items && donations.items.length > 0 ? (
                          donations.items.map((donation) => (
                            <tr key={donation._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{donation.donor}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{donation.caseTitle}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <div className="flex items-center">
                                  <span className="text-purple-400 mr-1">{donation.amount} ETH</span>
                                  <span className="text-gray-500 text-xs">(${donation.amountUsd})</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {new Date(donation.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <a
                                  href={`https://explorer.zksync.io/tx/${donation.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 flex items-center"
                                >
                                  View <ExternalLink size={12} className="ml-1" />
                                </a>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                              No donations received yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {(activeTab === "updates" || 
              activeTab === "reports" || 
              activeTab === "analytics" || 
              activeTab === "settings") && (
              <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700 text-center">
                <h3 className="text-lg font-medium mb-4 text-white">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                </h3>
                <p className="text-gray-400">
                  This section is under development and will be available soon.
                </p>
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
                  <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-4xl mx-auto my-4 sm:my-8 border border-gray-700 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-4 sticky top-0 bg-gray-800 z-10 pb-4 border-b border-gray-700">
                      <h3 className="text-lg font-medium text-white">Post New Adoption</h3>
                      <button
                        onClick={() => setShowAddAdoption(false)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddAdoption} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Name</label>
                          <input
                            type="text"
                            value={newAdoption.name}
                            onChange={(e) => setNewAdoption({...newAdoption, name: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Type</label>
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

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Breed</label>
                          <input
                            type="text"
                            value={newAdoption.breed}
                            onChange={(e) => setNewAdoption({...newAdoption, breed: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Age</label>
                          <input
                            type="text"
                            value={newAdoption.age}
                            onChange={(e) => setNewAdoption({...newAdoption, age: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Gender</label>
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

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Size</label>
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

                        <div className="space-y-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-300">Description</label>
                          <textarea
                            value={newAdoption.description}
                            onChange={(e) => setNewAdoption({...newAdoption, description: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[100px]"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Location</label>
                          <input
                            type="text"
                            value={newAdoption.location}
                            onChange={(e) => setNewAdoption({...newAdoption, location: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Contact Number</label>
                          <input
                            type="text"
                            value={newAdoption.contactNumber}
                            onChange={(e) => setNewAdoption({...newAdoption, contactNumber: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-300">Health Information</label>
                          <textarea
                            value={newAdoption.health}
                            onChange={(e) => setNewAdoption({...newAdoption, health: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white h-24"
                            required
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-300">Behavior</label>
                          <textarea
                            value={newAdoption.behavior}
                            onChange={(e) => setNewAdoption({...newAdoption, behavior: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white h-24"
                            required
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-300">Images</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleAdoptionImageChange}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            required
                          />
                          <p className="text-xs text-gray-400 mt-1">Upload up to 5 images</p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6 sticky bottom-0 bg-gray-800 pt-4 border-t border-gray-700">
                        <button
                          type="button"
                          onClick={() => setShowAddAdoption(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Post Adoption
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adoptions.filter(a => adoptionStatusFilter === 'all' ? true : a.status === adoptionStatusFilter).length > 0 ? adoptions.filter(a => adoptionStatusFilter === 'all' ? true : a.status === adoptionStatusFilter).map((adoption) => {
                  console.log('profile._id:', profile._id, 'adoption.postedBy:', adoption.postedBy);
                  if (typeof adoption.postedBy === 'object' && adoption.postedBy !== null) {
                    console.log('adoption.postedBy._id:', (adoption.postedBy as any)._id);
                  }
                  let isOwnListing = false;
                  let welfareName = '';
                  if (typeof adoption.postedBy === 'object' && adoption.postedBy !== null) {
                    isOwnListing = String(profile._id) === String((adoption.postedBy as any)._id);
                    welfareName = (adoption.postedBy as any).name || '';
                  } else if (typeof adoption.postedBy === 'string') {
                    isOwnListing = String(profile._id) === String(adoption.postedBy);
                    welfareName = adoption.postedBy;
                  }

                  // Find related requests for this adoption
                  const relatedRequests = adoptionRequests.filter(r => r.adoptionId === adoption._id);
                  const hasApprovedRequest = relatedRequests.some(r => r.status === 'approved');
                  const hasUnderReviewRequest = relatedRequests.some(r => r.status === 'under review');

                  let badgeText = '';
                  let badgeClass = '';
                  if (adoption.status === 'adopted') {
                    badgeText = 'Adopted';
                    badgeClass = 'bg-green-700 text-white';
                  } else if (hasUnderReviewRequest) {
                    badgeText = 'Pending Payment';
                    badgeClass = 'bg-blue-600 text-white';
                  } else if (hasApprovedRequest) {
                    badgeText = 'Reserved';
                    badgeClass = 'bg-yellow-500 text-gray-900';
                  } else if (adoption.status === 'available') {
                    badgeText = 'Available';
                    badgeClass = 'bg-green-600 text-white';
                  } else {
                    badgeText = adoption.status.charAt(0).toUpperCase() + adoption.status.slice(1);
                    badgeClass = 'bg-gray-500 text-white';
                  }

                  return (
                    <div key={adoption._id} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                      <div className="h-48 bg-gray-700 relative">
                        {/* Status badge */}
                        <span className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold rounded-full ${badgeClass}`}>{badgeText}</span>
                        {adoption.images && adoption.images.length > 0 ? (
                          <img
                            src={`http://localhost:5001/${adoption.images[0]}`}
                            alt={adoption.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="mb-2">
                          <span className="block text-xs text-gray-400">Name:</span>
                          <span className="font-semibold text-lg text-white">{adoption.name}</span>
                        </div>
                        <div className="mb-2 grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-400">Breed:</span> <span className="text-white">{adoption.breed}</span></div>
                          <div><span className="text-gray-400">Type:</span> <span className="text-white">{adoption.type}</span></div>
                          <div><span className="text-gray-400">Age:</span> <span className="text-white">{adoption.age} {adoption.age && !adoption.age.toLowerCase().includes('year') ? 'years' : ''}</span></div>
                          <div><span className="text-gray-400">Gender:</span> <span className="text-white">{adoption.gender}</span></div>
                          <div><span className="text-gray-400">Size:</span> <span className="text-white">{adoption.size}</span></div>
                        </div>
                        <div className="mb-2 text-sm"><span className="text-gray-400">Location:</span> <span className="text-white">{adoption.location}</span></div>
                        <div className="mb-2 text-sm"><span className="text-gray-400">Health:</span> <span className="text-white">{adoption.health}</span></div>
                        <div className="mb-2 text-sm"><span className="text-gray-400">Behavior:</span> <span className="text-white">{adoption.behavior}</span></div>
                        <div className="mb-2 text-sm"><span className="text-gray-400">Contact:</span> <span className="text-white">{adoption.contactNumber}</span></div>
                        <div className="mb-2 text-sm flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-400">Posted by:</span> {/* 4. Welfare org name clickable */}
                          {typeof adoption.postedBy === 'object' && adoption.postedBy !== null ? (
                            <Link href={`/welfare/${(adoption.postedBy as any)._id}`} className="text-purple-400 hover:underline ml-1">{(adoption.postedBy as any).name}</Link>
                          ) : (
                            <span className="ml-1">{adoption.postedBy}</span>
                          )}
                          <span className="ml-1">({adoption.postedByType === 'donor' ? 'Donor' : 'Welfare Organization'})</span>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          {isOwnListing ? (
                            adoption.status === 'adopted' ? (
                              <span className="px-3 py-1 bg-green-700 text-white rounded-md text-sm">Adopted</span>
                            ) : null // Remove Mark as Adopted for untouched cases
                          ) : (
                            adoption.status === 'available' && (
                              <button 
                                onClick={() => handleAdopt(adoption)}
                                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                              >
                                Adopt
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
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

              {/* Payment Modal */}
              {showPaymentModal && selectedAdoption && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-xl font-semibold text-white mb-4">Complete Adoption</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-700 p-4 rounded-md">
                        <p className="text-gray-300 mb-2">Contact Information:</p>
                        <p className="text-white">{selectedAdoption.contactNumber}</p>
                      </div>
                      <div className="bg-gray-700 p-4 rounded-md">
                        <p className="text-gray-300 mb-2">Payment Details:</p>
                        <p className="text-white">Amount: 10 USDT</p>
                        <p className="text-white">Admin Wallet: 0x1234567890abcdef</p>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setShowPaymentModal(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePayment}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Complete Payment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Adoption Requests Tab */}
          {activeTab === "adoption-requests" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Adoption Requests</h2>
              </div>

              {loadingRequests ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : adoptionRequests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {adoptionRequests.map((request) => {
                    console.log('Request status:', request.status, request);
                    return (
                      <div key={request._id} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-white mb-1">{request.adoption.name}</h3>
                              <p className="text-purple-400 text-sm">
                                {request.adoption.type} • {request.adoption.breed}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              request.status === 'pending' ? 'bg-yellow-500 text-gray-900' :
                              request.status === 'approved' ? 'bg-green-600 text-white' :
                              request.status === 'payment pending' ? 'bg-blue-600 text-white' :
                              request.status === 'under review' ? 'bg-purple-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm">Requested by</p>
                              <p className="text-gray-300">{request.donor.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Contact Information</p>
                              <p className="text-gray-300">{request.donor.email}</p>
                              <p className="text-gray-300">{request.donor.phone}</p>
                            </div>
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
                            {request.status === 'under review' && request.paymentProof && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Payment Proof</h4>
                                {request.paymentProof.endsWith('.jpg') || request.paymentProof.endsWith('.png') ? (
                                  <img 
                                    src={`http://localhost:5001/${request.paymentProof}`} 
                                    alt="Payment Proof" 
                                    className="w-full h-48 object-cover rounded-lg mb-2"
                                  />
                                ) : (
                                  <div className="bg-gray-700 text-white p-2 rounded mb-2 break-all">
                                    {request.paymentProof}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button onClick={() => handleVerifyPayment(request._id, true)} className="bg-green-600 hover:bg-green-700">
                                    Verify Payment
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Add Manage Request button for pending requests */}
                          {request.status.toLowerCase() === 'pending' && (
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRequestModal(true);
                                }}
                                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                              >
                                Manage Request
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700">
                  <ClipboardList className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">No adoption requests yet.</p>
                  <p className="text-gray-400 mb-6 text-sm">Requests will appear here when donors submit them.</p>
                </div>
              )}
            </div>
          )}

          {/* Request Management Modal */}
          {showRequestModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Manage Adoption Request</h3>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedRequest(null);
                    }}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Animal</p>
                    <p className="text-gray-300">{selectedRequest.adoption.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Requested by</p>
                    <p className="text-gray-300">{selectedRequest.donor.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Reason</p>
                    <p className="text-gray-300">{selectedRequest.reason}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => updateRequestStatus(selectedRequest._id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateRequestStatus(selectedRequest._id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </ErrorBoundary>
  )
}

// Fix the ErrorBoundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error: error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error("Error in welfare dashboard:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-300 mb-4">
              We encountered an error while loading your dashboard. Please try refreshing the page.
            </p>
            <div className="bg-gray-700 p-4 rounded-md overflow-auto max-h-48 mb-4">
              <pre className="text-xs text-red-300">{this.state.error && this.state.error.toString()}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
