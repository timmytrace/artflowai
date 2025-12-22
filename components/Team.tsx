import React from 'react';

const Team: React.FC = () => {
  return (
    <section id="team" className="py-20 bg-gray-800 border-t border-gray-700">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-playfair text-white mb-4">
            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Team</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A passionate team combining AI expertise with creative vision to democratize digital art creation.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Founder Section */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                TT
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Timilehin (Founder & CEO)</h3>
                <p className="text-purple-400 mb-4">AI & Product Development</p>
                <p className="text-gray-300 mb-4">
                  Timilehin founded Artflow AI with a vision to make digital art creation accessible to everyone, regardless of artistic skill level. 
                  With expertise in AI/ML and a passion for creative technology, he's building tools that empower users to express their creativity through AI-assisted art generation.
                </p>
                <div className="flex gap-4 justify-center md:justify-start">
                  <div className="text-gray-400">
                    <span className="font-semibold text-white">Focus:</span> AI Model Integration, Product Strategy, User Experience
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Our Mission</h4>
              <p className="text-gray-400">
                Democratize digital art creation by combining AI technology with intuitive design, making professional-quality art accessible to everyone.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Our Values</h4>
              <p className="text-gray-400">
                Innovation in AI, accessibility for all skill levels, and fostering creativity through technology-enhanced experiences.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30 text-center">
            <h4 className="text-xl font-bold text-white mb-2">Get in Touch</h4>
            <p className="text-gray-300 mb-4">
              Interested in partnerships, investment opportunities, or have questions about our technology?
            </p>
            <a 
              href="mailto:contact@artflowai.ca" 
              className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
