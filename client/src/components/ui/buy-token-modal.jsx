import { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useWallet } from '../../contexts/WalletContext';

const BuyTokenModal = ({ open, onOpenChange }) => {
  const { connected } = useWallet();
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

  const handlePurchase = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    
    // Purchase logic would go here
    alert(`Purchase of ${amount} PXT successful!`);
    setAmount('');
    onOpenChange(false);
  };

  // Only render the modal content if it's open
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-400 opacity-75" onClick={() => onOpenChange(false)}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto z-50">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 sm:mx-0 sm:h-10 sm:w-10">
              <i className="fas fa-coins text-primary"></i>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-heading font-semibold text-secondary" id="modal-title">
                Buy PXT Tokens
              </h3>
              <div className="mt-2">
                <p className="text-sm text-neutral-300">
                  Purchase PropertyX utility tokens (PXT) to participate in staking, governance, and PXFO eligibility.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="mb-4">
              <label htmlFor="token-amount" className="block text-sm font-medium text-neutral-400 mb-1">Amount to Purchase</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <Input
                  type="number"
                  id="token-amount"
                  name="token-amount"
                  placeholder="0"
                  min="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="focus:ring-primary focus:border-primary block w-full border-neutral-200 rounded-md pr-12"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-neutral-300 sm:text-sm">PXT</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="payment-method" className="block text-sm font-medium text-neutral-400 mb-1">Payment Method</label>
              <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stx">Stacks (STX)</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                  <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-md mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-300">Exchange Rate</span>
                <span className="text-sm font-medium">1 PXT = {
                  paymentMethod === 'stx' ? '0.01 STX' :
                  paymentMethod === 'usdc' ? '0.01 USDC' :
                  '0.0000003 BTC'
                }</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-300">Subtotal</span>
                <span className="text-sm font-medium">{calculateSubtotal().toFixed(paymentMethod === 'btc' ? 8 : 4)} {getPaymentSymbol()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-300">Network Fee</span>
                <span className="text-sm font-medium">{calculateNetworkFee().toFixed(paymentMethod === 'btc' ? 8 : 4)} {getPaymentSymbol()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-100">
                <span className="text-sm font-medium text-neutral-400">Total</span>
                <span className="text-sm font-medium text-secondary">{calculateTotal().toFixed(paymentMethod === 'btc' ? 8 : 4)} {getPaymentSymbol()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handlePurchase}
          >
            Confirm Purchase
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-200 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-400 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyTokenModal;
