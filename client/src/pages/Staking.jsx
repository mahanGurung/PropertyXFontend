import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { shortenAddress } from '../lib/utils';
import assets from '../data/asset-data';
import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';

const Staking = () => {
  const { connected, stxAddress, callContract } = useWallet();
  const { toast } = useToast();
  const [pxtLockupPeriod, setPxtLockupPeriod] = useState('3');
  const [aptLockupPeriod, setAptLockupPeriod] = useState('3');
  const [pxtStakeAmount, setPxtStakeAmount] = useState('');
  const [aptStakeAmount, setAptStakeAmount] = useState('');
  const [selectedApt, setSelectedApt] = useState('');
  const [activeTab, setActiveTab] = useState('staking');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [tokenizationProposals, setTokenizationProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [userVote, setUserVote] = useState(null);

  const CONTRACT_ADDRESS = 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E';
  const CONTRACT_NAME = 'test5-rws';

  // Function to stake PXT tokens
  const stakePxt = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake tokens.",
        variant: "destructive"
      });
      return;
    }

    try {
      const amount = parseInt(pxtStakeAmount) || 0;
      if (amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount greater than zero.",
          variant: "destructive"
        });
        return;
      }

      const result = await request('stx_callContract' ,{
        contract: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E.test5-rws',
        functionName: 'stake-pxt',
        functionArgs: [Cl.uint(amount)],
        network: 'testnet',
        postConditionMode: 'allow'
      });
      console.log(result)

      if (result) {
        toast({
          title: "Staking Successful",
          description: `Successfully staked ${pxtStakeAmount} PXT tokens.`,
          variant: "default"
        });
        setPxtStakeAmount('');
      } else {
        throw new Error("Contract call failed");
      }
    } catch (error) {
      console.error("Error staking PXT:", error);
      toast({
        title: "Staking Failed",
        description: error.message || "There was an error staking your PXT tokens.",
        variant: "destructive"
      });
    }
  };

  // Load tokenization proposals for voting
  useEffect(() => {
    if (connected) {
      // In a real implementation, we would call the contract to get the proposals
      // For demo purposes, we'll use mock data
      const mockProposals = [
        {
          assetOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          assetId: 123456,
          assetName: 'Downtown Office Tower',
          description: 'A premium office building in the financial district with 85% occupancy.',
          requestedValue: 5000000,
          ipfsData: 'ipfs://QmExample1',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          voteEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          votes: { yes: 750000, no: 250000 }
        },
        {
          assetOwner: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          assetId: 789012,
          assetName: 'Riverside Apartment Complex',
          description: 'Luxury apartment complex with 120 units and premium amenities.',
          requestedValue: 12000000,
          ipfsData: 'ipfs://QmExample2',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          voteEnds: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
          votes: { yes: 1200000, no: 300000 }
        },
        {
          assetOwner: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5YC7SG3KG',
          assetId: 345678,
          assetName: 'Retail Shopping Center',
          description: 'Suburban shopping center with anchor tenants and 95% leased.',
          requestedValue: 8500000,
          ipfsData: 'ipfs://QmExample3',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          voteEnds: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000), // 29 days from now
          votes: { yes: 550000, no: 400000 }
        }
      ];

      setTokenizationProposals(mockProposals);
    }
  }, [connected]);

  // Function to submit a vote for a tokenization proposal
  const submitVote = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedProposal || userVote === null) {
      toast({
        title: "Invalid selection",
        description: "Please select a proposal and vote option.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmittingVote(true);

      // Call the vote-tokenize function in the smart contract
      const result = await callContract({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'vote-tokenize',
        functionArgs: [selectedProposal.assetOwner, selectedProposal.assetId, userVote]
      });

      if (result && result.value) {
        toast({
          title: "Vote Submitted",
          description: `Successfully voted ${userVote ? 'YES' : 'NO'} on ${selectedProposal.assetName} tokenization.`,
          variant: "default"
        });

        // Update the proposal votes in our local state
        setTokenizationProposals(prevProposals => 
          prevProposals.map(proposal => {
            if (proposal.assetOwner === selectedProposal.assetOwner && proposal.assetId === selectedProposal.assetId) {
              const votes = {...proposal.votes};
              if (userVote) {
                votes.yes += 1;
              } else {
                votes.no += 1;
              }
              return {...proposal, votes};
            }
            return proposal;
          })
        );

        setShowVoteModal(false);
        setSelectedProposal(null);
        setUserVote(null);
      } else {
        throw new Error("Contract call failed");
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Vote Failed",
        description: error.message || "There was an error submitting your vote.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const getMaxPercentage = (months) => {
    if (months === '3') return 25;
    if (months === '6') return 50;
    if (months === '12') return 100;
    return 0;
  };

  const pxtMaxPercentage = getMaxPercentage(pxtLockupPeriod);
  const aptMaxPercentage = getMaxPercentage(aptLockupPeriod);

  // Calculate vote percentage for progress bars
  const calculateVotePercentage = (yes, no) => {
    const total = yes + no;
    if (total === 0) return { yes: 0, no: 0 };
    return {
      yes: Math.round((yes / total) * 100),
      no: Math.round((no / total) * 100)
    };
  };

  return (
    <div className="mx-auto min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">Stake & Vote</h1>
        <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
          Stake tokens to earn rewards and participate in governance by voting on tokenization proposals.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full mb-8"
        >
          <TabsList className="grid grid-cols-2 max-w-md mx-auto bg-gray-800/80 border border-gray-700/50 rounded-lg p-1">
            <TabsTrigger 
              value="staking" 
              className={`py-2 px-4 ${activeTab === 'staking' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' : 'bg-transparent text-gray-400 hover:text-gray-300'} rounded-md transition-all duration-300`}
            >
              <i className="fas fa-coins mr-2"></i> Staking
            </TabsTrigger>
            <TabsTrigger 
              value="governance" 
              className={`py-2 px-4 ${activeTab === 'governance' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : 'bg-transparent text-gray-400 hover:text-gray-300'} rounded-md transition-all duration-300`}
            >
              <i className="fas fa-vote-yea mr-2"></i> Governance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staking">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PXT Staking */}
              <div className="bg-gradient-to-b from-gray-800/70 to-gray-800/90 rounded-lg shadow-lg overflow-hidden border border-gray-700/50 hover:border-teal-400/50 transition-all duration-300">
                <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-4">
                  <h2 className="text-xl font-semibold">Stake PXT Tokens</h2>
                  <p className="text-teal-200 text-sm">Protocol-wide utility token staking</p>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">My PXT Balance</span>
                      <span className="text-sm font-semibold text-gray-100">0 PXT</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Currently Staked</span>
                      <span className="text-sm font-semibold text-gray-100">0 PXT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Unstake Available</span>
                      <span className="text-sm font-semibold text-gray-100">In 0 days</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3">Benefits</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-teal-400 mt-1 mr-2"></i>
                        <span className="text-gray-300 text-sm">Protocol Yield: 2-4% APY</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-teal-400 mt-1 mr-2"></i>
                        <span className="text-gray-300 text-sm">BTC Yield: 0.25-0.5% APY</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-teal-400 mt-1 mr-2"></i>
                        <span className="text-gray-300 text-sm">Governance rights (1 PXT = 1 vote)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3">Lockup Period</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <Button
                        onClick={() => setPxtLockupPeriod('3')}
                        className={`${pxtLockupPeriod === '3' ? 'bg-teal-600 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'} border border-gray-600/50 transition-all duration-300`}
                      >
                        3 Months
                      </Button>
                      <Button
                        onClick={() => setPxtLockupPeriod('6')}
                        className={`${pxtLockupPeriod === '6' ? 'bg-teal-600 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'} border border-gray-600/50 transition-all duration-300`}
                      >
                        6 Months
                      </Button>
                      <Button
                        onClick={() => setPxtLockupPeriod('12')}
                        className={`${pxtLockupPeriod === '12' ? 'bg-teal-600 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'} border border-gray-600/50 transition-all duration-300`}
                      >
                        12 Months
                      </Button>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div className="bg-teal-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pxtMaxPercentage}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>3 Months</span>
                      <span>12 Months</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="pxt-stake-amount" className="block text-sm font-medium text-gray-400 mb-1">Amount to Stake</label>
                    <div className="relative">
                      <Input
                        type="text"
                        id="pxt-stake-amount"
                        value={pxtStakeAmount}
                        onChange={(e) => setPxtStakeAmount(e.target.value)}
                        className="w-full bg-gray-700/50 border-gray-600/50 text-gray-100 rounded-md focus:ring-teal-500 focus:border-teal-500 pr-20 transition-all duration-300"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <button className="mr-2 text-xs text-teal-400 font-medium hover:text-teal-300 transition-colors duration-300">MAX</button>
                        <span className="mr-3 text-gray-400">PXT</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={stakePxt}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-teal-500/30"
                  >
                    <i className="fas fa-lock mr-2"></i> Stake PXT
                  </Button>
                </div>
              </div>

              {/* APT Staking */}
              <div className="bg-gradient-to-b from-gray-800/70 to-gray-800/90 rounded-lg shadow-lg overflow-hidden border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300">
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4">
                  <h2 className="text-xl font-semibold">Stake APT Tokens</h2>
                  <p className="text-purple-200 text-sm">Asset-specific token staking</p>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Select APT Token</span>
                      <div className="text-sm font-semibold">
                        <Select value={selectedApt} onValueChange={setSelectedApt}>
                          <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-gray-100 focus:ring-purple-500 focus:border-purple-500 text-xs w-40 transition-all duration-300">
                            <SelectValue placeholder="Select Token" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800/90 border-gray-700/50 text-gray-100">
                            <SelectItem value="select_token" className="hover:bg-gray-700/70 transition-colors duration-300">Select Token</SelectItem>
                            {assets.map((asset) => (
                              <SelectItem key={asset.id} value={asset.symbol} className="hover:bg-gray-700/70 transition-colors duration-300">{asset.symbol}-APT</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">My APT Balance</span>
                      <span className="text-sm font-semibold text-gray-100">0 APT</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Currently Staked</span>
                      <span className="text-sm font-semibold text-gray-100">0 APT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Unstake Available</span>
                      <span className="text-sm font-semibold text-gray-100">In 0 days</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3">Benefits</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-purple-400 mt-1 mr-2"></i>
                        <span className="text-gray-300 text-sm">Asset Profit: 4.5% APY</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-purple-400 mt-1 mr-2"></i>
                        <span className="text-gray-300 text-sm">BTC Yield: 0.25-0.5% APY</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-purple-400 mt-1 mr-2"></i>
                        <span className="text-gray-300 text-sm">Cash flow rights to 45% of asset profits</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3">Lockup Period</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <Button
                        onClick={() => setAptLockupPeriod('3')}
                        className={`${aptLockupPeriod === '3' ? 'bg-purple-600 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'} border border-gray-600/50 transition-all duration-300`}
                      >
                        3 Months
                      </Button>
                      <Button
                        onClick={() => setAptLockupPeriod('6')}
                        className={`${aptLockupPeriod === '6' ? 'bg-purple-600 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'} border border-gray-600/50 transition-all duration-300`}
                      >
                        6 Months
                      </Button>
                      <Button
                        onClick={() => setAptLockupPeriod('12')}
                        className={`${aptLockupPeriod === '12' ? 'bg-purple-600 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'} border border-gray-600/50 transition-all duration-300`}
                      >
                        12 Months
                      </Button>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div className="bg-purple-400 h-2 rounded-full transition-all duration-500" style={{ width: `${aptMaxPercentage}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>3 Months</span>
                      <span>12 Months</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="apt-stake-amount" className="block text-sm font-medium text-gray-400 mb-1">Amount to Stake</label>
                    <div className="relative">
                      <Input
                        type="text"
                        id="apt-stake-amount"
                        value={aptStakeAmount}
                        onChange={(e) => setAptStakeAmount(e.target.value)}
                        className="w-full bg-gray-700/50 border-gray-600/50 text-gray-100 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-20 transition-all duration-300"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <button className="mr-2 text-xs text-purple-400 font-medium hover:text-purple-300 transition-colors duration-300">MAX</button>
                        <span className="mr-3 text-gray-400">APT</span>
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
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-purple-500/30"
                  >
                    <i className="fas fa-lock mr-2"></i> Stake APT
                  </Button>
                </div>
              </div>
            </div>

            {/* Staking Stats */}
            <div className="bg-gradient-to-b from-gray-800/70 to-gray-800/90 rounded-lg shadow-lg mt-8 p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Your Staking Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Value Staked</p>
                  <p className="text-2xl font-semibold text-gray-100">$0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Estimated Annual Yield</p>
                  <p className="text-2xl font-semibold text-teal-400">$0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">BTC Rewards</p>
                  <p className="text-2xl font-semibold text-yellow-400">0.00000000 BTC</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Stakes</p>
                  <p className="text-xl font-semibold text-teal-400">0</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="governance">
            <div className="bg-gradient-to-b from-gray-800/70 to-gray-800/90 rounded-lg shadow-lg p-6 mb-8 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Asset Tokenization Proposals</h3>

              {!connected ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto bg-gray-700/50 text-teal-400 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-wallet text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-400 mb-6">Connect your Stacks wallet to view and vote on tokenization proposals.</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-400 text-sm">You have <span className="font-semibold text-gray-100">0 PXT</span> staked, giving you <span className="font-semibold text-teal-400">0 votes</span>.</p>
                    <p className="text-gray-400 text-sm">Min. stake required: <span className="font-semibold text-gray-100">100 PXT</span></p>
                  </div>

                  <div className="divide-y divide-gray-700/50">
                    {tokenizationProposals.map((proposal, index) => {
                      const votePercent = calculateVotePercentage(proposal.votes.yes, proposal.votes.no);
                      return (
                        <div key={index} className="py-6 first:pt-0 last:pb-0">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-100">{proposal.assetName}</h4>
                              <p className="text-sm text-gray-400 mb-2">{proposal.description}</p>
                              <div className="flex items-center mb-2 text-xs text-gray-500">
                                <span className="font-mono mr-4">Owner: {shortenAddress(proposal.assetOwner, 6)}</span>
                                <span>ID: {proposal.assetId}</span>
                              </div>
                            </div>
                            <div className="mt-4 lg:mt-0">
                              <Button 
                                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white transition-all duration-300"
                                onClick={() => {
                                  setSelectedProposal(proposal);
                                  setUserVote(null);
                                  setShowVoteModal(true);
                                }}
                              >
                                <i className="fas fa-vote-yea mr-2"></i> Vote Now
                              </Button>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-400">Current Vote</span>
                              <span className="text-xs font-medium text-gray-300">
                                Yes: {proposal.votes.yes.toLocaleString()} ({votePercent.yes}%) | 
                                No: {proposal.votes.no.toLocaleString()} ({votePercent.no}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2 flex overflow-hidden">
                              <div className="bg-green-500 h-2 transition-all duration-500" style={{ width: `${votePercent.yes}%` }}></div>
                              <div className="bg-red-500 h-2 transition-all duration-500" style={{ width: `${votePercent.no}%` }}></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-gray-400">Value: <span className="font-semibold text-gray-100">${proposal.requestedValue.toLocaleString()}</span></p>
                            </div>
                            <div>
                              <p className="text-gray-400">Voting Ends: <span className="font-semibold text-gray-100">{proposal.voteEnds.toLocaleDateString()}</span></p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Voting Modal */}
        <Dialog open={showVoteModal} onOpenChange={setShowVoteModal}>
          <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-gray-800/90 to-gray-800/70 border-gray-700/50 text-gray-100">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Vote on Asset Tokenization</DialogTitle>
              <DialogDescription className="text-gray-400">
                Cast your vote to approve or reject this asset tokenization proposal.
              </DialogDescription>
            </DialogHeader>

            {selectedProposal && (
              <div className="py-4">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{selectedProposal.assetName}</h3>
                <p className="text-sm text-gray-400 mb-4">{selectedProposal.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Asset ID</p>
                    <p className="font-medium text-gray-200">{selectedProposal.assetId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Value</p>
                    <p className="font-medium text-gray-200">${selectedProposal.requestedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Asset Owner</p>
                    <p className="font-mono font-medium text-gray-200">{shortenAddress(selectedProposal.assetOwner, 6)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Voting Ends</p>
                    <p className="font-medium text-gray-200">{selectedProposal.voteEnds.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-100 mb-3">Your Vote</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={userVote === true ? 'default' : 'outline'}
                      className={`${userVote === true ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-gray-600/50 text-gray-300 hover:bg-gray-700/50'} h-12 transition-all duration-300`}
                      onClick={() => setUserVote(true)}
                    >
                      <i className="fas fa-check mr-2"></i> YES
                    </Button>
                    <Button
                      variant={userVote === false ? 'default' : 'outline'}
                      className={`${userVote === false ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-gray-600/50 text-gray-300 hover:bg-gray-700/50'} h-12 transition-all duration-300`}
                      onClick={() => setUserVote(false)}
                    >
                      <i className="fas fa-times mr-2"></i> NO
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-md mb-4">
                  <p className="text-xs text-gray-400">By voting, you are helping to determine whether this real-world asset should be tokenized on the PropertyX platform. Your vote is weighted by your staked PXT amount.</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50 transition-all duration-300" 
                onClick={() => setShowVoteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white transition-all duration-300" 
                onClick={submitVote}
                disabled={isSubmittingVote || userVote === null}
              >
                {isSubmittingVote ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                  </>
                ) : 'Submit Vote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
  };

  export default Staking;