import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '../../contexts/WalletContext';

const AssetDetailModal = ({ open, onOpenChange, asset }) => {
  const { connected } = useWallet();

  if (!asset) return null;

  const handleBuyTokens = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    alert(`Initiated purchase of ${asset.symbol}-APT tokens`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-700">
            <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-cyan-400">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <img src={asset.image} alt={asset.name} className="w-full h-64 object-cover rounded-lg mb-4 border border-gray-700" />
              
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-medium text-white">{asset.name}</h2>
                <span className="ml-2 text-sm font-mono font-medium text-cyan-400 bg-gray-700/50 px-2 py-0.5 rounded-full">{asset.symbol}-APT</span>
              </div>
              
              <p className="text-gray-400 mb-6">{asset.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Asset Type', value: asset.type },
                  { label: 'Location', value: asset.location },
                  { label: 'Valuation', value: asset.valuation },
                  { label: 'Token Supply', value: asset.tokens.split(' ')[0] },
                  { label: 'APT Price', value: asset.tokenPrice },
                  { label: 'APR', value: asset.apr, accent: true }
                ].map((item, i) => (
                  <div key={i} className="bg-gray-700/30 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className={`font-medium ${item.accent ? 'text-cyan-400' : 'text-white'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Investment Distribution</h3>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="flex rounded-full h-2 overflow-hidden">
                        <div className="bg-cyan-500 h-2" style={{ width: '45%' }}></div>
                        <div className="bg-purple-500 h-2" style={{ width: '40%' }}></div>
                        <div className="bg-yellow-500 h-2" style={{ width: '10%' }}></div>
                        <div className="bg-red-500 h-2" style={{ width: '5%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      { color: 'bg-cyan-500', label: '45% APT Stakers' },
                      { color: 'bg-purple-500', label: '40% Asset Owner' },
                      { color: 'bg-yellow-500', label: '10% PXT Buyback' },
                      { color: 'bg-red-500', label: '5% Treasury' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center">
                        <div className={`w-2 h-2 ${item.color} rounded-full mr-2`}></div>
                        <span className="text-xs text-gray-400">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {asset.ownershipAvailable && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Fractional Ownership</h3>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-2">
                      This asset offers fractional ownership through PXFO NFTs. Each PXFO represents 0.01% ownership.
                    </p>
                    <div className="flex items-center">
                      <i className="fas fa-info-circle text-cyan-400 mr-2"></i>
                      <span className="text-xs text-cyan-400">Stake 50,000+ APT or 100,000+ PXT to qualify</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-700">
              <Button
                onClick={handleBuyTokens}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium"
              >
                Buy APT Tokens
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AssetDetailModal;