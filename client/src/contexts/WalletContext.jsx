import { createContext, useState, useContext, useEffect } from 'react';
import { 
  AppConfig, 
  UserSession, 
  showConnect, 
  openContractCall 
} from '@stacks/connect';
// Import individual modules to avoid the package export issue
import { standardPrincipalCV } from '@stacks/transactions';
import { uintCV } from '@stacks/transactions';
import { stringUtf8CV } from '@stacks/transactions';
import { trueCV, falseCV } from '@stacks/transactions';
import { noneCV, someCV } from '@stacks/transactions';
import { cvToString } from '@stacks/transactions';
// Import callReadOnlyFunction from @stacks/blockchain-api-client for compatibility
import { callReadOnlyFunction } from '@stacks/blockchain-api-client';

// Creating the wallet context
const WalletContext = createContext();

// Configure Stacks Connect
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

// Network config for the Stacks API
const network = {
  coreApiUrl: 'https://stacks-node-api.mainnet.stacks.co', // For mainnet
  // coreApiUrl: 'https://stacks-node-api.testnet.stacks.co', // For testnet
};

// Wallet provider component that will wrap our app
export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [stxAddress, setStxAddress] = useState('');
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState({
    pxt: 0,
    btc: 0
  });

  // Check if the user is already authenticated with Stacks
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserData(userData);
      setStxAddress(userData.profile.stxAddress.mainnet); // or .testnet for testnet
      setConnected(true);
      fetchBalance(userData.profile.stxAddress.mainnet);
    }
  }, []);

  // Fetch token balances for an address
  const fetchBalance = async (address) => {
    try {
      // This would be a call to get PXT token balance
      const contractAddress = 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E';
      const contractName = 'rws';
      const functionName = 'get-balance';
      
      // Call the Stacks blockchain
      const pxtResult = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName,
        functionArgs: [standardPrincipalCV(address)],
        network,
        senderAddress: address
      });
      
      // Parse the result
      let pxtBalance = 0;
      if (pxtResult && pxtResult.value) {
        try {
          pxtBalance = parseInt(cvToString(pxtResult.value).replace('(ok u', '').replace(')', '')) || 0;
        } catch (error) {
          console.error('Error parsing PXT balance:', error);
        }
      }
      
      // For BTC rewards, this would be another contract call in a real scenario
      // For now, we'll just use a mock BTC balance
      const btcBalance = 0.00025;
      
      const newBalance = {
        pxt: pxtBalance,
        btc: btcBalance
      };
      
      setBalance(newBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Connect wallet function using Stacks Connect
  const connect = () => {
    showConnect({
      appDetails: {
        name: 'PropertyX Protocol',
        icon: window.location.origin + '/icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        setUserData(userData);
        setStxAddress(userData.profile.stxAddress.mainnet); // or .testnet for testnet
        setConnected(true);
        fetchBalance(userData.profile.stxAddress.mainnet);
      },
      userSession,
    });
  };

  // Disconnect wallet function
  const disconnect = () => {
    userSession.signUserOut();
    setConnected(false);
    setStxAddress('');
    setUserData(null);
    setBalance({ pxt: 0, btc: 0 });
  };

  // Function to call a contract method
  const callContract = async ({ contractAddress, contractName, functionName, functionArgs }) => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Convert functionArgs to CV types based on their type
      const cvArgs = functionArgs.map(arg => {
        if (typeof arg === 'number' || (typeof arg === 'string' && !isNaN(Number(arg)))) {
          return uintCV(Number(arg));
        } else if (typeof arg === 'string') {
          if (arg.startsWith('ST') && arg.length >= 39) {
            return standardPrincipalCV(arg);
          }
          return stringUtf8CV(arg);
        } else if (typeof arg === 'boolean') {
          return arg ? trueCV() : falseCV();
        } else if (arg === null || arg === undefined) {
          return noneCV();
        }
        // Default case
        return stringUtf8CV(String(arg));
      });
      
      // Set up contract call options
      const options = {
        contractAddress,
        contractName,
        functionName,
        functionArgs: cvArgs,
        network,
        appDetails: {
          name: 'PropertyX Protocol',
          icon: window.location.origin + '/icon.png',
        },
        onFinish: data => {
          console.log('Transaction submitted:', data);
          return data;
        },
        onCancel: () => {
          console.log('Transaction was canceled');
          throw new Error('Transaction canceled by user');
        }
      };
      
      // Make the contract call
      const result = await openContractCall(options);
      return { txId: result.txId, value: true };
    } catch (error) {
      console.error('Error calling contract:', error);
      throw error;
    }
  };

  // Function to read NFT data from the contract
  const getNftData = async (tokenId) => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Call the get-owner function in the NFT contract
      const result = await callReadOnlyFunction({
        contractAddress: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E',
        contractName: 'nft',
        functionName: 'get-owner',
        functionArgs: [uintCV(tokenId)],
        network,
        senderAddress: stxAddress
      });
      
      // Parse the result
      let owner = null;
      if (result.value) {
        try {
          // Extract owner address from the response
          const ownerString = cvToString(result.value);
          // Format: "(ok (some STADDRESS))" or "(ok none)"
          if (ownerString.includes('some')) {
            owner = ownerString.split('some ')[1].replace(')', '');
          }
        } catch (error) {
          console.error('Error parsing NFT owner:', error);
        }
      }
      
      return { tokenId, owner };
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      throw error;
    }
  };
  
  // Function to read asset data from the contract
  const getAssetData = async (owner, assetId) => {
    try {
      // Call the get-asset function in the RWS contract
      const result = await callReadOnlyFunction({
        contractAddress: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E',
        contractName: 'rws',
        functionName: 'get-asset',
        functionArgs: [
          standardPrincipalCV(owner),
          uintCV(assetId)
        ],
        network,
        senderAddress: stxAddress || owner
      });
      
      // Parse the result - this would depend on the exact structure returned by the contract
      if (result.value) {
        // Format the result into a usable object
        return {
          owner,
          assetId,
          data: result.value
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching asset data:', error);
      throw error;
    }
  };

  // The context value that will be supplied to any descendants of this provider
  const contextValue = {
    connected,
    stxAddress,
    userData,
    balance,
    connect,
    disconnect,
    callContract,
    fetchBalance,
    getNftData,
    getAssetData
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for using the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
