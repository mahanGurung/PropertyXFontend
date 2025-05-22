import { Dialog, DialogContent } from '@/components/ui/dialog';
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

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 z-10"
        >
          <i className="fas fa-times text-lg"></i>
        </button>
        
        <div className="space-y-6">
          <img 
            src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`} 
            alt={asset.name} 
            className="w-full h-64 object-cover rounded-lg border border-gray-700" 
          />
          
          <div className="flex items-center">
            <h2 className="text-2xl font-medium text-white">{asset.name}</h2>
            <span className="ml-2 text-sm font-mono font-medium text-cyan-400 bg-gray-700/50 px-2 py-0.5 rounded-full">
              {asset.symbol}-APT
            </span>
          </div>
          
          <p className="text-gray-400">{asset.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
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
                <p className={`font-medium ${item.accent ? 'text-cyan-400' : 'text-white'}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          
          <div>
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
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Fractional Ownership</h3>
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700/50">
                <p className="text-sm text-gray-400 mb-2">
                  This asset offers fractional ownership through PXFO NFTs. Each PXFO represents 0.01% ownership.
                </p>
                <div className="flex items-center">
                  <i className="fas fa-info-circle text-cyan-400 mr-2"></i>
                  <span className="text-xs text-cyan-400">
                    Stake 50,000+ APT or 100,000+ PXT to qualify
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={handleClose}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              Close
            </Button>
            <Button
              onClick={handleBuyTokens}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium"
            >
              Buy APT Tokens
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailModal;