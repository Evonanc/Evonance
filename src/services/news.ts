// News service — fetches crypto market insights
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  url: string;
  category: "market" | "regulation" | "tech" | "institutional";
}

export async function getMarketNews(): Promise<NewsItem[]> {
  // Simulating a news API
  return [
    {
      id: "1",
      title: "Bitcoin Crosses $75k as Institutional Inflow Hits Record High",
      summary: "Spot ETFs saw over $1.2B in net inflows today as BlackRock and Fidelity expand their crypto offerings.",
      source: "Reuters Finance",
      time: "12m ago",
      url: "#",
      category: "institutional"
    },
    {
      id: "2",
      title: "Ethereum Dencun Upgrade: Layer-2 Fees Drop by 90%",
      summary: "New data shows significant reduction in transaction costs for Arbitrum, Optimism, and Base following the hard fork.",
      source: "TechDaily",
      time: "45m ago",
      url: "#",
      category: "tech"
    },
    {
      id: "3",
      title: "SEC Proposes New Framework for Digital Asset Custody",
      summary: "The proposed rules aim to clarify how registered investment advisors should hold customer crypto assets.",
      source: "Bloomberg",
      time: "2h ago",
      url: "#",
      category: "regulation"
    },
    {
      id: "4",
      title: "Solana Network Hits New ATH in Monthly Active Addresses",
      summary: "Memecoin frenzy and high-speed DEX activity propel Solana to 40M+ active users in the last 30 days.",
      source: "CoinDesk",
      time: "4h ago",
      url: "#",
      category: "market"
    }
  ];
}
