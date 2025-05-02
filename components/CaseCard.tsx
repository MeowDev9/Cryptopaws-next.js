"use client"

import Image from "next/image"

const CaseCard = ({ caseData, onDonate, walletConnected }) => {
  // Calculate progress percentage
  const targetAmount = Number.parseFloat(caseData.targetAmount) || 1
  const amountRaised = Number.parseFloat(caseData.amountRaised) || 0
  const progressPercentage = Math.min(Math.round((amountRaised / targetAmount) * 100), 100)

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="h-48 relative">
        <Image
          src={
            caseData.imageUrl ? `http://localhost:5001/uploads/${caseData.imageUrl}` : "/images/placeholder-case.jpg"
          }
          alt={caseData.title}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2">{caseData.title}</h3>
        <p className="text-gray-400 mb-4 line-clamp-3">{caseData.description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Raised: ${amountRaised.toFixed(2)}</span>
            <span className="font-medium">${targetAmount.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="mt-1 text-right text-sm text-gray-400">{progressPercentage}% funded</div>
        </div>

        {caseData.welfareAddress && (
          <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Welfare Address:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(caseData.welfareAddress);
                    // You could add a toast notification here
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="font-mono text-xs text-gray-400 break-all">
                {caseData.welfareAddress}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => onDonate(caseData)}
          className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center ${
            walletConnected
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-gray-700 text-gray-300 cursor-not-allowed"
          }`}
          disabled={!walletConnected}
        >
          {walletConnected ? "Donate Now" : "Connect Wallet to Donate"}
        </button>
      </div>
    </div>
  )
}

export default CaseCard

