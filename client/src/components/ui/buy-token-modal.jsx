import { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useWallet } from '../../contexts/WalletContext';

const BuyTokenModal = ({ open, onOpenChange }) => {
  const { connected , stxAddress, } = useWallet();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stx');

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };

  const calculateSubtotal = () => {
    const numAmount = parseFloat(amount) || 0;
    const rate = paymentMethod === 'stx' ? 0.01 : 
                paymentMethod === 'usdc' ? 0.01 : 
                0.0000003; // BTC rate
    return numAmount * rate;
  };

  const calculateNetworkFee = () => {
    if (paymentMethod === 'stx') return 0.001;
    if (paymentMethod === 'usdc') return 0.5;
    return 0.00001; // BTC fee
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateNetworkFee();
  };

  const getPaymentSymbol = () => {
    if (paymentMethod === 'stx') return 'STX';
    if (paymentMethod === 'usdc') return 'USDC';
    return 'BTC';
  };




const handlePurchase = async () => {
  if (!connected) {
    alert('Please connect your wallet first');
    return;
  }

  if (!amount || isNaN(amount)) {
    alert('Please enter a valid number');
    return;
  }

  try {
    alert('Purchase functionality has been removed.');
    setAmount('');
    onOpenChange(false);
  } catch (error) {
    console.error('Error during hypothetical purchase:', error);
    alert('Simulated purchase failed. Please try again.');
  }
};


  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
      <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border-0 bg-gray-800 p-6 shadow-lg sm:rounded-lg">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/10 sm:mx-0 sm:h-10 sm:w-10">
            <i className="fas fa-coins text-cyan-400"></i>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-white" id="modal-title">
              Buy Tokens
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-400">
                Purchase tokens to participate in staking and governance.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="token-amount" className="block text-sm font-medium text-gray-300 mb-1">Amount to Purchase</label>
            <div className="relative rounded-md shadow-sm">
              <Input
                type="number"
                id="token-amount"
                name="token-amount"
                placeholder="0"
                min="0"
                value={amount}
                onChange={handleAmountChange}
                className="bg-gray-700 border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500 block w-full pr-12"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 sm:text-sm">Tokens</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
            <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="stx" className="hover:bg-gray-700">Stacks (STX)</SelectItem>
                <SelectItem value="usdc" className="hover:bg-gray-700">USDC</SelectItem>
                <SelectItem value="btc" className="hover:bg-gray-700">Bitcoin (BTC)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-md border border-gray-700">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Exchange Rate</span>
              <span className="text-sm font-medium text-cyan-400">1 Token = {
                paymentMethod === 'stx' ? '0.01 STX' :
                paymentMethod === 'usdc' ? '0.01 USDC' :
                '0.0000003 BTC'
              }</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Subtotal</span>
              <span className="text-sm font-medium text-white">{calculateSubtotal().toFixed(paymentMethod === 'btc' ? 8 : 4)} {getPaymentSymbol()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Network Fee</span>
              <span className="text-sm font-medium text-white">{calculateNetworkFee().toFixed(paymentMethod === 'btc' ? 8 : 4)} {getPaymentSymbol()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-600">
              <span className="text-sm font-medium text-gray-300">Total</span>
              <span className="text-sm font-bold text-cyan-400">{calculateTotal().toFixed(paymentMethod === 'btc' ? 8 : 4)} {getPaymentSymbol()}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg"
            onClick={handlePurchase}
          >
            Confirm Purchase
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyTokenModal;