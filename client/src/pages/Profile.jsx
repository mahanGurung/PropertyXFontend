import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { shortenAddress } from '../lib/utils';

const Profile = () => {
  const { connected, address, balance } = useWallet();
  const [activeTab, setActiveTab] = useState('assets');

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
              <i className="fas fa-user"></i>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-heading font-bold text-secondary">My Profile</h1>
              {connected ? (
                <p className="text-sm text-neutral-300 font-mono">{shortenAddress(address, 8)}</p>
              ) : (
                <p className="text-sm text-neutral-300 font-mono">Wallet not connected</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
            <div className="bg-neutral-50 p-3 rounded-lg text-center">
              <p className="text-xs text-neutral-300 mb-1">PXT Balance</p>
              <p className="font-semibold text-secondary">{balance.pxt} PXT</p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg text-center">
              <p className="text-xs text-neutral-300 mb-1">BTC Rewards</p>
              <p className="font-semibold text-warning">{balance.btc.toFixed(8)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="border-b border-neutral-100 mb-6 grid grid-cols-3 max-w-md">
          <TabsTrigger 
            value="assets" 
            className={`py-4 px-1 relative font-medium text-sm ${activeTab === 'assets' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-primary-600'}`}
          >
            My Assets
          </TabsTrigger>
          <TabsTrigger 
            value="profits" 
            className={`py-4 px-1 relative font-medium text-sm ${activeTab === 'profits' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-primary-600'}`}
          >
            Profit History
          </TabsTrigger>
          <TabsTrigger 
            value="governance" 
            className={`py-4 px-1 relative font-medium text-sm ${activeTab === 'governance' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-primary-600'}`}
          >
            Governance
          </TabsTrigger>
        </TabsList>
        
        {/* My Assets Tab */}
        <TabsContent value="assets">
          {!connected ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-heading font-semibold text-secondary mb-2">Connect Your Wallet</h3>
              <p className="text-neutral-300 mb-6">Connect your Stacks wallet to view your tokenized assets and investments.</p>
              <Button className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-neutral-100">
                <h3 className="font-heading font-semibold text-secondary">Your Tokenized Assets</h3>
              </div>
              
              <div className="p-8 text-center border-b border-neutral-100">
                <div className="w-16 h-16 mx-auto bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-building text-xl text-neutral-300"></i>
                </div>
                <h3 className="text-lg font-heading font-medium text-secondary mb-2">No Assets Found</h3>
                <p className="text-neutral-300 mb-6">You haven't tokenized any assets yet.</p>
                <Button href="/tokenize" className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                  Tokenize Asset
                </Button>
              </div>
              
              <div className="p-6 border-b border-neutral-100">
                <h3 className="font-heading font-semibold text-secondary mb-4">Your APT Investments</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-100">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Token</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">APR</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-100">
                      <tr>
                        <td className="px-6 py-4 text-center" colSpan="6">
                          <p className="text-neutral-300">No APT investments found</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-heading font-semibold text-secondary mb-4">Your PXFO Ownership</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-100">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">PXFO ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Ownership %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Acquired</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-100">
                      <tr>
                        <td className="px-6 py-4 text-center" colSpan="5">
                          <p className="text-neutral-300">No PXFO ownership found</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Profit History Tab */}
        <TabsContent value="profits">
          {!connected ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-heading font-semibold text-secondary mb-2">Connect Your Wallet</h3>
              <p className="text-neutral-300 mb-6">Connect your Stacks wallet to view your profit history.</p>
              <Button className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                  <h3 className="font-heading font-semibold text-secondary">APT Profit Distribution</h3>
                </div>
                
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-chart-line text-xl text-neutral-300"></i>
                  </div>
                  <h3 className="text-lg font-heading font-medium text-secondary mb-2">No Profit History</h3>
                  <p className="text-neutral-300">You haven't received any APT profits yet.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                  <h3 className="font-heading font-semibold text-secondary">PXFO Profit Distribution</h3>
                </div>
                
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-chart-pie text-xl text-neutral-300"></i>
                  </div>
                  <h3 className="text-lg font-heading font-medium text-secondary mb-2">No Ownership Profits</h3>
                  <p className="text-neutral-300">You haven't received any PXFO ownership profits yet.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                  <h3 className="font-heading font-semibold text-secondary">BTC Rewards</h3>
                </div>
                
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fab fa-bitcoin text-xl text-neutral-300"></i>
                  </div>
                  <h3 className="text-lg font-heading font-medium text-secondary mb-2">No BTC Rewards</h3>
                  <p className="text-neutral-300">You haven't received any BTC stacking rewards yet.</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Governance Tab */}
        <TabsContent value="governance">
          {!connected ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-heading font-semibold text-secondary mb-2">Connect Your Wallet</h3>
              <p className="text-neutral-300 mb-6">Connect your Stacks wallet to participate in governance.</p>
              <Button className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-secondary">Active Proposals</h3>
                  <Button className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    Create Proposal
                  </Button>
                </div>
                
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-vote-yea text-xl text-neutral-300"></i>
                  </div>
                  <h3 className="text-lg font-heading font-medium text-secondary mb-2">No Active Proposals</h3>
                  <p className="text-neutral-300 mb-6">There are no active governance proposals at this time.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                  <h3 className="font-heading font-semibold text-secondary">Your Voting Power</h3>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-neutral-300 mb-1">PXT Staked</p>
                      <p className="text-2xl font-semibold text-secondary">0 PXT</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-300 mb-1">Voting Power</p>
                      <p className="text-2xl font-semibold text-primary">0 votes</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-300 mb-1">Voting History</p>
                      <p className="text-2xl font-semibold text-neutral-400">0 votes cast</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-neutral-300">Governance Threshold</span>
                      <span className="text-xs font-medium">0 / 100,000 PXT</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="mt-2 text-xs text-neutral-300">
                      Stake at least 100,000 PXT to create governance proposals and participate in voting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
