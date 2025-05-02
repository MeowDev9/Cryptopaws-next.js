"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Share, Heart, Calendar, ExternalLink } from "lucide-react";

interface CaseUpdate {
  _id: string;
  title: string;
  content: string;
  imageUrl: string[];
  postedBy: {
    name: string;
  };
  createdAt: string;
  isSuccessStory: boolean;
}

interface Case {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  imageUrl: string[];
  status: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
  costBreakdown?: {
    surgery: number;
    medicine: number;
    recovery: number;
    other: number;
  };
  assignedDoctor?: string;
  medicalIssue?: string;
}

export default function CaseDetailPage() {
  const { id } = useParams();
  const caseId = Array.isArray(id) ? id[0] : id;
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [updates, setUpdates] = useState<CaseUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        // Fetch case details
        const caseResponse = await fetch(`http://localhost:5001/api/welfare/cases/${caseId}`);
        if (!caseResponse.ok) {
          throw new Error('Failed to fetch case details');
        }
        const caseData = await caseResponse.json();
        setCaseData(caseData);
        
        // Fetch case updates
        const updatesResponse = await fetch(`http://localhost:5001/api/welfare/public/case-updates/${caseId}`);
        if (!updatesResponse.ok) {
          throw new Error('Failed to fetch case updates');
        }
        const updatesData = await updatesResponse.json();
        setUpdates(updatesData.updates || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error("Error fetching case details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!caseData) return 0;
    const percentage = (caseData.raisedAmount / caseData.targetAmount) * 100;
    return Math.min(percentage, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-60 bg-gray-800 rounded-xl"></div>
            <div className="h-8 bg-gray-800 w-3/4 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              <div className="h-4 bg-gray-800 rounded w-4/6"></div>
              <div className="h-4 bg-gray-800 rounded w-3/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl text-red-400 mb-4">Error Loading Case</h1>
          <p className="text-gray-300">{error || 'Case not found'}</p>
          <Link href="/" className="inline-block mt-6 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
            Return Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 relative h-[400px]">
                {caseData.imageUrl && caseData.imageUrl.length > 0 ? (
                  <Image
                    src={`http://localhost:5001/uploads/${caseData.imageUrl[activeImage]}`}
                    alt={caseData.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <p className="text-gray-400">No image available</p>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {caseData.imageUrl && caseData.imageUrl.length > 1 && (
                <div className="flex overflow-x-auto p-2 space-x-2">
                  {caseData.imageUrl.map((img, index) => (
                    <div
                      key={index}
                      className={`relative h-16 w-24 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${
                        index === activeImage ? "border-purple-500" : "border-transparent"
                      }`}
                      onClick={() => setActiveImage(index)}
                    >
                      <Image
                        src={`http://localhost:5001/uploads/${img}`}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Case Information Tabs */}
            <div className="mt-6">
              <Tabs defaultValue="details">
                <TabsList className="bg-gray-800 border border-gray-700">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4 bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">About This Case</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-line">{caseData.description}</p>
                  </div>
                  
                  {caseData.medicalIssue && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-white mb-2">Medical Issue</h3>
                      <p className="text-gray-300">{caseData.medicalIssue}</p>
                    </div>
                  )}
                  
                  {caseData.assignedDoctor && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-white mb-2">Assigned Veterinarian</h3>
                      <p className="text-gray-300">{caseData.assignedDoctor}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="costs" className="mt-4 bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Cost Breakdown</h2>
                  
                  {caseData.costBreakdown ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <div className="text-gray-400">Surgery Costs:</div>
                        <div className="text-white font-medium">${caseData.costBreakdown.surgery}</div>
                        
                        <div className="text-gray-400">Medicine/Treatment:</div>
                        <div className="text-white font-medium">${caseData.costBreakdown.medicine}</div>
                        
                        <div className="text-gray-400">Recovery Care:</div>
                        <div className="text-white font-medium">${caseData.costBreakdown.recovery}</div>
                        
                        <div className="text-gray-400">Other Expenses:</div>
                        <div className="text-white font-medium">${caseData.costBreakdown.other}</div>
                        
                        <div className="text-gray-300 font-semibold pt-2 border-t border-gray-700">Total:</div>
                        <div className="text-purple-400 font-bold pt-2 border-t border-gray-700">
                          ${caseData.targetAmount}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">No detailed cost breakdown available.</p>
                  )}
                </TabsContent>

                <TabsContent value="updates" className="mt-4 bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Case Updates</h2>
                  
                  {updates.length > 0 ? (
                    <div className="space-y-6">
                      {updates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((update) => (
                        <div key={update._id} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-medium text-white">
                              {update.title}
                              {update.isSuccessStory && (
                                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  Success Story
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center text-gray-400 text-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDate(update.createdAt)}</span>
                            </div>
                          </div>
                          
                          {update.imageUrl && update.imageUrl.length > 0 && (
                            <div className="mb-4 max-h-96 overflow-hidden rounded-lg">
                              <Image
                                src={`http://localhost:5001/uploads/${update.imageUrl[0]}`}
                                alt={update.title}
                                width={600}
                                height={400}
                                className="object-cover w-full"
                              />
                            </div>
                          )}
                          
                          <div className="prose prose-invert max-w-none mb-3">
                            <p className="text-gray-300 whitespace-pre-line">{update.content}</p>
                          </div>
                          
                          <div className="text-sm text-gray-400">
                            Posted by: {update.postedBy?.name || caseData.createdBy.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No updates available for this case yet.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column - Donation Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 sticky top-4">
              <h1 className="text-2xl font-bold text-white mb-2">{caseData.title}</h1>
              
              <div className="flex items-center text-sm text-gray-400 mb-6">
                <span className="mr-4">By {caseData.createdBy.name}</span>
                <span>Posted {formatDate(caseData.createdAt)}</span>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">
                    <span className="text-2xl font-bold text-white">${caseData.raisedAmount}</span> raised
                  </span>
                  <span className="text-gray-300">of ${caseData.targetAmount}</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
                <p className="text-sm text-gray-400 mt-2">
                  {calculateProgress().toFixed(1)}% towards our goal
                </p>
              </div>
              
              <div className="space-y-3 mb-8">
                <Link
                  href={`/donate/${caseId}`}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-md flex justify-center items-center font-medium hover:bg-purple-700 transition-colors"
                >
                  Donate Now
                </Link>
                
                <button className="w-full border border-gray-700 text-gray-300 py-3 px-4 rounded-md flex justify-center items-center gap-2 hover:bg-gray-700 transition-colors">
                  <Heart className="h-5 w-5" />
                  Save
                </button>
                
                <button className="w-full border border-gray-700 text-gray-300 py-3 px-4 rounded-md flex justify-center items-center gap-2 hover:bg-gray-700 transition-colors">
                  <Share className="h-5 w-5" />
                  Share
                </button>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-white font-medium mb-2">Case Status</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                  ${caseData.status === "Active" ? "bg-green-900 text-green-300" : 
                    caseData.status === "Completed" ? "bg-blue-900 text-blue-300" : 
                      "bg-yellow-900 text-yellow-300"}`}
                >
                  {caseData.status}
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-4 pt-4">
                <h3 className="text-white font-medium mb-2">Have questions?</h3>
                <a
                  href={`/contact?case=${caseId}`}
                  className="text-purple-400 flex items-center hover:text-purple-300 transition-colors"
                >
                  Contact the welfare organization <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 