import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tokenizationSteps } from '../data/tokenomics-data';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { Cl } from '@stacks/transactions';
import { request } from '@stacks/connect';

const Tokenize = () => {
  const { connected, stxAddress, callContract } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    assetType: '',
    assetName: '',
    assetSymbol: '',
    location: '',
    description: '',
    assetValue: '',
    assetId: '',
    ipfsData: '',
    images: []
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const addTokenization = async() => {
            if (!connected) {
              alert('Please connect your wallet first');
              return;
            }
            if (connected) {
              
              const response = await request('stx_callContract', {
                contract: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E.test5-rws',
                functionName: 'add-for-tokenization',
                functionArgs: [
                                
                                Cl.uint(1),
                                Cl.stringUtf8(formData.assetName),
                                Cl.uint(formData.assetValue),
                                Cl.stringUtf8("haoje")
                              ],
                // functionArgs: [
                //                 Cl.principal(address),
                //                 Cl.stringUtf8('dsjoenow')
        
                //               ],
                network: 'testnet'
              })
              
            }                        
          
          };
  
  const generateIpfsHash = () => {
    // In a real implementation, you would upload data to IPFS
    // For now, we'll create a simulated hash based on the form data
    const dataString = JSON.stringify({
      assetType: formData.assetType,
      assetName: formData.assetName,
      location: formData.location,
      description: formData.description,
      timestamp: Date.now()
    });
    
    // Simple hash function for demo purposes
    const hash = Array.from(dataString)
      .reduce((hash, char) => (((hash << 5) - hash) + char.charCodeAt(0)) | 0, 0)
      .toString(16)
      .replace('-', '');
      
    return `ipfs://Qm${hash.padStart(44, 'a')}`;
  };
  
  const submitTokenization = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit your asset for tokenization.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Generate a numeric asset ID from the symbol (for demo purposes)
      const assetIdValue = parseInt(Date.now().toString().slice(-8));
      
      // Generate IPFS data hash
      const ipfsDataValue = generateIpfsHash();
      
      // Asset value converted to microstacks (assuming input is in STX)
      const assetAmount = Math.floor(parseFloat(formData.assetValue || 0) * 1000000);
      
      // Prepare contract function parameters
      const functionArgs = [
        assetIdValue, // assetId as uint
        formData.assetName, // name as string
        assetAmount, // amount as uint
        ipfsDataValue // ipfsData as string
      ];
      
      // Call the add-for-tokenization function
      const result = await callContract({
        contractAddress: 'ST1VZ3YGJKKC8JSSWMS4EZDXXJM7QWRBEZ0ZWM64E',
        contractName: 'rws',
        functionName: 'add-for-tokenization',
        functionArgs: functionArgs
      });
      
      if (result && result.value) {
        toast({
          title: "Tokenization Submitted",
          description: "Your asset has been submitted for tokenization and awaits community approval.",
          variant: "default"
        });
        
        // Update form data with the generated values (for display purposes)
        setFormData(prev => ({
          ...prev,
          assetId: assetIdValue.toString(),
          ipfsData: ipfsDataValue
        }));
        
        // Reset the form and go back to step 1
        setTimeout(() => {
          setCurrentStep(1);
          // Optionally reset the form
          // setFormData({...});
        }, 3000);
      } else {
        throw new Error("Contract call failed");
      }
    } catch (error) {
      console.error("Error submitting tokenization:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your asset for tokenization.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen  mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-100">Tokenize Your Asset</h1>
        <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
          Convert your real-world assets into digital tokens to raise capital, create liquidity, and establish fractional ownership.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                {step > 1 && (
                  <div className={`flex-1 h-1 mx-2 ${currentStep >= step ? 'bg-cyan-400' : 'bg-gray-700'}`}></div>
                )}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 
                      'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 
                      'bg-gray-700 text-gray-400'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-sm font-medium mt-2 ${
                    currentStep >= step ? 'text-cyan-400' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Asset Details'}
                    {step === 2 && 'Valuation'}
                    {step === 3 && 'Token Setup'}
                    {step === 4 && 'Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <form>
            {/* Step 1: Asset Details */}
            {currentStep === 1 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Asset Details</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label htmlFor="asset-type" className="block text-sm font-medium text-gray-400 mb-1">Asset Type</label>
                    <Select value={formData.assetType} onValueChange={(value) => handleChange('assetType', value)}>
                      <SelectTrigger id="asset-type" className="bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue placeholder="Select Asset Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                        <SelectItem value="commercial" className="hover:bg-gray-700">Commercial Building</SelectItem>
                        <SelectItem value="residential" className="hover:bg-gray-700">Residential Complex</SelectItem>
                        <SelectItem value="hotel" className="hover:bg-gray-700">Hotel</SelectItem>
                        <SelectItem value="office" className="hover:bg-gray-700">Office Space</SelectItem>
                        <SelectItem value="retail" className="hover:bg-gray-700">Retail Space</SelectItem>
                        <SelectItem value="coworking" className="hover:bg-gray-700">Co-working Space</SelectItem>
                        <SelectItem value="infrastructure" className="hover:bg-gray-700">Public Infrastructure</SelectItem>
                        <SelectItem value="other" className="hover:bg-gray-700">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="asset-name" className="block text-sm font-medium text-gray-400 mb-1">Asset Name</label>
                    <Input 
                      type="text" 
                      id="asset-name" 
                      value={formData.assetName}
                      onChange={(e) => handleChange('assetName', e.target.value)}
                      className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" 
                      placeholder="e.g. Horizon Hotel Complex" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="asset-symbol" className="block text-sm font-medium text-gray-400 mb-1">Token Symbol (3-5 characters)</label>
                    <Input 
                      type="text" 
                      id="asset-symbol" 
                      value={formData.assetSymbol}
                      onChange={(e) => handleChange('assetSymbol', e.target.value)} 
                      className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" 
                      placeholder="e.g. HORIZ" 
                    />
                    <p className="mt-1 text-xs text-gray-500">Your tokens will be identified as SYMBOL-APT</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="asset-location" className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                    <Input 
                      type="text" 
                      id="asset-location" 
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" 
                      placeholder="e.g. Downtown Financial District" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="asset-description" className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <Textarea 
                      id="asset-description" 
                      rows="4" 
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" 
                      placeholder="Describe your asset, its features, and potential..." 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Asset Images</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <div className="mb-3">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-500"></i>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Drag and drop images here, or <span className="text-cyan-400">browse files</span></p>
                      <p className="text-xs text-gray-500">Upload up to 10 images (PNG, JPG, WEBP)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Valuation */}
            {currentStep === 2 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Asset Valuation</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label htmlFor="asset-valuation" className="block text-sm font-medium text-gray-400 mb-1">Total Asset Valuation (USD)</label>
                    <Input 
                      type="number" 
                      id="asset-valuation" 
                      className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" 
                      placeholder="e.g. 5000000" 
                    />
                    <p className="mt-1 text-xs text-gray-500">The total market value of your asset</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="annual-revenue" className="block text-sm font-medium text-gray-400 mb-1">Annual Revenue (USD)</label>
                    <Input 
                      type="number" 
                      id="annual-revenue" 
                      className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" 
                      placeholder="e.g. 500000" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="annual-profit" className="block text-sm font-medium text-gray-400 mb-1">Annual Net Profit (USD)</label>
                    <Input 
                      type="number" 
                      id="annual-profit" 
                      className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" 
                      placeholder="e.g. 100000" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="valuation-docs" className="block text-sm font-medium text-gray-400 mb-1">Valuation Documents</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <div className="mb-3">
                        <i className="fas fa-file-pdf text-3xl text-gray-500"></i>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Upload valuation reports, financial statements, etc.</p>
                      <p className="text-xs text-gray-500">Supported formats: PDF, DOC, XLS (Max 10MB each)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Token Setup */}
            {currentStep === 3 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Token Setup</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label htmlFor="token-supply" className="block text-sm font-medium text-gray-400 mb-1">APT Token Supply</label>
                    <Input 
                      type="number" 
                      id="token-supply" 
                      className="w-full bg-gray-700 border-gray-600 text-gray-400" 
                      placeholder="e.g. 5000000" 
                  
                    />
                    <p className="mt-1 text-xs text-gray-500">Each token equals $1 of asset value</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="initial-offering" className="block text-sm font-medium text-gray-400 mb-1">Initial Offering Percentage</label>
                    <div className="flex items-center">
                      <Input 
                        type="number" 
                        id="initial-offering" 
                        className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" 
                        placeholder="e.g. 40" 
                      />
                      <span className="ml-2 text-gray-400">%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Percentage of tokens available for purchase in the initial offering</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="profit-distribution" className="block text-sm font-medium text-gray-400 mb-1">Profit Distribution</label>
                    <div className="p-4 rounded-lg bg-gray-700 border border-gray-600">
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-600 rounded-full h-4">
                          <div className="flex rounded-full h-4 overflow-hidden">
                            <div className="bg-cyan-400 h-4" style={{ width: '45%' }}></div>
                            <div className="bg-purple-500 h-4" style={{ width: '40%' }}></div>
                            <div className="bg-yellow-400 h-4" style={{ width: '10%' }}></div>
                            <div className="bg-red-500 h-4" style={{ width: '5%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-400">45% APT Stakers</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-400">40% Asset Owner</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-400">10% PXT Buyback</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-400">5% Treasury</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Review & Submit</h2>
                <div className="bg-gray-700 p-6 rounded-lg mb-6 border border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Asset Summary</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Asset Name</p>
                      <p className="font-medium text-gray-200">{formData.assetName || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Token Symbol</p>
                      <p className="font-medium text-gray-200">{formData.assetSymbol ? `${formData.assetSymbol}-APT` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Asset Type</p>
                      <p className="font-medium text-gray-200">{formData.assetType || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Location</p>
                      <p className="font-medium text-gray-200">{formData.location || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Token Distribution</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Your asset will generate APT tokens according to PropertyX Protocol standards.
                  </p>
                  
                  <div className="flex justify-center mb-4">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-700 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-cyan-400 glow-effect">
                        <i className="fas fa-coins text-3xl"></i>
                      </div>
                      <p className="text-lg font-medium text-gray-200">APT Tokens</p>
                      <p className="text-sm text-gray-500">Cash Flow Rights & Asset Investment</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 border border-cyan-400/30 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Next Steps</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400">
                    <li>Our team will review your submission within 2-3 business days</li>
                    <li>Valuation auditors will contact you to verify asset details</li>
                    <li>Once approved, your tokens will be created and offered to investors</li>
                    <li>You'll receive funds as tokens are purchased</li>
                  </ol>
                </div>
                
                <div className="flex items-center mb-6">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="rounded border-gray-600 text-cyan-400 focus:ring-cyan-500 bg-gray-700" 
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                    I agree to the <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a> and confirm that all provided information is accurate.
                  </label>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white ml-auto"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={addTokenization}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                    </>
                  ) : 'Submit Application'}
                </Button>
              )}
            </div>
          </form>
        </div>
        
        {/* Information Box */}
        <div className="mt-8 bg-gray-800 border border-cyan-400/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">How Tokenization Works</h3>
          <ul className="space-y-3">
            {tokenizationSteps.map((item, index) => (
              <li key={index} className="flex items-start">
                <i className="fas fa-check-circle text-cyan-400 mt-1 mr-2"></i>
                <span className="text-gray-400 text-sm">{item.step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tokenize;