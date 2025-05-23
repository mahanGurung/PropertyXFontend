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

const Profile = () => {
  const { connected, stxAddress, balance, callContract } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('assets');
  const [kycStatus, setKycStatus] = useState('not_started');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showAdminKycModal, setShowAdminKycModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycFormData, setKycFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    idType: '',
    idNumber: '',
    additionalInfo: ''
  });
  const [adminKycData, setAdminKycData] = useState({
    userAddress: '',
    ipfsData: '',
    approved: false
  });
  const [mockBalance, setMockBalance] = useState(0);

  const CONTRACT_ADDRESS = 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E';
  const CONTRACT_NAME = 'test3-rws';

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
          const result = await callContract({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-admin',
            functionArgs: []
          });

          // Parse the result to determine if current user is admin
          if (result && result.value && result.value.type === 'ok') {
            const adminAddress = result.value.value.address;
            const userIsAdmin = adminAddress === stxAddress;
            setIsAdmin(userIsAdmin);
            console.log(`Admin check complete. User ${userIsAdmin ? 'is' : 'is not'} admin.`);
          } else {
            console.log('Could not determine admin status from contract');
            setIsAdmin(false);
          }

          // Check KYC status for the connected user
          await checkKycStatus();
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      };

      checkAdminStatus();
    }
  }, [connected, stxAddress]);

  // Function to check KYC status
  const checkKycStatus = async () => {
    if (!connected) return;

    try {
      // In a real implementation, we would call the contract to check KYC status
      // For now, we'll just simulate a random status
      const statuses = ['not_started', 'pending', 'completed'];
      const randomStatus = statuses[Math.floor(Math.random() * 3)];
      setKycStatus(randomStatus);
    } catch (error) {
      console.error("Error checking KYC status:", error);
      setKycStatus('not_started');
    }
  };

  // Function to submit KYC
  const submitKyc = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit your KYC information.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate IPFS data hash (in a real implementation, this would upload to IPFS)
      const ipfsData = generateIpfsHash(kycFormData);

      // Call the kyc function in the smart contract
      const result = await callContract({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'kyc',
        functionArgs: [stxAddress, ipfsData]
      });

      if (result && result.value) {
        toast({
          title: "KYC Submitted",
          description: "Your KYC information has been submitted for review.",
          variant: "default"
        });

        // Update KYC status
        setKycStatus('pending');
        setShowKycModal(false);
      } else {
        throw new Error("Contract call failed");
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your KYC information.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function for admin to complete KYC for a user
  const completeKyc = async () => {
    if (!connected || !isAdmin) {
      toast({
        title: "Not Authorized",
        description: "Only admin can complete KYC verification.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Call the complete-kyc function in the smart contract
      const result = await callContract({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'complete-kyc',
        functionArgs: [adminKycData.userAddress, adminKycData.ipfsData]
      });

      if (result && result.value) {
        toast({
          title: "KYC Verification Completed",
          description: "User's KYC has been successfully verified.",
          variant: "default"
        });

        setShowAdminKycModal(false);
      } else {
        throw new Error("Contract call failed");
      }
    } catch (error) {
      console.error("Error completing KYC:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "There was an error completing the KYC verification.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to generate IPFS hash
  const generateIpfsHash = (data) => {
    const dataString = JSON.stringify(data);
    const hash = Array.from(dataString)
      .reduce((hash, char) => (((hash << 5) - hash) + char.charCodeAt(0)) | 0, 0)
      .toString(16)
      .replace('-', '');

    return `ipfs://Qm${hash.padStart(44, 'a')}`;
  };

  const handleKycChange = (field, value) => {
    setKycFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdminKycChange = (field, value) => {
    setAdminKycData(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

 return (
    <div className="min-h-screen  mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900">
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
              <i className="fas fa-user"></i>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-100">My Profile</h1>
              {connected ? (
                <p className="text-sm text-gray-400 font-mono">{shortenAddress(stxAddress || '', 8)}</p>
              ) : (
                <p className="text-sm text-gray-400 font-mono">Wallet not connected</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full sm:w-auto">
            <div className="bg-gray-700 p-3 rounded-lg text-center border border-gray-600">
              <p className="text-xs text-gray-400 mb-1">PXT Balance</p>
              <p className="font-semibold text-cyan-400">{mockBalance.toFixed(2)}PXT</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg text-center border border-gray-600">
              <p className="text-xs text-gray-400 mb-1">BTC Rewards</p>
              <p className="font-semibold text-yellow-400">{(balance?.btc || 0).toFixed(8)}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg text-center border border-gray-600">
              <p className="text-xs text-gray-400 mb-1">KYC Status</p>
              <div className="flex items-center justify-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  kycStatus === 'completed' ? 'bg-green-500' :
                  kycStatus === 'pending' ? 'bg-yellow-400' :
                  'bg-red-500'
                }`}></span>
                <p className="font-semibold text-gray-100 capitalize">
                  {kycStatus === 'not_started' ? 'Not Started' : kycStatus}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Action Button */}
        <div className="mt-6 flex justify-end">
          {kycStatus === 'not_started' && (
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              onClick={() => setShowKycModal(true)}
            >
              <i className="fas fa-id-card mr-2"></i> Complete KYC
            </Button>
          )}
          {kycStatus === 'pending' && (
            <Button 
              variant="outline"
              disabled
              className="border-gray-600 text-gray-400"
            >
              <i className="fas fa-hourglass-half mr-2"></i> KYC Under Review
            </Button>
          )}
          {connected && isAdmin && (
            <Button 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white ml-4"
              onClick={() => setShowAdminKycModal(true)}
            >
              <i className="fas fa-user-shield mr-2"></i> Admin: Approve KYC
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="border-b border-gray-700 mb-6 grid grid-cols-3 max-w-md">
          <TabsTrigger 
            value="assets" 
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'assets' ? 
                'text-cyan-400 border-b-2 border-cyan-400' : 
                'text-gray-400 hover:text-cyan-300'
            }`}
          >
            <i className="fas fa-building mr-2"></i> My Assets
          </TabsTrigger>
          <TabsTrigger 
            value="profits" 
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'profits' ? 
                'text-cyan-400 border-b-2 border-cyan-400' : 
                'text-gray-400 hover:text-cyan-300'
            }`}
          >
            <i className="fas fa-chart-line mr-2"></i> Profit History
          </TabsTrigger>
          <TabsTrigger 
            value="governance" 
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'governance' ? 
                'text-cyan-400 border-b-2 border-cyan-400' : 
                'text-gray-400 hover:text-cyan-300'
            }`}
          >
            <i className="fas fa-vote-yea mr-2"></i> Governance
          </TabsTrigger>
        </TabsList>

        {/* My Assets Tab */}
        <TabsContent value="assets">
          {!connected ? (
            <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
              <div className="w-16 h-16 mx-auto bg-gray-700 text-cyan-400 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">Connect your Stacks wallet to view your tokenized assets and investments.</p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="font-semibold text-gray-100">Your Tokenized Assets</h3>
              </div>

              <div className="p-8 text-center border-b border-gray-700">
                <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-building text-xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">No Assets Found</h3>
                <p className="text-gray-400 mb-6">You haven't tokenized any assets yet.</p>
                  <Link href="/tokenize" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                  <i className="fas fa-token mr-2"></i> Tokenize Asset
                </Link>
              </div>

              <div className="p-6 border-b border-gray-700">
                <h3 className="font-semibold text-gray-100 mb-4">Your APT Investments</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">APR</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 text-center" colSpan="6">
                          <p className="text-gray-400">No APT investments found</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-100 mb-4">Your PXFO Ownership</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">PXFO ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ownership %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acquired</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 text-center" colSpan="5">
                          <p className="text-gray-400">No PXFO ownership found</p>
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
            <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
              <div className="w-16 h-16 mx-auto bg-gray-700 text-cyan-400 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">Connect your Stacks wallet to view your profit history.</p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="font-semibold text-gray-100">APT Profit Distribution</h3>
                </div>

                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-chart-line text-xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Profit History</h3>
                  <p className="text-gray-400">You haven't received any APT profits yet.</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="font-semibold text-gray-100">PXFO Profit Distribution</h3>
                </div>

                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-chart-pie text-xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Ownership Profits</h3>
                  <p className="text-gray-400">You haven't received any PXFO ownership profits yet.</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="font-semibold text-gray-100">BTC Rewards</h3>
                </div>

                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <i className="fab fa-bitcoin text-xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No BTC Rewards</h3>
                  <p className="text-gray-400">You haven't received any BTC stacking rewards yet.</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance">
          {!connected ? (
            <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
              <div className="w-16 h-16 mx-auto bg-gray-700 text-cyan-400 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">Connect your Stacks wallet to participate in governance.</p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-100">Active Proposals</h3>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    <i className="fas fa-plus mr-2"></i> Create Proposal
                  </Button>
                </div>

                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-vote-yea text-xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Active Proposals</h3>
                  <p className="text-gray-400 mb-6">There are no active governance proposals at this time.</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="font-semibold text-gray-100">Your Voting Power</h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">PXT Staked</p>
                      <p className="text-2xl font-semibold text-cyan-400">0 PXT</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Voting Power</p>
                      <p className="text-2xl font-semibold text-cyan-400">0 votes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Voting History</p>
                      <p className="text-2xl font-semibold text-gray-400">0 votes cast</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">Governance Threshold</span>
                      <span className="text-xs font-medium text-gray-300">0 / 100,000 PXT</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '0%' }}></div>
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

      {/* KYC Submission Modal */}
      <Dialog open={showKycModal} onOpenChange={setShowKycModal}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Complete KYC Verification</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill out your information below to complete the KYC process. This is required to tokenize assets on PropertyX.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <Input 
                  id="full-name" 
                  value={kycFormData.fullName}
                  onChange={(e) => handleKycChange('fullName', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100" 
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <Input 
                  id="email" 
                  type="email"
                  value={kycFormData.email}
                  onChange={(e) => handleKycChange('email', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100" 
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-400 mb-1">Country of Residence</label>
                <Input 
                  id="country" 
                  value={kycFormData.country}
                  onChange={(e) => handleKycChange('country', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100" 
                />
              </div>

              <div>
                <label htmlFor="id-type" className="block text-sm font-medium text-gray-400 mb-1">ID Type</label>
                <Input 
                  id="id-type" 
                  value={kycFormData.idType}
                  onChange={(e) => handleKycChange('idType', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100" 
                  placeholder="Passport, Driver's License, etc."
                />
              </div>

              <div>
                <label htmlFor="id-number" className="block text-sm font-medium text-gray-400 mb-1">ID Number</label>
                <Input 
                  id="id-number" 
                  value={kycFormData.idNumber}
                  onChange={(e) => handleKycChange('idNumber', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100" 
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="additional-info" className="block text-sm font-medium text-gray-400 mb-1">Additional Information</label>
                <Textarea 
                  id="additional-info" 
                  value={kycFormData.additionalInfo}
                  onChange={(e) => handleKycChange('additionalInfo', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100" 
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <div className="mb-3">
                    <i className="fas fa-file-image text-3xl text-gray-500"></i>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Drag and drop ID documents here, or <span className="text-cyan-400">browse files</span></p>
                  <p className="text-xs text-gray-500">Upload photo ID and proof of address (PNG, JPG, PDF)</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700" 
              onClick={() => setShowKycModal(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" 
              onClick={submitKyc}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                </>
              ) : 'Submit KYC'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin KYC Approval Modal */}
      {isAdmin && (
        <Dialog open={showAdminKycModal} onOpenChange={setShowAdminKycModal}>
          <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-gray-100">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Admin: Complete KYC Verification</DialogTitle>
              <DialogDescription className="text-gray-400">
                As an admin, you can approve KYC verification for users. This will allow them to tokenize assets.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="user-address" className="block text-sm font-medium text-gray-400 mb-1">User Address</label>
                <Input 
                  id="user-address" 
                  value={adminKycData.userAddress}
                  onChange={(e) => handleAdminKycChange('userAddress', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100" 
                  placeholder="ST..."
                />
              </div>

              <div>
                <label htmlFor="ipfs-data" className="block text-sm font-medium text-gray-400 mb-1">IPFS Data</label>
                <Input 
                  id="ipfs-data" 
                  value={adminKycData.ipfsData}
                  onChange={(e) => handleAdminKycChange('ipfsData', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100" 
                  placeholder="ipfs://..."
                />
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="approve-kyc" 
                  checked={adminKycData.approved}
                  onChange={(e) => handleAdminKycChange('approved', e.target.checked)}
                  className="h-4 w-4 text-cyan-400 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700" 
                />
                <label htmlFor="approve-kyc" className="ml-2 block text-sm text-gray-400">
                  I confirm this user has passed all necessary KYC checks
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700" 
                onClick={() => setShowAdminKycModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" 
                onClick={completeKyc}
                disabled={isSubmitting || !adminKycData.approved}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
                  </>
                ) : 'Complete KYC'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Profile;