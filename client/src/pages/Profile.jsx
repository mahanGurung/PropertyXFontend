import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { shortenAddress } from '../lib/utils';
import { useToast } from '@/hooks/use-toast';

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

  const CONTRACT_ADDRESS = 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E';
  const CONTRACT_NAME = 'rws';
  
  // Simulating admin check - in a real app, this would come from contract data
  useEffect(() => {
    // For demonstration, consider the wallet with this specific address as admin
    if (connected) {
      const checkIsAdmin = async () => {
        try {
          // Here, ideally, we'd check if the user is the admin by making a contract call
          // For demo purposes, we'll just set a random wallet as admin
          // In a real implementation, we'd query the contract
          
          // Simulate a 20% chance of being admin for demo purposes
          setIsAdmin(Math.random() < 0.2);
          
          // Check KYC status for the connected user
          await checkKycStatus();
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      };
      
      checkIsAdmin();
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
                <p className="text-sm text-neutral-300 font-mono">{shortenAddress(stxAddress || '', 8)}</p>
              ) : (
                <p className="text-sm text-neutral-300 font-mono">Wallet not connected</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full sm:w-auto">
            <div className="bg-neutral-50 p-3 rounded-lg text-center">
              <p className="text-xs text-neutral-300 mb-1">PXT Balance</p>
              <p className="font-semibold text-secondary">{balance?.pxt || 0} PXT</p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg text-center">
              <p className="text-xs text-neutral-300 mb-1">BTC Rewards</p>
              <p className="font-semibold text-warning">{(balance?.btc || 0).toFixed(8)}</p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg text-center">
              <p className="text-xs text-neutral-300 mb-1">KYC Status</p>
              <div className="flex items-center justify-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  kycStatus === 'completed' ? 'bg-success' :
                  kycStatus === 'pending' ? 'bg-warning' :
                  'bg-error-500'
                }`}></span>
                <p className="font-semibold text-secondary capitalize">
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
              className="bg-primary hover:bg-primary-600 text-white"
              onClick={() => setShowKycModal(true)}
            >
              Complete KYC
            </Button>
          )}
          {kycStatus === 'pending' && (
            <Button 
              variant="outline"
              disabled
              className="border-neutral-200"
            >
              KYC Under Review
            </Button>
          )}
          {connected && isAdmin && (
            <Button 
              className="bg-secondary hover:bg-secondary-600 text-white ml-4"
              onClick={() => setShowAdminKycModal(true)}
            >
              Admin: Approve KYC
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
