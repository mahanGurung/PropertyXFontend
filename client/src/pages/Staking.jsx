import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWallet } from '../contexts/WalletContext';
import assets from '../data/asset-data';

const Staking = () => {
  const { connected } = useWallet();
  const [pxtLockupPeriod, setPxtLockupPeriod] = useState('3');
  const [aptLockupPeriod, setAptLockupPeriod] = useState('3');
  const [pxtStakeAmount, setPxtStakeAmount] = useState('');
  const [aptStakeAmount, setAptStakeAmount] = useState('');
  const [selectedApt, setSelectedApt] = useState('');

  const getMaxPercentage = (months) => {
    if (months === '3') return 25;
    if (months === '6') return 50;
    if (months === '12') return 100;
    return 0;
  };

  const pxtMaxPercentage = getMaxPercentage(pxtLockupPeriod);
  const aptMaxPercentage = getMaxPercentage(aptLockupPeriod);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-heading font-bold text-secondary">Stake Your Tokens</h1>
        <p className="mt-4 text-lg text-neutral-300 max-w-3xl mx-auto">
          Earn yields, BTC rewards, and qualify for fractional ownership by staking your PXT and APT tokens.
        </p>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PXT Staking */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary text-white p-4">
              <h2 className="text-xl font-heading font-semibold">Stake PXT Tokens</h2>
              <p className="text-primary-100 text-sm">Protocol-wide utility token staking</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-300">My PXT Balance</span>
                  <span className="text-sm font-semibold">0 PXT</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-300">Currently Staked</span>
                  <span className="text-sm font-semibold">0 PXT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-300">Unstake Available</span>
                  <span className="text-sm font-semibold">In 0 days</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Benefits</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                    <span className="text-neutral-400 text-sm">Protocol Yield: 2-4% APY</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                    <span className="text-neutral-400 text-sm">BTC Yield: 0.25-0.5% APY</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                    <span className="text-neutral-400 text-sm">Governance rights (1 PXT = 1 vote)</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                    <span className="text-neutral-400 text-sm">PXFO eligibility: 100,000+ PXT</span>
                  </li>
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Lockup Period</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                    variant={pxtLockupPeriod === '3' ? 'outline' : 'secondary'}
                    className={pxtLockupPeriod === '3' ? 'border border-primary bg-primary-50 text-primary' : 'border border-neutral-200 text-neutral-400'}
                    onClick={() => setPxtLockupPeriod('3')}
                  >
                    3 Months
                  </Button>
                  <Button
                    variant={pxtLockupPeriod === '6' ? 'outline' : 'secondary'}
                    className={pxtLockupPeriod === '6' ? 'border border-primary bg-primary-50 text-primary' : 'border border-neutral-200 text-neutral-400'}
                    onClick={() => setPxtLockupPeriod('6')}
                  >
                    6 Months
                  </Button>
                  <Button
                    variant={pxtLockupPeriod === '12' ? 'outline' : 'secondary'}
                    className={pxtLockupPeriod === '12' ? 'border border-primary bg-primary-50 text-primary' : 'border border-neutral-200 text-neutral-400'}
                    onClick={() => setPxtLockupPeriod('12')}
                  >
                    12 Months
                  </Button>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${pxtMaxPercentage}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-300">3 Months</span>
                  <span className="text-xs text-neutral-300">12 Months</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="pxt-stake-amount" className="block text-sm font-medium text-neutral-400 mb-1">Amount to Stake</label>
                <div className="relative">
                  <Input
                    type="text"
                    id="pxt-stake-amount"
                    value={pxtStakeAmount}
                    onChange={(e) => setPxtStakeAmount(e.target.value)}
                    className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary pr-20"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button className="mr-2 text-xs text-primary font-medium">MAX</button>
                    <span className="mr-3 text-neutral-300">PXT</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  if (!connected) {
                    alert('Please connect your wallet first');
                    return;
                  }
                  alert(`Staked ${pxtStakeAmount} PXT for ${pxtLockupPeriod} months`);
                }}
                className="w-full bg-primary hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition"
              >
                Stake PXT
              </Button>
            </div>
          </div>
          
          {/* APT Staking */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-accent text-white p-4">
              <h2 className="text-xl font-heading font-semibold">Stake APT Tokens</h2>
              <p className="text-accent-100 text-sm">Asset-specific token staking</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-300">Select APT Token</span>
                  <div className="text-sm font-semibold">
                    <Select value={selectedApt} onValueChange={setSelectedApt}>
                      <SelectTrigger className="border-neutral-200 rounded-md shadow-sm focus:ring-accent focus:border-accent text-xs w-40">
                        <SelectValue placeholder="Select Token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select_token">Select Token</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.symbol}>{asset.symbol}-APT</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-300">My APT Balance</span>
                  <span className="text-sm font-semibold">0 APT</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-300">Currently Staked</span>
                  <span className="text-sm font-semibold">0 APT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-300">Unstake Available</span>
                  <span className="text-sm font-semibold">In 0 days</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Benefits</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-accent mt-1 mr-2"></i>
                    <span className="text-neutral-400 text-sm">Asset Profit: 4.5% APY</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-accent mt-1 mr-2"></i>
                    <span className="text-neutral-400 text-sm">BTC Yield: 0.25-0.5% APY</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-accent mt-1 mr-2"></i>
                    <span className="text-neutral-400 text-sm">Cash flow rights to 45% of asset profits</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-accent mt-1 mr-2"></i>
                    <span className="text-neutral-400 text-sm">PXFO eligibility: 50,000+ APT</span>
                  </li>
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Lockup Period</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                    variant={aptLockupPeriod === '3' ? 'outline' : 'secondary'}
                    className={aptLockupPeriod === '3' ? 'border border-accent bg-accent-50 text-accent' : 'border border-neutral-200 text-neutral-400'}
                    onClick={() => setAptLockupPeriod('3')}
                  >
                    3 Months
                  </Button>
                  <Button
                    variant={aptLockupPeriod === '6' ? 'outline' : 'secondary'}
                    className={aptLockupPeriod === '6' ? 'border border-accent bg-accent-50 text-accent' : 'border border-neutral-200 text-neutral-400'}
                    onClick={() => setAptLockupPeriod('6')}
                  >
                    6 Months
                  </Button>
                  <Button
                    variant={aptLockupPeriod === '12' ? 'outline' : 'secondary'}
                    className={aptLockupPeriod === '12' ? 'border border-accent bg-accent-50 text-accent' : 'border border-neutral-200 text-neutral-400'}
                    onClick={() => setAptLockupPeriod('12')}
                  >
                    12 Months
                  </Button>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${aptMaxPercentage}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-300">3 Months</span>
                  <span className="text-xs text-neutral-300">12 Months</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="apt-stake-amount" className="block text-sm font-medium text-neutral-400 mb-1">Amount to Stake</label>
                <div className="relative">
                  <Input
                    type="text"
                    id="apt-stake-amount"
                    value={aptStakeAmount}
                    onChange={(e) => setAptStakeAmount(e.target.value)}
                    className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-accent focus:border-accent pr-20"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button className="mr-2 text-xs text-accent font-medium">MAX</button>
                    <span className="mr-3 text-neutral-300">APT</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  if (!connected) {
                    alert('Please connect your wallet first');
                    return;
                  }
                  if (!selectedApt || selectedApt === 'select_token') {
                    alert('Please select an APT token');
                    return;
                  }
                  alert(`Staked ${aptStakeAmount} ${selectedApt}-APT for ${aptLockupPeriod} months`);
                }}
                className="w-full bg-accent hover:bg-accent-600 text-white py-3 px-4 rounded-lg font-medium transition"
              >
                Stake APT
              </Button>
            </div>
          </div>
        </div>
        
        {/* Staking Stats */}
        <div className="bg-white rounded-lg shadow-md mt-8 p-6">
          <h3 className="text-xl font-heading font-semibold text-secondary mb-4">Your Staking Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-neutral-300 mb-1">Total Value Staked</p>
              <p className="text-2xl font-semibold text-secondary">$0.00</p>
            </div>
            <div>
              <p className="text-sm text-neutral-300 mb-1">Estimated Annual Yield</p>
              <p className="text-2xl font-semibold text-accent">$0.00</p>
            </div>
            <div>
              <p className="text-sm text-neutral-300 mb-1">BTC Rewards</p>
              <p className="text-2xl font-semibold text-warning">0.00000000 BTC</p>
            </div>
            <div>
              <p className="text-sm text-neutral-300 mb-1">PXFO Eligibility</p>
              <p className="text-xl font-semibold text-error-500">Not Eligible</p>
            </div>
          </div>
          
          <div className="mt-6 border-t border-neutral-100 pt-6">
            <h4 className="font-heading font-semibold text-secondary mb-3">PXFO Eligibility Progress</h4>
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-300">PXT Requirement</span>
                <span className="text-xs font-medium">0 / 100,000 PXT</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-300">APT Requirement (any token)</span>
                <span className="text-xs font-medium">0 / 50,000 APT</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;
