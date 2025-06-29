
import { ArrowLeft, Play, BarChart3, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  language: 'ar' | 'en';
}

const HeroSection = ({ language }: HeroSectionProps) => {
  const content = {
    ar: {
      title: 'إدارة المخزون الذكية',
      subtitle: 'للمحلات الصغيرة والمتوسطة',
      description: 'نظام StockSense الشامل لإدارة المخزون، المبيعات، والمشتريات بكفاءة عالية. اجعل تجارتك تنمو مع تقنيات الذكاء الاصطناعي.',
      cta1: 'ابدأ تجربتك المجانية',
      cta2: 'شاهد العرض التوضيحي',
      stats: {
        title: 'أرقام تتحدث عن نفسها',
        items: [
          { label: 'زيادة في الأرباح', value: '40%', icon: TrendingUp },
          { label: 'توفير في الوقت', value: '60%', icon: Package },
          { label: 'دقة في التقارير', value: '99%', icon: BarChart3 },
        ]
      }
    },
    en: {
      title: 'Smart Inventory Management',
      subtitle: 'For Small & Medium Businesses',
      description: 'Comprehensive StockSense system for managing inventory, sales, and purchases with high efficiency. Grow your business with AI-powered technologies.',
      cta1: 'Start Free Trial',
      cta2: 'Watch Demo',
      stats: {
        title: 'Numbers Speak for Themselves',
        items: [
          { label: 'Profit Increase', value: '40%', icon: TrendingUp },
          { label: 'Time Saving', value: '60%', icon: Package },
          { label: 'Report Accuracy', value: '99%', icon: BarChart3 },
        ]
      }
    }
  };

  const text = content[language];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-hero-gradient"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container-custom section-padding">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              {text.title}
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-6">
              {text.subtitle}
            </h2>
          </div>

          {/* Description */}
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {text.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button className="btn-primary text-lg px-8 py-4 shadow-2xl">
              {text.cta1}
              <ArrowLeft className="ml-2 rtl:ml-0 rtl:mr-2 w-5 h-5 rtl:rotate-180" />
            </Button>
            <Button className="btn-secondary text-lg px-8 py-4">
              <Play className="ml-2 rtl:ml-0 rtl:mr-2 w-5 h-5" />
              {text.cta2}
            </Button>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-semibold text-white/90 mb-8">{text.stats.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {text.stats.items.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-center mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
