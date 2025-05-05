export const benefitsData = [
  {
    icon: 'fas fa-dollar-sign',
    title: 'Multi-Layered Yields',
    description: 'Earn stable APT profits (4.5% APY), BTC rewards (0.5-1%), and PXFO equity appreciation from tokenized assets.'
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Protocol Resilience',
    description: 'PXT aggregates value across multiple assets, mitigating single-asset risks and creating portfolio diversity.'
  },
  {
    icon: 'fas fa-handshake',
    title: 'Inclusive Access',
    description: 'Workers and residents can invest in local assets with minimal capital, fostering economic participation.'
  },
  {
    icon: 'fas fa-money-bill-wave',
    title: 'Liquidity for Asset Owners',
    description: 'Asset owners can raise capital through APT sales, unlocking the value of their properties without full liquidation.'
  },
  {
    icon: 'fas fa-vote-yea',
    title: 'Governance Rights',
    description: 'PXT stakers can vote on ecosystem priorities, asset onboarding, and community initiatives.'
  },
  {
    icon: 'fas fa-link',
    title: 'Stacks Integration',
    description: 'Leverages Bitcoin\'s security, Clarity\'s predictability, and PoX consensus for enhanced reliability.'
  }
];

export const tokenomicsData = [
  {
    name: 'PropertyX-Token (PXT)',
    color: 'primary',
    description: 'Protocol-wide utility token for governance, staking rewards, and value accrual.',
    features: [
      'Fixed supply of 1 billion PXT',
      '5-10% of asset profits used for buybacks',
      'Governance rights (1 PXT = 1 vote)',
      'Staking yields 2-4% APY + BTC rewards'
    ],
    button: {
      text: 'Buy PXT',
      action: 'buyPxt'
    }
  },
  {
    name: 'Asset Property Token (APT)',
    color: 'accent',
    description: 'Asset-specific tokens that grant rights to underlying cash flows.',
    features: [
      'Unique per asset (e.g., HORIZ-APT)',
      'Rights to 45% of asset\'s cash flows',
      '4.5% APY + 0.25-0.5% BTC yield',
      '50,000+ APT grants PXFO eligibility'
    ],
    button: {
      text: 'Explore Assets',
      action: 'exploreAssets'
    }
  },
  {
    name: 'PropertyX-FO (PXFO)',
    color: 'warning',
    description: 'Non-fungible tokens representing fractional ownership of assets.',
    features: [
      '0.01% ownership per PXFO NFT',
      '10,000 PXFO per asset (100% ownership)',
      'Eligibility: 50,000+ APT or 100,000+ PXT',
      'Share of 40% asset owner profits'
    ],
    button: {
      text: 'Stake to Qualify',
      action: 'stakeToQualify'
    }
  }
];

export const tokenizationSteps = [
  {
    step: 'Your asset is verified and valued by independent auditors.',
  },
  {
    step: 'Asset Property Tokens (APTs) are issued at $1 per token.',
  },
  {
    step: 'You retain 40% of profits and ownership; 45% goes to APT holders; 10% to PXT; 5% to treasury.',
  },
  {
    step: '10,000 PXFO NFTs represent fractional ownership for qualifying stakers.',
  },
  {
    step: 'Monthly profit deposits ensure transparent distribution to all stakeholders.',
  }
];
