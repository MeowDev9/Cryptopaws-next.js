"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  X,
  RefreshCw,
  Save,
  FileBarChart,
  ExternalLink,
  Search,
  Filter,
  Tag,
  Calendar,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Heart,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Interfaces
interface CaseUpdate {
  _id: string;
  caseId: string;
  title: string;
  content: string;
  imageUrl: string[];
  isSuccessStory: boolean;
  isPublished: boolean;
  createdAt: string;
  postedBy: string;
  authorRole: string;
  case?: {
    _id: string;
    title: string;
    imageUrl: string;
  };
  animalStatus?: string;
  spent?: {
    medicine?: number;
    surgery?: number;
    recovery?: number;
    other?: number;
  };
}

interface Case {
  _id: string;
  title: string;
  imageUrl: string;
}

interface NewUpdate {
  caseId: string;
  title: string;
  content: string;
  images: File[];
  isSuccessStory: boolean;
  animalStatus: string;
  spent: {
    medicine: string;
    surgery: string;
    recovery: string;
    other: string;
  };
}

export default function WelfareUpdates() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State variables
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [showEditUpdate, setShowEditUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<CaseUpdate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, success, regular
  const [filterCase, setFilterCase] = useState("all");
  
  const [newUpdate, setNewUpdate] = useState<NewUpdate>({
    caseId: "",
    title: "",
    content: "",
    images: [],
    isSuccessStory: false,
    animalStatus: "",
    spent: {
      medicine: "0",
      surgery: "0",
      recovery: "0",
      other: "0"
    }
  });
  
  const [editingUpdate, setEditingUpdate] = useState<{
    _id: string;
    caseId: string;
    title: string;
    content: string;
    imageFiles: File[];
    imageUrls: string[];
    isSuccessStory: boolean;
    isPublished: boolean;
    animalStatus: string;
    spent: {
      medicine: string;
      surgery: string;
      recovery: string;
      other: string;
    };
  }>({
    _id: "",
    caseId: "",
    title: "",
    content: "",
    imageFiles: [],
    imageUrls: [],
    isSuccessStory: false,
    isPublished: true,
    animalStatus: "",
    spent: {
      medicine: "0",
      surgery: "0",
      recovery: "0",
      other: "0"
    }
  });
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [welfareToken, setWelfareToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all"); // all, published, drafts
  
  // Initialize welfare token and check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('welfareToken');
      setWelfareToken(token);
      
      if (!token) {
        router.push('/welfare/login');
        return;
      }
    }
  }, [router]);

  // Fetch case updates and cases when component mounts
  useEffect(() => {
    if (welfareToken) {
      fetchCaseUpdates();
      fetchCases();
    }
  }, [welfareToken]);

  // Fetch case updates
  const fetchCaseUpdates = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("welfareToken");
      
      const response = await fetch("http://localhost:5001/api/welfare/my-updates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
        throw new Error(`Failed to fetch updates: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data && Array.isArray(data.updates)) {
        setCaseUpdates(data.updates);
      } else if (data && Array.isArray(data)) {
        setCaseUpdates(data);
      } else {
        console.error("Invalid data format for case updates:", data);
        setCaseUpdates([]); // Set empty array as fallback
      }
    } catch (err) {
      console.error("Error fetching case updates:", err);
      toast({
        title: "Error",
        description: "Failed to fetch updates. Please try again.",
        variant: "destructive",
      });
      setCaseUpdates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cases
  const fetchCases = async () => {
    try {
      const token = localStorage.getItem("welfareToken");
      
      const response = await fetch("http://localhost:5001/api/welfare/cases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }
      
      const data = await response.json();
      setCases(data);
    } catch (err) {
      console.error("Error fetching cases:", err);
      toast({
        title: "Error",
        description: "Failed to fetch cases. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle image change for new update
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setNewUpdate({ ...newUpdate, images: filesArray });
      
      // Create image previews
      const newPreviews: string[] = [];
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            newPreviews.push(e.target.result as string);
            setImagePreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle image change for edit update
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setEditingUpdate({ ...editingUpdate, imageFiles: filesArray });
      
      // Create image previews
      const newPreviews: string[] = [];
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            newPreviews.push(e.target.result as string);
            setEditImagePreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle spent value change for new update
  const handleSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUpdate({
      ...newUpdate,
      spent: {
        ...newUpdate.spent,
        [name]: value
      }
    });
  };

  // Handle spent value change for edit update
  const handleEditSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingUpdate({
      ...editingUpdate,
      spent: {
        ...editingUpdate.spent,
        [name]: value
      }
    });
  };

  // Handle add update form submission
  const handleAddUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("welfareToken");
    const formData = new FormData();
    formData.append("caseId", newUpdate.caseId);
    formData.append("title", newUpdate.title);
    formData.append("content", newUpdate.content);
    formData.append("isSuccessStory", String(newUpdate.isSuccessStory));
    formData.append("animalStatus", newUpdate.animalStatus);
    
    // Append spent values
    formData.append("spent[medicine]", newUpdate.spent.medicine);
    formData.append("spent[surgery]", newUpdate.spent.surgery);
    formData.append("spent[recovery]", newUpdate.spent.recovery);
    formData.append("spent[other]", newUpdate.spent.other);

    // Append multiple images
    if (newUpdate.images && newUpdate.images.length > 0) {
      newUpdate.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    try {
      const response = await fetch("http://localhost:5001/api/welfare/case-updates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add update");
      }

      const data = await response.json();
      
      // Reset form and fetch updated list
      setNewUpdate({
        caseId: "",
        title: "",
        content: "",
        images: [],
        isSuccessStory: false,
        animalStatus: "",
        spent: {
          medicine: "0",
          surgery: "0",
          recovery: "0",
          other: "0"
        }
      });
      setImagePreviews([]);
      setShowAddUpdate(false);
      fetchCaseUpdates();
      
      toast({
        title: "Success",
        description: "Update added successfully!",
        variant: "default",
      });
    } catch (err) {
      console.error("Error adding update:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add update",
        variant: "destructive",
      });
    }
  };

  // Handle edit update
  const handleEditUpdate = (update: CaseUpdate) => {
    setEditingUpdate({
      _id: update._id,
      caseId: update.caseId,
      title: update.title,
      content: update.content,
      imageFiles: [],
      imageUrls: update.imageUrl || [],
      isSuccessStory: update.isSuccessStory,
      isPublished: update.isPublished,
      animalStatus: update.animalStatus || "",
      spent: {
        medicine: update.spent?.medicine?.toString() || "0",
        surgery: update.spent?.surgery?.toString() || "0",
        recovery: update.spent?.recovery?.toString() || "0",
        other: update.spent?.other?.toString() || "0"
      }
    });
    
    // Set image previews for existing images
    const previews = update.imageUrl?.map(url => `http://localhost:5001${url}`) || [];
    setEditImagePreviews(previews);
    
    setShowEditUpdate(true);
  };

  // Handle update edit form submission
  const handleUpdateEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("welfareToken");
    const formData = new FormData();
    formData.append("title", editingUpdate.title);
    formData.append("content", editingUpdate.content);
    formData.append("isSuccessStory", String(editingUpdate.isSuccessStory));
    formData.append("isPublished", String(editingUpdate.isPublished));
    formData.append("animalStatus", editingUpdate.animalStatus);
    
    // Append spent values
    formData.append("spent[medicine]", editingUpdate.spent.medicine);
    formData.append("spent[surgery]", editingUpdate.spent.surgery);
    formData.append("spent[recovery]", editingUpdate.spent.recovery);
    formData.append("spent[other]", editingUpdate.spent.other);

    // Keep existing images
    if (editingUpdate.imageUrls && editingUpdate.imageUrls.length > 0) {
      editingUpdate.imageUrls.forEach(url => {
        formData.append("existingImages", url);
      });
    }

    // Add new images if any
    if (editingUpdate.imageFiles && editingUpdate.imageFiles.length > 0) {
      editingUpdate.imageFiles.forEach(file => {
        formData.append("images", file);
      });
    }

    try {
      const response = await fetch(`http://localhost:5001/api/welfare/case-updates/${editingUpdate._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update");
      }

      const data = await response.json();
      
      // Reset form and fetch updated list
      setShowEditUpdate(false);
      setEditImagePreviews([]);
      fetchCaseUpdates();
      
      toast({
        title: "Success",
        description: "Update modified successfully!",
        variant: "default",
      });
    } catch (err) {
      console.error("Error updating:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update",
        variant: "destructive",
      });
    }
  };

  // Handle delete update
  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm("Are you sure you want to delete this update? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("welfareToken");
      
      const response = await fetch(`http://localhost:5001/api/welfare/case-updates/${updateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete update");
      }

      // Remove from state and fetch updated list
      setCaseUpdates(caseUpdates.filter(update => update._id !== updateId));
      
      toast({
        title: "Success",
        description: "Update deleted successfully!",
        variant: "default",
      });
    } catch (err) {
      console.error("Error deleting update:", err);
      toast({
        title: "Error",
        description: "Failed to delete update. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle toggle publish status
  const handleTogglePublish = async (updateId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("welfareToken");
      
      const response = await fetch(`http://localhost:5001/api/welfare/case-updates/${updateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update publish status");
      }

      // Update in state
      setCaseUpdates(caseUpdates.map(update => 
        update._id === updateId 
          ? { ...update, isPublished: !currentStatus } 
          : update
      ));
      
      toast({
        title: "Success",
        description: `Update ${!currentStatus ? "published" : "unpublished"} successfully!`,
        variant: "default",
      });
    } catch (err) {
      console.error("Error updating publish status:", err);
      toast({
        title: "Error",
        description: "Failed to update publish status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter updates based on search term and filters
  const filteredUpdates = caseUpdates.filter(update => {
    // Search term filter
    const matchesSearch = 
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = 
      filterType === "all" ||
      (filterType === "success" && update.isSuccessStory) ||
      (filterType === "regular" && !update.isSuccessStory);
    
    // Case filter
    const matchesCase = 
      filterCase === "all" ||
      update.caseId === filterCase;
    
    return matchesSearch && matchesType && matchesCase;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Updates Management</h1>
          <div className="flex space-x-2">
            <Link href="/welfare/dashboard" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
              <Home className="h-4 w-4 mr-2" /> Dashboard
            </Link>
            <button
              onClick={() => setShowAddUpdate(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" /> New Update
            </button>
          </div>
        </div>
        
        {/* Filters and search */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search updates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md pl-10 w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="success">Success Stories</option>
                <option value="regular">Regular Updates</option>
              </select>
              
              <select
                value={filterCase}
                onChange={(e) => setFilterCase(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                <option value="all">All Cases</option>
                {cases.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md ${activeTab === "all" ? "bg-purple-600" : "bg-gray-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`px-4 py-2 rounded-md ${activeTab === "published" ? "bg-purple-600" : "bg-gray-700"}`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab("drafts")}
              className={`px-4 py-2 rounded-md ${activeTab === "drafts" ? "bg-purple-600" : "bg-gray-700"}`}
            >
              Drafts
            </button>
          </div>
        </div>
        
        {/* Updates list */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No updates found. Create your first update by clicking the "New Update" button.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpdates
              .filter(update => {
                if (activeTab === "all") return true;
                if (activeTab === "published") return update.isPublished;
                if (activeTab === "drafts") return !update.isPublished;
                return true;
              })
              .map(update => (
                <div key={update._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col">
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs mr-2 ${update.isSuccessStory ? "bg-green-900 text-green-300" : "bg-blue-900 text-blue-300"}`}>
                          {update.isSuccessStory ? "Success Story" : "Update"}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${update.isPublished ? "bg-purple-900 text-purple-300" : "bg-gray-700 text-gray-300"}`}>
                          {update.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditUpdate(update)}
                          className="text-gray-400 hover:text-white p-1"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(update._id, update.isPublished)}
                          className="text-gray-400 hover:text-white p-1"
                          title={update.isPublished ? "Unpublish" : "Publish"}
                        >
                          {update.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUpdate(update._id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{update.title}</h3>
                    
                    <p className="text-gray-300 text-sm mb-3 line-clamp-3">{update.content}</p>
                    
                    {update.imageUrl && update.imageUrl.length > 0 && (
                      <div className="flex space-x-2 overflow-x-auto py-2 mb-3">
                        {update.imageUrl.map((img, i) => (
                          <div key={i} className="w-16 h-16 flex-shrink-0 bg-gray-700 rounded-md relative">
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
                    
                    {update.animalStatus && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-400">Animal Status:</span>
                        <span className="ml-2 text-sm text-white">{update.animalStatus}</span>
                      </div>
                    )}
                    
                    {update.spent && Object.values(update.spent).some(val => val && val > 0) && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-400">Expenses:</span>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {update.spent.medicine && update.spent.medicine > 0 && (
                            <div className="text-xs">Medicine: <span className="text-purple-300">${update.spent.medicine}</span></div>
                          )}
                          {update.spent.surgery && update.spent.surgery > 0 && (
                            <div className="text-xs">Surgery: <span className="text-purple-300">${update.spent.surgery}</span></div>
                          )}
                          {update.spent.recovery && update.spent.recovery > 0 && (
                            <div className="text-xs">Recovery: <span className="text-purple-300">${update.spent.recovery}</span></div>
                          )}
                          {update.spent.other && update.spent.other > 0 && (
                            <div className="text-xs">Other: <span className="text-purple-300">${update.spent.other}</span></div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(update.createdAt)}
                      </div>
                      <div>
                        {update.case?.title && (
                          <span className="flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {update.case.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      
      {/* Add Update Modal */}
      {showAddUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sticky top-0 bg-gray-800 z-10 pb-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Add New Update</h3>
              <button
                onClick={() => {
                  setShowAddUpdate(false);
                  setImagePreviews([]);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Case</label>
                <select
                  value={newUpdate.caseId}
                  onChange={(e) => setNewUpdate({ ...newUpdate, caseId: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                >
                  <option value="">Select a case</option>
                  {cases.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                <textarea
                  value={newUpdate.content}
                  onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[150px]"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Animal Status (optional)</label>
                <input
                  type="text"
                  value={newUpdate.animalStatus}
                  onChange={(e) => setNewUpdate({ ...newUpdate, animalStatus: e.target.value })}
                  placeholder="e.g., Recovering, Adopted, In treatment"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newUpdate.isSuccessStory}
                    onChange={(e) => setNewUpdate({ ...newUpdate, isSuccessStory: e.target.checked })}
                    className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-300">Mark as Success Story</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Upload up to 5 images</p>
                
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-16 h-16 bg-gray-700 rounded-md overflow-hidden">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Expenses (optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Medicine ($)</label>
                    <input
                      type="number"
                      name="medicine"
                      value={newUpdate.spent.medicine}
                      onChange={handleSpentChange}
                      min="0"

                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Surgery ($)</label>
                    <input
                      type="number"
                      name="surgery"
                      value={newUpdate.spent.surgery}
                      onChange={handleSpentChange}
                      min="0"

                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Recovery ($)</label>
                    <input
                      type="number"
                      name="recovery"
                      value={newUpdate.spent.recovery}
                      onChange={handleSpentChange}
                      min="0"

                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Other ($)</label>
                    <input
                      type="number"
                      name="other"
                      value={newUpdate.spent.other}
                      onChange={handleSpentChange}
                      min="0"

                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUpdate(false);
                    setImagePreviews([]);
                  }}
                  className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" /> Save Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Update Modal */}
      {showEditUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sticky top-0 bg-gray-800 z-10 pb-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Edit Update</h3>
              <button
                onClick={() => {
                  setShowEditUpdate(false);
                  setEditImagePreviews([]);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingUpdate.title}
                  onChange={(e) => setEditingUpdate({ ...editingUpdate, title: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                <textarea
                  value={editingUpdate.content}
                  onChange={(e) => setEditingUpdate({ ...editingUpdate, content: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[150px]"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Animal Status (optional)</label>
                <input
                  type="text"
                  value={editingUpdate.animalStatus}
                  onChange={(e) => setEditingUpdate({ ...editingUpdate, animalStatus: e.target.value })}
                  placeholder="e.g., Recovering, Adopted, In treatment"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingUpdate.isSuccessStory}
                    onChange={(e) => setEditingUpdate({ ...editingUpdate, isSuccessStory: e.target.checked })}
                    className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-300">Mark as Success Story</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingUpdate.isPublished}
                    onChange={(e) => setEditingUpdate({ ...editingUpdate, isPublished: e.target.checked })}
                    className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-300">Published</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Upload new images or keep existing ones</p>
                
                {editImagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editImagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-16 h-16 bg-gray-700 rounded-md overflow-hidden">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Expenses (optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Medicine ($)</label>
                    <input
                      type="number"
                      name="medicine"
                      value={editingUpdate.spent.medicine}
                      onChange={handleEditSpentChange}
                      min="0"

                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Surgery ($)</label>
                    <input
                      type="number"
                      name="surgery"
                      value={editingUpdate.spent.surgery}
                      onChange={handleEditSpentChange}
                      min="0"

                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Recovery ($)</label>
                    <input
                      type="number"
                      name="recovery"
                      value={editingUpdate.spent.recovery}
                      onChange={handleEditSpentChange}
                      min="0"

                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Other ($)</label>
                    <input
                      type="number"
                      name="other"
                      value={editingUpdate.spent.other}
                      onChange={handleEditSpentChange}
                      min="0"

                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUpdate(false);
                    setEditImagePreviews([]);
                  }}
                  className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
