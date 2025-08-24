import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { shortenAddress } from '../../lib/utils';

const AssetDetailModal = ({ open, onOpenChange, asset }) => {
  if (!asset) return null;

  const assetData = asset.imageUrl?.asset || asset;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">{assetData.name || 'Asset Details'}</DialogTitle>
          {assetData.description && (
            <DialogDescription className="text-gray-400">
              {assetData.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700/50">
            <img
              src={assetData.image || `https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`}
              alt={assetData.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-400">Asset Name</p>
              <p className="text-lg font-semibold text-gray-100">{assetData.name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-400">Asset Symbol</p>
              <p className="text-lg font-semibold text-gray-100">{assetData.symbol}</p>
            </div>
            {assetData.location && (
              <div>
                <p className="font-medium text-gray-400">Location</p>
                <p className="text-lg font-semibold text-gray-100">{assetData.location}</p>
              </div>
            )}
            {assetData.valuation && (
              <div>
                <p className="font-medium text-gray-400">Valuation</p>
                <p className="text-lg font-semibold text-gray-100">{assetData.valuation}</p>
              </div>
            )}
            {assetData.apr && (
              <div>
                <p className="font-medium text-gray-400">APR</p>
                <p className="text-lg font-semibold text-gray-100">{assetData.apr}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {asset.price && (
              <div>
                <p className="font-medium text-gray-400">Price</p>
                <p className="text-lg font-semibold text-gray-100">{asset.price}</p>
              </div>
            )}
            {asset.id !== undefined && (
              <div>
                <p className="font-medium text-gray-400">ID</p>
                <p className="text-lg font-semibold text-gray-100">{asset.id}</p>
              </div>
            )}
            {asset.balance && (
              <div>
                <p className="font-medium text-gray-400">Balance</p>
                <p className="text-lg font-semibold text-gray-100">
                  {asset.balance / 1000000}
                </p>
              </div>
            )}
            {asset.tokenAmount && (
              <div>
                <p className="font-medium text-gray-400">Amount</p>
                <p className="text-lg font-semibold text-gray-100">{asset.tokenAmount}</p>
              </div>
            )}
          </div>
          {asset.maker && (
            <div>
              <p className="font-medium text-gray-400">Owner</p>
              <p className="text-lg font-semibold text-gray-100">{shortenAddress(asset.maker, 10)}</p>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-400">Asset Contract</p>
            <p className="text-lg font-semibold text-gray-100 break-all">
              {asset.ftAssetContract || (asset.token && asset.token.split('::')[0]) || ''}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailModal;
