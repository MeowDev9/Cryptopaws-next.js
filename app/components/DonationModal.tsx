'use client';

import { useState, useEffect } from 'react';
import { fetchEthPrice } from '../utils/fetchEthPrice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export default function DonationModal({
  isOpen,
  onClose,
  onComplete,
  welfareAddress,
  caseId,
}: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const { donate, isLoading } = useDonationContract();

  useEffect(() => {
    const getPrice = async () => {
      setIsFetchingPrice(true);
      try {
        const price = await fetchEthPrice();
        setEthPrice(price);
      } catch {
        setEthPrice(null);
      } finally {
        setIsFetchingPrice(false);
      }
    };
    getPrice();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!amount || !welfareAddress) {
        throw new Error('Please enter an amount and ensure welfare address is available');
      }

      if (ethPrice) {
        const minEth = 5 / ethPrice;
        if (parseFloat(amount) < minEth) {
          throw new Error(`Minimum donation is $5 (${minEth.toFixed(6)} ETH)`);
        }
      }

      const amountInWei = ethers.parseEther(amount);
      const receipt = await donate(welfareAddress, amountInWei, message);

      onComplete({ amount, txHash: receipt.transactionHash });
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
              placeholder={ethPrice ? `${(5 / ethPrice).toFixed(6)} (min)` : "0.0"}
              min={ethPrice ? (5 / ethPrice).toFixed(6) : "0"}
              step="any"
              required
            />
            {ethPrice && (
              <div className="text-xs text-gray-500 mt-1">
                Minimum donation: $5.00 USD ({(5 / ethPrice).toFixed(6)} ETH)
              </div>
            )}
            {amount && ethPrice && !isNaN(Number(amount)) && (
              <div className="text-xs text-gray-500 mt-1">
                ≈ ${(Number(amount) * ethPrice).toFixed(2)} USD
              </div>
            )}
            {isFetchingPrice && (
              <div className="text-xs text-gray-400 mt-1">Fetching ETH price...</div>
            )}
            {!isFetchingPrice && ethPrice === null && (
              <div className="text-xs text-red-400 mt-1">Unable to fetch ETH price</div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mr-2 px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
              ) : (
                'Donate Now'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}