"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface ConnectWalletButtonProps {
  onAddressChange?: (address: string) => void;
}

export default function ConnectWalletButton({ onAddressChange }: ConnectWalletButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const updateBlockchainAddress = async (address: string) => {
    try {
      const token = localStorage.getItem("welfareToken");
      if (!token) return;

      const response = await fetch("http://localhost:5001/api/welfare/blockchain-address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blockchainAddress: address }),
      });

      if (!response.ok) {
        throw new Error("Failed to update blockchain address");
      }

      // Call the onAddressChange callback if provided
      if (onAddressChange) {
        onAddressChange(address);
      }
    } catch (error) {
      console.error("Error updating blockchain address:", error);
    }
  };

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== "undefined") {
      // Check if already connected
      window.ethereum.request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setIsConnected(true);
            setWalletAddress(accounts[0]);
            updateBlockchainAddress(accounts[0]);
          }
        })
        .catch((error: any) => {
          console.error("Error checking wallet connection:", error);
        });
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        setIsConnected(true);
        setWalletAddress(accounts[0]);
        await updateBlockchainAddress(accounts[0]);
      } else {
        alert("Please install MetaMask to use this feature!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
    // Don't update blockchain address when disconnecting
    // The address should remain in the database
  };

  return (
    <Button
      onClick={isConnected ? disconnectWallet : connectWallet}
      variant={isConnected ? "outline" : "default"}
    >
      {isConnected
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  );
} 