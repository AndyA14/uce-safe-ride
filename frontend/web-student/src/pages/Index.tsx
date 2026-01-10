import React, { useState } from 'react';
import { Navigate } from 'react-router-dom'; // <--- IMPORTANTE: Importar Navigate
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import Footer from '@/components/landing/Footer';
import LoginModal from '@/components/landing/LoginModal';
import RegisterModal from '@/components/landing/RegisterModal';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/student" replace />;
  }
  // ------------------------

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <HeroSection onLoginClick={() => setShowLogin(true)} />
      <FeaturesSection />
      <Footer />
      
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal 
        isOpen={showRegister} 
        onClose={() => setShowRegister(false)} 
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default Index;