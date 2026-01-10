import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import uceLogo from '@/assets/uce-logo.png';

interface NavbarProps {
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={uceLogo} 
              alt="Universidad Central del Ecuador" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary leading-tight">UCE Safe Ride</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Universidad Central del Ecuador</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Características
            </a>
            <a href="#routes" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Rutas
            </a>
            <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Contacto
            </a>
            <Button variant="default" onClick={onLoginClick} className="font-semibold">
              Iniciar Sesión
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors">
                Características
              </a>
              <a href="#routes" className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors">
                Rutas
              </a>
              <a href="#contact" className="text-sm font-medium py-2 text-foreground/80 hover:text-primary transition-colors">
                Contacto
              </a>
              <Button variant="default" onClick={onLoginClick} className="w-full font-semibold">
                Iniciar Sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
