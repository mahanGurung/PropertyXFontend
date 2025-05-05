import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tokenizationSteps } from '../data/tokenomics-data';

const Tokenize = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    assetType: '',
    assetName: '',
    assetSymbol: '',
    location: '',
    description: '',
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-heading font-bold text-secondary">Tokenize Your Asset</h1>
        <p className="mt-4 text-lg text-neutral-300 max-w-3xl mx-auto">
          Convert your real-world assets into digital tokens to raise capital, create liquidity, and establish fractional ownership.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-primary' : 'bg-neutral-200'} text-white rounded-full flex items-center justify-center`}>1</div>
              <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-secondary' : 'text-neutral-300'} mt-2`}>Asset Details</span>
            </div>
            <div className="flex-1 h-1 bg-neutral-100 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-primary' : 'bg-neutral-200'} ${currentStep < 2 ? 'text-neutral-400' : 'text-white'} rounded-full flex items-center justify-center`}>2</div>
              <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-secondary' : 'text-neutral-300'} mt-2`}>Valuation</span>
            </div>
            <div className="flex-1 h-1 bg-neutral-100 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-primary' : 'bg-neutral-200'} ${currentStep < 3 ? 'text-neutral-400' : 'text-white'} rounded-full flex items-center justify-center`}>3</div>
              <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-secondary' : 'text-neutral-300'} mt-2`}>Token Setup</span>
            </div>
            <div className="flex-1 h-1 bg-neutral-100 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${currentStep >= 4 ? 'bg-primary' : 'bg-neutral-200'} ${currentStep < 4 ? 'text-neutral-400' : 'text-white'} rounded-full flex items-center justify-center`}>4</div>
              <span className={`text-sm font-medium ${currentStep >= 4 ? 'text-secondary' : 'text-neutral-300'} mt-2`}>Review</span>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form>
            {/* Step 1: Asset Details */}
            {currentStep === 1 && (
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-secondary mb-4">Asset Details</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label htmlFor="asset-type" className="block text-sm font-medium text-neutral-400 mb-1">Asset Type</label>
                    <Select value={formData.assetType} onValueChange={(value) => handleChange('assetType', value)}>
                      <SelectTrigger id="asset-type">
                        <SelectValue placeholder="Select Asset Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commercial">Commercial Building</SelectItem>
                        <SelectItem value="residential">Residential Complex</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="office">Office Space</SelectItem>
                        <SelectItem value="retail">Retail Space</SelectItem>
                        <SelectItem value="coworking">Co-working Space</SelectItem>
                        <SelectItem value="infrastructure">Public Infrastructure</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="asset-name" className="block text-sm font-medium text-neutral-400 mb-1">Asset Name</label>
                    <Input 
                      type="text" 
                      id="asset-name" 
                      value={formData.assetName}
                      onChange={(e) => handleChange('assetName', e.target.value)}
                      className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                      placeholder="e.g. Horizon Hotel Complex" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="asset-symbol" className="block text-sm font-medium text-neutral-400 mb-1">Token Symbol (3-5 characters)</label>
                    <Input 
                      type="text" 
                      id="asset-symbol" 
                      value={formData.assetSymbol}
                      onChange={(e) => handleChange('assetSymbol', e.target.value)} 
                      className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                      placeholder="e.g. HORIZ" 
                    />
                    <p className="mt-1 text-xs text-neutral-300">Your tokens will be identified as SYMBOL-APT</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="asset-location" className="block text-sm font-medium text-neutral-400 mb-1">Location</label>
                    <Input 
                      type="text" 
                      id="asset-location" 
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                      placeholder="e.g. Downtown Financial District" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="asset-description" className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                    <Textarea 
                      id="asset-description" 
                      rows="4" 
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                      placeholder="Describe your asset, its features, and potential..." 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Asset Images</label>
                    <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center">
                      <div className="mb-3">
                        <i className="fas fa-cloud-upload-alt text-3xl text-neutral-300"></i>
                      </div>
                      <p className="text-sm text-neutral-300 mb-2">Drag and drop images here, or <span className="text-primary">browse files</span></p>
                      <p className="text-xs text-neutral-300">Upload up to 10 images (PNG, JPG, WEBP)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other steps would go here */}
            {currentStep === 2 && (
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-secondary mb-4">Asset Valuation</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label htmlFor="asset-valuation" className="block text-sm font-medium text-neutral-400 mb-1">Total Asset Valuation (USD)</label>
                    <Input 
                      type="number" 
                      id="asset-valuation" 
                      className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                      placeholder="e.g. 5000000" 
                    />
                    <p className="mt-1 text-xs text-neutral-300">The total market value of your asset</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="annual-revenue" className="block text-sm font-medium text-neutral-400 mb-1">Annual Revenue (USD)</label>
                    <Input 
                      type="number" 
                      id="annual-revenue" 
                      className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                      placeholder="e.g. 500000" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="annual-profit" className="block text-sm font-medium text-neutral-400 mb-1">Annual Net Profit (USD)</label>
                    <Input 
                      type="number" 
                      id="annual-profit" 
                      className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                      placeholder="e.g. 100000" 
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="valuation-docs" className="block text-sm font-medium text-neutral-400 mb-1">Valuation Documents</label>
                    <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center">
                      <div className="mb-3">
                        <i className="fas fa-file-pdf text-3xl text-neutral-300"></i>
                      </div>
                      <p className="text-sm text-neutral-300 mb-2">Upload valuation reports, financial statements, etc.</p>
                      <p className="text-xs text-neutral-300">Supported formats: PDF, DOC, XLS (Max 10MB each)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-secondary mb-4">Token Setup</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label htmlFor="token-supply" className="block text-sm font-medium text-neutral-400 mb-1">APT Token Supply</label>
                    <Input 
                      type="number" 
                      id="token-supply" 
                      className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                      placeholder="e.g. 5000000" 
                      disabled
                    />
                    <p className="mt-1 text-xs text-neutral-300">Each token equals $1 of asset value</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="initial-offering" className="block text-sm font-medium text-neutral-400 mb-1">Initial Offering Percentage</label>
                    <div className="flex items-center">
                      <Input 
                        type="number" 
                        id="initial-offering" 
                        className="w-full border-neutral-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                        placeholder="e.g. 40" 
                      />
                      <span className="ml-2">%</span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-300">Percentage of tokens available for purchase in the initial offering</p>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="profit-distribution" className="block text-sm font-medium text-neutral-400 mb-1">Profit Distribution</label>
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
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-secondary mb-4">Review & Submit</h2>
                <div className="bg-neutral-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Asset Summary</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-neutral-300 mb-1">Asset Name</p>
                      <p className="font-medium">{formData.assetName || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-300 mb-1">Token Symbol</p>
                      <p className="font-medium">{formData.assetSymbol ? `${formData.assetSymbol}-APT` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-300 mb-1">Asset Type</p>
                      <p className="font-medium">{formData.assetType || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-300 mb-1">Location</p>
                      <p className="font-medium">{formData.location || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Token Distribution</h3>
                  <p className="text-sm text-neutral-300 mb-4">
                    Your asset will generate APT tokens and PXFO NFTs according to PropertyX Protocol standards.
                  </p>
                  
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary-50 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-coins text-2xl"></i>
                        </div>
                        <p className="text-sm font-medium">APT Tokens</p>
                        <p className="text-xs text-neutral-300">Cash Flow Rights</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 bg-warning-50 text-warning rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-certificate text-2xl"></i>
                        </div>
                        <p className="text-sm font-medium">PXFO NFTs</p>
                        <p className="text-xs text-neutral-300">Ownership Rights</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-heading font-semibold text-secondary mb-3">Next Steps</h3>
                  <ol className="list-decimal list-inside space-y-2 text-neutral-400">
                    <li>Our team will review your submission within 2-3 business days</li>
                    <li>Valuation auditors will contact you to verify asset details</li>
                    <li>Once approved, your tokens will be created and offered to investors</li>
                    <li>You'll receive funds as tokens are purchased</li>
                  </ol>
                </div>
                
                <div className="flex items-center mb-6">
                  <input type="checkbox" id="terms" className="rounded border-neutral-300 text-primary focus:ring-primary" />
                  <label htmlFor="terms" className="ml-2 text-sm text-neutral-400">
                    I agree to the <a href="#" className="text-primary hover:text-primary-600">Terms of Service</a> and confirm that all provided information is accurate.
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
                  className="border border-neutral-200 text-neutral-400 hover:bg-neutral-50"
                >
                  Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition ml-auto"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-base font-medium transition ml-auto"
                >
                  Submit Application
                </Button>
              )}
            </div>
          </form>
        </div>
        
        {/* Information Box */}
        <div className="mt-8 bg-primary-50 border border-primary-100 rounded-lg p-6">
          <h3 className="text-lg font-heading font-semibold text-secondary mb-3">How Tokenization Works</h3>
          <ul className="space-y-3">
            {tokenizationSteps.map((item, index) => (
              <li key={index} className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span className="text-neutral-400 text-sm">{item.step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tokenize;
