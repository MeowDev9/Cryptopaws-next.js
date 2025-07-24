"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  RefreshCw,
  Save,
} from "lucide-react"
import ConnectWalletButton from "@/components/ConnectWalletButton"
import Link from "next/link"
import { useDonationContract } from "@/hooks/useDonationContract"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import { DONATION_CONTRACT_ABI, DONATION_CONTRACT_ADDRESS } from "@/app/config/contracts";

// Define raw types that match the contract's ABI exactly
interface RawDonation {
  donor: string;
  organization: string;
  amount: ethers.BigNumberish;
  timestamp: ethers.BigNumberish;
  message: string;
}

interface RawOrganizationInfo {
  name: string;
  description: string;
  walletAddress: string;
  isActive: boolean;
  orgTotalDonations: ethers.BigNumberish;
  uniqueDonors: ethers.BigNumberish;
}

// Define frontend-friendly types
interface Donation {
  donor: string;
  organization: string;
  amount: string; // Formatted amount
  timestamp: number; // Unix timestamp in milliseconds
  message: string;
  amountWei: string; // Raw amount in wei
  timestampSeconds: number; // Raw timestamp in seconds
  caseId: string; // Case identifier
}

interface OrganizationInfo {
  name: string;
  description: string;
  walletAddress: string;
  isActive: boolean;
  totalDonations: string; // Formatted amount
  uniqueDonors: number;
}

// Helper function to convert raw contract data to frontend format
function toDonation(donation: RawDonation | null | undefined): Donation {
  // Return default values if donation is null or undefined
  if (!donation) {
    return {
      donor: ethers.ZeroAddress,
      organization: ethers.ZeroAddress,
      amount: '0',
      timestamp: 0,
      message: '',
      amountWei: '0',
      timestampSeconds: 0,
      caseId: ''
    };
  }

  // Safely handle BigNumberish values
  const amount = donation.amount != null 
    ? ethers.formatEther(donation.amount)
    : '0';
    
  const amountWei = donation.amount != null
    ? donation.amount.toString()
    : '0';
    
  const timestamp = donation.timestamp != null
    ? Number(donation.timestamp) * 1000 // Convert to ms for JS Date
    : 0;
    
  const timestampSeconds = donation.timestamp != null
    ? Number(donation.timestamp)
    : 0;

  return {
    donor: donation.donor || ethers.ZeroAddress,
    organization: donation.organization || ethers.ZeroAddress,
    message: donation.message || '',
    amount,
    amountWei,
    timestamp,
    timestampSeconds,
    caseId: (donation as any).caseId || '' // Handle caseId from raw donation if it exists
  };
}

// Helper function to convert raw organization info to frontend format
function toOrganizationInfo(info: RawOrganizationInfo | null | undefined): OrganizationInfo {
  // Return default values if info is null or undefined
  if (!info) {
    return {
      name: '',
      description: '',
      walletAddress: ethers.ZeroAddress,
      isActive: false,
      totalDonations: '0',
      uniqueDonors: 0
    };
  }

  // Safely handle BigNumberish values
  const totalDonations = info.orgTotalDonations != null 
    ? ethers.formatEther(info.orgTotalDonations) 
    : '0';
    
  const uniqueDonors = info.uniqueDonors != null 
    ? Number(info.uniqueDonors)
    : 0;

  return {
    name: info.name || '',
    description: info.description || '',
    walletAddress: info.walletAddress || ethers.ZeroAddress,
    isActive: info.isActive || false,
    totalDonations,
    uniqueDonors
  };
}

// Contract interface with proper typing
interface DonationContract extends Omit<ethers.Contract, 'getOrganizationInfo' | 'getDonorHistory'> {
  getOrganizationInfo(orgAddress: string): Promise<RawOrganizationInfo>;
  getDonorHistory(donorAddress: string): Promise<RawDonation[]>;
}

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
  isUrgent?: boolean
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
  animalType: string  // Added animal type field
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
  password?: string
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

// Memoized chart components to prevent unnecessary re-renders
const MemoizedDonationTrendsChart = React.memo(({ data }: { data: Array<{ month: string; amount: number }> }) => (
  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
    <h3 className="text-lg font-medium mb-4 text-white">Donation Trends</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }} 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#8B5CF6" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
));

const MemoizedCasePerformanceChart = React.memo(({ data }: { data: Array<{ name: string; donations: number }> }) => (
  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
    <h3 className="text-lg font-medium mb-4 text-white">Case Performance</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }} 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Donations']}
          />
          <Legend />
          <Bar 
            dataKey="donations" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
));

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
  const [showEditCase, setShowEditCase] = useState(false)
  const [newCase, setNewCase] = useState<NewCase>({
    title: "",
    description: "",
    targetAmount: "",
    imageUrl: "",
    images: [],
    animalType: "dog", // Default animal type
    costBreakdown: {
      surgery: "",
      medicine: "",
      recovery: "",
      other: "",
    },
  })
  const [editingCase, setEditingCase] = useState({
    _id: "",
    title: "",
    description: "",
    targetAmount: "",
    category: "medical",
    imageFile: null as File | null,
    imagePreview: "",
    currentImageUrl: ""
  })
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null)
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(false)
  const [isCreatingCase, setIsCreatingCase] = useState(false)
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
  
  // State variables for case management
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

  // Function to fetch all cases
  const fetchCases = useCallback(async () => {
    try {
      const token = localStorage.getItem('welfareToken');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/welfare/cases', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // Prevent caching to ensure fresh data
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }

      const cases = await response.json();
      console.log('Fetched cases:', cases.length);
      setCases(cases);
    } catch (error: unknown) {
      console.error('Error fetching cases:', error);
      toast({
        title: "Error",
        description: handleError(error),
        variant: "destructive",
      });
    }
  }, [toast, handleError]);

  // Function to fetch a single case by ID to get the latest data
  const fetchCaseById = async (caseId: string) => {
    try {
      const token = localStorage.getItem('welfareToken');
      if (!token) return null;

      // Using the correct API endpoint for single case
      const response = await fetch(`http://localhost:5001/api/welfare/case/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }

      const caseData = await response.json();
      console.log('Fetched updated case data:', caseData);
      
      // Update the case in the cases array
      setCases(prevCases => prevCases.map(c => 
        c._id === caseId ? caseData : c
      ));
      
      return caseData;
    } catch (error: unknown) {
      console.error('Error fetching case details:', error);
      toast({
        title: "Error",
        description: handleError(error),
        variant: "destructive",
      });
      return null;
    }
  };

  // Fetch cases when component mounts or active tab changes
  useEffect(() => {
    // Only fetch cases when on dashboard or cases tab
    if (activeTab === 'dashboard' || activeTab === 'cases') {
      fetchCases();
    }
  }, [activeTab, fetchCases]);

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
      console.log("Address passed to registerOrganization:", address);
      console.log("Data from backend:", data);


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
    formData.append("animalType", newCase.animalType) // Add animal type to form data
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
          animalType: "dog", // Include animal type field
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

  const handleEditCase = (caseData: Case) => {
    // Set the editing case data
    setEditingCase({
      _id: caseData._id || '',
      title: caseData.title || '',
      description: caseData.description || '',
      targetAmount: caseData.targetAmount?.toString() || '',
      category: caseData.category || 'medical',
      imageFile: null,
      imagePreview: '',
      currentImageUrl: caseData.imageUrl || ''
    });
    
    // Show the edit case modal
    setShowEditCase(true);
  }
  
  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("welfareToken");
    
    if (!token) {
      console.error("No token found");
      return;
    }
    
    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('title', editingCase.title);
      formData.append('description', editingCase.description);
      formData.append('targetAmount', editingCase.targetAmount);
      formData.append('category', editingCase.category);
      
      // Only append image if a new one is selected
      if (editingCase.imageFile) {
        formData.append('image', editingCase.imageFile);
      }
      
      // Make the API request to update the case
      const response = await fetch(`http://localhost:5001/api/welfare/cases/${editingCase._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      // Check if response is OK before trying to parse JSON
      if (response.ok) {
        const result = await response.json();
        
        // Update the cases list with the updated case
        setCases(cases.map(c => c._id === editingCase._id ? result.case : c));
        
        // Close the edit modal and show success message
        setShowEditCase(false);
        toast({
          title: "Success",
          description: "Case updated successfully",
          variant: "default",
        });
      } else {
        // Don't try to read the response body if status is 404
        if (response.status === 404) {
          console.error("API endpoint not found (404)");
          toast({
            title: "Error",
            description: `API endpoint not found (404)`,
            variant: "destructive",
          });
        } else {
          // For other errors, clone the response before reading
          const responseClone = response.clone();
          try {
            // Try to parse error as JSON
            const errorData = await response.json();
            console.error("Failed to update case:", errorData.message);
            toast({
              title: "Error",
              description: errorData.message || "Failed to update case",
              variant: "destructive",
            });
          } catch (jsonError) {
            // If not JSON, get the text response from the cloned response
            try {
              const textError = await responseClone.text();
              console.error("Server returned non-JSON response:", textError);
            } catch (textError) {
              console.error("Could not read response body");
            }
            
            toast({
              title: "Error",
              description: `Server error (${response.status})`,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating case:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the case",
        variant: "destructive",
      });
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
    console.log(`Diagnosis change: ${name} = ${value}`);
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
          animalType: selectedEmergency.animalType, // Explicitly include animal type
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

  // Function to fetch emergencies
  const getEmergencies = async () => {
    try {
      const token = localStorage.getItem('welfareToken');
      if (!token) {
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
      toast({
        title: "Error",
        description: "Failed to fetch emergencies",
        variant: "destructive",
      });
    }
  };

  // Add a new function to directly create a case from emergency data
  const createCaseDirectly = async () => {
    console.log("createCaseDirectly function called");
    console.log("Selected Emergency:", selectedEmergency);
    console.log("Emergency Diagnosis:", emergencyDiagnosis);
    try {
      // Set loading state
      setIsCreatingCase(true);
      
      if (!selectedEmergency) {
        toast({
          title: "Error",
          description: "No emergency selected.",
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem("welfareToken");
      const walletAddress = localStorage.getItem("walletAddress");
      
      console.log("Token exists:", !!token);
      console.log("Wallet address:", walletAddress);
      
      // Make wallet address optional
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token not found. Please login again.",
          variant: "destructive",
        });
        return;
      }
      
      // If wallet address is missing, use a placeholder
      const effectiveWalletAddress = walletAddress || "0x0000000000000000000000000000000000000000";

      // Only validate the doctor assignment since other fields have been removed
      if (!emergencyDiagnosis.assignedDoctor) {
        console.log("Validation failed: No doctor assigned");
        toast({
          title: "Missing Information",
          description: "Please assign a doctor to this emergency case.",
          variant: "destructive",
        });
        return;
      }

      // Get the doctor ID from the emergencyDiagnosis state
      const doctorId = emergencyDiagnosis.assignedDoctor;

      // Debug logging
      console.log("Doctor ID:", doctorId);
      console.log("Doctor ID type:", typeof doctorId);
      console.log("Doctor ID valid:", doctorId && /^[0-9a-fA-F]{24}$/.test(doctorId));

      // Prepare case data as JSON without default values for fields to be completed by the doctor
      // Create case data with proper types for required fields
      const caseData = {
        isEmergency: true,
        title: selectedEmergency.animalType + " Emergency Case",
        description: selectedEmergency.description || "Emergency case created from report",
        welfareAddress: effectiveWalletAddress,
        animalType: selectedEmergency.animalType || "other",
        assignedDoctor: doctorId,
        status: "pending",
        costBreakdown: null,
        imageUrls: selectedEmergency.images || [],
        emergencyId: selectedEmergency._id // Include the emergency ID for reference
      };

      console.log("Creating case with data:", caseData);
      
      try {
        // Make a direct JSON API call to convert emergency to case
        console.log("Sending API request to emergency-to-case endpoint");
        const response = await fetch("http://localhost:5001/api/welfare/emergency-to-case", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(caseData)
        });
        
        console.log("API response status:", response.status);
        
        // Get the response text first to see what's being returned
        const responseText = await response.text();
        console.log("API response text:", responseText);
        
        // Try to parse as JSON if possible
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Error parsing response as JSON:", e);
        }
        
        if (!response.ok) {
          console.error("Error creating case:", responseData || responseText);
          toast({
            title: "Error",
            description: (responseData && responseData.message) || "Failed to create case. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // If we got here, the response was successful
        console.log("Case created successfully:", responseData);
        
        // Refresh emergencies list
        getEmergencies();
        
        // Reset form and close modal
        setEmergencyDiagnosis({
          medicalIssue: "",
          estimatedCost: "",
          assignedDoctor: "",
        });
        setSelectedEmergency(null);
        setShowEmergencyDetails(false);
        
        toast({
          title: "Success",
          description: "Case created successfully!",
          variant: "default",
        });
      } catch (apiError) {
        console.error("API call error:", apiError);
        toast({
          title: "API Error",
          description: `Error calling API: ${apiError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Refresh emergencies list
      getEmergencies();
      
      // Reset form and close modal
      setEmergencyDiagnosis({
        medicalIssue: "",
        estimatedCost: "",
        assignedDoctor: "",
      });
      setSelectedEmergency(null);
      setShowEmergencyDetails(false);
      
      toast({
        title: "Success",
        description: "Case created successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating case:", error);
      toast({
        title: "Error",
        description: `Failed to create case: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsCreatingCase(false);
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
        specialization: ""
      });
      setSelectedDoctor(null);
      setShowEditDoctor(false);
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert("Failed to update doctor. Please try again.");
    }
  };
  
  // Function to handle viewing case details
  const handleViewCase = async (caseId: string) => {
    // Fetch the latest case data before navigating
    await fetchCaseById(caseId);
    router.push(`/welfare/cases/${caseId}`);
  };
  
  // Function to refresh cases periodically
  const refreshCases = useCallback(async () => {
    console.log('Refreshing cases with latest data...');
    await fetchCases();
  }, [fetchCases]);

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
  
  // Function to handle adding a new doctor with temporary password
  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const token = localStorage.getItem("welfareToken");
    if (!token) {
      console.error("No token found");
      toast({
        title: "Error",
        description: "Authentication token not found. Please log in again.",
        variant: "destructive",
      });
      router.push("/welfare/login");
      return;
    }
    
    try {
      // Check if token is expired by decoding it
      const tokenParts = token.split('.');
      let welfareId = null;
      let isTokenExpired = false;
      
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          welfareId = payload.id || payload._id || payload.userId;
          
          // Check token expiration
          if (payload.exp) {
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            isTokenExpired = Date.now() >= expirationTime;
          }
        } catch (e) {
          console.error("Error parsing token:", e);
          isTokenExpired = true;
        }
      }
      
      if (isTokenExpired) {
        localStorage.removeItem("welfareToken");
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        router.push("/welfare/login");
        return;
      }
      
      if (!welfareId) {
        throw new Error("Could not extract welfare ID from token");
      }
      
      // Make API request to register doctor
      const response = await fetch("http://localhost:5001/api/doctor/register-with-temp-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newDoctor.name,
          email: newDoctor.email,
          specialization: newDoctor.specialization,
          welfareId: welfareId
        })
      });
      
      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem("welfareToken");
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        router.push("/welfare/login");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Failed to register doctor";
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.message && errorData.message.includes("already registered")) {
            errorMessage = "This email is already registered. Please use a different email address.";
          } else if (errorData.message && errorData.message.includes("invalid email")) {
            errorMessage = "Please enter a valid email address.";
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (response.status === 500) {
          errorMessage = "An unexpected server error occurred. Please try again later.";
        }
        
        // Show the error toast
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Re-throw the error for further handling if needed
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Add the new doctor to the list
      setDoctors([...doctors, data.doctor]);
      
      // Reset form and close dialog
      setNewDoctor({
        name: "",
        email: "",
        specialization: ""
      });
      setShowAddDoctor(false);
      
      toast({
        title: "Success",
        description: "Doctor registered successfully. A temporary password has been sent to their email.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error registering doctor:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register doctor",
        variant: "destructive",
      });
    }
  };
  
  // Function to open the edit doctor dialog
  const openEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setNewDoctor({
      name: doctor.name,
      email: doctor.email,
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

  // Add state for loading dashboard data
  const [loadingDashboardData, setLoadingDashboardData] = useState(false);

  // Create a separate fetchDashboardData function using useCallback for proper dependency management
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("welfareToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Set loading state
      setLoadingDashboardData(true);

      // Fetch donations data with cache: 'no-store' to ensure fresh data
      const donationsResponse = await fetch("http://localhost:5001/api/welfare/donations", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store',
        next: { revalidate: 30 } // Revalidate every 30 seconds
      });

      if (!donationsResponse.ok) {
        throw new Error('Failed to fetch donations data');
      }

      const donationsData = await donationsResponse.json();
      
      // Update all state in a single batch
      setDonations(prev => ({
        ...donationsData.stats,
        items: donationsData.donations || []
      }));
      
      setDonorsCount(prev => ({
        total: donationsData.stats.uniqueDonors,
        thisMonth: donationsData.stats.newDonorsThisMonth,
        percentChange: donationsData.stats.donorPercentChange
      }));
      
      setDashboardCharts(prev => ({
        donationsByMonth: donationsData.charts.byMonth,
        casePerformance: donationsData.charts.byCase
      }));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingDashboardData(false);
    }
  }, [toast]);
  
  // Memoize the fetch function
  const memoizedFetchDashboardData = useCallback(fetchDashboardData, [fetchDashboardData]);

  // Add useEffect to manage data fetching and polling
  useEffect(() => {
    // Only proceed if we have a token
    if (!welfareToken) return;
    
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        await memoizedFetchDashboardData();
      } catch (error) {
        console.error('Error in data fetch:', error);
      }
      
      // Only set up next poll if component is still mounted
      if (isMounted) {
        // Only poll if we're on the dashboard tab
        if (activeTab === 'dashboard') {
          timeoutId = setTimeout(fetchData, 30000); // 30 seconds
        }
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [welfareToken, activeTab, memoizedFetchDashboardData]);
  
  // Add effect to fetch data when tab changes to dashboard
  useEffect(() => {
    if (activeTab === 'dashboard' && welfareToken) {
      // Use a small timeout to avoid rapid successive fetches
      const timer = setTimeout(() => {
        memoizedFetchDashboardData();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, welfareToken, memoizedFetchDashboardData]);

  // Add useEffect for fetching blockchain data
  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        if (!profile?.blockchainAddress) {
          console.error("No blockchain address found");
          return;
        }

        // Validate and format the blockchain address
        let formattedAddress: string;
        try {
          if (ethers.isAddress(profile.blockchainAddress)) {
            formattedAddress = ethers.getAddress(profile.blockchainAddress);
          } else {
            console.error("Invalid blockchain address format:", profile.blockchainAddress);
            return;
          }
        } catch (error) {
          console.error("Error formatting blockchain address:", error);
          return;
        }

        try {
          // Initialize provider with just the URL
          const provider = new ethers.JsonRpcProvider("https://sepolia.era.zksync.dev");
          
          // Create contract instance with proper typing
          const contract = new ethers.Contract(
            ethers.getAddress(DONATION_CONTRACT_ADDRESS),
            DONATION_CONTRACT_ABI,
            provider
          ) as unknown as DonationContract;

          // Get organization info with proper typing and conversion
          const rawOrgInfo = await contract.getOrganizationInfo(formattedAddress);
          const orgInfo = toOrganizationInfo(rawOrgInfo);
          const { name, description, walletAddress, isActive, totalDonations, uniqueDonors } = orgInfo;

          // Get donor history with proper typing and conversion
          const rawDonorHistory = await contract.getDonorHistory(formattedAddress);
          const donorHistory = rawDonorHistory.map(toDonation);
          
          const { monthlyDonations, casePerformance, recentDonations } = processDonationData(donorHistory);

          setDonations(prev => ({
            ...prev,
            total: parseFloat(ethers.formatEther(totalDonations || '0')),
            totalUsd: parseFloat(ethers.formatEther(totalDonations || '0')) * 3000,
            thisMonth: monthlyDonations[monthlyDonations.length - 1]?.amount || 0,
            thisMonthUsd: (monthlyDonations[monthlyDonations.length - 1]?.amount || 0) * 3000,
            percentChange: monthlyDonations.length > 1 
              ? ((monthlyDonations[monthlyDonations.length - 1]?.amount || 0) - (monthlyDonations[monthlyDonations.length - 2]?.amount || 0)) / (monthlyDonations[monthlyDonations.length - 2]?.amount || 1) * 100
              : 0,
            uniqueDonors: Number(uniqueDonors || 0),
            newDonorsThisMonth: 0,
            donorPercentChange: 0,
            items: recentDonations
          }));

          setDashboardCharts(prev => ({
            ...prev,
            donationsByMonth: monthlyDonations,
            casePerformance: casePerformance
          }));
          
        } catch (error) {
          console.error("Error in blockchain data fetch:", error);
          // Don't show error to user if it's just a blockchain data fetch issue
        }

      } catch (error: unknown) {
        console.error("Error in fetchBlockchainData:", error);
        // Only show non-blockchain related errors to user
        if (!(error instanceof Error && error.message.includes('network does not support ENS'))) {
          setError(handleError(error));
        }
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
          try {
            // Validate and format the blockchain address
            let formattedAddress: string;
            if (ethers.isAddress(profile.blockchainAddress)) {
              formattedAddress = ethers.getAddress(profile.blockchainAddress);
              
              const provider = new ethers.JsonRpcProvider("https://sepolia.era.zksync.dev");
              const contract = new ethers.Contract(
                DONATION_CONTRACT_ADDRESS,
                DONATION_CONTRACT_ABI,
                provider
              );

              // Get organization info from blockchain using the formatted address
              const [name, description, walletAddress, isActive, totalDonations, uniqueDonors] = 
                await contract.getOrganizationInfo(formattedAddress);

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
            console.error('Error fetching blockchain data in donation data fetch:', error);
            // Don't throw the error here to prevent breaking the entire donation data fetch
          }
        }
      } catch (error) {
        console.error('Error fetching donation data:', error);
      }
    };

    // Initial fetch
    fetchDonationData();
  }, [profile?.blockchainAddress]);

  // Memoized donation data processing
  const processDonationData = useCallback((donations: Donation[]) => {
    if (!donations?.length) return { monthlyDonations: [], casePerformance: [], recentDonations: [] };
    
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

    // Sort monthly donations chronologically
    const sortedMonthlyDonations = monthlyDonations.sort((a, b) => 
      new Date(`1 ${a.month}`).getTime() - new Date(`1 ${b.month}`).getTime()
    );
    
    // Sort recent donations by date (newest first)
    const sortedRecentDonations = recentDonations.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return { 
      monthlyDonations: sortedMonthlyDonations, 
      casePerformance: casePerformanceArray, 
      recentDonations: sortedRecentDonations 
    };
  }, []); // Empty dependency array as we don't use any external values

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

            {/* Reports, Analytics, and Settings tabs removed */}

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
              {/* Dashboard Header with Refresh Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Welfare Dashboard</h2>
                <button
                  onClick={fetchDashboardData}
                  disabled={loadingDashboardData}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loadingDashboardData ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
              {loadingDashboardData ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                  <p className="text-gray-400">Loading dashboard data...</p>
                </div>
              ) : (
                <>
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
                    <MemoizedDonationTrendsChart data={dashboardCharts?.donationsByMonth || []} />
                    <MemoizedCasePerformanceChart data={dashboardCharts?.casePerformance || []} />
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
                </>
              )}
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === "cases" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-white">Donation Cases</h2>
                  <Button
                    onClick={refreshCases}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    title="Refresh cases"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => setShowAddCase(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Case
                </Button>
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

                    {/* Target Amount removed - will be added by doctor */}

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

                    {/* Medical Issue removed - will be added by doctor */}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Animal Type</label>
                      <select
                        value={newCase.animalType}
                        onChange={(e) => setNewCase({ ...newCase, animalType: e.target.value })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        required
                      >
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="donkey">Donkey</option>
                        <option value="cow">Cow</option>
                        <option value="goat">Goat</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Cost Breakdown removed - will be added by doctor */}

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
              
              {/* Edit Case Modal */}
              {showEditCase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full border border-gray-700 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-white">Edit Donation Case</h3>
                      <button
                        onClick={() => setShowEditCase(false)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleUpdateCase} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={editingCase.title}
                          onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                          value={editingCase.description}
                          onChange={(e) => setEditingCase({ ...editingCase, description: e.target.value })}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[100px]"
                          required
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Target Amount ($)</label>
                        <input
                          type="number"
                          value={editingCase.targetAmount}
                          onChange={(e) => setEditingCase({ ...editingCase, targetAmount: e.target.value })}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <select
                          value={editingCase.category}
                          onChange={(e) => setEditingCase({ ...editingCase, category: e.target.value })}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                          <option value="medical">Medical</option>
                          <option value="food">Food</option>
                          <option value="shelter">Shelter</option>
                          <option value="rescue">Rescue</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Current Image</label>
                        {editingCase.currentImageUrl ? (
                          <div className="h-40 w-full bg-gray-700 relative rounded-md overflow-hidden mb-2">
                            <Image
                              src={
                                Array.isArray(editingCase.currentImageUrl) && editingCase.currentImageUrl.length > 0
                                  ? (editingCase.currentImageUrl[0].startsWith('http') 
                                      ? editingCase.currentImageUrl[0] 
                                      : `http://localhost:5001/uploads/${editingCase.currentImageUrl[0]}`)
                                  : (typeof editingCase.currentImageUrl === 'string'
                                      ? (editingCase.currentImageUrl.startsWith('http')
                                          ? editingCase.currentImageUrl
                                          : `http://localhost:5001/uploads/${editingCase.currentImageUrl}`)
                                      : "/images/placeholder-case.jpg")
                              }
                              alt="Current case image"
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        ) : (
                          <div className="h-40 w-full bg-gray-700 flex items-center justify-center text-gray-400 rounded-md mb-2">
                            No image available
                          </div>
                        )}
                        
                        <label className="block text-sm font-medium text-gray-300 mb-1 mt-4">Update Image (Optional)</label>
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingCase({
                                  ...editingCase,
                                  imageFile: file,
                                  imagePreview: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        />
                        
                        {editingCase.imagePreview && (
                          <div className="mt-2 h-40 w-full bg-gray-700 relative rounded-md overflow-hidden">
                            <Image
                              src={editingCase.imagePreview}
                              alt="New image preview"
                              fill
                              style={{ objectFit: "cover" }}
                            />
                            <div className="absolute top-2 right-2 bg-gray-800 rounded-full p-1">
                              <span className="text-xs text-white px-2">New Image</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowEditCase(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                        >
                          <Save className="h-4 w-4 mr-2" /> Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(cases) && cases.length > 0 ? (
                  cases.map((c) => (
                    <div key={c._id || `case-${c.title}-${c.createdAt}`} className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                      <div className="h-48 bg-gray-700 relative">
                        {c.imageUrl ? (
                          <Image
                            src={
                              Array.isArray(c.imageUrl) && c.imageUrl.length > 0
                                ? (c.imageUrl[0].startsWith('http') 
                                    ? c.imageUrl[0] 
                                    : `http://localhost:5001/uploads/${c.imageUrl[0]}`)
                                : (typeof c.imageUrl === 'string'
                                    ? (c.imageUrl.startsWith('http')
                                        ? c.imageUrl
                                        : `http://localhost:5001/uploads/${c.imageUrl}`)
                                    : "/images/placeholder-case.jpg")
                            }
                            alt={c.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg text-white">{c.title}</h3>
                          <div className="flex space-x-2">
                            {c.isUrgent && (
                              <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-medium rounded-full border border-red-700/50">
                                URGENT
                              </span>
                            )}
                            {c.status === "completed" && (
                              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded-full border border-green-700/50">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
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
                            
                            {/* Display cost breakdown if available */}
                            {c.costBreakdown && Array.isArray(c.costBreakdown) && c.costBreakdown.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-300">
                                  <span className="font-medium">Cost Breakdown:</span>
                                </p>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  {c.costBreakdown.map((item, index) => (
                                    <p key={index} className="text-gray-300">
                                      {item.item}: <span className="text-white">${parseFloat(item.cost).toFixed(2)}</span>
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Progress bar for amount raised */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Raised: ${c.amountRaised || '0'}</span>
                            <span className="text-gray-400">
                              Target: ${(() => {
                                if (Array.isArray(c.costBreakdown) && c.costBreakdown.length > 0) {
                                  return c.costBreakdown.reduce((total, item) => total + (parseFloat(item.cost) || 0), 0).toFixed(2);
                                } else {
                                  return c.targetAmount || '0';
                                }
                              })()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(() => {
                                  const amountRaised = parseFloat(c.amountRaised || '0');
                                  let targetAmount;
                                  
                                  if (Array.isArray(c.costBreakdown) && c.costBreakdown.length > 0) {
                                    targetAmount = c.costBreakdown.reduce((total, item) => total + (parseFloat(item.cost) || 0), 0);
                                  } else {
                                    targetAmount = parseFloat(c.targetAmount || '1');
                                  }
                                  
                                  const percentage = (amountRaised / targetAmount) * 100;
                                  return Math.min(100, percentage);
                                })()}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 font-medium">
                            {/* Display the total from cost breakdown if available, otherwise show targetAmount */}
                            Total: ${(() => {
                              if (Array.isArray(c.costBreakdown) && c.costBreakdown.length > 0) {
                                return c.costBreakdown.reduce((total, item) => total + (parseFloat(item.cost) || 0), 0).toFixed(2);
                              } else {
                                return c.targetAmount || '0';
                              }
                            })()}
                          </span>
                          <div>
                            <button 
                              onClick={() => handleEditCase(c)}
                              className="p-2 text-blue-400 hover:bg-gray-700 rounded-full flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              <span className="text-xs">Edit</span>
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
                          <p className="text-white">{selectedEmergency?.animalType || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Condition</p>
                          <p className="text-white">{selectedEmergency?.condition || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Location</p>
                          <p className="text-white">{selectedEmergency?.location || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Status</p>
                            <p className="text-white">{selectedEmergency?.status || 'N/A'}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400">Description</p>
                          <p className="text-white">{selectedEmergency?.description || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400">Reporter Contact</p>
                          <p className="text-white">{selectedEmergency?.name || 'N/A'} - {selectedEmergency?.phone || 'N/A'}</p>
                        </div>

                        {selectedEmergency?.images && selectedEmergency.images.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Images</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {selectedEmergency?.images?.map((img, i) => (
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
                              <option key={doctor._id} value={doctor._id}>
                                {doctor.name} - {doctor.specialization}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                          <div className="flex items-center text-amber-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium">Medical details will be added by the assigned doctor</p>
                          </div>
                          <p className="text-xs text-gray-400">The doctor will assess the animal's condition and provide medical details and cost estimates.</p>
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
                            onClick={(e) => {
                              e.preventDefault();
                              console.log("Create Donation Case button clicked");
                              createCaseDirectly();
                            }}
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
                        
                        <div className="p-4 bg-gray-700 rounded-md border border-gray-600">
                          <div className="flex items-center text-amber-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium">Temporary Password</p>
                          </div>
                          <p className="text-xs text-gray-300">A temporary password will be sent to the doctor's email. They will be able to change it after logging in.</p>
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
            
            {activeTab === "updates" && (
              <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700 text-center">
                <h3 className="text-lg font-medium mb-4 text-white">Updates Section</h3>
                <p className="text-gray-400 mb-4">
                  Manage your case updates, success stories, and announcements in the dedicated Updates page.
                </p>
                <Link href="/welfare/updates" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md inline-flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> Go to Updates Page
                </Link>
              </div>
            )}
            
            {(activeTab === "reports" || 
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
                        <p className="text-white">{selectedAdoption?.contactNumber || 'N/A'}</p>
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
                    <p className="text-gray-300">{selectedRequest?.adoption?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Requested by</p>
                    <p className="text-gray-300">{selectedRequest?.donor?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Reason</p>
                    <p className="text-gray-300">{selectedRequest?.reason || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => selectedRequest?._id && updateRequestStatus(selectedRequest._id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={!selectedRequest}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => selectedRequest?._id && updateRequestStatus(selectedRequest._id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    disabled={!selectedRequest}
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
