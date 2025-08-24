import React, { createContext, useContext, useState, useEffect } from "react";
import {
  connect,
  getLocalStorage,
  disconnect,
  isConnected,
  request,
} from "@stacks/connect";
import { Cl, fetchCallReadOnlyFunction } from "@stacks/transactions";
import {
  createPrincipalCV,
  createUintCV,
  createStringCV,
  createBoolCV,
  createNoneCV,
  createSomeCV,
  cvToString,
  simulateContractCall,
  simulateContractWrite,
  parseAssetData,
} from "../utils/stacksHelper";

// IPFS gateway URL - used to fetch metadata from IPFS
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

// Creating the wallet context
const WalletContext = createContext();

// Network configuration for testnet (can be changed to mainnet in production)
const network = {
  url: "https://stacks-node-api.testnet.stacks.co",
  chainId: 2147483648,
};

// WalletProvider component to wrap the app
export const WalletProvider = ({ children }) => {
  // State variables
  const [connected, setConnected] = useState(false);
  const [stxAddress, setStxAddress] = useState(null);
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState({ pxt: 0, btc: 0 });

  // Check if user is already logged in
  useEffect(() => {
    if (isConnected()) {
      const data = getLocalStorage();
      setUserData(data);
      setStxAddress(data.addresses.stx[0].address); // Use .mainnet for production
      setConnected(true);
      fetchBalance(data.addresses.stx[0].address);
    }
  }, []);

  // Fetch PXT and native token balance
  const fetchBalance = async (address) => {
    if (!address) return;

    try {
      if (isConnected()) {
        const options = {
          contractAddress: "ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E",
          contractName: "test5-rws",
          functionName: "get-balance",
          functionArgs: [Cl.principal(address)],
          network: "testnet",
          senderAddress: "ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E",
        };

        const result = await fetchCallReadOnlyFunction(options);

        // const response = await request('stx_callContract', {
        //   contract: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E.rws',
        //   functionName: 'get-balance',
        //   functionArgs: [

        //                   Cl.principal(address)
        //                 ],
        //   network: 'testnet'
        // })
        console.log("get-balance responce: ", parseInt(result.value.value));
        setBalance({ pxt: parseInt(result.value.value), btc: 0 });
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance({ pxt: 0, btc: 0 });
    }
  };


  

  // Connect to wallet
  const getConnect = async () => {
    if (isConnected()) return;
    await connect();
    const data = getLocalStorage();
    setUserData(data);
    setStxAddress(data.addresses.stx[0].address); // Use .mainnet for production
    setConnected(true);
    fetchBalance(data.addresses.stx[0].address);
  };

  // Disconnect from wallet
  const getDisconnect = () => {
    setConnected(false);
    setStxAddress(null);
    setUserData(null);
    setBalance({ pxt: 0, btc: 0 });
    disconnect();
  };

  // Function to call a contract method
  const callContract = async ({
    contractAddress,
    contractName,
    functionName,
    functionArgs,
  }) => {
    if (!connected) {
      throw new Error("Wallet not connected");
    }

    try {
      // Convert functionArgs to CV types based on their type
      const cvArgs = functionArgs.map((arg) => {
        if (
          typeof arg === "number" ||
          (typeof arg === "string" && !isNaN(Number(arg)))
        ) {
          return createUintCV(Number(arg));
        } else if (typeof arg === "string") {
          if (arg.startsWith("ST") && arg.length >= 39) {
            return createPrincipalCV(arg);
          }
          return createStringCV(arg);
        } else if (typeof arg === "boolean") {
          return createBoolCV(arg);
        } else if (arg === null || arg === undefined) {
          return createNoneCV();
        }
        // Default case
        return createStringCV(String(arg));
      });

      // Set up contract call options
      const options = {
        contractAddress,
        contractName,
        functionName,
        functionArgs: cvArgs,
        network,
        appDetails: {
          name: "PropertyX Protocol",
          icon: window.location.origin + "/icon.png",
        },
        onFinish: (data) => {
          console.log("Transaction submitted:", data);
          return data;
        },
        onCancel: () => {
          console.log("Transaction was canceled");
          throw new Error("Transaction canceled by user");
        },
      };

      // For now, simulate the contract call
      // In a production app, we would use openContractCall(options)
      const result = await simulateContractWrite(options);
      return { txId: result.txId, value: true };
    } catch (error) {
      console.error("Error calling contract:", error);
      throw error;
    }
  };

  // Function to read NFT data from the contract
  const getNftData = async (tokenId) => {
    if (!connected) {
      throw new Error("Wallet not connected");
    }

    try {
      // Call the get-owner function in the NFT contract
      const result = await simulateContractCall({
        contractAddress: "ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E",
        contractName: "nft",
        functionName: "get-owner",
        functionArgs: [createUintCV(tokenId)],
        network,
        senderAddress: stxAddress,
      });

      // Parse the result
      let owner = null;
      if (result.value) {
        try {
          // Extract owner address from the response
          if (result.value.type === "some") {
            owner = result.value.value.address;
          }
        } catch (error) {
          console.error("Error parsing NFT owner:", error);
        }
      }

      return { tokenId, owner };
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      throw error;
    }
  };

  // Function to read asset data from the contract
  const getAssetData = async (owner, assetId) => {
    try {
      // Call the get-asset function in the RWS contract
      const result = await simulateContractCall({
        contractAddress: "ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E",
        contractName: "rws",
        functionName: "get-asset",
        functionArgs: [createPrincipalCV(owner), createUintCV(assetId)],
        network,
        senderAddress: stxAddress || owner,
      });

      // Parse the result
      return parseAssetData(result, owner, assetId);
    } catch (error) {
      console.error("Error fetching asset data:", error);
      throw error;
    }
  };

  

  // Function to check if the current user is the admin
  const isContractAdmin = async () => {
    if (!connected) return false;

    try {
      if (connected) {
        const options = {
          contractAddress: "ST1JG6WDA1B4PZD8JZY95RPNKFFF5YKPV57BHPC9G",
          contractName: "marketplace",
          functionName: "get-contract-owner",
          functionArgs: [],
          senderAddress: stxAddress,
          network: "testnet",
        };
        const response = await fetchCallReadOnlyFunction(options);

        console.log("admin", response);

        if (response.type === "err") {
          return false;
        }

        return true;
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  const updateMarketplaceContract = async (principal, role) => {
    if (!connected) throw new Error("Wallet not connected");
    try {
      await request("stx_callContract", {
        contractAddress: "ST1JG6WDA1B4PZD8JZY95RPNKFFF5YKPV57BHPC9G",
        contractName: "marketplace",
        functionName: "update-marketplace-contract",
        functionArgs: [
          createPrincipalCV(principal),
          Cl.bufferFromHex(parseInt(role)) // Assuming role is a hex string like '0x00'
        ],
        network: "testnet",
        postConditionMode: 'allow'
      });
    } catch (error) {
      console.error("Error updating marketplace contract:", error);
      throw error;
    }
  };

  const updateKycContract = async (principal, role) => {
    if (!connected) throw new Error("Wallet not connected");
    try {
      await request("stx_callContract", {
        contractAddress: "ST1JG6WDA1B4PZD8JZY95RPNKFFF5YKPV57BHPC9G",
        contractName: "marketplace",
        functionName: "update-kyc-contract",
        functionArgs: [
          createPrincipalCV(principal),
          createUintCV(parseInt(role, 16)) // Assuming role is a hex string like '0x00'
        ],
        network: "testnet",
        postConditionMode: 'allow'
      });
    } catch (error) {
      console.error("Error updating KYC contract:", error);
      throw error;
    }
  };

  const whitelistTokenCreator = async (contractIdentifier, status) => {
    if (!connected) throw new Error("Wallet not connected");

    
    
    try {
      await request("stx_callContract", {
        contract: 'ST1JG6WDA1B4PZD8JZY95RPNKFFF5YKPV57BHPC9G.marketplace',
        functionName: "set-whitelisted",
        functionArgs: [
          Cl.principal(contractIdentifier),
          Cl.bool(status)
        ],
        network: "testnet",
        postConditionMode: 'allow'
      });
    } catch (error) {
      console.error("Error whitelisting token creator:", error);
      throw error;
    }
  };

  // Function to fetch metadata from IPFS
  const fetchIpfsMetadata = async (cid) => {
    if (!cid) return null;

    try {
      const url = `${IPFS_GATEWAY}${cid}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch IPFS data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching IPFS metadata:", error);
      return null;
    }
  };

  // Function to get all marketplace listings
  const getMarketplaceListings = async () => {
    if (!connected) return [];

    try {
      // For a real implementation, we would query the contract for all listings
      // Here we'll simulate a few listings
      const listings = [];

      for (let i = 1; i <= 5; i++) {
        const result = await simulateContractCall({
          contractAddress: "ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E",
          contractName: "nft-marketplace",
          functionName: "get-listing",
          functionArgs: [createUintCV(i)],
          network,
          senderAddress: stxAddress,
        });

        if (result.value && result.value.type === "tuple") {
          const listingData = result.value.data;

          // Get NFT details
          const nftData = await getNftData(listingData.tokenId.value);

          if (nftData && nftData.owner) {
            const assetData = await getAssetData(
              nftData.owner,
              listingData.tokenId.value,
            );

            if (assetData) {
              // Generate an IPFS CID for the metadata
              const ipfsCid = `QmNR2n4zywCV61MeMLB6JwPueAPqhbtqMfCMKDRQftUSa${i}`;

              // Create the listing object
              listings.push({
                id: listingData.id.value,
                tokenId: listingData.tokenId.value,
                name: assetData.name,
                description: assetData.description,
                assetType: "property",
                owner: listingData.maker.address,
                price: listingData.price.value,
                currency: "STX",
                imageUrl: `https://ipfs.io/ipfs/QmbeQYcm8xTdTtXiYPwTR8oBGPEZ9cZMLs4YgWkfQMCUJ${i}/image.jpg`,
                metadataCid: ipfsCid,
                createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                expiry: listingData.expiry.value,
                isCancelled: listingData.isCancelled.value,
              });
            }
          }
        }
      }

      return listings;
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      return [];
    }
  };

  

  // The context value that will be supplied to any descendants of this provider
  const contextValue = {
    connected,
    stxAddress,
    userData,
    balance,
    getConnect,
    getDisconnect,
    callContract,
    fetchBalance,
    getNftData,
    getAssetData,
    fetchIpfsMetadata,
    getMarketplaceListings,
    isContractAdmin,
    updateMarketplaceContract,
    updateKycContract,
    whitelistTokenCreator,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

export default WalletContext;
