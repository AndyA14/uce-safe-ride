import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import Footer from '@/components/landing/Footer';
import LoginModal from '@/components/landing/LoginModal';
import '@/styles/pages/LandingPage.css';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login');

  const handleLoginClick = () => {
    setModalTab('login');
    setIsModalOpen(true);
  };

  const handleGetStartedClick = () => {
    setModalTab('register');
    setIsModalOpen(true);
  };

  return (
    <div className="landing-page">
      <Navbar onLoginClick={handleLoginClick} />
      <main>
        <HeroSection onGetStartedClick={handleGetStartedClick} />
        <FeaturesSection />
      </main>
      <Footer />
      {isModalOpen && (
        <LoginModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          initialTab={modalTab}
        />
      )}
    </div>
  );
}
