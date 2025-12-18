import React from 'react';

interface PricingProps {
  onUpgrade: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onUpgrade }) => {
  return (
    <section id="pricing" className="py-20 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-playfair text-white mb-4">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Inner Artist</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your creative journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-12 border border-purple-500/30 text-center backdrop-blur-sm">
            <div className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-6">
              Limited Time Offer
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">All Features Are Currently Free!</h3>
            <p className="text-xl text-gray-300 mb-8">
              We are in early access. Enjoy unlimited AI generation, advanced brushes, and instructor lessons on us.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-8">
              <div className="flex items-center text-gray-200">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Unlimited AI Image Generation
              </div>
              <div className="flex items-center text-gray-200">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Full AI Instructor Access
              </div>
              <div className="flex items-center text-gray-200">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Advanced Brushes (Watercolor, etc.)
              </div>
              <div className="flex items-center text-gray-200">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Save & Load Sessions
              </div>
            </div>

            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Start Creating Now
            </button>
          </div>
        </div>
                Priority Generation
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Community Gallery Access
              </li>
            </ul>
            <button 
              onClick={onUpgrade}
              className="w-full py-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;