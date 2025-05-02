# Cryptopaws - Blockchain-based Animal Welfare Platform

A decentralized platform for animal welfare organizations to manage donations, cases, and adoptions using blockchain technology.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git
- MetaMask or any Web3 wallet
- MongoDB (for backend)
- Foundry (for smart contracts)

## Project Structure

The project consists of three main parts:
1. Frontend (Next.js)
2. Backend (Node.js/Express)
3. Smart Contracts (Solidity)

## Installation

### 1. Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/MeowDev9/Cryptopaws-next.js.git

# Navigate to the project directory
cd Cryptopaws-next.js

# Initialize and update submodules (for smart contracts)
git submodule update --init --recursive
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd Backend
npm install
cd ..
```

### 3. Environment Setup

#### MongoDB Setup
1. Install MongoDB Community Edition:
   - [Windows](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)
   - [MacOS](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
   - [Linux](https://www.mongodb.com/docs/manual/administration/install-on-linux/)

2. Start MongoDB service:
   ```bash
   # MacOS
   brew services start mongodb-community
   
   # Windows (Run as Administrator)
   net start MongoDB
   
   # Linux
   sudo systemctl start mongod
   ```

3. Create a database named `cryptopaws`:
   ```bash
   mongosh
   use cryptopaws
   ```

4. The default MongoDB connection string will be:
   ```
   mongodb://localhost:27017/cryptopaws
   ```

#### Smart Contract Deployment and Address
1. Navigate to contracts directory:
   ```bash
   cd contracts
   ```

2. Deploy the contract to your preferred network:
   ```bash
   # For local development (Anvil)
   anvil
   # In a new terminal
   forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   
   # For testnet (Sepolia)
   forge script script/Deploy.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_INFURA_KEY --private-key YOUR_PRIVATE_KEY
   ```

3. After deployment, you'll receive a contract address. Use this in your frontend .env file.

#### JWT Secret Generation
Generate a secure JWT secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

#### Frontend (.env)
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed contract address
```

#### Backend (.env)
Create a `.env` file in the Backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/cryptopaws
JWT_SECRET=your_generated_jwt_secret
PORT=5001
```

### 4. Smart Contracts Setup

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test
```

## Running the Project

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd Backend

# Start the server
npm start
```

### 2. Start the Frontend Development Server

```bash
# In a new terminal, from the root directory
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001

## Smart Contract Deployment

To deploy the smart contracts:

```bash
# Navigate to contracts directory
cd contracts

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url your_rpc_url --private-key your_private_key
```

## Features

- Blockchain-based donations
- Case management for animal welfare organizations
- Adoption system
- Emergency reporting
- Donor and organization dashboards
- Real-time updates
- Secure authentication

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Smart Contracts**: Solidity, Foundry
- **Blockchain**: Ethereum
- **Authentication**: JWT, Web3
- **UI Components**: Radix UI, Shadcn UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@cryptopaws.com or open an issue in the repository. 