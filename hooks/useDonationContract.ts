'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { DONATION_CONTRACT_ADDRESS, DONATION_CONTRACT_ABI } from '@/app/config/contracts';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface OrganizationInfo {
    name: string;
    description: string;
    totalDonations: string;
    uniqueDonors: number;
    isActive: boolean;
}

export interface DonationStatus {
    status: 'pending' | 'success' | 'failed' | 'already_registered';
    txHash?: string;
    error?: string;
}

export function useDonationContract() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [donationStatus, setDonationStatus] = useState<DonationStatus>({ status: 'pending' });

    const getContract = useCallback(async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('Please install MetaMask to use this feature');
        }

        try {
            // Request account access from MetaMask
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create a Web3Provider using window.ethereum
            const provider = new ethers.BrowserProvider(window.ethereum);
            
            // Get the signer from the provider
            const signer = await provider.getSigner();
            
            // Create the contract instance with the signer
            return new ethers.Contract(DONATION_CONTRACT_ADDRESS, DONATION_CONTRACT_ABI, signer);
        } catch (err) {
            console.error('Error getting contract:', err);
            throw new Error('Failed to connect to the blockchain. Please check your MetaMask connection.');
        }
    }, []);

    const estimateGas = async (contract: ethers.Contract, amountInWei: bigint, organizationAddress: string, message: string = '') => {
        try {
            const gasEstimate = await contract.donate.estimateGas(organizationAddress, message, {
                value: amountInWei
            });
            return gasEstimate;
        } catch (err) {
            console.error('Error estimating gas:', err);
            throw new Error('Failed to estimate gas cost. The transaction may fail.');
        }
    };

    const registerOrganization = async (name: string, description: string, walletAddress: string) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Starting organization registration with:', { name, description, walletAddress });
            
            // Get the contract instance
            const contract = await getContract();
            console.log('Contract instance obtained');
            
            // Make sure the wallet address is properly formatted
            const formattedAddress = ethers.getAddress(walletAddress);
            console.log('Formatted wallet address:', formattedAddress);
            
            // Check if organization is already registered
            try {
                const [existingName, existingDesc, existingAddr, isActive, totalDonations, uniqueDonors] = 
                    await contract.getOrganizationInfo(formattedAddress);
                console.log('Organization already registered:', {
                    name: existingName,
                    description: existingDesc,
                    address: existingAddr,
                    isActive,
                    totalDonations: ethers.formatEther(totalDonations),
                    uniqueDonors: Number(uniqueDonors)
                });
                return { status: 'already_registered' };
            } catch (err) {
                console.log('Organization not registered yet, proceeding with registration');
            }
            
            // Estimate gas for the transaction
            const gasEstimate = await contract.registerOrganization.estimateGas(
                name,
                description,
                formattedAddress
            );
            console.log('Gas estimate:', gasEstimate.toString());
            
            // Create the transaction with a higher gas limit
            const tx = await contract.registerOrganization(
                name,
                description,
                formattedAddress,
                {
                    gasLimit: gasEstimate * BigInt(2), // Use 2x the estimated gas
                    value: 0
                }
            );
            console.log('Transaction sent:', tx.hash);
            
            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            console.log('Transaction mined:', receipt.hash);
            
            // Verify registration
            const [registeredName, registeredDesc, registeredAddr, isActive, totalDonations, uniqueDonors] = 
                await contract.getOrganizationInfo(formattedAddress);
            console.log('Organization registration verified:', {
                name: registeredName,
                description: registeredDesc,
                address: registeredAddr,
                isActive,
                totalDonations: ethers.formatEther(totalDonations),
                uniqueDonors: Number(uniqueDonors)
            });
            
            return receipt;
        } catch (err) {
            console.error('Error in registerOrganization:', err);
            setError(err instanceof Error ? err.message : 'Failed to register organization');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const donate = async (amountInWei: bigint, organizationAddress: string, message: string = '') => {
        setIsLoading(true);
        setError(null);
        setDonationStatus({ status: 'pending' });

        try {
            // Validate inputs
            if (!organizationAddress) {
                throw new Error('Organization address is required');
            }
            
            if (!ethers.isAddress(organizationAddress)) {
                throw new Error('Invalid organization address');
            }
            
            const contract = await getContract();
            
            // Estimate gas before transaction
            const gasEstimate = await estimateGas(contract, amountInWei, organizationAddress, message);
            
            // Call the donate function with gas estimate
            const tx = await contract.donate(organizationAddress, message, {
                value: amountInWei,
                gasLimit: gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
            });
            
            return tx;
        } catch (err) {
            console.error('Donation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to process donation';
            setError(errorMessage);
            setDonationStatus({
                status: 'failed',
                error: errorMessage
            });
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getOrganizationInfo = async (organizationAddress: string): Promise<OrganizationInfo> => {
        try {
            // Validate input
            if (!organizationAddress) {
                throw new Error('Organization address is required');
            }
            
            if (!ethers.isAddress(organizationAddress)) {
                throw new Error('Invalid organization address');
            }
            
            const contract = await getContract();
            
            // Get organization info
            const [name, description, walletAddress, isActive, totalDonations, uniqueDonors] = await contract.getOrganizationInfo(organizationAddress);

            return {
                name,
                description,
                totalDonations: ethers.formatEther(totalDonations),
                uniqueDonors: Number(uniqueDonors),
                isActive
            };
        } catch (err) {
            console.error('Error getting organization info:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch organization info';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const getDonorHistory = async (donorAddress: string) => {
        try {
            // Validate input
            if (!donorAddress) {
                throw new Error('Donor address is required');
            }
            
            if (!ethers.isAddress(donorAddress)) {
                throw new Error('Invalid donor address');
            }
            
            const contract = await getContract();
            const donations = await contract.getDonorHistory(donorAddress);
            
            return donations.map((donation: any) => ({
                organizationAddress: donation.organizationAddress,
                amount: ethers.formatEther(donation.amount),
                timestamp: new Date(Number(donation.timestamp) * 1000),
                message: donation.message
            }));
        } catch (err) {
            console.error('Error getting donor history:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch donor history';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    return {
        isLoading,
        error,
        donationStatus,
        registerOrganization,
        donate,
        getOrganizationInfo,
        getDonorHistory
    };
} 