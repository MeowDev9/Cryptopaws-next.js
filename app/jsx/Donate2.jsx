"use client"

import { useState } from "react"
import { useEffect } from "react"
import "../styles/Donate2.css"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { ethers } from "ethers"

const Donate2 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState("")
  const [currency, setCurrency] = useState("USDT")
  const [ethBtcAmount, setEthBtcAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("") // Track connected wallet address
  const [cases, setCases] = useState([])
  const receiverAddress = "0x1234567890abcdef1234567890abcdef12345678" // Fixed receiver address
  useEffect(() => {
    fetch("http://localhost:5000/api/donate/donate")
      .then((response) => {
        return response.json()
      })
      .then((data) => setCases(data.donation))
      .catch((error) => console.error("Error fetching cases:", error))
  }, [])

  // Hardcoded exchange rates for demonstration
  const exchangeRates = {
    ETH: 3500, // 1 ETH = 3500 USD
    BTC: 90000, // 1 BTC = 90000 USD
  }

  const handleAmountChange = (e) => {
    const usdAmount = e.target.value
    setDonationAmount(usdAmount)

    if (currency === "ETH" || currency === "BTC") {
      const rate = exchangeRates[currency]
      setEthBtcAmount((usdAmount / rate).toFixed(6))
    }
  }

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value)
    setEthBtcAmount("")
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert("Donation Submitted")
    closeModal()
  }

  // Connect Wallet Function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask and try again.")
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      // Set the wallet address in state
      setWalletAddress(address)
      alert(`Wallet connected: ${address}`)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }
  }

  return (
    <>
      <Navbar />
      <div className="donate-container">
        <h2>Choose a Case to Donate</h2>
        <div className="donate-cards">
          {cases.map((caseItem) => (
            <div key={caseItem._id} className="donate-card">
              <img src={caseItem.image} alt={`Rescue Case ${caseItem._id}`} />
              <div className="card-details">
                <p>{caseItem.description}</p>
                <p className="amount">Amount Required: {caseItem.amount}</p>
                <button className="donate2-button" onClick={openModal}>
                  Donate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Donation Modal */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>
                &times;
              </span>
              <h3>Donate to Animal Rescue</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="receiverAddress">Receiver Address</label>
                  <input type="text" id="receiverAddress" value={receiverAddress} readOnly />
                </div>

                <div className="form-group">
                  <label htmlFor="donationAmount">Donation Amount (USD)</label>
                  <input
                    type="number"
                    id="donationAmount"
                    value={donationAmount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount in USD"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Select Currency</label>
                  <select id="currency" value={currency} onChange={handleCurrencyChange}>
                    <option value="USDT">USDT</option>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>

                {currency === "ETH" || currency === "BTC" ? (
                  <div className="form-group">
                    <label>{currency} Equivalent</label>
                    <input type="text" value={ethBtcAmount} readOnly />
                  </div>
                ) : null}

                <button type="submit" className="donate2-button">
                  Confirm Donation
                </button>
              </form>

              {/* Wallet Connect Button */}
              {!walletAddress ? (
                <button className="donate2-button" onClick={connectWallet}>
                  Connect Wallet
                </button>
              ) : (
                <p className="wallet-connected">Wallet Connected: {walletAddress}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default Donate2

