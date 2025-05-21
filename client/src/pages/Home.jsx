import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import BuyTokenModal from '../components/ui/buy-token-modal';
import { benefitsData, tokenomicsData } from '../data/tokenomics-data';

const Home = () => {
  const [buyTokenModal, setBuyTokenModal] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gray-900 overflow-hidden border-b border-gray-800">
        <div className="  container  mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 xl:col-span-5">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-100 leading-tight">
                Tokenize Urban Real-World Assets on Stacks
              </h1>
              <p className="mt-6 text-lg text-gray-400">
                PropertyX Protocol enables tokenization of real-world assets to create decentralized economic ecosystems.
                Access property investments with lower barriers and higher liquidity.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={() => setBuyTokenModal(true)} 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg text-base font-medium shadow-lg transition flex items-center justify-center"
                >
                  <i className="fas fa-coins mr-2"></i> Buy PXT Token
                </Button>
                <Link href="/marketplace"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-base font-medium shadow-lg transition flex items-center justify-center"
                >
                  <i className="fas fa-search mr-2"></i> Explore Assets
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 xl:col-span-7 mt-12 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Modern urban property" 
                className="w-full h-auto rounded-lg shadow-xl border border-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-900  mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-100">How PropertyX Benefits You</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Our protocol reimagines urban asset ownership, creating value for all participants in the ecosystem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefitsData.map((benefit, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 hover:border-cyan-400 transition-colors">
              <div className="w-12 h-12 bg-gray-700 text-cyan-400 rounded-full flex items-center justify-center mb-4">
                <i className={`${benefit.icon} text-xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">{benefit.title}</h3>
              <p className="text-gray-400">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tokenomics Section */}
      <div className="bg-gray-900 border-t min-h-screen border-gray-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-100">Tokenomics</h2>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
              PropertyX Protocol features a multi-token model designed to create sustainable value for all ecosystem participants.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tokenomicsData.map((token, index) => (
              <div key={index} className={`bg-gray-800 p-6 rounded-lg shadow-md border-t-4 ${
                token.color === 'primary' ? 'border-cyan-400' : 
                token.color === 'secondary' ? 'border-purple-500' : 'border-green-500'
              }`}>
                <h3 className="text-xl font-semibold text-gray-100 mb-3">{token.name}</h3>
                <p className="text-gray-400 mb-4">
                  {token.description}
                </p>
                <ul className="space-y-2 text-gray-400">
                  {token.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <i className={`fas fa-check-circle ${
                        token.color === 'primary' ? 'text-cyan-400' : 
                        token.color === 'secondary' ? 'text-purple-500' : 'text-green-500'
                      } mt-1 mr-2`}></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {token.button.action === 'buyPxt' ? (
                    <Button 
                      onClick={() => setBuyTokenModal(true)} 
                      className={`w-full ${
                        token.color === 'primary' ? 'bg-cyan-500 hover:bg-cyan-600' : 
                        token.color === 'secondary' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-green-500 hover:bg-green-600'
                      } text-white px-4 py-2 rounded-lg text-base font-medium transition`}
                    >
                      {token.button.text}
                    </Button>
                  ) : (
                    <Link 
                      href={token.button.action === 'exploreAssets' ? '/marketplace' : '/staking'}
                      className={`block text-center w-full ${
                        token.color === 'primary' ? 'bg-cyan-500 hover:bg-cyan-600' : 
                        token.color === 'secondary' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-green-500 hover:bg-green-600'
                      } text-white px-4 py-2 rounded-lg text-base font-medium transition`}
                    >
                      {token.button.text}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buy Token Modal */}
      <BuyTokenModal open={buyTokenModal} onOpenChange={setBuyTokenModal} />
    </>
  );
};

export default Home;