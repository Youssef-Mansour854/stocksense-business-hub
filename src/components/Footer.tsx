import { Mail, Phone, MapPin, Heart, Facebook, Instagram } from 'lucide-react';

interface FooterProps {
  language: 'ar' | 'en';
}

const Footer = ({ language }: FooterProps) => {
  const content = {
    ar: {
      description: 'نظام إدارة المخزون الذكي للمحلات الصغيرة والمتوسطة',
      quickLinks: {
        title: 'روابط سريعة',
        links: [
          { name: 'الرئيسية', href: '#home' },
          { name: 'من نحن', href: '#about' },
          { name: 'المميزات', href: '#features' },
          { name: 'الباقات', href: '#pricing' }
        ]
      },
      contact: {
        title: 'تواصل معنا',
        email: 'info@stocksense.com',
        phone: '+966 50 123 4567',
        address: 'الرياض، المملكة العربية السعودية'
      },
      support: {
        title: 'الدعم',
        links: [
          { name: 'مركز المساعدة', href: '#' },
          { name: 'الأسئلة الشائعة', href: '#' },
          { name: 'الدعم الفني', href: '#' },
          { name: 'التدريب', href: '#' }
        ]
      },
      legal: {
        title: 'قانوني',
        links: [
          { name: 'شروط الاستخدام', href: '#' },
          { name: 'سياسة الخصوصية', href: '#' },
          { name: 'سياسة الاسترداد', href: '#' }
        ]
      },
      copyright: 'جميع الحقوق محفوظة',
      madeWith: 'صُنع بـ',
      by: 'بواسطة فريق StockSense'
    },
    en: {
      description: 'Smart inventory management system for small and medium businesses',
      quickLinks: {
        title: 'Quick Links',
        links: [
          { name: 'Home', href: '#home' },
          { name: 'About', href: '#about' },
          { name: 'Features', href: '#features' },
          { name: 'Pricing', href: '#pricing' }
        ]
      },
      contact: {
        title: 'Contact Us',
        email: 'info@stocksense.com',
        phone: '+966 50 123 4567',
        address: 'Riyadh, Saudi Arabia'
      },
      support: {
        title: 'Support',
        links: [
          { name: 'Help Center', href: '#' },
          { name: 'FAQ', href: '#' },
          { name: 'Technical Support', href: '#' },
          { name: 'Training', href: '#' }
        ]
      },
      legal: {
        title: 'Legal',
        links: [
          { name: 'Terms of Service', href: '#' },
          { name: 'Privacy Policy', href: '#' },
          { name: 'Refund Policy', href: '#' }
        ]
      },
      copyright: 'All rights reserved',
      madeWith: 'Made with',
      by: 'by StockSense Team'
    }
  };

  const text = content[language];

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container-custom relative z-10">
        {/* Main Footer Content */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Enhanced Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-8 group">
              <div className="w-14 h-14 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <span className="text-3xl font-bold text-gradient">StockSense</span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-8 text-lg">
              {text.description}
            </p>
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-primary transition-all duration-300 hover:scale-125">
                <Facebook className="w-7 h-7" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-all duration-300 hover:scale-125">
                <Instagram className="w-7 h-7" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-all duration-300 hover:scale-125">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-primary">{text.quickLinks.title}</h3>
            <ul className="space-y-4">
              {text.quickLinks.links.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-all duration-300 text-lg hover:translate-x-2 rtl:hover:-translate-x-2 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-accent">{text.support.title}</h3>
            <ul className="space-y-4">
              {text.support.links.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-all duration-300 text-lg hover:translate-x-2 rtl:hover:-translate-x-2 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Enhanced Contact Info */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-success">{text.contact.title}</h3>
            <div className="space-y-6">
              <div className="flex items-center group">
                <div className="p-3 bg-primary/20 rounded-xl ml-4 rtl:ml-0 rtl:mr-4 group-hover:bg-primary/30 transition-colors">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <span className="text-gray-300 text-lg">{text.contact.email}</span>
              </div>
              <div className="flex items-center group">
                <div className="p-3 bg-accent/20 rounded-xl ml-4 rtl:ml-0 rtl:mr-4 group-hover:bg-accent/30 transition-colors">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <span className="text-gray-300 text-lg">{text.contact.phone}</span>
              </div>
              <div className="flex items-start group">
                <div className="p-3 bg-success/20 rounded-xl ml-4 rtl:ml-0 rtl:mr-4 mt-1 group-hover:bg-success/30 transition-colors">
                  <MapPin className="w-6 h-6 text-success" />
                </div>
                <span className="text-gray-300 text-lg">{text.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Footer */}
        <div className="border-t border-gray-700/50 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-gray-400 text-lg">
              © 2024 StockSense. {text.copyright}
            </div>
            <div className="flex items-center text-gray-400 text-lg">
              {text.madeWith}
              <Heart className="w-5 h-5 text-red-500 mx-2 animate-pulse" />
              {text.by}
            </div>
            <div className="flex space-x-8 rtl:space-x-reverse">
              {text.legal.links.map((link, index) => (
                <a 
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-primary transition-all duration-300 text-lg hover:underline"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
