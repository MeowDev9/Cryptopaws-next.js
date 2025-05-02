'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDonationContract } from "@/hooks/useDonationContract";
import { ethers } from 'ethers';
import { Loader2 } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { amount: string; txHash: string }) => void;
  welfareAddress: string;
  caseId: string;
}

export default function DonationModal({ isOpen, onClose, onComplete, welfareAddress, caseId }: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { donate, isLoading } = useDonationContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!amount || !welfareAddress) {
        throw new Error('Please enter an amount and ensure welfare address is available');
      }

      // Convert amount to wei
      const amountInWei = ethers.parseEther(amount);
      
      // Call the donate function from our hook
      const receipt = await donate(welfareAddress, amountInWei, message);
      
      // Call onComplete with transaction data
      onComplete({
        amount,
        txHash: receipt.transactionHash
      });

      // Close modal
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your donation');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make a Donation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (ETH)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0.0"
              step="0.001"
              min="0"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Add a message with your donation"
              rows={3}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Donate'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 