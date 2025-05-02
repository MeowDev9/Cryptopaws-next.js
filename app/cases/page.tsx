"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Case {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  amountRaised: number;
  imageUrl: string[];
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [welfareFilter, setWelfareFilter] = useState("all");
  const [uniqueWelfares, setUniqueWelfares] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/welfare/cases/latest");
        if (!response.ok) {
          throw new Error("Failed to fetch cases");
        }
        const data = await response.json();
        setCases(data.cases);
        setFilteredCases(data.cases);
        
        // Extract unique welfare organizations
        const welfares = data.cases.reduce((acc: {id: string, name: string}[], curr: Case) => {
          if (!acc.some(w => w.id === curr.createdBy._id)) {
            acc.push({
              id: curr.createdBy._id,
              name: curr.createdBy.name
            });
          }
          return acc;
        }, []);
        setUniqueWelfares(welfares);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...cases];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(
        c => 
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Welfare organization filter
    if (welfareFilter !== "all") {
      result = result.filter(c => c.createdBy._id === welfareFilter);
    }
    
    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "most-funded":
        result.sort((a, b) => (b.amountRaised / b.targetAmount) - (a.amountRaised / a.targetAmount));
        break;
      case "least-funded":
        result.sort((a, b) => (a.amountRaised / a.targetAmount) - (b.amountRaised / b.targetAmount));
        break;
      case "highest-amount":
        result.sort((a, b) => b.targetAmount - a.targetAmount);
        break;
      default:
        break;
    }
    
    setFilteredCases(result);
  }, [cases, searchTerm, sortBy, welfareFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const calculateProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-20">
          <h1 className="text-3xl font-bold text-center mb-8">All Cases</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 h-48 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="bg-muted py-12">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Animals in Need</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Browse through cases of animals requiring medical attention and financial support. 
            Every donation makes a difference in their lives.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto py-12 px-4">
        {/* Filter Controls */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              type="text"
              placeholder="Search by title or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-funded">Most Funded (%)</SelectItem>
              <SelectItem value="least-funded">Least Funded (%)</SelectItem>
              <SelectItem value="highest-amount">Highest Target Amount</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={welfareFilter} onValueChange={setWelfareFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {uniqueWelfares.map(welfare => (
                <SelectItem key={welfare.id} value={welfare.id}>
                  {welfare.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'}
          </p>
        </div>
        
        {/* Cases Grid */}
        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCases.map((caseItem) => (
              <div key={caseItem._id} className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
                <div className="relative h-56">
                  {caseItem.imageUrl && caseItem.imageUrl.length > 0 ? (
                    <Image 
                      src={`http://localhost:5001/uploads/${caseItem.imageUrl[0]}`}
                      alt={caseItem.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>
                
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1 text-foreground">
                      {caseItem.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      By {caseItem.createdBy.name} • {formatDate(caseItem.createdAt)}
                    </p>
                  </div>
                  
                  <p className="text-foreground">
                    {truncateText(caseItem.description, 120)}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${caseItem.amountRaised.toFixed(2)} raised
                      </span>
                      <span className="text-muted-foreground">
                        Goal: ${caseItem.targetAmount.toFixed(2)}
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(caseItem.amountRaised, caseItem.targetAmount)} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {calculateProgress(caseItem.amountRaised, caseItem.targetAmount).toFixed(0)}% of target
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      href={`/case/${caseItem._id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link 
                      href={`/donate/${caseItem._id}`}
                      className="flex-1"
                    >
                      <Button className="w-full">
                        Donate
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-muted-foreground mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="8" rx="1"></rect>
                <path d="M6 14v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3"></path>
                <path d="M4 6v-.8C4 3.97 5.18 3 6.8 3h10.4C18.82 3 20 3.97 20 5.2v.8"></path>
                <path d="m16 14-4 4-4-4"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">No Cases Found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any cases matching your search criteria.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSortBy("newest");
              setWelfareFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 