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
        // If not connected, load empty data
        setNftListings([]);
        setUserNfts([]);
        setMyListings([]);
        setIsLoading(false);
        return;
      }
      
      // Contract information from the provided smart contract
      const contractAddress = 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E';
      const nftContractName = 'nft';
      const marketplaceContractName = 'nft-marketplace';
      
      // Fetch marketplace listings using Stacks.js indexer
      console.log('Fetching marketplace listings from the blockchain...');
      const marketplaceListings = await fetchNFTListings(contractAddress, marketplaceContractName);
      
      // Process listings and fetch metadata from IPFS
      console.log('Processing listings and fetching IPFS metadata...');
      const processedListings = await Promise.all(
        marketplaceListings.map(async (listing) => {
          try {
            // Fetch metadata from IPFS if available
            if (listing.metadata && listing.metadata.metadataCid) {
              const metadata = await fetchIPFSMetadata(listing.metadata.metadataCid);
              
              if (metadata) {
                // Return enhanced listing with IPFS metadata
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
                  imageUrl: metadata.image || `https://via.placeholder.com/400x300?text=Property+Asset+${listing.metadata.tokenId}`,
                  metadataCid: listing.metadata.metadataCid,
                  location: metadata.properties?.location || 'Property Location',
                  createdAt: new Date(listing.timestamp),
                  documents: metadata.properties?.documents || []
                };
              }
            }
            
            // Fallback if no IPFS metadata found
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
              imageUrl: `https://via.placeholder.com/400x300?text=Property+Asset+${listing.id}`,
              createdAt: new Date(listing.timestamp)
            };
          } catch (error) {
            console.error('Error processing listing:', error);
            return null;
          }
        })
      );
      
      // Filter out any failed entries
      const validListings = processedListings.filter(listing => listing !== null);
      
      // Separate listings that belong to the current user
      const userListings = validListings.filter(listing => listing.owner === stxAddress);
      const otherListings = validListings.filter(listing => listing.owner !== stxAddress);
      
      console.log('Found listings:', validListings.length);
      console.log('User listings:', userListings.length);
      console.log('Marketplace listings:', otherListings.length);
      
      // Get user's owned NFTs that are not listed
      // Call the NFT contract to find tokens owned by the current user
      console.log('Fetching user-owned NFTs...');
      const ownedNfts = [];
      
      // Simulate fetching owned NFTs by querying tokens 1-10
      // In a real implementation, we would query the contract
      for (let i = 1; i <= 10; i++) {
        try {
          // Call get-owner function from the NFT contract for each tokenId
          const result = await callContract({
            contractAddress,
            contractName: nftContractName,
            functionName: 'get-owner',
            functionArgs: [i]
          });
          
          // Check if the current user is the owner
          const owner = result?.value?.value?.address;
          
          if (owner === stxAddress && !userListings.some(listing => listing.tokenId === i)) {
            // Get metadata for this NFT from IPFS
            // First generate a CID to demonstrate what a real implementation would use
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
              documents: metadata?.properties?.documents || [],
              isListed: false
            });
          }
        } catch (error) {
          console.error(`Error checking ownership for token ${i}:`, error);
        }
      }
      
      // Update state with the fetched data
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
      
      // Calculate expiry in block height (approximate blocks per day * days)
      const expiryBlocks = Math.floor(144 * listingDetails.expiryDays);
      
      // Prepare target buyer parameter (if specified)
      const targetBuyer = listingDetails.targetBuyer.trim() === '' ? null : listingDetails.targetBuyer;
      
      // Notify user transaction is being processed
      toast({
        title: 'Processing Transaction',
        description: 'Submitting your listing to the blockchain...',
        variant: 'default'
      });
      
      // Generate a metadata CID for the listing
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
      
      // Call the list-asset function in the nft-marketplace contract
      const result = await callContract({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT_NAME,
        functionName: 'list-asset',
        functionArgs: [
          CONTRACT_ADDRESS, // Contract where NFT is deployed
          NFT_CONTRACT_NAME, // NFT contract name
          selectedNft.tokenId, // Token ID
          expiryBlocks, // Expiry in blocks
          price, // Price in STX
          listingDetails.paymentMethod === 'stx' ? null : 'ft-contract', // Payment token if not STX
          metadataCid, // IPFS CID for metadata
          targetBuyer // Optional target buyer (only they can buy)
        ]
      });
      
      console.log('Listing transaction result:', result);
      
      if (result && result.txId) {
        // Create a new listing object
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
          expiryBlocks: expiryBlocks
        };
        
        // Update UI state with the new listing
        setMyListings([...myListings, newListing]);
        
        // Remove from owned NFTs
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
      
      // This would be the actual call to the smart contract in a real implementation
      /*
      const result = await callContract({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT_NAME,
        functionName: 'cancel-listing',
        functionArgs: [
          listing.id,
          CONTRACT_ADDRESS,
          NFT_CONTRACT_NAME
        ]
      });
      */
      
      // Simulate success
      const canceledNft = {
        id: listing.id,
        tokenId: listing.tokenId,
        name: listing.name,
        description: listing.description,
        assetType: listing.assetType,
        owner: stxAddress || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        imageUrl: listing.imageUrl,
        isListed: false
      };
      
      // Update UI state
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
      
      // Notify the user that we're processing the transaction
      toast({
        title: 'Processing Transaction',
        description: 'Sending purchase request to the blockchain...',
        variant: 'default'
      });
      
      // Make the actual call to the smart contract
      const result = await callContract({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT_NAME,
        functionName: listing.currency === 'STX' ? 'fulfil-listing-stx' : 'fulfil-listing-ft',
        functionArgs: [
          listing.id,
          CONTRACT_ADDRESS,
          NFT_CONTRACT_NAME,
          listing.currency !== 'STX' ? 'ft-contract' : null // payment token contract if not STX
        ]
      });
      
      // Show transaction details
      console.log('Purchase transaction result:', result);
      
      // The NFT is now owned by the user
      const purchasedNft = {
        id: listing.id,
        tokenId: listing.tokenId,
        name: listing.name,
        description: listing.description,
        assetType: listing.assetType,
        owner: stxAddress,
        imageUrl: listing.imageUrl,
        isListed: false
      };
      
      // Update UI state
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
  
  // Render loading state
  if (isLoading && !nftListings.length && !userNfts.length) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-secondary mb-8">NFT Marketplace</h1>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-neutral-300">Loading marketplace data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">NFT Marketplace</h1>
        <p className="mt-4 text-lg text-neutral-300 max-w-3xl mx-auto">
          Buy, sell, and manage tokenized real estate NFTs representing fractional ownership of properties.
        </p>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full mb-8"
      >
        <TabsList className="grid grid-cols-3 max-w-xl mx-auto mb-8">
          <TabsTrigger 
            value="browse" 
            className={`py-2 px-4 ${activeTab === 'browse' ? 'bg-primary text-white' : 'bg-white text-neutral-400'} rounded-l-lg`}
          >
            Browse Marketplace
          </TabsTrigger>
          <TabsTrigger 
            value="my-nfts" 
            className={`py-2 px-4 ${activeTab === 'my-nfts' ? 'bg-primary text-white' : 'bg-white text-neutral-400'}`}
          >
            My NFTs
          </TabsTrigger>
          <TabsTrigger 
            value="my-listings" 
            className={`py-2 px-4 ${activeTab === 'my-listings' ? 'bg-primary text-white' : 'bg-white text-neutral-400'} rounded-r-lg`}
          >
            My Listings
          </TabsTrigger>
        </TabsList>
        
        {/* Browse Marketplace Tab */}
        <TabsContent value="browse">
          {!connected ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-heading font-semibold text-secondary mb-2">Connect Your Wallet</h3>
              <p className="text-neutral-300 mb-6">Connect your Stacks wallet to browse and purchase NFTs.</p>
              <Button className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              {nftListings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-store text-neutral-300 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-heading font-medium text-secondary mb-2">No Listings Available</h3>
                  <p className="text-neutral-300">There are no NFTs listed in the marketplace at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nftListings.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-neutral-100 overflow-hidden">
                        <img 
                          src={listing.imageUrl} 
                          alt={listing.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-heading font-semibold text-secondary">{listing.name}</h3>
                          <div className="px-2 py-1 bg-neutral-100 rounded text-xs font-medium text-neutral-500 capitalize">
                            {listing.assetType}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-neutral-300 line-clamp-2">{listing.description}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-neutral-400">Price</p>
                            <p className="text-lg font-semibold text-accent">
                              {listing.price.toLocaleString()} {listing.currency}
                            </p>
                          </div>
                          <Button 
                            className="bg-primary hover:bg-primary-600 text-white"
                            onClick={() => handlePurchaseNft(listing)}
                          >
                            Buy Now
                          </Button>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center">
                          <div className="text-xs text-neutral-400">
                            Owner: <span className="font-mono">{shortenAddress(listing.owner, 4)}</span>
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
        
        {/* My NFTs Tab */}
        <TabsContent value="my-nfts">
          {!connected ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-heading font-semibold text-secondary mb-2">Connect Your Wallet</h3>
              <p className="text-neutral-300 mb-6">Connect your Stacks wallet to view your NFTs.</p>
              <Button className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              {userNfts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-image text-neutral-300 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-heading font-medium text-secondary mb-2">No NFTs Found</h3>
                  <p className="text-neutral-300 mb-6">You don't own any property NFTs yet.</p>
                  <Button className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                    Explore Marketplace
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNfts.map((nft) => (
                    <div key={nft.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-neutral-100 overflow-hidden">
                        <img 
                          src={nft.imageUrl} 
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-heading font-semibold text-secondary">{nft.name}</h3>
                          <div className="px-2 py-1 bg-neutral-100 rounded text-xs font-medium text-neutral-500 capitalize">
                            {nft.assetType}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-neutral-300 line-clamp-2">{nft.description}</p>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            className="bg-primary hover:bg-primary-600 text-white"
                            onClick={() => handleListNft(nft)}
                          >
                            List for Sale
                          </Button>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center">
                          <div className="text-xs text-neutral-400">
                            Token ID: <span className="font-mono">{nft.tokenId}</span>
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
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-heading font-semibold text-secondary mb-2">Connect Your Wallet</h3>
              <p className="text-neutral-300 mb-6">Connect your Stacks wallet to view your listings.</p>
              <Button className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              {myListings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-tag text-neutral-300 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-heading font-medium text-secondary mb-2">No Active Listings</h3>
                  <p className="text-neutral-300 mb-6">You don't have any active listings. List your NFTs to sell them.</p>
                  <Button 
                    className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition"
                    onClick={() => setActiveTab('my-nfts')}
                  >
                    Go to My NFTs
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-neutral-100 overflow-hidden">
                        <img 
                          src={listing.imageUrl} 
                          alt={listing.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-heading font-semibold text-secondary">{listing.name}</h3>
                          <div className="px-2 py-1 bg-neutral-100 rounded text-xs font-medium text-neutral-500 capitalize">
                            {listing.assetType}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-neutral-300 line-clamp-2">{listing.description}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-neutral-400">Listed Price</p>
                            <p className="text-lg font-semibold text-accent">
                              {listing.price.toLocaleString()} {listing.currency}
                            </p>
                          </div>
                          <Button 
                            variant="outline"
                            className="border-error-500 text-error-500 hover:bg-error-50"
                            onClick={() => handleCancelListing(listing)}
                          >
                            Cancel Listing
                          </Button>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center">
                          <div className="text-xs text-neutral-400">
                            Token ID: <span className="font-mono">{listing.tokenId}</span>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>List NFT for Sale</DialogTitle>
            <DialogDescription>
              Set the price and terms for listing your NFT on the marketplace.
            </DialogDescription>
          </DialogHeader>
          
          {selectedNft && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden">
                  <img 
                    src={selectedNft.imageUrl} 
                    alt={selectedNft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-secondary">{selectedNft.name}</h3>
                  <p className="text-xs text-neutral-300">Token ID: {selectedNft.tokenId}</p>
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
                      className="pr-16 block w-full border-neutral-200"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <Select 
                        value={listingDetails.paymentMethod} 
                        onValueChange={(v) => setListingDetails({...listingDetails, paymentMethod: v})}
                      >
                        <SelectTrigger className="bg-transparent border-0 pr-3 text-sm w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stx">STX</SelectItem>
                          <SelectItem value="btc">BTC</SelectItem>
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
                    <SelectTrigger className="w-full border-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
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
                    className="block w-full border-neutral-200"
                    placeholder="Stacks address (leave empty for public listing)"
                  />
                  <p className="mt-1 text-xs text-neutral-300">
                    If specified, only this address will be able to purchase your NFT.
                  </p>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-md mt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-300">Marketplace Fee (2.5%)</span>
                  <span className="text-sm font-medium">
                    {listingDetails.price ? 
                      `${(parseFloat(listingDetails.price) * 0.025).toFixed(2)} ${listingDetails.paymentMethod.toUpperCase()}` : 
                      '0.00'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <span className="text-sm font-medium text-neutral-400">You Receive</span>
                  <span className="text-sm font-medium text-secondary">
                    {listingDetails.price ? 
                      `${(parseFloat(listingDetails.price) * 0.975).toFixed(2)} ${listingDetails.paymentMethod.toUpperCase()}` : 
                      '0.00'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowListModal(false)}>Cancel</Button>
            <Button 
              className="bg-primary text-white hover:bg-primary-600" 
              onClick={handleSubmitListing}
              disabled={isLoading || !listingDetails.price}
            >
              {isLoading ? 'Processing...' : 'List NFT'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;