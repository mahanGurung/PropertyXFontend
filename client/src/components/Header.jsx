import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useWallet } from '../contexts/WalletContext';
import ConnectWallet from './ui/connect-wallet';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { connected } = useWallet();

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Staking', path: '/staking' },
  ];

  const isActive = (path) => location === path;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center group hover:scale-105 transition-transform duration-200">
            <svg className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 12h3v8h16v-8h3L12 2zm-1 15v-5h2v5h-2z" />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-100 group-hover:text-cyan-300 transition-colors duration-200">PropertyX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`px-4 py-2 text-sm lg:text-base font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-cyan-400 bg-gray-800/50 shadow-inner'
                    : 'text-gray-300 hover:text-cyan-300 hover:bg-gray-800/30'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            <ConnectWallet />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-gray-800/70 text-cyan-400'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-cyan-400'
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="mt-4 border-t border-gray-700 pt-4">
              <ConnectWallet mobile onClick={closeMenu} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;