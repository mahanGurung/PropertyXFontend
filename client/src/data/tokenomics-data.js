export const benefitsData = [
  {
    icon: "fas fa-dollar-sign",
    title: "Multi-Layered Yields",
    description:
      "Earn stable APT profits (4.5% APY), BTC rewards (0.5-1%), and PXFO equity appreciation from tokenized assets.",
  },
  {
    icon: "fas fa-shield-alt",
    title: "Protocol Resilience",
    description:
      "PXT aggregates value across multiple assets, mitigating single-asset risks and creating portfolio diversity.",
  },
  {
    icon: "fas fa-handshake",
    title: "Inclusive Access",
    description:
      "Workers and residents can invest in local assets with minimal capital, fostering economic participation.",
  },
  {
    icon: "fas fa-money-bill-wave",
    title: "Liquidity for Asset Owners",
    description:
      "Asset owners can raise capital through APT sales, unlocking the value of their properties without full liquidation.",
  },
  {
    icon: "fas fa-vote-yea",
    title: "Governance Rights",
    description:
      "PXT stakers can vote on ecosystem priorities, asset onboarding, and community initiatives.",
  },
  {
    icon: "fas fa-link",
    title: "Stacks Integration",
    description:
      "Leverages Bitcoin's security, Clarity's predictability, and PoX consensus for enhanced reliability.",
  },
];

export const tokenomicsData = [
  {
    name: "PXT (PropertyX Token)",
    color: "primary",
    description:
      "The utility token of the PropertyX Protocol. Used for governance, staking, and accessing premium features.",
    features: [
      "Governance voting rights",
      "Staking rewards (2-4% APY)",
      "BTC yield participation",
      "Asset tokenization voting",
      "Protocol fee discounts",
    ],
    button: {
      text: "Start Staking",
      action: "staking",
    },
  },
  {
    name: "Asset Property Token (APT)",
    color: "accent",
    description:
      "Asset-specific tokens that grant rights to underlying cash flows.",
    features: [
      "Unique per asset (e.g., HORIZ-APT)",
      "Rights to 45% of asset's cash flows",
      "4.5% APY + 0.25-0.5% BTC yield",
      "Sold to raise liquidity for asset owners.",
    ],
    button: {
      text: "Explore Assets",
      action: "exploreAssets",
    },
  },
  {
    name: "Stacking",
    color: "accent",
    description:
      "Earn yields and governance power by staking APT or PXT tokens.",
    features: [
      "APT Staking: 4.5% APY + 0.25-0.5% BTC yield",
      "PXT Staking: 2-4% protocol APY + 0.25-0.5% BTC yield",
      "Governance voting: 1 PXT = 1 vote"    ],
    button: {
      text: "Start Staking",
      action: "staking",
    },
  },
];

export const tokenizationSteps = [
  {
    step: "Your asset is verified and valued by independent auditors.",
  },
  {
    step: "Asset Property Tokens (APTs) are issued at $1 per token.",
  },
  {
    step: "You retain 40% of profits and ownership; 45% goes to APT holders; 10% to PXT; 5% to treasury.",
  },
  {
    step: "Monthly profit deposits ensure transparent distribution to all stakeholders.",
  },
];
