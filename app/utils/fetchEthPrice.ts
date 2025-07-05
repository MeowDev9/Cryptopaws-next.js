// Fetches the latest ETH price in USD from CoinGecko
export async function fetchEthPrice(): Promise<number> {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
  if (!res.ok) throw new Error('Failed to fetch ETH price');
  const data = await res.json();
  return data.ethereum.usd;
}
