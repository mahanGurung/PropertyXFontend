
import { useState } from 'react';
import { Link } from 'wouter';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import AssetDetailModal from '../components/ui/asset-detail-modal';
import assets from '../data/asset-data';
import { Button } from '@/components/ui/button';

const Explore = () => {
  const [assetDetailModal, setAssetDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all_types',
    location: 'all_locations',
    sortBy: 'newest'
  });

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setAssetDetailModal(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Get unique values for filters
  const assetTypes = [...new Set(assets.map(asset => asset.type))];
  const locations = [...new Set(assets.map(asset => asset.location))];

  // Filter and sort assets
  const filteredAssets = assets.filter(asset => {
    if (filters.type && filters.type !== 'all_types' && asset.type !== filters.type) return false;
    if (filters.location && filters.location !== 'all_locations' && asset.location !== filters.location) return false;
    return true;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (filters.sortBy === 'highestValuation') {
      return parseFloat(b.valuation.replace(/[^0-9.-]+/g, '')) - parseFloat(a.valuation.replace(/[^0-9.-]+/g, ''));
    } else if (filters.sortBy === 'highestAPR') {
      return parseFloat(b.apr) - parseFloat(a.apr);
    } else if (filters.sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    // default: newest first (by id in our case)
    return a.id - b.id;
  });

  return (
    <div className="bg-gradient-to-b from-gray-900/80 via-gray-900/50 to-gray-900/30 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent">Explore Tokenized Assets</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Discover real-world assets tokenized on the PropertyX Protocol. Browse, analyze, and invest in diverse urban properties.
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 p-4 rounded-lg shadow-lg mb-8 border border-gray-700/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-400 mb-1">Asset Type</label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-gray-100 focus:ring-teal-500 focus:border-teal-500">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                  <SelectItem value="all_types">All Types</SelectItem>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="location-filter" className="block text-sm font-medium text-gray-400 mb-1">Location</label>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-gray-100 focus:ring-teal-500 focus:border-teal-500">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                  <SelectItem value="all_locations">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-gray-100 focus:ring-teal-500 focus:border-teal-500">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="highestValuation">Highest Valuation</SelectItem>
                  <SelectItem value="highestAPR">Highest APR</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAssets.map((asset) => (
            <div key={asset.id} className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 rounded-lg shadow-lg overflow-hidden border border-gray-700/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-teal-500/20">
              <div className="relative h-48 overflow-hidden">
                <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <span className="bg-gradient-to-r from-teal-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full">{asset.type}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-100 mb-1">{asset.name}</h3>
                <div className="flex items-center mb-3">
                  <span className="text-sm font-medium text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full">{asset.symbol}-APT</span>
                  <span className="ml-2 text-sm text-gray-300">{asset.location}</span>
                </div>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{asset.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Valuation</p>
                    <p className="font-semibold text-gray-100">{asset.valuation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Token Price</p>
                    <p className="font-semibold text-gray-100">{asset.tokenPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">APT Supply</p>
                    <p className="font-semibold text-gray-100">{asset.tokens.split(' ')[0]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">APR</p>
                    <p className="font-semibold text-teal-400">{asset.apr}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleAssetClick(asset)}
                    variant="outline"
                    className="flex-1 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-teal-400/50 transition-all duration-300"
                  >
                    View Details
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white transition-all duration-300 hover:shadow-teal-500/30"
                  >
                    Buy Tokens
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if no assets match filters */}
        {sortedAssets.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-search text-xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-100 mb-2">No Assets Found</h3>
            <p className="text-gray-300 mb-6">Try adjusting your filters to find more assets.</p>
            <Button 
              onClick={() => setFilters({ type: 'all_types', location: 'all_locations', sortBy: 'newest' })}
              variant="outline"
              className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Asset Detail Modal */}
        <AssetDetailModal 
          open={assetDetailModal} 
          onOpenChange={setAssetDetailModal} 
          asset={selectedAsset} 
        />
      </div>
    </div>
  );
};

export default Explore;
