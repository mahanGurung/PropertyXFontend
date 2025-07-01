
import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { shortenAddress, formatCurrency } from '../lib/utils';
import { fetchNFTListings, fetchIPFSMetadata, generateMetadataCID } from '../utils/stacksIndexer';
import AssetDetailModal from '../components/ui/asset-detail-modal';

const Marketplace = () => {
  const { connected, stxAddress, callContract, getNftData, getAssetData, getMarketplaceListings, fetchIpfsMetadata } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [nftListings, setNftListings] = useState([]);
  const [userNfts, setUserNfts] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [assetDetailModal, setAssetDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [listingDetails, setListingDetails] = useState({
    price: '',
    paymentMethod: 'stx',
    expiryDays: 30,
    targetBuyer: ''
  });
  
  const CONTRACT_ADDRESS = 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E';
  const NFT_CONTRACT_NAME = 'nft';
  const MARKETPLACE_CONTRACT_NAME = 'nft-marketplace';
  
  useEffect(() => {
    if (connected) {
      loadNFTData();
    }
  }, [connected]);
  
  const loadNFTData = async () => {
    setIsLoading(true);
    
    try {
      if (!connected) {
        setNftListings([]);
        setUserNfts([]);
        setMyListings([]);
        setIsLoading(false);
        return;
      }
      
      const contractAddress = 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E';
      const nftContractName = 'nft';
      const marketplaceContractName = 'nft-marketplace';
      
      console.log('Fetching marketplace listings from the blockchain...');
      const marketplaceListings = await fetchNFTListings(contractAddress, marketplaceContractName);
      
      console.log('Processing listings and fetching IPFS metadata...');
      const processedListings = await Promise.all(
        marketplaceListings.map(async (listing) => {
          try {
            if (listing.metadata && listing.metadata.metadataCid) {
              const metadata = await fetchIPFSMetadata(listing.metadata.metadataCid);
              
              if (metadata) {
                return {
                  id: listing.id,
                  tokenId: listing.metadata.tokenId,
                  txId: listing.txId,
                  name: metadata.name || `Property Asset #${listing.metadata.tokenId}`,
                  description: metadata.description || 'Real-world asset tokenized on PropertyX Protocol',
                  assetType: metadata.properties?.assetType || 'property',
                  owner: listing.sender,
                  price: listing.metadata.price,
                  currency: 'STX',
                  imageUrl: `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80` || `https://via.placeholder.com/400x300?text=Property+Asset+${listing.metadata.tokenId}`,
                  metadataCid: listing.metadata.metadataCid,
                  location: metadata.properties?.location || 'Property Location',
                  valuation: metadata.properties?.valuation || '$500,000',
                  apr: metadata.properties?.apr || '8.5%',
                  tokenPrice: metadata.properties?.tokenPrice || '$10.00',
                  tokens: metadata.properties?.tokens || '50,000 APT',
                  createdAt: new Date(listing.timestamp),
                  documents: metadata.properties?.documents || []
                };
              }
            }
            
            return {
              id: listing.id,
              tokenId: listing.metadata?.tokenId || listing.id,
              txId: listing.txId,
              name: listing.metadata?.name || `Property Asset #${listing.id}`,
              description: listing.metadata?.description || 'Real-world asset tokenized on PropertyX Protocol',
              assetType: listing.metadata?.assetType || 'property',
              owner: listing.sender,
              price: listing.metadata?.price || 100000,
              currency: 'STX',
              imageUrl: `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`,
              valuation: '$500,000',
              apr: '8.5%',
              tokenPrice: '$10.00',
              tokens: '50,000 APT',
              createdAt: new Date(listing.timestamp)
            };
          } catch (error) {
            console.error('Error processing listing:', error);
            return null;
          }
        })
      );
      
      const validListings = processedListings.filter(listing => listing !== null);
      const userListings = validListings.filter(listing => listing.owner === stxAddress);
      const otherListings = validListings.filter(listing => listing.owner !== stxAddress);
      
      console.log('Found listings:', validListings.length);
      console.log('User listings:', userListings.length);
      console.log('Marketplace listings:', otherListings.length);
      
      console.log('Fetching user-owned NFTs...');
      const ownedNfts = [];
      
      for (let i = 1; i <= 10; i++) {
        try {
          const result = await callContract({
            contractAddress,
            contractName: nftContractName,
            functionName: 'get-owner',
            functionArgs: [i]
          });
          
          const owner = result?.value?.value?.address;
          
          if (owner === stxAddress && !userListings.some(listing => listing.tokenId === i)) {
            const metadataCid = `QmNR2n4zywCV61MeMLB6JwPueAPqhbtqMfCMKDRQftUSa${i}`;
            const metadata = await fetchIPFSMetadata(metadataCid);
            
            ownedNfts.push({
              id: i,
              tokenId: i,
              name: metadata?.name || `My Property Asset #${i}`,
              description: metadata?.description || `Tokenized real estate asset owned by you (ID: ${i})`,
              assetType: metadata?.properties?.assetType || 'property',
              owner: stxAddress,
              imageUrl: metadata?.image || `https://via.placeholder.com/400x300?text=My+Asset+${i}`,
              metadataCid: metadataCid,
              location: metadata?.properties?.location || 'Your Property Location',
              valuation: metadata?.properties?.valuation || '$500,000',
              apr: metadata?.properties?.apr || '8.5%',
              tokenPrice: metadata?.properties?.tokenPrice || '$10.00',
              tokens: metadata?.properties?.tokens || '50,000 APT',
              documents: metadata?.properties?.documents || [],
              isListed: false
            });
          }
        } catch (error) {
          console.error(`Error checking ownership for token ${i}:`, error);
        }
      }
      
      setNftListings(otherListings);
      setUserNfts(ownedNfts);
      setMyListings(userListings);
      
      console.log('Marketplace data loaded successfully');
      
    } catch (error) {
      console.error('Error loading NFT data:', error);
      toast({
        title: 'Data Loading Error',
        description: 'Failed to load marketplace data. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleListNft = (nft) => {
    setSelectedNft(nft);
    setListingDetails({
      price: '',
      paymentMethod: 'stx',
      expiryDays: 30,
      targetBuyer: ''
    });
    setShowListModal(true);
  };
  
  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setAssetDetailModal(true);
  };
  
  const handleSubmitListing = async () => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to list your NFT.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedNft) {
      toast({
        title: 'No NFT Selected',
        description: 'Please select an NFT to list in the marketplace.',
        variant: 'destructive'
      });
      return;
    }
    
    const price = parseFloat(listingDetails.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price greater than zero.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const expiryBlocks = Math.floor(144 * listingDetails.expiryDays);
      const targetBuyer = listingDetails.targetBuyer.trim() === '' ? null : listingDetails.targetBuyer;
      
      toast({
        title: 'Processing Transaction',
        description: 'Submitting your listing to the blockchain...',
        variant: 'default'
      });
      
      const listingMetadata = {
        name: selectedNft.name,
        description: selectedNft.description,
        assetType: selectedNft.assetType || 'property',
        tokenId: selectedNft.tokenId,
        price: price,
        expiryBlocks: expiryBlocks,
        paymentMethod: listingDetails.paymentMethod,
        seller: stxAddress,
        timestamp: new Date().toISOString()
      };
      
      const metadataCid = generateMetadataCID(listingMetadata);
      console.log(`Generated metadata CID for listing: ${metadataCid}`);
      
      const result = await callContract({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT_NAME,
        functionName: 'list-asset',
        functionArgs: [
          CONTRACT_ADDRESS,
          NFT_CONTRACT_NAME,
          selectedNft.tokenId,
          expiryBlocks,
          price,
          listingDetails.paymentMethod === 'stx' ? null : 'ft-contract',
          metadataCid,
          targetBuyer
        ]
      });
      
      console.log('Listing transaction result:', result);
      
      if (result && result.txId) {
        const newListing = {
          id: Date.now(),
          tokenId: selectedNft.tokenId,
          name: selectedNft.name,
          description: selectedNft.description,
          assetType: selectedNft.assetType,
          owner: stxAddress,
          price: price,
          currency: listingDetails.paymentMethod === 'stx' ? 'STX' : 'BTC',
          imageUrl: selectedNft.imageUrl,
          createdAt: new Date(),
          txId: result.txId,
          metadataCid: metadataCid,
          expiryBlocks: expiryBlocks,
          valuation: selectedNft.valuation,
          apr: selectedNft.apr,
          tokenPrice: selectedNft.tokenPrice,
          tokens: selectedNft.tokens
        };
        
        setMyListings([...myListings, newListing]);
        setUserNfts(userNfts.filter(nft => nft.id !== selectedNft.id));
        
        toast({
          title: 'NFT Listed Successfully',
          description: `Your ${selectedNft.name} has been listed on the marketplace. Transaction ID: ${result.txId.substring(0, 10)}...`,
          variant: 'default'
        });
        
        setShowListModal(false);
      } else {
        throw new Error('Contract call failed - no transaction ID returned');
      }
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast({
        title: 'Listing Failed',
        description: error.message || 'There was an error listing your NFT.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelListing = async (listing) => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to cancel your listing.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const canceledNft = {
        id: listing.id,
        tokenId: listing.tokenId,
        name: listing.name,
        description: listing.description,
        assetType: listing.assetType,
        owner: stxAddress || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        imageUrl: listing.imageUrl,
        isListed: false,
        valuation: listing.valuation,
        apr: listing.apr,
        tokenPrice: listing.tokenPrice,
        tokens: listing.tokens
      };
      
      setUserNfts([...userNfts, canceledNft]);
      setMyListings(myListings.filter(item => item.id !== listing.id));
      
      toast({
        title: 'Listing Canceled',
        description: `Your ${listing.name} has been removed from the marketplace.`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error canceling listing:', error);
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'There was an error canceling your listing.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePurchaseNft = async (listing) => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to purchase this NFT.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      toast({
        title: 'Processing Transaction',
        description: 'Sending purchase request to the blockchain...',
        variant: 'default'
      });
      
      const result = await callContract({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT_NAME,
        functionName: listing.currency === 'STX' ? 'fulfil-listing-stx' : 'fulfil-listing-ft',
        functionArgs: [
          listing.id,
          CONTRACT_ADDRESS,
          NFT_CONTRACT_NAME,
          listing.currency !== 'STX' ? 'ft-contract' : null
        ]
      });
      
      console.log('Purchase transaction result:', result);
      
      const purchasedNft = {
        id: listing.id,
        tokenId: listing.tokenId,
        name: listing.name,
        description: listing.description,
        assetType: listing.assetType,
        owner: stxAddress,
        imageUrl: listing.imageUrl,
        isListed: false,
        valuation: listing.valuation,
        apr: listing.apr,
        tokenPrice: listing.tokenPrice,
        tokens: listing.tokens
      };
      
      setUserNfts([...userNfts, purchasedNft]);
      setNftListings(nftListings.filter(item => item.id !== listing.id));
      
      toast({
        title: 'Purchase Successful',
        description: `You have successfully purchased ${listing.name}. Transaction ID: ${result.txId.substring(0, 10)}...`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'There was an error purchasing this NFT.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !nftListings.length && !userNfts.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-teal-900/20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-800 opacity-10 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-700 opacity-10 filter blur-3xl"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent mb-8">
              Marketplace
            </h1>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-neutral-300">Loading marketplace data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-teal-900/20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-800 opacity-10 filter blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-700 opacity-10 filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent mb-4">
            Marketplace
          </h1>
          <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
            Buy, sell, and manage tokenized real estate APTs representing fractional parts of properties.
          </p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full mb-8"
        >
          <TabsList className="grid grid-cols-3 max-w-xl mx-auto mb-8 bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
            <TabsTrigger 
              value="browse" 
              className={`py-3 px-4 ${activeTab === 'browse' ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-lg' : 'bg-transparent text-gray-400 hover:text-white'} rounded-md transition-all duration-300`}
            >
              <i className="fas fa-store mr-2"></i> Browse
            </TabsTrigger>
            <TabsTrigger 
              value="my-nfts" 
              className={`py-3 px-4 ${activeTab === 'my-nfts' ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-lg' : 'bg-transparent text-gray-400 hover:text-white'} rounded-md transition-all duration-300`}
            >
              <i className="fas fa-image mr-2"></i> My APTs
            </TabsTrigger>
            <TabsTrigger 
              value="my-listings" 
              className={`py-3 px-4 ${activeTab === 'my-listings' ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-lg' : 'bg-transparent text-gray-400 hover:text-white'} rounded-md transition-all duration-300`}
            >
              <i className="fas fa-tag mr-2"></i> My Listings
            </TabsTrigger>
          </TabsList>
          
          {/* Browse Marketplace Tab */}
          <TabsContent value="browse">
            {!connected ? (
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center border border-gray-700/50">
                <div className="w-16 h-16 mx-auto bg-gray-700/50 text-teal-400 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                  <i className="fas fa-wallet text-2xl"></i>
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
                <p className="text-neutral-300 mb-6">Connect your Stacks wallet to browse and purchase NFTs.</p>
                <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-teal-500/30">
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <>
                {nftListings.length === 0 ? (
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center border border-gray-700/50">
                    <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                      <i className="fas fa-store text-neutral-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-heading font-medium text-gray-100 mb-2">No Listings Available</h3>
                    <p className="text-neutral-300">There are no NFTs listed in the marketplace at this time.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nftListings.map((listing) => (
                      <div key={listing.id} className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border border-gray-700/50 hover:border-teal-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-400/10">
                        <div className="h-48 bg-gray-700 overflow-hidden">
                          <img 
                            src={listing.imageUrl} 
                            alt={listing.name}
                            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                            onClick={() => handleAssetClick(listing)}
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-heading font-semibold text-gray-100">{listing.name}</h3>
                            <div className="px-3 py-1 bg-gray-700/70 rounded-full text-xs font-medium text-neutral-300 capitalize border border-gray-600">
                              {listing.assetType}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-300 line-clamp-2 mb-4">{listing.description}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">Valuation</p>
                              <p className="text-sm font-semibold text-gray-300">{listing.valuation}</p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">Token Price</p>
                              <p className="text-sm font-semibold text-gray-300">{listing.tokenPrice}</p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">Supply</p>
                              <p className="text-sm font-semibold text-gray-300">{listing.tokens.split(' ')[0]}</p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">APR</p>
                              <p className="text-sm font-semibold bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">{listing.apr}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 mb-4">
                            <Button
                              variant="outline"
                              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-teal-400 hover:text-white"
                              onClick={() => handleAssetClick(listing)}
                            >
                              View Details
                            </Button>
                            <Button
                              className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white"
                              onClick={() => handlePurchaseNft(listing)}
                            >
                              Buy Now
                            </Button>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
                            <div className="text-xs text-neutral-400">
                              Owner: <span className="font-mono text-neutral-300">{shortenAddress(listing.owner, 4)}</span>
                            </div>
                            <div className="text-xs text-neutral-400">
                              Listed: {listing.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* My APTs Tab */}
          <TabsContent value="my-nfts">
            {!connected ? (
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center border border-gray-700/50">
                <div className="w-16 h-16 mx-auto bg-gray-700/50 text-teal-400 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                  <i className="fas fa-wallet text-2xl"></i>
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
                <p className="text-neutral-300 mb-6">Connect your Stacks wallet to view your APTs.</p>
                <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-teal-500/30">
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <>
                {userNfts.length === 0 ? (
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center border border-gray-700/50">
                    <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                      <i className="fas fa-image text-neutral-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-heading font-medium text-gray-100 mb-2">No APTs Found</h3>
                    <p className="text-neutral-300 mb-6">You don't own any property APTs yet.</p>
                    <Button 
                      className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-teal-500/30"
                      onClick={() => setActiveTab('browse')}
                    >
                      Explore Marketplace
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userNfts.map((nft) => (
                      <div key={nft.id} className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border border-gray-700/50 hover:border-teal-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-400/10">
                        <div className="h-48 bg-gray-700 overflow-hidden">
                          <img 
                            src={nft.imageUrl} 
                            alt={nft.name}
                            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                            onClick={() => handleAssetClick(nft)}
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-heading font-semibold text-gray-100">{nft.name}</h3>
                            <div className="px-3 py-1 bg-gray-700/70 rounded-full text-xs font-medium text-neutral-300 capitalize border border-gray-600">
                              {nft.assetType}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-300 line-clamp-2 mb-4">{nft.description}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">Valuation</p>
                              <p className="text-sm font-semibold text-gray-300">{nft.valuation}</p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">Token Price</p>
                              <p className="text-sm font-semibold text-gray-300">{nft.tokenPrice}</p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">Supply</p>
                              <p className="text-sm font-semibold text-gray-300">{nft.tokens.split(' ')[0]}</p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">APR</p>
                              <p className="text-sm font-semibold bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">{nft.apr}</p>
                            </div>
                          </div>
                          
                          <Button
                            className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white transition-all duration-300 shadow-lg hover:shadow-teal-500/30"
                            onClick={() => handleListNft(nft)}
                          >
                            List for Sale
                          </Button>
                          
                          <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
                            <div className="text-xs text-neutral-400">
                              Token ID: <span className="font-mono text-neutral-300">{nft.tokenId}</span>
                            </div>
                            <div className="text-xs text-neutral-400">
                              {nft.isListed ? 'Listed' : 'Not Listed'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* My Listings Tab */}
          <TabsContent value="my-listings">
            {!connected ? (
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center border border-gray-700/50">
                <div className="w-16 h-16 mx-auto bg-gray-700/50 text-teal-400 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                  <i className="fas fa-wallet text-2xl"></i>
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
                <p className="text-neutral-300 mb-6">Connect your Stacks wallet to view your listings.</p>
                <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-teal-500/30">
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <>
                {myListings.length === 0 ? (
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center border border-gray-700/50">
                    <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4 border border-gray-600">
                      <i className="fas fa-tag text-neutral-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-heading font-medium text-gray-100 mb-2">No Active Listings</h3>
                    <p className="text-neutral-300 mb-6">You don't have any active listings. List your APTs to sell them.</p>
                    <Button 
                      className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-teal-500/30"
                      onClick={() => setActiveTab('my-nfts')}
                    >
                      Go to My APTs
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map((listing) => (
                      <div key={listing.id} className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border border-gray-700/50 hover:border-teal-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-400/10">
                        <div className="h-48 bg-gray-700 overflow-hidden">
                          <img 
                            src={listing.imageUrl} 
                            alt={listing.name}
                            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                            onClick={() => handleAssetClick(listing)}
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-heading font-semibold text-gray-100">{listing.name}</h3>
                            <div className="px-3 py-1 bg-gray-700/70 rounded-full text-xs font-medium text-neutral-300 capitalize border border-gray-600">
                              {listing.assetType}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-300 line-clamp-2 mb-4">{listing.description}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">Valuation</p>
                              <p className="text-sm font-semibold text-gray-300">{listing.valuation}</p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">List Price</p>
                              <p className="text-sm font-semibold bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
                                {listing.price.toLocaleString()} {listing.currency}
                              </p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">Supply</p>
                              <p className="text-sm font-semibold text-gray-300">{listing.tokens.split(' ')[0]}</p>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                              <p className="text-xs text-neutral-400">APR</p>
                              <p className="text-sm font-semibold bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">{listing.apr}</p>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            className="w-full border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400"
                            onClick={() => handleCancelListing(listing)}
                          >
                            Cancel Listing
                          </Button>
                          
                          <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
                            <div className="text-xs text-neutral-400">
                              Token ID: <span className="font-mono text-neutral-300">{listing.tokenId}</span>
                            </div>
                            <div className="text-xs text-neutral-400">
                              Listed: {listing.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        
        {/* List NFT Modal */}
        <Dialog open={showListModal} onOpenChange={setShowListModal}>
          <DialogContent className="sm:max-w-[500px] bg-gray-800/90 backdrop-blur-sm border-gray-700/50 text-gray-100">
            <DialogHeader>
              <DialogTitle className="text-gray-100 font-heading">List NFT for Sale</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Set the price and terms for listing your NFT on the marketplace.
              </DialogDescription>
            </DialogHeader>
            
            {selectedNft && (
              <div className="py-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600">
                    <img 
                      src={selectedNft.imageUrl} 
                      alt={selectedNft.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">{selectedNft.name}</h3>
                    <p className="text-xs text-neutral-400">Token ID: {selectedNft.tokenId}</p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="listing-price" className="block text-sm font-medium text-neutral-400 mb-1">Listing Price</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <Input
                        type="number"
                        id="listing-price"
                        value={listingDetails.price}
                        onChange={(e) => setListingDetails({...listingDetails, price: e.target.value})}
                        className="pr-16 block w-full bg-gray-700/70 border-gray-600 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <Select 
                          value={listingDetails.paymentMethod} 
                          onValueChange={(v) => setListingDetails({...listingDetails, paymentMethod: v})}
                        >
                          <SelectTrigger className="bg-gray-700/70 border-gray-600 text-gray-100 pr-3 text-sm w-[70px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                            <SelectItem value="stx" className="hover:bg-gray-700">STX</SelectItem>
                            <SelectItem value="btc" className="hover:bg-gray-700">BTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="expiry-days" className="block text-sm font-medium text-neutral-400 mb-1">Listing Duration</label>
                    <Select 
                      value={listingDetails.expiryDays.toString()} 
                      onValueChange={(v) => setListingDetails({...listingDetails, expiryDays: parseInt(v)})}
                    >
                      <SelectTrigger className="w-full bg-gray-700/70 border-gray-600 text-gray-100 focus:ring-teal-500 focus:border-teal-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                        <SelectItem value="7" className="hover:bg-gray-700">7 Days</SelectItem>
                        <SelectItem value="14" className="hover:bg-gray-700">14 Days</SelectItem>
                        <SelectItem value="30" className="hover:bg-gray-700">30 Days</SelectItem>
                        <SelectItem value="60" className="hover:bg-gray-700">60 Days</SelectItem>
                        <SelectItem value="90" className="hover:bg-gray-700">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="target-buyer" className="block text-sm font-medium text-neutral-400 mb-1">
                      Target Buyer (Optional)
                    </label>
                    <Input
                      type="text"
                      id="target-buyer"
                      value={listingDetails.targetBuyer}
                      onChange={(e) => setListingDetails({...listingDetails, targetBuyer: e.target.value})}
                      className="block w-full bg-gray-700/70 border-gray-600 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Stacks address (leave empty for public listing)"
                    />
                    <p className="mt-1 text-xs text-neutral-400">
                      If specified, only this address will be able to purchase your NFT.
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-md mt-6 border border-gray-600/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Marketplace Fee (2.5%)</span>
                    <span className="text-sm font-medium text-gray-300">
                      {listingDetails.price ? 
                        `${(parseFloat(listingDetails.price) * 0.025).toFixed(2)} ${listingDetails.paymentMethod.toUpperCase()}` : 
                        '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-600">
                    <span className="text-sm font-medium text-neutral-400">You Receive</span>
                    <span className="text-sm font-medium bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
                      {listingDetails.price ? 
                        `${(parseFloat(listingDetails.price) * 0.975).toFixed(2)} ${listingDetails.paymentMethod.toUpperCase()}` : 
                        '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-teal-400" 
                onClick={() => setShowListModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white" 
                onClick={handleSubmitListing}
                disabled={isLoading || !listingDetails.price}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
                  </>
                ) : 'List NFT'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Asset Detail Modal */}
        <AssetDetailModal 
          open={assetDetailModal} 
          onOpenChange={setAssetDetailModal} 
          asset={selectedAsset} 
        />
      </div>
    </div>
  );
};

export default Marketplace;
