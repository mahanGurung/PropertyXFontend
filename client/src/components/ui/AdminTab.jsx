import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from './select';
import { useToast } from '../../hooks/use-toast';

const AdminTab = () => {
  const { updateMarketplaceContract, updateKycContract, whitelistTokenCreator } = useWallet();
  const { toast } = useToast();

  const [marketplacePrincipal, setMarketplacePrincipal] = useState('');
  const [marketplaceRole, setMarketplaceRole] = useState('0x00');
  const [kycPrincipal, setKycPrincipal] = useState('');
  const [kycRole, setKycRole] = useState('0x00');
  const [principalToWhitelist, setPrincipalToWhitelist] = useState('');
  const [whitelistStatus, setWhitelistStatus] = useState("true");

  const handleWhitelist = async () => {
    if (!principalToWhitelist) {
      toast({ title: 'Error', description: 'Contract address is required.', variant: 'destructive' });
      return;
    }
    if (!principalToWhitelist.includes('.')) {
      toast({ title: 'Error', description: 'Please enter a valid contract address (e.g., SP...my-contract).', variant: 'destructive' });
      return;
    }
    try {
      await whitelistTokenCreator(principalToWhitelist, JSON.parse(whitelistStatus));
      toast({ title: 'Success', description: `Contract whitelist status updated to ${whitelistStatus}.` });
      setPrincipalToWhitelist('');
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateMarketplace = async () => {
    if (!marketplacePrincipal) {
      toast({ title: 'Error', description: 'Principal is required.', variant: 'destructive' });
      return;
    }
    try {
      await updateMarketplaceContract(marketplacePrincipal, marketplaceRole);
      toast({ title: 'Success', description: 'Marketplace contract updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateKyc = async () => {
    if (!kycPrincipal) {
      toast({ title: 'Error', description: 'Principal is required.', variant: 'destructive' });
      return;
    }
    try {
      await updateKycContract(kycPrincipal, kycRole);
      toast({ title: 'Success', description: 'KYC contract updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 text-gray-300">
      <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-700/30">
        <h3 className="text-xl font-semibold text-gray-100 mb-3">Whitelist Token Contract</h3>
        <p className="text-gray-300 mb-4">
          Make the given contract address whitelist for the propertyX eco-system
       </p>
        <div className="space-y-2">
          <Input
            placeholder="Contract Address (e.g., SP...my-contract)"
            value={principalToWhitelist}
            onChange={(e) => setPrincipalToWhitelist(e.target.value)}
            className="bg-gray-900/50 border-gray-700"
          />
          <Select value={whitelistStatus} onValueChange={setWhitelistStatus}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-gray-300 border-gray-700">
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleWhitelist} className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white">Update Whitelist</Button>
        </div>
      </div>

      <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-700/30">
        <h3 className="text-xl font-semibold text-gray-100 mb-3">Update Marketplace Contract</h3>
        <div className="space-y-4">
          <Input
            placeholder="Principal"
            value={marketplacePrincipal}
            onChange={(e) => setMarketplacePrincipal(e.target.value)}
            className="bg-gray-900/50 border-gray-700"
          />
          <Select value={marketplaceRole} onValueChange={setMarketplaceRole}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-gray-300 border-gray-700">
              <SelectItem value="0x00">Admin Role</SelectItem>
              <SelectItem value="0x01">Fulfill Role</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleUpdateMarketplace} className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white">Update Marketplace</Button>
        </div>
      </div>

      <div className="bg-gradient-to-b from-gray-800/50 to-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-700/30">
        <h3 className="text-xl font-semibold text-gray-100 mb-3">Update KYC Contract</h3>
        <div className="space-y-4">
          <Input
            placeholder="Principal"
            value={kycPrincipal}
            onChange={(e) => setKycPrincipal(e.target.value)}
            className="bg-gray-900/50 border-gray-700"
          />
          <Select value={kycRole} onValueChange={setKycRole}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-gray-300 border-gray-700">
              <SelectItem value="0x00">Admin Role</SelectItem>
              <SelectItem value="0x01">Add Role</SelectItem>
              <SelectItem value="0x02">Banned Role</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleUpdateKyc} className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white">Update KYC Contract</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminTab;