import { ethers } from "ethers";
import {
    DONATION_CONTRACT_ABI_ARRAY,
    DONATION_CONTRACT_ADDRESS,
  } from "./scripts/helpers.js"; // Note the .js extension

const provider = new ethers.JsonRpcProvider("https://sepolia.era.zksync.dev");

const contract = new ethers.Contract(
  DONATION_CONTRACT_ADDRESS,
  DONATION_CONTRACT_ABI_ARRAY,
  provider
);


const welfareAddress = "0x976EA74026E726554dB657fA54763abd0C3a0aa9";

async function main() {
  try {
    const info = await contract.getOrganizationInfo(welfareAddress);
    console.log("✅ Organization Info:", info);

    const [name, description, wallet, isActive, totalDonations, donors] = info;
    console.log(`
    Name: ${name}
    Description: ${description}
    Wallet: ${wallet}
    Active: ${isActive}
    Donations: ${totalDonations}
    Donors: ${donors}
    `);
  } catch (err) {
    console.error("❌ Error fetching organization info:", err.message);
  }
}

main();
