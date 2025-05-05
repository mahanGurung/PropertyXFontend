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
    
    // Buy token logic would go here
    alert(`Initiated purchase of ${asset.symbol}-APT tokens`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-neutral-400 opacity-75"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button onClick={() => onOpenChange(false)} className="text-neutral-300 hover:text-secondary">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <img src={asset.image} alt={asset.name} className="w-full h-64 object-cover rounded-lg mb-4" />
              
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-heading font-semibold text-secondary">{asset.name}</h2>
                <span className="ml-2 text-sm font-medium text-primary bg-primary-50 px-2 py-0.5 rounded-full">{asset.symbol}-APT</span>
              </div>
              
              <p className="text-neutral-300 mb-6">{asset.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-300 mb-1">Asset Type</p>
                  <p className="font-semibold text-secondary">{asset.type}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-300 mb-1">Location</p>
                  <p className="font-semibold text-secondary">{asset.location}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-300 mb-1">Valuation</p>
                  <p className="font-semibold text-secondary">{asset.valuation}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-300 mb-1">Token Supply</p>
                  <p className="font-semibold text-secondary">{asset.tokens.split(' ')[0]}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-300 mb-1">APT Price</p>
                  <p className="font-semibold text-secondary">{asset.tokenPrice}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-300 mb-1">APR</p>
                  <p className="font-semibold text-accent">{asset.apr}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Investment Distribution</h3>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-full bg-neutral-100 rounded-full h-4">
                      <div className="flex rounded-full h-4 overflow-hidden">
                        <div className="bg-primary h-4" style={{ width: '45%' }}></div>
                        <div className="bg-accent h-4" style={{ width: '40%' }}></div>
                        <div className="bg-warning h-4" style={{ width: '10%' }}></div>
                        <div className="bg-error-500 h-4" style={{ width: '5%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                      <span className="text-xs text-neutral-300">45% APT Stakers</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
                      <span className="text-xs text-neutral-300">40% Asset Owner</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-warning rounded-full mr-2"></div>
                      <span className="text-xs text-neutral-300">10% PXT Buyback</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-error-500 rounded-full mr-2"></div>
                      <span className="text-xs text-neutral-300">5% Treasury</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {asset.ownershipAvailable && (
                <div className="mb-6">
                  <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Fractional Ownership</h3>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-sm text-neutral-300 mb-2">
                      This asset offers fractional ownership through PXFO NFTs. Each PXFO represents 0.01% ownership.
                    </p>
                    <div className="flex items-center">
                      <i className="fas fa-info-circle text-primary mr-2"></i>
                      <span className="text-xs text-primary">Stake 50,000+ APT or 100,000+ PXT to qualify</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleBuyTokens}
              >
                Buy APT Tokens
              </Button>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-200 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-400 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => onOpenChange(false)}
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
