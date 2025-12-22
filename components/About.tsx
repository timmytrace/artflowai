import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-600/30 rounded-full blur-3xl"></div>
             <img 
                src="https://image.pollinations.ai/prompt/cozy%20art%20studio%20interior%20with%20plants%20and%20easels%20warm%20lighting%20realistic?width=800&height=600&nologo=true" 
                alt="Our Studio Mission" 
                className="relative z-10 rounded-2xl shadow-2xl border border-gray-700 w-full object-cover transform rotate-2 hover:rotate-0 transition-transform duration-500"
             />
          </div>
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold font-playfair text-white">
              Democratizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Digital Art Creation</span>
            </h2>
            <div className="w-20 h-1 bg-purple-600 rounded-full"></div>
            <p className="text-gray-300 text-lg leading-relaxed">
              <strong>Artflow AI</strong> is a next-generation digital art platform that combines the intuitive experience of traditional painting with the power of artificial intelligence. We're solving the accessibility problem in digital art creation.
            </p>
            <p className="text-gray-400 leading-relaxed">
              <strong>The Problem:</strong> Traditional art requires years of training. Complex digital tools like Photoshop have steep learning curves. AI art generators lack interactivity and personalization.
            </p>
            <p className="text-gray-400 leading-relaxed">
              <strong>Our Solution:</strong> An AI-powered canvas with real-time instruction, generative image creation from text, and professional-grade tools accessible to everyone—regardless of artistic background.
            </p>
            <div className="pt-4 flex gap-4">
                <div className="text-center">
                    <h4 className="text-3xl font-bold text-white">Beta</h4>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Live & Accessible</p>
                </div>
                <div className="w-px bg-gray-700"></div>
                <div className="text-center">
                    <h4 className="text-3xl font-bold text-white">100%</h4>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Free Access</p>
                </div>
                <div className="w-px bg-gray-700"></div>
                <div className="text-center">
                    <h4 className="text-3xl font-bold text-white">AI</h4>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Powered</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;