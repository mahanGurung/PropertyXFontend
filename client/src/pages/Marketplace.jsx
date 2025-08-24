import { useState, useEffect } from 'react';
import { useQuery, QueryClient } from '@tanstack/react-query';

// Initialize QueryClient outside the component to prevent re-initialization
// In a real application, this should be done once at the root (e.g., in main.jsx or App.jsx)
// and provided via QueryClientProvider.

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
import assets from '../data/asset-data.js';
import axios from 'axios';
import { fetchCallReadOnlyFunction, fetchContractMapEntry, uintCV, principalCV, Cl } from '@stacks/transactions';
import { request, openContractCall } from '@stacks/connect';


const Marketplace = () => {
  const { connected, stxAddress, callContract, getNftData, getAssetData, getMarketplaceListings, fetchIpfsMetadata, openContractCall } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [assetDetailModal, setAssetDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isloading, setIsLoading] = useState(null);
  const [listingDetails, setListingDetails] = useState({
    price: '',
    amount: '',
    ftAssetContract: '',
    paymentAssetContract: '',
    expiryDays: 30,
    targetBuyer: ''
  });

  const CONTRACT_ADDRESS = 'ST1JG6WDA1B4PZD8JZY95RPNKFFF5YKPV57BHPC9G';


  const MARKETPLACE_CONTRACT_NAME = 'marketplace';
  const MARKETPLACE_CONTRACT_NAME_FULFILL = 'marketplace-fulfill';

  const getFtImageUrl = async (ftContractAddress, ftContractName) => {
      try {
        const options = {
          contractAddress: ftContractAddress,
          contractName: ftContractName,
          functionName: "get-token-uri",
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
          network: "testnet"
        };

        const response = await fetchCallReadOnlyFunction(options);
        console.log('Ft url: ', response)
        const url = response.value.value.value;
        const axiosResponse = await axios.get(url);
        console.log('ft image axiosResponse: ', axiosResponse)
        return axiosResponse.data; // This should be the image URL or an object containing it
      } catch (e) {
        console.error("Get Ft image error: ", e);
        return null;
      }
  }

  const getTokenName = async (ftContractAddress, ftContractName) => {
    try {
      const options = {
        contractAddress: ftContractAddress,
        contractName: ftContractName,
        functionName: "get-name",
        functionArgs: [],
        senderAddress: stxAddress,
        network: "testnet"
      };

      const response = await fetchCallReadOnlyFunction(options);
      return response.value.value;
    } catch (e) {
      console.error("Get token name error: ", e);
      return null;
    }
  }

  const getTokenSymbol = async (ftContractAddress, ftContractName) => {
    try {
      const options = {
        contractAddress: ftContractAddress,
        contractName: ftContractName,
        functionName: "get-symbol",
        functionArgs: [],
        senderAddress: stxAddress,
        network: "testnet"
      };

      const response = await fetchCallReadOnlyFunction(options);
      return response.value.value;
    } catch (e) {
      console.error("Get token symbol error: ", e);
      return null;
    }
  }

  const isFtWhitelisted = async (ftContractAddress, ftContractName) => {
    try {
      const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT_NAME,
        functionName: "is-whitelisted",
        functionArgs: [Cl.contractPrincipal(ftContractAddress, ftContractName)],
        senderAddress: stxAddress,
        network: "testnet"
      };

      const response = await fetchCallReadOnlyFunction(options);
      console.log("is white listed: ", JSON.parse(response.type));
      return JSON.parse(response.type);
    } catch (e) {
      console.error("Whitelist check error: ", e);
      return false;
    }
  }

  const fetchMarketplaceData = async () => {
    if (!stxAddress) return { nftListings: [], userNfts: [], myListings: [] };

    try {
      const contractAddress = 'ST1JG6WDA1B4PZD8JZY95RPNKFFF5YKPV57BHPC9G';
      const marketplaceContractName = 'marketplace';

      console.log('Fetching marketplace listings from the blockchain...');
      
      // Get current block height for expiry checking
      const blockHeightResponse = await fetch('https://api.testnet.hiro.so/extended');
      const blockInfo = await blockHeightResponse.json();
      console.log("blockInfo", blockInfo);
      const currentBlockHeight = blockInfo.chain_tip.block_height;
      console.log("currentBlockHeight", currentBlockHeight);

      // Fetch FT listings
      const ftListings = [];
      
      const ftNonceResult = await fetchCallReadOnlyFunction({
        contractName: marketplaceContractName,
        contractAddress: contractAddress,
        functionName: 'get-listing-ft-nonce',
        functionArgs: [],
        senderAddress: stxAddress,
        network: 'testnet'
      });
      
      const ftNonce = parseInt(ftNonceResult.value.value);
      console.log("ftNonceResult", ftNonce);

      // Fetch FT listings
      for (let i = 0; i < ftNonce; i++) {
        try {
          const listingResult = await fetchContractMapEntry({
            contractAddress: contractAddress,
            contractName: marketplaceContractName,
            mapName: 'listings-ft',
            mapKey: uintCV(i),
            network: 'testnet'
          });

          if (listingResult && listingResult.value) {
            console.log("listingResult", listingResult);
            const listing = listingResult.value.value;
            console.log("listing", listing);
            const expiry = Number(listing.expiry.value);
            
            // Only include non-expired listings
            if (currentBlockHeight < expiry) {
              const processedListing = {
                id: i,
                tokenAmount: Number(listing.amt.value),
                maker: listing.maker.value,
                taker: listing.taker.value ? listing.taker.value.value : null,
                ftAssetContract: listing['ft-asset-contract'].value,
                expiry: expiry,
                price: Number(listing.price.value),
                paymentAssetContract: listing['payment-asset-contract'].value ? listing['payment-asset-contract'].value.value : null,
                type: 'ft'
              };

              if (processedListing.maker === stxAddress) {
                ftListings.push({ ...processedListing, isUserListing: true });
              } else {
                ftListings.push({ ...processedListing, isUserListing: false });
              }
            }
          }
        } catch (error) {
          console.log(`No FT listing found at index ${i}`);
          console.error("error at ft map get", error);

        }
      }

      // Separate user listings from marketplace listings
      const allListings = [...ftListings];
      const marketplaceListings = allListings.filter(listing => !listing.isUserListing);
      const userListingsFiltered = allListings.filter(listing => listing.isUserListing);

      // Fetch FT balances 
      const url = `https://api.testnet.hiro.so/extended/v2/addresses/${stxAddress}/balances/ft?limit=100&offset=0`;
      const response = await axios.get(url);
      const ftBalances = response.data.results;

      // Process FT balances to get image URLs
      const ownedNftsWithImages = (await Promise.all(
        ftBalances.map(async (ft) => {
          const ftContract = ft.token.split('::')[0];
          const [ftContractAddress, ftContractName] = ftContract.split('.');
          
          const isWhitelisted = await isFtWhitelisted(ftContractAddress, ftContractName);
          if (isWhitelisted === false) {
            return null;
          }

          const imageData = await getFtImageUrl(ftContractAddress, ftContractName);

          return {
            ...ft,
            imageUrl: imageData,
            name: ft.token.split('::')[1],
            isListed: false
          };
        })
      )).filter(Boolean);

      const [enrichedMarketplaceListings, enrichedUserListings, enrichedUserNfts] = await Promise.all([
        Promise.all(marketplaceListings.map(async (listing) => {
          const assetContract = listing.ftAssetContract;
          const [assetContractAddress, assetContractName] = assetContract.split('.');
          const name = await getTokenName(assetContractAddress, assetContractName);
          const imageUrl = await getFtImageUrl(assetContractAddress, assetContractName);
          const symbol = await getTokenSymbol(assetContractAddress, assetContractName);
          return { ...listing, name, imageUrl, symbol };
        })),
        Promise.all(userListingsFiltered.map(async (listing) => {
          const assetContract = listing.ftAssetContract;
          const [assetContractAddress, assetContractName] = assetContract.split('.');
          const name = await getTokenName(assetContractAddress, assetContractName);
          const imageUrl = await getFtImageUrl(assetContractAddress, assetContractName);
          const symbol = await getTokenSymbol(assetContractAddress, assetContractName);
          return { ...listing, name, imageUrl, symbol };
        })),
        Promise.all(ownedNftsWithImages.map(async (nft) => {
          const [assetContractAddress, assetContractName] = nft.token.split('::')[0].split('.');
          const name = await getTokenName(assetContractAddress, assetContractName);
          const imageUrl = await getFtImageUrl(assetContractAddress, assetContractName);
          const symbol = await getTokenSymbol(assetContractAddress, assetContractName);
          return { ...nft, name, imageUrl, symbol };
        }))
      ]);

      console.log('Found listings:', allListings.length);
      console.log('User listings:', enrichedUserListings.length);
      console.log('Marketplace listings:', enrichedMarketplaceListings.length);

      console.log("ownedNFts with images", ownedNftsWithImages);
      
      return { nftListings: enrichedMarketplaceListings, userNfts: enrichedUserNfts, myListings: enrichedUserListings };

    } catch (error) {
      console.error('Error loading NFT data:', error);
      toast({
        title: 'Data Loading Error',
        description: 'Failed to load marketplace data. Please try again later.',
        variant: 'destructive'
      });
      return { nftListings: [], userNfts: [], myListings: [] };
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['marketplaceData', stxAddress],
    queryFn: fetchMarketplaceData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!stxAddress, // Only fetch if wallet is connected
  });

  const nftListings = data?.nftListings || [];
  const userNfts = data?.userNfts || [];
  const myListings = data?.myListings || [];

  const handleListNft = (nft) => {
    setSelectedNft(nft);
    setListingDetails({
      price: '',
      amount: '',
      ftAssetContract: nft.token.split('::')[0],
      paymentAssetContract: '',
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
        description: 'Please connect your wallet to list your asset.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedNft) {
      toast({
        title: 'No Asset Selected',
        description: 'Please select an asset to list.',
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

    const amount = parseInt(listingDetails.amount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than zero.',
        variant: 'destructive'
      });
      return;
    }
    
    if (amount > parseInt(selectedNft.balance, 10)) {
      toast({
        title: 'Insufficient Balance',
        description: 'You cannot list more tokens than you own.',
        variant: 'destructive'
      });
      return;
    }

     

    try {
      setIsLoading(true);
      // Get current block height for expiry checking
      const blockHeightResponse = await fetch('https://api.testnet.hiro.so/extended');
      const blockInfo = await blockHeightResponse.json();
      console.log("blockInfo", blockInfo);
      const currentBlockHeight = blockInfo.chain_tip.block_height;
      console.log("currentBlockHeight", currentBlockHeight);

      const finalExpiry = currentBlockHeight + parseInt(listingDetails.expiryDays);
      console.log("Final expiry: ", finalExpiry)

      const finalAmount = listingDetails.amount * 1000000
      
      const result = await request("stx_callContract",{
        contract: `${CONTRACT_ADDRESS}.${MARKETPLACE_CONTRACT_NAME}`,
        functionName: 'list-asset-ft',
        functionArgs: [
          Cl.principal(listingDetails.ftAssetContract),
          Cl.tuple({
            taker: listingDetails.targetBuyer ? Cl.some(Cl.principal(listingDetails.targetBuyer)) : Cl.none(),
            amt: Cl.uint(finalAmount),
            expiry: Cl.uint(finalExpiry),
            price: Cl.uint(listingDetails.price),
            "payment-asset-contract": listingDetails.paymentAssetContract ? Cl.some(Cl.principal(listingDetails.paymentAssetContract)) : Cl.none()
          })

        ],
        network: "testnet",
        postConditionMode: 'allow'
      });

      console.log('handleSubmitListing: ', result)
      setShowListModal(false);
      window.location.reload();

    } catch (error) {
      console.error('Error listing asset:', error);
      toast({
        title: 'Listing Failed',
        description: error.message || 'There was an error listing your asset.',
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

      const assetContractParts = listing.ftAssetContract.split('.');
      const assetContractAddress = assetContractParts[0];
      const assetContractName = assetContractParts[1];
      

      const result = await request("stx_callContract",{
        contract: `${CONTRACT_ADDRESS}.${MARKETPLACE_CONTRACT_NAME}`,
        functionName: 'cancel-listing-ft',
        functionArgs: [
          Cl.uint(listing.id),
          Cl.contractPrincipal(assetContractAddress, assetContractName)
        ],
        network: "testnet",
        postConditionMode: 'allow'
      });

      console.log('handleSubmitListing: ', result)
      window.location.reload();


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

      let functionName = '';
      const functionArgs = [];

      const assetContractParts = listing.ftAssetContract.split('.');
      const assetContractAddress = assetContractParts[0];
      const assetContractName = assetContractParts[1];

      functionArgs.push(Cl.uint(listing.id));
      functionArgs.push(Cl.contractPrincipal(assetContractAddress,assetContractName));

      if (listing.paymentAssetContract) {
        functionName = 'fulfil-ft-listing-ft';
          const paymentContractParts = listing.paymentAssetContract.split('.');
        const paymentContractAddress = paymentContractParts[0];
        const paymentContractName = paymentContractParts[1];
        functionArgs.push(Cl.contractPrincipal(paymentContractAddress, paymentContractName));
      } else {
        functionName = 'fulfil-listing-ft-stx';
      }
      
      const result = await request("stx_callContract",{
        contract: `${CONTRACT_ADDRESS}.${MARKETPLACE_CONTRACT_NAME_FULFILL}`,
        functionName: functionName,
        functionArgs: functionArgs,
        network: "testnet",
        postConditionMode: 'allow'
      });

      console.log('result of buy ft', result)
      window.location.reload();


    } catch (error) {
      console.error('Error purchasing NFT:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'There was an error purchasing this asset.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent mb-8">Marketplace</h1>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-teal-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400">Loading marketplace data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen px-24 mx-auto sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">Marketplace</h1>
        <p className="mt-4 text-gray-300 max-w-3xl mx-auto">
          Buy, sell, and manage tokenized real estate APTs representing fractional parts of properties.
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full mb-8"
      >
        <TabsList className="grid grid-cols-3 max-w-xl mx-auto mb-8 bg-gray-800/80 border border-gray-700/50 rounded-lg p-1">
          <TabsTrigger 
            value="browse" 
            className={`py-2 px-4 ${activeTab === 'browse' ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white' : 'bg-transparent text-gray-300 hover:text-gray-100'} rounded-md transition-all duration-300`}
          >
            <i className="fas fa-store mr-2"></i> Browse
          </TabsTrigger>
          <TabsTrigger 
            value="my-nfts" 
            className={`py-2 px-4 ${activeTab === 'my-nfts' ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white' : 'bg-transparent text-gray-300 hover:text-gray-100'} rounded-md transition-all duration-300`}
          >
            <i className="fas fa-image mr-2"></i> My APTs
          </TabsTrigger>
          <TabsTrigger 
            value="my-listings" 
            className={`py-2 px-4 ${activeTab === 'my-listings' ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white' : 'bg-transparent text-gray-300 hover:text-gray-100'} rounded-md transition-all duration-300`}
          >
            <i className="fas fa-tag mr-2"></i> My Listings
          </TabsTrigger>
        </TabsList>

        {/* Browse Marketplace Tab */}
        <TabsContent value="browse">
          {!connected ? (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 text-center border border-gray-700/30">
              <div className="w-16 h-16 mx-auto bg-gray-800/50 text-teal-300 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-6">Connect your Stacks wallet to browse and purchase NFTs.</p>
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-primary/30">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              {nftListings.length === 0  ? (
                <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 text-center border border-gray-700/30">
                  <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-store text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Listings Available</h3>
                  <p className="text-gray-300">There are no NFTs listed in the marketplace at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assets.map((asset) => (
                    <div key={asset.id} className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-teal-500/20">
                      <div className="h-48 bg-gray-800/50 overflow-hidden">
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => handleAssetClick(asset)}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-100">
                            Name: {asset.name}
                          </h3>
                          <div className="px-2 py-1 bg-gray-800/50 rounded text-xs font-medium text-gray-300 capitalize">
                            Type: {asset.type}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{asset.description}</p>

                        <div className="mt-4 grid grid-cols-2 gap-4 mb-4 text-5xl">
                         Comming Soon.....
                        </div>

                        
                      </div>
                    </div>
                  ))}
                  {nftListings.map((listing) => {
                    const assetData = listing.imageUrl?.asset || listing;
                    return (
                    <div key={listing.id} className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-teal-500/20">
                      <div className="h-48 bg-gray-800/50 overflow-hidden">
                        <img 
                          src={assetData.image || `https://via.placeholder.com/400x300?text=${assetData.name || 'No Image'}`}
                          alt={assetData.name || (listing.type === 'ft' ? listing.ftAssetContract : listing.nftAssetContract)}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => handleAssetClick(listing)}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-100">
                            {assetData.name || (listing.type === 'ft' ? listing.ftAssetContract : listing.nftAssetContract)}
                          </h3>
                          <div className="px-2 py-1 bg-gray-800/50 rounded text-xs font-medium text-gray-300 capitalize">
                            {listing.type === 'ft' ? 'Token' : 'NFT'}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">Owner: {shortenAddress(listing.maker, 6)}</p>

                        <div className="mt-4 grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-400">Price</p>
                            <p className="text-sm font-semibold text-teal-300">{listing.price}</p>
                          </div>
                          {listing.type === 'ft' && (
                            <div>
                              <p className="text-xs text-gray-400">Amount</p>
                              <p className="text-sm font-semibold text-gray-100">{listing.tokenAmount / 1000000}</p>
                            </div>
                          )}
                          {listing.type === 'nft' && (
                            <div>
                              <p className="text-xs text-gray-400">Token ID</p>
                              <p className="text-sm font-semibold text-gray-100">{listing.tokenId}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-400">Payment</p>
                            <p className="text-sm font-semibold text-gray-100">
                              {shortenAddress(listing.paymentAssetContract, 6)} {listing.paymentAssetContract ? 'Token' : 'STX'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Expiry Block</p>
                            <p className="text-sm font-semibold text-teal-300">{listing.expiry}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:border-teal-400/50 transition-all duration-300"
                            onClick={() => handleAssetClick(listing)}
                          >
                            View Details
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white transition-all duration-300 hover:shadow-teal-500/30"
                            onClick={() => handlePurchaseNft(listing)}
                          >
                            Buy Now
                          </Button>
                        </div>

                        
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* My APTs Tab */}
        <TabsContent value="my-nfts">
          {!connected ? (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 text-center border border-gray-700/30">
              <div className="w-16 h-16 mx-auto bg-gray-800/50 text-teal-300 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-6">Connect your Stacks wallet to view your APTs.</p>
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-primary/30">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              {userNfts.length === 0 ? (
                <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg h-screen p-8 text-center border border-gray-700/30">
                  <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-image text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No APTs Found</h3>
                  <p className="text-gray-300 mb-6">You don't own any property APTs yet.</p>
                  <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-teal-500/30"
                   onClick={() => setActiveTab('browse')}
                  >
                    Explore Marketplace
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNfts.map((nft, index) => {
                    const assetData = nft.imageUrl?.asset || nft;
                    return (
                    <div key={index} className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-teal-500/20">
                      <div className="p-4 flex items-center">
                        <img 
                          src={assetData.image || `https://via.placeholder.com/400x300?text=${assetData.name || 'No Image'}`}
                          alt={assetData.name ?? 'unknown'}
                          className="w-24 h-24 object-cover cursor-pointer rounded-lg mr-4"
                          loading='lazy'
                          onClick={() => handleAssetClick(nft)}
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100">{assetData.name ?? 'unknown'}</h3>
                          <p className="text-xs text-gray-400">{assetData.symbol}</p>
                          {/* Add other NFT details here */}
                          <div className="mt-4 grid grid-cols-2 gap-4 mb-4">
                            <div> 
                              <p className="text-xs text-gray-400">Balance</p>
                              <p className="text-sm font-semibold text-teal-300">{nft.balance / 1000000}</p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white transition-all duration-300 hover:shadow-teal-500/30"
                              onClick={() => handleListNft(nft)}
                            >
                              List for Sale
                            </Button>
                          </div>  
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* My Listings Tab */}
        <TabsContent value="my-listings">
          {!connected ? (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 text-center border border-gray-700/30">
              <div className="w-16 h-16 mx-auto bg-gray-800/50 text-teal-300 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-6">Connect your Stacks wallet to view your listings.</p>
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-primary/30">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              {myListings.length === 0 ? (
                <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg p-8 h-screen text-center border border-gray-700/30">
                  <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-tag text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No Active Listings</h3>
                  <p className="text-gray-300 mb-6">You don't have any active listings. List your APTs to sell them.</p>
                  <Button 
                    className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-teal-500/30"
                    onClick={() => setActiveTab('my-nfts')}
                  >
                    Go to My APTs
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map((listing) => {
                    const assetData = listing.imageUrl?.asset || listing;
                    return (
                    <div key={listing.id} className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-teal-500/20">
                      <div className="h-48 bg-gray-800/50 overflow-hidden">
                        <img 
                          src={assetData.image || `https://via.placeholder.com/400x300?text=${assetData.name || 'No Image'}`}
                          alt={assetData.name}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => handleAssetClick(listing)}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-100">{assetData.name}</h3>
                          <div className="px-2 py-1 bg-gray-800/50 rounded text-xs font-medium text-gray-300 capitalize">
                            {assetData.symbol}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{assetData.description}</p>

                        <div className="mt-4 grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-400">Price</p>
                            <p className="text-sm font-semibold text-teal-300">{listing.price}</p>
                          </div>
                          <div>
                              <p className="text-xs text-gray-400">Amount</p>
                              <p className="text-sm font-semibold text-gray-100">{listing.tokenAmount / 1000000}</p>
                            </div>
                          <div>
                            <p className="text-xs text-gray-400">Payment</p>
                            <p className="text-sm font-semibold text-gray-100">
                              {listing.paymentAssetContract ? shortenAddress(listing.paymentAssetContract, 6) : 'STX'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Expiry Block</p>
                            <p className="text-sm font-semibold text-teal-300">{listing.expiry}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-red-700/50 text-red-400 hover:bg-gray-800/50 hover:border-red-400/50 transition-all duration-300"
                            onClick={() => handleCancelListing(listing)}
                          >
                            Cancel Listing
                          </Button>
                        </div>

                        
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* List NFT Modal */}
      <Dialog open={showListModal} onOpenChange={setShowListModal}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-gray-800/90 to-gray-800/70 border-gray-700/50 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">List APT for Sale</DialogTitle>
            <DialogDescription className="text-gray-300">
              Set the price and terms for listing your APT on the marketplace.
            </DialogDescription>
          </DialogHeader>

          {selectedNft && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
                  <img 
                    src={selectedNft.imageUrl?.image} 
                    alt={selectedNft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">{selectedNft.name}</h3>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label htmlFor="listing-price" className="block text-sm font-medium text-gray-400 mb-1">Listing Price</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <Input
                      type="number"
                      id="listing-price"
                      value={listingDetails.price}
                      onChange={(e) => setListingDetails({...listingDetails, price: e.target.value})}
                      className="block w-full bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="listing-amount" className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <Input
                      type="number"
                      id="listing-amount"
                      value={listingDetails.amount}
                      onChange={(e) => setListingDetails({...listingDetails, amount: e.target.value})}
                      className="block w-full bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ft-asset-contract" className="block text-sm font-medium text-gray-400 mb-1">
                    FT Asset Contract Address
                  </label>
                  <Input
                    type="text"
                    id="ft-asset-contract"
                    value={listingDetails.ftAssetContract}
                    onChange={(e) => setListingDetails({...listingDetails, ftAssetContract: e.target.value})}
                    className="block w-full bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300"
                    placeholder="e.g. ST1..."
                    disabled
                  />
                </div>

                <div>
                  <label htmlFor="payment-asset-contract" className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Asset Contract Address
                  </label>
                  <Input
                    type="text"
                    id="payment-asset-contract"
                    value={listingDetails.paymentAssetContract}
                    onChange={(e) => setListingDetails({...listingDetails, paymentAssetContract: e.target.value})}
                    className="block w-full bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300"
                    placeholder="e.g. ST1... (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="expiry-days" className="block text-sm font-medium text-gray-400 mb-1">Listing Duration</label>
                  <Select 
                    value={listingDetails.expiryDays.toString()} 
                    onValueChange={(v) => setListingDetails({...listingDetails, expiryDays: parseInt(v)})}
                  >
                    <SelectTrigger className="w-full bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectItem value="20927">7 Days</SelectItem>
                      <SelectItem value="41855">14 Days</SelectItem>
                      <SelectItem value="89689">30 Days</SelectItem>
                      <SelectItem value="179377">60 Days</SelectItem>
                      <SelectItem value="269066">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="target-buyer" className="block text-sm font-medium text-gray-400 mb-1">
                    Target Buyer (Optional)
                  </label>
                  <Input
                    type="text"
                    id="target-buyer"
                    value={listingDetails.targetBuyer}
                    onChange={(e) => setListingDetails({...listingDetails, targetBuyer: e.target.value})}
                    className="block w-full bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-teal-300 focus:border-teal-300"
                    placeholder="Stacks address (leave empty for public listing)"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    If specified, only this address will be able to purchase your NFT.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50 transition-all duration-300" 
              onClick={() => setShowListModal(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white transition-all duration-300 hover:shadow-teal-500/30" 
              onClick={handleSubmitListing}
              disabled={isloading || !listingDetails.price}
            >
              {isloading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
                </>
              ) : 'List FT'}
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
  );
};

export default Marketplace;