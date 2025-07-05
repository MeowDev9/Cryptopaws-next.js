"use client"

import Image from "next/image"

interface CostBreakdown {
  surgery: number;
  medicine: number;
  recovery: number;
  other: number;
}

interface CaseData {
  _id: string;
  title: string;
  description: string;
  targetAmount: string;
  amountRaised: string;
  imageUrl?: string | string[];
  welfareAddress?: string;
  costBreakdown?: CostBreakdown | Array<{item: string; cost: number}>;
  status?: string;
  isUrgent?: boolean;
  emergencySource?: string; // ID of the emergency this case was converted from
}

interface CaseCardProps {
  caseData: CaseData;
  onDonate: (caseData: CaseData) => void;
  walletConnected: boolean;
}

const CaseCard = ({ caseData, onDonate, walletConnected }: CaseCardProps) => {
  // Calculate the target amount from cost breakdown if available
  const calculateTargetAmount = () => {
    if (caseData.costBreakdown) {
      if (Array.isArray(caseData.costBreakdown)) {
        return caseData.costBreakdown.reduce((total, item) => total + (Number(item.cost) || 0), 0);
      } else {
        const cb = caseData.costBreakdown as CostBreakdown;
        return (Number(cb.surgery) || 0) + 
               (Number(cb.medicine) || 0) + 
               (Number(cb.recovery) || 0) + 
               (Number(cb.other) || 0);
      }
    }
    return Number.parseFloat(caseData.targetAmount) || 1;
  };
  
  const targetAmount = calculateTargetAmount();
  const amountRaised = Number.parseFloat(caseData.amountRaised) || 0;
  const progressPercentage = Math.min(Math.round((amountRaised / targetAmount) * 100), 100);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="h-48 relative">
        <Image
          src={
            caseData.imageUrl 
              ? (Array.isArray(caseData.imageUrl) && caseData.imageUrl.length > 0
                  ? (caseData.imageUrl[0].startsWith('http') 
                      ? caseData.imageUrl[0] 
                      : `http://localhost:5001/uploads/${caseData.imageUrl[0]}`)
                  : (typeof caseData.imageUrl === 'string'
                      ? (caseData.imageUrl.startsWith('http')
                          ? caseData.imageUrl
                          : `http://localhost:5001/uploads/${caseData.imageUrl}`)
                      : "/images/placeholder-case.jpg"))
              : "/images/placeholder-case.jpg"
          }
          alt={caseData.title}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold">{caseData.title}</h3>
          {caseData.isUrgent && (
            <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-medium rounded-full border border-red-700/50">
              URGENT
            </span>
          )}
        </div>
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

        {caseData.costBreakdown && (() => {
          function normalizeCostBreakdown(cb: CostBreakdown | Array<{item: string; cost: number}> | undefined): CostBreakdown {
            if (Array.isArray(cb)) {
              const map: Record<string, number> = {};
              cb.forEach((c) => {
                if (c.item && typeof c.cost !== "undefined") {
                  map[c.item.toLowerCase()] = c.cost;
                }
              });
              return {
                surgery: map.surgery ?? 0,
                medicine: map.medicine ?? 0,
                recovery: map.recovery ?? 0,
                other: map.other ?? 0,
              };
            }
            return cb as CostBreakdown || { surgery: 0, medicine: 0, recovery: 0, other: 0 };
          }
          const cost = normalizeCostBreakdown(caseData.costBreakdown);
          return (
            <div className="mb-2">
              <span className="text-gray-300 font-semibold">Cost Breakdown:</span>
              <ul className="text-gray-400 text-sm">
                <li>Surgery: ${cost.surgery}</li>
                <li>Medicine: ${cost.medicine}</li>
                <li>Recovery: ${cost.recovery}</li>
                <li>Other: ${cost.other}</li>
              </ul>
            </div>
          );
        })()}

        {/* Status badge for completed cases */}
        {caseData.status === "completed" && (
          <div className="mb-4 bg-green-900/30 border border-green-700/50 rounded-lg p-2 text-center">
            <span className="text-green-400 font-medium">Case Completed</span>
            <p className="text-xs text-green-500 mt-1">This case has been successfully funded and completed.</p>
          </div>
        )}

        <button
          onClick={() => onDonate(caseData)}
          className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center ${
            !walletConnected
              ? "bg-gray-700 text-gray-300 cursor-not-allowed"
              : caseData.status === "completed"
              ? "bg-gray-700 text-gray-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
          disabled={!walletConnected || caseData.status === "completed"}
        >
          {!walletConnected 
            ? "Connect Wallet to Donate" 
            : caseData.status === "completed" 
            ? "Case Completed" 
            : "Donate Now"}
        </button>
      </div>
    </div>
  )
}

export default CaseCard

