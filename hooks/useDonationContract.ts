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
            
            // Validate and format the wallet address
            let formattedAddress: string;
            try {
                // Convert to checksum address if it's a valid address
                if (ethers.isAddress(walletAddress)) {
                    formattedAddress = ethers.getAddress(walletAddress);
                } else {
                    throw new Error('Invalid wallet address format');
                }
            } catch (error) {
                throw new Error('Please enter a valid Ethereum address. ENS names are not supported on this network.');
            }
            
            console.log('Formatted wallet address:', formattedAddress);
            
            // Skip the organization check to avoid ENS resolution
            // We'll proceed directly to registration since the contract will handle duplicates
            
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
            
            // Skip verification to avoid ENS resolution
            console.log('Organization registration submitted successfully');
            
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
            
            console.log('Original organization address:', organizationAddress);
            
            // Normalize the address to checksum format
            let normalizedAddress: string;
            try {
                normalizedAddress = ethers.getAddress(organizationAddress.toLowerCase());
                console.log('Normalized organization address:', normalizedAddress);
            } catch (error) {
                console.error('Error normalizing address:', error);
                throw new Error('Invalid organization address format');
            }
            
            if (!ethers.isAddress(normalizedAddress)) {
                console.error('Invalid address after normalization:', normalizedAddress);
                throw new Error('Invalid organization address');
            }
            
            // Check if amount meets minimum requirement (0.002 ETH)
            const minDonation = ethers.parseEther('0.002');
            if (amountInWei < minDonation) {
                throw new Error(`Minimum donation amount is 0.002 ETH (${minDonation.toString()} wei)`);
            }
            
            const contract = await getContract();
            console.log('Using contract at address:', contract.target);
            
            // Check if organization is registered and active
            try {
                console.log('Checking organization status for address:', {
                    input: organizationAddress,
                    normalized: normalizedAddress,
                    isAddress: ethers.isAddress(normalizedAddress),
                    isZeroAddress: normalizedAddress === ethers.ZeroAddress
                });
                
                // Try getting the organization info with the exact address
                console.log('Calling getOrganizationInfo with:', normalizedAddress);
                const orgInfo = await contract.getOrganizationInfo(normalizedAddress);
                console.log('Raw organization info from contract:', orgInfo);
                
                // Log each part of the response
                const [name, description, walletAddress, isActive, totalDonations, uniqueDonors] = orgInfo;
                const orgData = { 
                    name, 
                    description, 
                    walletAddress, 
                    isActive: Boolean(isActive),
                    totalDonations: totalDonations?.toString(),
                    uniqueDonors: uniqueDonors?.toString()
                };
                console.log('Parsed organization info:', orgData);
                
                if (!name || name === '') {
                    console.error('Organization name is empty, indicating it might not be registered');
                    console.error('Full organization data:', orgData);
                    throw new Error('Organization is not registered');
                }
                if (!isActive) {
                    console.error('Organization is registered but not active');
                    console.error('Full organization data:', orgData);
                    throw new Error('Organization is not active');
                }
                console.log('Organization status verified successfully');
            } catch (error) {
                const orgError = error as Error & { data?: any };
                console.error('Organization check failed with error:', orgError);
                console.error('Error details:', {
                    message: orgError.message,
                    stack: orgError.stack,
                    data: orgError.data
                });
                throw new Error('Failed to verify organization status. The organization may not be registered or active.');
            }
            
            // Estimate gas before transaction
            try {
                const gasEstimate = await estimateGas(contract, amountInWei, organizationAddress, message);
                
                // Call the donate function with gas estimate
                const tx = await contract.donate(organizationAddress, message, {
                    value: amountInWei,
                    gasLimit: gasEstimate * BigInt(150) / BigInt(100) // Add 50% buffer for zkSync
                });
                
                return tx;
            } catch (estimateError) {
                console.error('Transaction estimation failed:', estimateError);
                throw new Error('Transaction would fail. Please ensure the organization is registered and active, and you have enough funds for the donation and gas.');
            }
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