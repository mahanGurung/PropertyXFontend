import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen flex flex-col bg-gray-900">
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-100">Share Your Feedback</h1>
            <p className="mt-4 text-lg text-gray-400">
              We value your input! Let us know about your experience or report any issues.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-400 mb-1">
                    Feedback or Issue Description
                  </label>
                  <Textarea
                    id="feedback"
                    rows={6}
                    value={formData.feedback}
                    onChange={(e) => handleChange('feedback', e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Describe your feedback or issue in detail..."
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                      </>
                    ) : 'Submit'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="mt-8 bg-gray-800 border border-cyan-400/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Need Immediate Help?</h3>
            <p className="text-gray-400 mb-4">
              For urgent issues, please contact our support team directly at:
            </p>
            <div className="flex items-center text-cyan-400">
              <i className="fas fa-envelope mr-2"></i>
              <span>basanta11subedi@gmail.com</span>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Feedback;