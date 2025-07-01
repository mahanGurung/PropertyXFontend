import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { benefitsData, tokenomicsData } from '../data/tokenomics-data';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-900/80 via-gray-900/50 to-gray-900/30 overflow-hidden border-b border-gray-700/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 xl:col-span-5">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent leading-tight">
                Tokenize Urban Real-World Assets on Stacks
              </h1>
              <p className="mt-6 text-lg text-gray-300">
                PropertyX Protocol enables tokenization of real-world assets to create decentralized economic ecosystems.
                Access property investments with lower barriers and higher liquidity.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/marketplace"
                  className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg text-base font-medium shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
                >
                  <i className="fas fa-search mr-2 group-hover:scale-110 transition-transform duration-300"></i> 
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Explore Assets</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 xl:col-span-7 mt-12 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Modern urban property" 
                className="w-full h-auto rounded-lg shadow-xl border border-gray-700/50 hover:border-teal-400/50 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-b from-gray-900/30 to-gray-900/70 mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">How PropertyX Benefits You</h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Our protocol reimagines urban asset ownership, creating value for all participants in the ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefitsData.map((benefit, index) => (
            <div key={index} className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-700/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-teal-500/20">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 text-teal-300 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <i className={`${benefit.icon} text-xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">{benefit.title}</h3>
              <p className="text-gray-300">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tokenomics Section */}
      <div className="bg-gradient-to-b from-gray-900/50 to-gray-900 border-t border-gray-700/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">Tokenomics</h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              PropertyX Protocol features a multi-token model designed to create sustainable value for all ecosystem participants.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tokenomicsData.map((token, index) => (
              <div key={index} className={`bg-gradient-to-b from-gray-800/50 to-gray-800/80 p-6 rounded-lg shadow-lg border-t-4 ${
                token.color === 'primary' ? 'border-teal-400' : 
                token.color === 'secondary' ? 'border-purple-400' : 'border-green-400'
              } hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300`}>
                <h3 className="text-xl font-semibold text-gray-100 mb-3">{token.name}</h3>
                <p className="text-gray-300 mb-4">
                  {token.description}
                </p>
                <ul className="space-y-2 text-gray-300">
                  {token.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <i className={`fas fa-check-circle ${
                        token.color === 'primary' ? 'text-teal-400' : 
                        token.color === 'secondary' ? 'text-purple-400' : 'text-green-400'
                      } mt-1 mr-2`}></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {token.button.action === "exploreAssets" &&
                  <Link 
                    href={ '/marketplace'}
                    className={`block text-center w-full ${
                      token.color === 'primary' ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500' : 
                      token.color === 'secondary' ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500' : 
                      'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
                    } text-white px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:shadow-lg`}
                  >
                    {token.button.text}
                  </Link>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>  
    </>
  );
};

export default Home;