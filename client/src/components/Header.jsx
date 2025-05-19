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
    { name: 'Explore', path: '/explore' },
    { name: 'Tokenize', path: '/tokenize' },
    { name: 'Staking', path: '/staking' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => {
    return location === path;
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 12h3v8h16v-8h3L12 2zm-1 15v-5h2v5h-2z"/>
              </svg>
              <span className="ml-2 text-xl font-heading font-bold text-secondary">PropertyX</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-3">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`px-3 py-2 text-sm lg:text-base font-medium ${
                  isActive(item.path)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-neutral-400 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            <ConnectWallet />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-neutral-400 hover:text-primary focus:outline-none"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={closeMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary'
                    : 'text-neutral-400 hover:bg-primary-50 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <ConnectWallet mobile onClick={closeMenu} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
