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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Visitor</h3>
            <div className="text-4xl font-bold text-white mb-6">Free</div>
            <p className="text-gray-400 mb-8">Perfect for trying out the digital canvas.</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Free Paint Mode
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Basic Brushes (Round, Square)
              </li>
              <li className="flex items-center text-gray-500">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                AI Idea Generation
              </li>
              <li className="flex items-center text-gray-500">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                AI Instructor Lessons
              </li>
            </ul>
            <button className="w-full py-3 rounded-full border border-gray-600 text-white font-bold hover:bg-gray-700 transition-colors">
              Current Plan
            </button>
          </div>

          {/* Day Pass */}
          <div className="bg-gray-800 rounded-2xl p-8 border-2 border-purple-500 relative transform md:-translate-y-4 shadow-2xl flex flex-col">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Day Pass</h3>
            <div className="text-4xl font-bold text-white mb-1">$4.99</div>
            <span className="text-sm text-gray-400 mb-6">/ 24 hours</span>
            <p className="text-gray-400 mb-8">Full access for a fun date night or solo session.</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Unlimited AI Image Generation
              </li>
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Full AI Instructor Access
              </li>
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Advanced Brushes (Watercolor, etc.)
              </li>
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Save & Load Sessions
              </li>
            </ul>
            <button 
              onClick={onUpgrade}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all"
            >
              Get Day Pass
            </button>
          </div>

          {/* Monthly */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Pro Artist</h3>
            <div className="text-4xl font-bold text-white mb-1">$14.99</div>
            <span className="text-sm text-gray-400 mb-6">/ month</span>
            <p className="text-gray-400 mb-8">For the dedicated creative.</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Everything in Day Pass
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                High-Res Downloads
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
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