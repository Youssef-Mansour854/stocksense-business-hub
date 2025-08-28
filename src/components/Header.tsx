import { useState } from 'react';
import { Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: 'ar' | 'en';
  toggleLanguage: () => void;
}

const Header = ({ darkMode, toggleDarkMode, language, toggleLanguage }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = {
    ar: [
      { name: 'الرئيسية', href: '#home' },
      { name: 'من نحن', href: '#about' },
      { name: 'المميزات', href: '#features' },
      { name: 'اتصل بنا', href: '#contact' },
    ],
    en: [
      { name: 'Home', href: '#home' },
      { name: 'About', href: '#about' },
      { name: 'Features', href: '#features' },
      { name: 'Contact', href: '#contact' },
    ]
  };

  const text = {
    ar: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      demo: 'التسجيل مجاناً'
    },
    en: {
      login: 'Login',
      signup: 'Sign Up',
      demo: 'Register Free'
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-white/10">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 rtl:space-x-reverse group">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gradient">
                StockSense
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {menuItems[language].map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="relative text-foreground/80 hover:text-primary transition-all duration-300 font-medium group py-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></div>
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300"
            >
              <Globe className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
              {language === 'ar' ? 'EN' : 'AR'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Link to="/login">
              <Button variant="ghost" className="text-foreground/70 hover:text-primary rounded-xl">
                {text[language].login}
              </Button>
            </Link>
            
            <Link to="/register">
              <Button className="btn-primary animate-glow">
                {text[language].demo}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="text-foreground/70 hover:text-primary rounded-xl"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground/70 hover:text-primary rounded-xl"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 animate-fade-in-up bg-gradient-glass backdrop-blur-xl rounded-2xl border border-white/10 mt-4 mb-4">
            <nav className="flex flex-col space-y-4">
              {menuItems[language].map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-all duration-300 font-medium px-6 py-3 rounded-xl hover:bg-primary/10 animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-3 px-6 pt-4 border-t border-white/10">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="text-foreground/70 hover:text-primary justify-start w-full rounded-xl">
                    {text[language].login}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="btn-primary justify-start w-full">
                    {text[language].demo}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;