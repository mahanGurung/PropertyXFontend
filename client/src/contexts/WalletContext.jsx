import { createContext, useState, useContext, useEffect } from 'react';

// Creating the wallet context
const WalletContext = createContext();

// Wallet provider component that will wrap our app
export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState({
    pxt: 0,
    btc: 0
  });

  // Check if there's a saved connection in local storage
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      try {
        const parsedWallet = JSON.parse(savedWallet);
        setConnected(true);
        setAddress(parsedWallet.address);
        setBalance(parsedWallet.balance || { pxt: 0, btc: 0 });
      } catch (error) {
        console.error('Error parsing wallet data:', error);
        localStorage.removeItem('wallet');
      }
    }
  }, []);

  // Connect wallet function
  const connect = () => {
    // For demo, we're using a mock address
    // In a real app, you would use a Stacks wallet library here
    const mockAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
    setAddress(mockAddress);
    setConnected(true);
    setBalance({ pxt: 0, btc: 0 });
    
    // Save to local storage
    localStorage.setItem('wallet', JSON.stringify({
      address: mockAddress,
      balance: { pxt: 0, btc: 0 }
    }));
  };

  // Disconnect wallet function
  const disconnect = () => {
    setConnected(false);
    setAddress('');
    setBalance({ pxt: 0, btc: 0 });
    localStorage.removeItem('wallet');
  };

  // Update balance function
  const updateBalance = (newBalance) => {
    setBalance(newBalance);
    
    // Update local storage
    localStorage.setItem('wallet', JSON.stringify({
      address,
      balance: newBalance
    }));
  };

  // The context value that will be supplied to any descendants of this provider
  const contextValue = {
    connected,
    address,
    balance,
    connect,
    disconnect,
    updateBalance
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
