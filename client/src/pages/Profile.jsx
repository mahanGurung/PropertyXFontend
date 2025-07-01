import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { shortenAddress } from '../lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Cl, fetchCallReadOnlyFunction } from '@stacks/transactions';
import { request } from '@stacks/connect';

const Profile = () => {
  const { connected, stxAddress, balance, callContract } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('assets');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mockBalance, setMockBalance] = useState(0);

  const CONTRACT_ADDRESS = 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E';
  const CONTRACT_NAME = 'test5-rws';

  useEffect(() => {
    if (connected && stxAddress) {
      const storedData = JSON.parse(localStorage.getItem('pxtPurchases') || '{}');
      const userBalance = parseFloat(storedData[stxAddress] || 0);
      setMockBalance(userBalance);
    }
  }, [connected, stxAddress]);

  // Check if user is admin using the contract's get-admin function
  useEffect(() => {
    if (connected) {
      const checkAdminStatus = async () => {
        try {
          // Call the get-admin function in the contract to determine if user is admin
          const options = {
            contractAddress: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E',
            contractName: 'test5-rws',
            functionName: 'get-admin',
            functionArgs: [],
            network: 'testnet',
            senderAddress: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E',
          };

          const result = await fetchCallReadOnlyFunction(options);

          console.log("get admin: ", result.type);
          console.log("get admin: ", result.value.value);
          console.log('stx Address: ', stxAddress);

          // Parse the result to determine if current user is admin
          if (result && result.value.value && result.type === 'ok') {
            const adminAddress = result.value.value;
            if (adminAddress == stxAddress){
              setIsAdmin(true);
              console.log(`Admin check complete. User ${true ? 'is' : 'is not'} admin.`);
            }
          } else {
            console.log('Could not determine admin status from contract');
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      };

      checkAdminStatus();
    }
  }, [connected, stxAddress]);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const startPxtPurchase = async () => {
    if (connected){
      const response = await request('stx_callContract', {
        contract: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E.test5-rws',
        functionName: 'stop-pxt-sale',
        functionArgs: [
          Cl.bool(false)
        ],
        network: 'testnet'
      })
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/80 via-gray-900/50 to-gray-900/30 min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-6 mb-8 border border-gray-700/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-gradient-to-r from-teal-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
              <i className="fas fa-user"></i>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">My Profile</h1>
              {connected ? (
                <p className="text-sm text-gray-300 font-mono">{shortenAddress(stxAddress || '', 8)}</p>
              ) : (
                <p className="text-sm text-gray-300 font-mono">Wallet not connected</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full sm:w-auto">
            <div className="bg-gray-700/50 p-3 rounded-lg text-center border border-gray-600/50">
              <p className="text-xs text-gray-400 mb-1">PXT Balance</p>
              <p className="font-semibold text-teal-400">{balance.pxt} PXT</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg text-center border border-gray-600/50">
              <p className="text-xs text-gray-400 mb-1">Assets Tokenized</p>
              <p className="font-semibold text-teal-400">0</p>
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
        <TabsList className="grid grid-cols-3 max-w-md mb-6 bg-gray-800/80 border border-gray-700/50 rounded-lg p-1">
          <TabsTrigger 
            value="assets" 
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'assets' ? 
                'bg-gradient-to-r from-teal-500 to-teal-600 text-white' : 
                'text-gray-400 hover:text-teal-300'
            } rounded-md transition-all duration-300`}
          >
            <i className="fas fa-building mr-2"></i> My Assets
          </TabsTrigger>
          <TabsTrigger 
            value="profits" 
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'profits' ? 
                'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : 
                'text-gray-400 hover:text-purple-300'
            } rounded-md transition-all duration-300`}
          >
            <i className="fas fa-chart-line mr-2"></i> Profit History
          </TabsTrigger>
          <TabsTrigger 
            value="governance" 
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'governance' ? 
                'bg-gradient-to-r from-teal-500 to-purple-600 text-white' : 
                'text-gray-400 hover:text-teal-300'
            } rounded-md transition-all duration-300`}
          >
            <i className="fas fa-vote-yea mr-2"></i> Governance
          </TabsTrigger>
        </TabsList>

        {/* My Assets Tab */}
        <TabsContent value="assets">
          {!connected ? (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 text-center border border-gray-700/30">
              <div className="w-16 h-16 mx-auto bg-gray-700/50 text-teal-400 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-6">Connect your Stacks wallet to view your tokenized assets and investments.</p>
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-teal-500/30">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="font-semibold text-gray-100">Your Tokenized Assets</h3>
              </div>

              <div className="p-8 text-center border-b border-gray-700/50">
                <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-building text-xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">No Assets Found</h3>
                <p className="text-gray-300 mb-6">You haven't tokenized any assets yet.</p>
                <Link href="/tokenize" className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-teal-500/30">
                  <i className="fas fa-token mr-2"></i> Tokenize Asset
                </Link>
              </div>

              <div className="p-6 border-b border-gray-700/50">
                <h3 className="font-semibold text-gray-100 mb-4">Your APT Investments</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700/50">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">APR</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-700/50">
                      <tr>
                        <td className="px-6 py-4 text-center" colSpan="6">
                          <p className="text-gray-300">No APT investments found</p>
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
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 text-center border border-gray-700/30">
              <div className="w-16 h-16 mx-auto bg-gray-700/50 text-teal-400 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-6">Connect your Stacks wallet to view your profit history.</p>
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-teal-500/30">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30">
                <div className="p-6 border-b border-gray-700/50">
                  <h3 className="font-semibold text-gray-100">APT Profit Distribution</h3>
                </div>

                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-chart-line text-xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Profit History</h3>
                  <p className="text-gray-300">You haven't received any APT profits yet.</p>
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30">
                <div className="p-6 border-b border-gray-700/50">
                  <h3 className="font-semibold text-gray-100">BTC Rewards</h3>
                </div>

                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <i className="fab fa-bitcoin text-xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No BTC Rewards</h3>
                  <p className="text-gray-300">You haven't received any BTC stacking rewards yet.</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance">
          {!connected ? (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 text-center border border-gray-700/30">
              <div className="w-16 h-16 mx-auto bg-gray-700/50 text-teal-400 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-6">Connect your Stacks wallet to participate in governance.</p>
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-teal-500/30">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30">
                <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-100">Active Proposals</h3>
                  <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-teal-500/30">
                    <i className="fas fa-plus mr-2"></i> Create Proposal
                  </Button>
                </div>

                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-vote-yea text-xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Active Proposals</h3>
                  <p className="text-gray-300 mb-6">There are no active governance proposals at this time.</p>
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30">
                <div className="p-6 border-b border-gray-700/50">
                  <h3 className="font-semibold text-gray-100">Your Voting Power</h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">PXT Staked</p>
                      <p className="text-2xl font-semibold text-teal-400">0 PXT</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Voting Power</p>
                      <p className="text-2xl font-semibold text-teal-400">0 votes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Voting History</p>
                      <p className="text-2xl font-semibold text-gray-300">0 votes cast</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">Governance Threshold</span>
                      <span className="text-xs font-medium text-gray-300">0 / 100,000 PXT</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-teal-400 to-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
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