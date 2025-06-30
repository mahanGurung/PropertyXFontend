import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useWallet } from '../../contexts/WalletContext';
import { shortenAddress } from '../../lib/utils';
import { GiHamburgerMenu } from "react-icons/gi";

const ConnectWallet = ({ mobile = false, onClick = () => {} }) => {
  const { connected, stxAddress, getConnect, getDisconnect } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [location, setLocation] = useLocation();

  const handleConnect = () => {
    getConnect();
    onClick();
  };

  const handleDisconnect = () => {
    getDisconnect();
    setLocation('/');
    onClick();
  };

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);

  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


useEffect(() => {
  if (connected) {
    setDropdownOpen(false);
  }
}, [connected]);


  if (!connected) {
    return (
      <button
        onClick={handleConnect}
        className={`${mobile ? 'w-full' : ''} bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20`}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
         onClick={() => setDropdownOpen(!dropdownOpen)}
        className="px-4 py-2 bg-gray-800 text-cyan-400 rounded-md hover:bg-gray-700 text-sm font-mono"
      >
        <GiHamburgerMenu size={24} />
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-[400px] h-[180px] bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50">
          <div className="block px-4 py-px-3 py-2 text-center' : 'px-3 py-1'} bg-gray-800 border border-gray-700 rounded-lg font-mono text-lg text-cyan-400 cursor-default">
            {shortenAddress(stxAddress || '', 10)}
          </div>
          <Link
            href="/profile"
            className="block px-4 py-2 text-lg text-gray-300 hover:bg-gray-700"
            onClick={() => {
              setDropdownOpen(false);
              onClick();
            }}
          >
            Profile
          </Link>
          <Link
            href="/tokenize"
            className="block px-4  py-2 text-lg text-gray-300 hover:bg-gray-700"
            onClick={() => {
              setDropdownOpen(false);
              onClick();
            }}
          >
            Tokenize
          </Link>
          <Link
            href="/feedback"
            className="block px-4  py-2 text-lg text-gray-300 hover:bg-gray-700"
            onClick={() => {
              setDropdownOpen(false);
              onClick();
            }}
          >
            Feedback
          </Link>
          <button
            onClick={handleDisconnect}
            className="block w-full text-left px-4 py-2 text-lg text-white hover:bg-red-700 bg-red-500 "
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
