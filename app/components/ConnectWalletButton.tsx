"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";

// True multi-provider support
interface WalletProvider {
  name: string;
  key: string;
  icon: string;
  isAvailable: boolean;
  provider: any;
}



interface ConnectWalletButtonProps {
  onAddressChange?: (address: string) => void;
}

export default function ConnectWalletButton({ onAddressChange }: ConnectWalletButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);
  const [walletProviders, setWalletProviders] = useState<WalletProvider[]>([]);


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
    // Detect all wallet providers
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      let providers: WalletProvider[] = [];
      if (Array.isArray(eth.providers)) {
        for (const p of eth.providers) {
          if (p.isMetaMask) providers.push({
            name: "MetaMask",
            key: "metamask",
            icon: "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg",
            isAvailable: true,
            provider: p
          });
          if (p.isTrust) providers.push({
            name: "Trust Wallet",
            key: "trustwallet",
            icon: "https://trustwallet.com/assets/images/media/assets/TWT.png",
            isAvailable: true,
            provider: p
          });
        }
      } else {
        // fallback for single-provider environments
        if (eth.isMetaMask) providers.push({
          name: "MetaMask",
          key: "metamask",
          icon: "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg",
          isAvailable: true,
          provider: eth
        });
        if (eth.isTrust) providers.push({
          name: "Trust Wallet",
          key: "trustwallet",
          icon: "https://trustwallet.com/assets/images/media/assets/TWT.png",
          isAvailable: true,
          provider: eth
        });
      }
      setWalletProviders(providers);
    }
    // Try to switch to zkSync Sepolia on mount
    if (typeof window.ethereum !== "undefined") {
      switchToZkSyncSepolia();
      // Only check if already connected (do not call eth_requestAccounts)
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

  const zkSyncSepoliaParams = {
    chainId: "0x144", // 324 in hex
    chainName: "zkSync Era Sepolia",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://sepolia.era.zksync.dev"],
    blockExplorerUrls: ["https://sepolia.explorer.zksync.io/"]
  };

  const switchToZkSyncSepolia = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x144" }],
        });
        return true;
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [zkSyncSepoliaParams],
            });
            return true;
          } catch (addError) {
            alert("Please add zkSync Era Sepolia to your wallet.");
            return false;
          }
        } else {
          alert("Please switch to zkSync Era Sepolia network in your wallet.");
          return false;
        }
      }
    }
    return false;
  };

  const connectWallet = async () => {
    if (isPending) return; // Prevent concurrent requests
    // Detect available wallets
    if (walletProviders.length > 1 && !selectedProvider) {
      setShowWalletModal(true);
      return;
    }
    const provider = selectedProvider ? selectedProvider : (walletProviders[0] ? walletProviders[0].provider : window.ethereum);
    if (!provider) {
      alert("No wallet provider found. Please install MetaMask or Trust Wallet.");
      return;
    }
    const switched = await switchToZkSyncSepoliaWithProvider(provider);
    if (!switched) return;
    setIsPending(true);
    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts"
      });
      setIsConnected(true);
      setWalletAddress(accounts[0]);
      await updateBlockchainAddress(accounts[0]);
      setShowWalletModal(false);
      setSelectedProvider(null);
    } catch (error: any) {
      if (error?.code === -32002) {
        alert("A wallet connection request is already pending. Please check your wallet extension and resolve any open requests.");
      } else {
        console.error("Error connecting wallet:", error);
      }
    } finally {
      setIsPending(false);
    }
  };



  const switchToZkSyncSepoliaWithProvider = async (provider: any) => {
    if (provider) {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x144" }],
        });
        return true;
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [zkSyncSepoliaParams],
            });
            return true;
          } catch (addError) {
            alert("Please add zkSync Era Sepolia to your wallet.");
            return false;
          }
        } else {
          alert("Please switch to zkSync Era Sepolia network in your wallet.");
          return false;
        }
      }
    }
    return false;
  };



  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
    // Don't update blockchain address when disconnecting
    // The address should remain in the database
  };

  return (
    <>
      <Button
        onClick={() => {
          if (isPending) return;
          if (isConnected) {
            disconnectWallet();
          } else if (walletProviders.length > 1) {
            setShowWalletModal(true);
          } else {
            connectWallet();
          }
        }}
        variant={isConnected ? "outline" : "default"}
        disabled={isPending}
      >
        {isPending
          ? "Connecting..."
          : isConnected
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "Connect Wallet"}
      </Button>
      {showWalletModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 320, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <h3 style={{ marginBottom: 16 }}>Select Wallet</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {walletProviders.map(w => (
                <button
                  key={w.key}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 8, border: "1px solid #eee", background: "#fafafa", cursor: isPending ? "not-allowed" : "pointer", fontSize: 16, opacity: isPending ? 0.6 : 1 }}
                  onClick={() => {
                    if (isPending) return;
                    setSelectedProvider(w.provider);
                    setShowWalletModal(false);
                    setTimeout(connectWallet, 100); // Only connect after explicit wallet selection
                  }}
                  disabled={isPending}
                >
                  <img src={w.icon} alt={w.name} style={{ width: 32, height: 32 }} />
                  {w.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowWalletModal(false)} style={{ marginTop: 24, background: "none", border: "none", color: "#888", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
} 