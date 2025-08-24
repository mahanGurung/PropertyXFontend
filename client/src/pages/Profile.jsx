import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { shortenAddress } from '../lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Cl } from '@stacks/transactions';
import { request, connect } from '@stacks/connect'; // Import connect, disconnect, getLocalStorage
import AdminTab from '../components/ui/AdminTab';
import { useQuery } from '@tanstack/react-query';
import { fetchUserApts } from '../utils/stacksMarketplace';

const Profile = () => {
  const { connected, stxAddress, balance, callContract, isContractAdmin } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('assets');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [stakingDetails, setStakingDetails] = useState({
    amount: '',
    duration: 30,
  });
  const [showTokenizeRequestModal, setShowTokenizeRequestModal] = useState(false);
  const [tokenizationRequest, setTokenizationRequest] = useState({
    contractAddress: '',
    information: '',
  });


  useEffect(() => {
    const checkAdminStatus = async () => {
      if (connected) {
        const status = await isContractAdmin();
        setIsAdmin(status);
      }
    };
    checkAdminStatus();
  }, [connected, isContractAdmin]);

  const { data: userApts, isLoading: isLoadingApts } = useQuery({
    queryKey: ['userApts', stxAddress],
    queryFn: () => fetchUserApts(stxAddress, toast),
    enabled: !!stxAddress,
  });

  const handleStakeApt = (apt) => {
    setSelectedApt(apt);
    setStakingDetails({ amount: '', duration: 30 });
    setShowStakeModal(true);
  };

  const handleStakeSubmit = async () => {
    if (!stakingDetails.amount || stakingDetails.amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to stake.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedApt) {
      toast({
        title: 'No Asset Selected',
        description: 'Please select an asset to stake.',
        variant: 'destructive'
      });
      return;
    }

    const assetData = selectedApt.imageUrl?.asset || selectedApt;
    const assetDataAll = selectedApt;
    console.log("asset data: ", assetData)
    console.log("asset data all: ", assetDataAll)

    const tokenContractAddress = selectedApt.token.split('::')[0];
    
    if (tokenContractAddress === 'ST388W712B8F7BKQG4G6QHD2K9P9SKBRD9FHQY8DG.testcoin') {
      toast({
        title: 'Staking Not Allowed',
        description: 'This asset cannot be staked.',
        variant: 'destructive'
      });
      setShowStakeModal(false);
      return;
    }

    const [contractAddress, contractName] = tokenContractAddress.split('.');
    const functionName = `lock-${assetDataAll.symbol}`;
    const amount = parseInt(stakingDetails.amount, 10) * 1000000; // Assuming 8 decimal places

    console.log("contract address:", contractAddress)
    console.log("contract name:", contractName)
    console.log("funtionName", functionName)


    try {
      const blockHeightResponse = await fetch('https://api.testnet.hiro.so/extended');
      const blockInfo = await blockHeightResponse.json();
      console.log("blockInfo", blockInfo);
      const currentBlockHeight = blockInfo.chain_tip.block_height;
      console.log("currentBlockHeight", currentBlockHeight);

      const finalDuration = currentBlockHeight + stakingDetails.duration;

      console.log("final Duration: ", finalDuration);
      


      await request("stx_callContract", {
        contract: `${contractAddress}.${contractName}`,
        functionName: functionName,
        functionArgs: [
          Cl.uint(amount),
          Cl.uint(finalDuration)
        ],
        network: "testnet",
        postConditionMode: 'allow'
      });

      toast({
        title: 'Staking Successful',
        description: `Successfully staked ${stakingDetails.amount} of ${assetData.name}.`,
        variant: 'default'
      });

      setShowStakeModal(false);
      window.location.reload();

    } catch (error) {
      console.error('Error staking asset:', error);
      toast({
        title: 'Staking Failed',
        description: error.message || 'There was an error staking your asset.',
        variant: 'destructive'
      });
    }
  };

  const handleTokenizationRequestSubmit = () => {
    const { contractAddress, information } = tokenizationRequest;
    if (!contractAddress) {
      toast({
        title: 'Contract Address Required',
        description: 'Please enter the asset contract address.',
        variant: 'destructive',
      });
      return;
    }

    const email = 'mahandaipatrick@gmail.com'; // Replace with the actual recipient
    const subject = 'New Tokenization Request';
    const body = `
A new tokenization request has been submitted from the PropertyX platform.

User STX Address: ${stxAddress}
Asset Contract Address: ${contractAddress}

Additional Information:
${information}
    `;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;

    setShowTokenizeRequestModal(false);
    setTokenizationRequest({ contractAddress: '', information: '' });
    toast({
      title: 'Email Client Opened',
      description: 'Please complete and send the email to submit your request.',
    });
  };

  // Handle wallet connection for the deployer
  const handleConnect = async () => {
    try {
      await connect({
        appDetails: {
          name: 'PropertyX',
          icon: window.location.origin + '/logo.png',
        },
      });
      // The useWallet context should update 'connected' and 'stxAddress'
    } catch (err) {
      toast({
        title: "Connection Error",
        description: err.message || "Failed to connect wallet.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900/80 to-gray-900/50 min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-6 mb-8 border border-gray-700/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-teal-300 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
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
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 p-3 rounded-lg text-center border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-1">PXT Balance</p>
              <p className="font-semibold text-teal-300">{(balance.pxt / 1000000)} PXT</p>
            </div>
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 p-3 rounded-lg text-center border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-1">Assets Tokenized</p>
              <p className="font-semibold text-teal-300">0</p>
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
        <TabsList className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} max-w-md mb-6 bg-gray-800/80 border border-gray-700 rounded-lg p-1`}>
          <TabsTrigger
            value="assets"
            className={`py-4 px-4 relative font-medium text-sm ${
              activeTab === 'assets' ?
                'bg-gradient-to-r from-teal-500 to-purple-600 text-white' :
                'text-gray-300 hover:text-gray-100'
            } rounded-md transition-all duration-300`}
          >
            <i className="fas fa-building mr-2"></i> My Assets
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="admin"
              className={`py-4 px-4 relative font-medium text-sm ${
                activeTab === 'admin' ?
                  'bg-gradient-to-r from-teal-500 to-purple-600 text-white' :
                  'text-gray-300 hover:text-gray-100'
              } rounded-md transition-all duration-300`}
            >
              <i className="fas fa-user-shield mr-2"></i> Admin
            </TabsTrigger>
          )}
        </TabsList>

        {/* My Assets Tab */}
        <TabsContent value="assets">
          {!connected ? (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 text-center border border-gray-700/30">
              <div className="w-16 h-16 mx-auto bg-gray-800/50 text-teal-300 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-6">Connect your Stacks wallet to view your tokenized assets and investments.</p>
              <Button onClick={handleConnect} className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-teal-500/30">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30">
              <div className="p-6 border-b border-gray-700/30">
                <h3 className="font-semibold text-gray-100">Your Tokenized Assets</h3>
              </div>

              <div className="p-6">
                {isLoadingApts ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-teal-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-300">Loading your APTs...</p>
                  </div>
                ) : userApts && userApts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userApts.map((apt, index) => {
                      const assetData = apt.imageUrl?.asset || apt;
                      return (
                      <div key={index} className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-teal-500/20">
                        <div className="p-4 flex items-center">
                          <img 
                            src={assetData.image || `https://via.placeholder.com/400x300?text=${assetData.name || 'No Image'}`}
                            alt={assetData.name ?? 'unknown'}
                            className="w-24 h-24 object-cover cursor-pointer rounded-lg mr-4"
                            loading='lazy'
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-100">{assetData.name ?? 'unknown'}</h3>
                            <p className="text-xs text-gray-400">{assetData.symbol}</p>
                            <div className="mt-4 grid grid-cols-3 gap-4 mb-4">
                              <div> 
                                <p className="text-xs text-gray-400">Balance</p>
                                <p className="text-sm font-semibold text-teal-300">{apt.balance / 1000000}</p>
                              </div>
                              <div> 
                                <p className="text-xs text-gray-400">Staked</p>
                                <p className="text-sm font-semibold text-teal-300">{apt.stakedAmount}</p>
                              </div>
                              <div> 
                                <p className="text-xs text-gray-400">Unlock At Block</p>
                                <p className="text-sm font-semibold text-teal-300">{apt.UnlockTime}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white transition-all duration-300 hover:shadow-teal-500/30"
                                onClick={() => handleStakeApt(apt)}
                                disabled={apt.token.split('::')[0] === 'ST388W712B8F7BKQG4G6QHD2K9P9SKBRD9FHQY8DG.testcoin'}
                              >
                                Stake APT
                              </Button>
                            </div>
                            {apt.token.split('::')[0] === 'ST388W712B8F7BKQG4G6QHD2K9P9SKBRD9FHQY8DG.testcoin' && (
                                <p className="text-sm text-red-400 mt-2 text-center">Can't be staked</p>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-700/30 flex justify-between items-center">
                                <div className="text-xs text-gray-400">
                                    Token: <span className="font-mono">{apt.token}</span>
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-file-signature text-xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-100 mb-2">No Assets Found</h3>
                    <p className="text-gray-300 mb-6">You don't own any APTs yet. Have an asset you'd like to tokenize? Submit a request to get started.</p>
                    <Button
                      onClick={() => setShowTokenizeRequestModal(true)}
                      className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-teal-500/30"
                    >
                      Make a Request
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        
        {isAdmin && (
          <TabsContent value="admin">
            <AdminTab />
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showTokenizeRequestModal} onOpenChange={setShowTokenizeRequestModal}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">Request for Tokenization</DialogTitle>
            <DialogDescription className="text-gray-400">
              Provide the contract address of your tokenized asset and any other information. We will review your request via email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid gap-4">
            <div>
              <Label htmlFor="contract-address" className="block text-sm font-medium text-gray-400 mb-1">
                Tokenized Asset Contract
              </Label>
              <Input
                id="contract-address"
                value={tokenizationRequest.contractAddress}
                onChange={(e) => setTokenizationRequest({ ...tokenizationRequest, contractAddress: e.target.value })}
                className="bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300"
                placeholder="e.g., SP... "
              />
            </div>
            <div>
              <Label htmlFor="information" className="block text-sm font-medium text-gray-400 mb-1">
                Additional Information
              </Label>
              <Textarea
                id="information"
                value={tokenizationRequest.information}
                onChange={(e) => setTokenizationRequest({ ...tokenizationRequest, information: e.target.value })}
                className="bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300"
                placeholder="Provide any details about your asset, links, etc."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50 transition-all duration-300" 
              onClick={() => setShowTokenizeRequestModal(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white transition-all duration-300 hover:shadow-teal-500/30" 
              onClick={handleTokenizationRequestSubmit}
              disabled={!tokenizationRequest.contractAddress}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStakeModal} onOpenChange={setShowStakeModal}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">Stake Your APT</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose the amount and duration for staking your Asset-backed Property Token.
            </DialogDescription>
          </DialogHeader>

          {selectedApt && (() => {
            const assetData = selectedApt.imageUrl?.asset || selectedApt;
            return (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
                  <img 
                    src={assetData.image || `https://via.placeholder.com/400x300?text=${assetData.name || 'No Image'}`}
                    alt={assetData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">{assetData.name}</h3>
                  <p className="text-xs text-gray-400">{assetData.symbol}</p>
                  <p className="text-xs text-gray-400">Balance: {selectedApt.balance}</p>
                </div>
              </div>
              <div className="grid gap-4 mb-6">
                {assetData.description && <p className="text-sm text-gray-400">{assetData.description}</p>}
                <div className="grid grid-cols-2 gap-4">
                  {assetData.location && <div><p className="text-sm font-medium text-gray-400">Location</p><p className="text-lg font-semibold text-gray-100">{assetData.location}</p></div>}
                  {assetData.valuation && <div><p className="text-sm font-medium text-gray-400">Valuation</p><p className="text-lg font-semibold text-gray-100">{assetData.valuation}</p></div>}
                  {assetData.apr && <div><p className="text-sm font-medium text-gray-400">APR</p><p className="text-lg font-semibold text-gray-100">{assetData.apr}</p></div>}
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label htmlFor="staking-amount" className="block text-sm font-medium text-gray-400 mb-1">Staking Amount</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <Input
                      type="number"
                      id="staking-amount"
                      value={stakingDetails.amount}
                      onChange={(e) => setStakingDetails({...stakingDetails, amount: e.target.value})}
                      className="pr-16 block w-full bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="staking-duration" className="block text-sm font-medium text-gray-400 mb-1">Staking Duration</label>
                  <Select 
                    value={stakingDetails.duration.toString()} 
                    onValueChange={(v) => setStakingDetails({...stakingDetails, duration: parseInt(v)})}
                  >
                    <SelectTrigger className="w-full bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectItem value="89689">30 Days</SelectItem>
                      <SelectItem value="179377">60 Days</SelectItem>
                      <SelectItem value="269066">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )})()}

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50 transition-all duration-300" 
              onClick={() => setShowStakeModal(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white transition-all duration-300 hover:shadow-teal-500/30" 
              onClick={handleStakeSubmit}
              disabled={!stakingDetails.amount}
            >
              Stake Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;