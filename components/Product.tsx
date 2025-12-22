import React from 'react';

const Product: React.FC = () => {
  return (
    <section id="product" className="py-20 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-playfair text-white mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Product</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Artflow AI is a next-generation digital art creation platform powered by advanced AI technology.
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-red-600/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">The Problem</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  Traditional art creation requires years of training and expensive tools
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  Digital art software has steep learning curves (Photoshop, Procreate)
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  Beginners lack guidance and struggle with creative blocks
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  Existing AI art tools lack interactivity and personalization
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30">
              <div className="w-16 h-16 bg-green-600/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Solution</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  AI-powered canvas with intelligent brush tools for instant results
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Real-time AI instructor providing step-by-step guidance
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Generative AI creates reference images from text descriptions
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Browser-based platform accessible anywhere, no installation needed
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Core Technology & Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">AI-Powered Canvas</h4>
              <p className="text-gray-400 text-sm">
                Professional-grade digital canvas with multiple brush styles, color mixing, and advanced tools powered by HTML5 Canvas API and real-time rendering.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Generative AI Integration</h4>
              <p className="text-gray-400 text-sm">
                Powered by Google Gemini AI for text-to-image generation, creating custom reference images and artwork suggestions based on natural language prompts.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">AI Instructor System</h4>
              <p className="text-gray-400 text-sm">
                Interactive AI-powered lesson system that provides step-by-step painting instructions, techniques, and real-time feedback with text-to-speech capability.
              </p>
            </div>
          </div>
        </div>

        {/* Current Stage & Roadmap */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
              Current Development Stage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">Beta Phase</h4>
                <p className="text-gray-300 text-sm">Live platform with core features deployed and accessible at artflowai.ca</p>
              </div>
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">Free Access</h4>
                <p className="text-gray-300 text-sm">Currently offering unlimited access to gather user feedback and refine AI models</p>
              </div>
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">Active Development</h4>
                <p className="text-gray-300 text-sm">Continuous improvements based on user feedback and AI model optimization</p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">Technology Stack</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-3xl mb-2">⚛️</div>
                <p className="text-sm text-gray-300 font-semibold">React + TypeScript</p>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-3xl mb-2">🤖</div>
                <p className="text-sm text-gray-300 font-semibold">Google Gemini AI</p>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-3xl mb-2">☁️</div>
                <p className="text-sm text-gray-300 font-semibold">Azure Static Web Apps</p>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-3xl mb-2">🎨</div>
                <p className="text-sm text-gray-300 font-semibold">HTML5 Canvas</p>
              </div>
            </div>
          </div>

          {/* Live Demo */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Try the Live Demo</h3>
            <p className="text-gray-300 mb-6">
              Experience Artflow AI in action. No signup required, start creating immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="https://artflowai.ca" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all"
              >
                Launch Platform
              </a>
              <a 
                href="https://github.com/timmytrace/artflowai" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full border border-purple-500 text-purple-300 font-bold hover:bg-purple-900/30 transition-all"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
