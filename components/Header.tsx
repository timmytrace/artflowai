import React from 'react';

interface HeaderProps {
    onNavigate?: (view: 'home' | 'studio') => void;
    currentView?: 'home' | 'studio';
    isPremium?: boolean;
    onUpgrade?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, isPremium, onUpgrade }) => {
  const handleNavClick = (e: React.MouseEvent, view: 'home' | 'studio', hash?: string) => {
      e.preventDefault();
      if (onNavigate) {
          onNavigate(view);
          if (hash) {
              setTimeout(() => {
                const element = document.querySelector(hash);
                element?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
          }
      }
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={(e) => handleNavClick(e, 'home')} className="flex items-center hover:opacity-80 transition-opacity">
          <img 
            src="/images/artflow logo.png" 
            alt="AI Art & Sip Logo" 
            className="h-12 w-auto"
          />
        </button>
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={(e) => handleNavClick(e, 'home', '#about')} className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">About Us</button>
          <button onClick={(e) => handleNavClick(e, 'home', '#how-it-works')} className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">How It Works</button>
          <button onClick={(e) => handleNavClick(e, 'home', '#pricing')} className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">Pricing</button>
          <button onClick={(e) => handleNavClick(e, 'home', '#reviews')} className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">Reviews</button>
          
          {isPremium ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-full border border-purple-500/50">
                  <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">All Access</span>
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
          ) : (
              <button 
                onClick={onUpgrade}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
              >
                  Upgrade to Pro
              </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;