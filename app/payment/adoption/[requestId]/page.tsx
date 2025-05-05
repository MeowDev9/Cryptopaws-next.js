'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function AdoptionPaymentPage({ params }: { params: { requestId: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const USDT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to make payments');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get user's balance
      const balance = await provider.getBalance(await signer.getAddress());
      
      // Required amount (30 USDT worth of ETH)
      const requiredAmount = ethers.parseUnits('30', 6);
      
      // Check if user has enough balance
      if (balance < requiredAmount) {
        throw new Error('Insufficient balance to make the payment');
      }

      // Send transaction
      const tx = await signer.sendTransaction({
        to: USDT_CONTRACT_ADDRESS,
        value: requiredAmount
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error('Failed to get transaction receipt');
      }
      const txHash = receipt.hash;

      // Send payment proof to backend
      const response = await fetch(`/api/adoption-requests/${params.requestId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash,
          amount: 30 // Amount in USDT
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment with server');
      }

      toast.success('Payment successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after successful payment
      setTimeout(() => {
        router.push('/donor/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Adoption Payment</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">Please pay 30 USDT to complete your adoption request.</p>
        <Button 
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Processing Payment...' : 'Pay Now'}
        </Button>
      </div>
    </div>
  );
} 