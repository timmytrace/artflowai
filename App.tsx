import React, { useState } from 'react';
import type { Painting } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import HowItWorks from './components/HowItWorks';
import Reviews from './components/Reviews';
import InteractiveStudio from './components/InteractiveStudio';
import PaintingGenerator from './components/PaintingGenerator';
import About from './components/About';
import Pricing from './components/Pricing';

type ViewState = 'home' | 'studio';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [studioPainting, setStudioPainting] = useState<Painting | null>(null);
  
  // Monetization State: Default to true (Free for now)
  const [isPremium, setIsPremium] = useState(true);

  const handleNavigate = (targetView: ViewState) => {
    setView(targetView);
    if (targetView === 'home') {
        setStudioPainting(null);
    }
    window.scrollTo(0, 0);
  };

  const handleCloseModal = () => {
    setSelectedPainting(null);
  };

  const handlePaintInStudio = (painting: Painting) => {
      setStudioPainting(painting);
      setSelectedPainting(null);
      handleNavigate('studio');
  };
  
  // Mock upgrade function for demo purposes
  const handleUpgrade = () => {
      const confirmed = window.confirm("Demo: Proceed to Payment Gateway?\n(Clicking OK will upgrade you to Premium instantly)");
      if (confirmed) {
          setIsPremium(true);
          alert("Welcome to Pro! All features are now unlocked.");
      }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-inter">
      <Header 
        onNavigate={handleNavigate} 
        currentView={view} 
        isPremium={isPremium}
        onUpgrade={handleUpgrade}
      />
      
      <main>
        {view === 'home' ? (
          <>
            <Hero onNavigateToStudio={() => handleNavigate('studio')} />
            
            <About />

            {/* Replaced EventGrid with PaintingGenerator */}
            <PaintingGenerator onPaintInStudio={handlePaintInStudio} />

            <HowItWorks />
            
            <Pricing onUpgrade={handleUpgrade} />

            <Reviews paintings={[]} /> 
          </>
        ) : (
            <InteractiveStudio 
                initialPainting={studioPainting} 
                onBack={() => handleNavigate('home')} 
                isPremium={isPremium}
                onUpgrade={handleUpgrade}
            />
        )}
      </main>
      
      <Footer />
      
      {selectedPainting && (
        <BookingModal 
          painting={selectedPainting}
          onClose={handleCloseModal}
          onPaintInStudio={handlePaintInStudio}
        />
      )}
    </div>
  );
};

export default App;