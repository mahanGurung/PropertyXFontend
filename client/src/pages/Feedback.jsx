
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Feedback = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your valuable feedback! We'll get back to you soon.",
        variant: "default"
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        feedback: ''
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your feedback.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-teal-900/20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-800 opacity-10 filter blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-700 opacity-10 filter blur-3xl"></div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-teal-300 to-purple-400 bg-clip-text text-transparent mb-4">
              Share Your Feedback
            </h1>
            <p className="text-lg text-neutral-300">
              We value your input! Let us know about your experience or report any issues.
            </p>
          </div>
          
          <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-gray-700/50 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-2">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-gray-700/70 border-gray-600 text-gray-100 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-400 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-gray-700/70 border-gray-600 text-gray-100 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-neutral-400 mb-2">
                    Feedback or Issue Description
                  </label>
                  <Textarea
                    id="feedback"
                    rows={6}
                    value={formData.feedback}
                    onChange={(e) => handleChange('feedback', e.target.value)}
                    className="w-full bg-gray-700/70 border-gray-600 text-gray-100 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                    placeholder="Describe your feedback or issue in detail..."
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-teal-500/30"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                      </>
                    ) : 'Submit Feedback'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-800/70 backdrop-blur-sm border border-teal-400/30 rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-heading font-semibold text-gray-100 mb-3">Need Immediate Help?</h3>
            <p className="text-neutral-300 mb-4">
              For urgent issues, please contact our support team directly at:
            </p>
            <div className="flex items-center">
              <i className="fas fa-envelope mr-3 text-teal-400"></i>
              <span className="bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent font-medium">
                basanta11subedi@gmail.com
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;
