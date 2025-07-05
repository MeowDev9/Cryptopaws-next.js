'use client';

import { useParams, useRouter } from 'next/navigation';
import DonationForm from '../../components/DonationForm';
import OrganizationInfo from '../../components/OrganizationInfo';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DonatePage() {
    const params = useParams();
    const router = useRouter();
    const organizationId = params.organizationId as string;
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    
    // Check if user is logged in
    useEffect(() => {
        // Check for user token in localStorage
        const token = localStorage.getItem('userToken') || localStorage.getItem('donorToken');
        const isAuthenticated = !!token;
        setIsLoggedIn(isAuthenticated);
        
        // Show login dialog if not authenticated
        if (!isAuthenticated) {
            setShowLoginDialog(true);
        }
    }, []);

    // Handle navigation to login page
    const handleLoginClick = () => {
        router.push('/login');
    };

    // Handle dialog close
    const handleDialogClose = () => {
        setShowLoginDialog(false);
    };

    // If authentication check is still in progress
    if (isLoggedIn === null) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex justify-center items-center py-12">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <OrganizationInfo organizationAddress={organizationId} />
                
                {/* Login Dialog */}
                <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Authentication Required</DialogTitle>
                            <DialogDescription>
                                You need to log in or sign up to make a donation.
                            </DialogDescription>
                        </DialogHeader>
                        <p className="py-2">Please log in to your account or create a new one to continue with your donation.</p>
                        <DialogFooter className="flex justify-between sm:justify-end gap-2">
                            <Button variant="outline" onClick={handleDialogClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleLoginClick}>
                                Login / Sign Up
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                {isLoggedIn && (
                    <DonationForm 
                        organizationAddress={organizationId}
                        onSuccess={() => {
                            // Optionally refresh the organization info or show a success message
                            window.location.reload();
                        }}
                    />
                )}
            </div>
        </div>
    );
}