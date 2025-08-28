
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
      {/* Enhanced Background with 3D Elements */}
      <div className="absolute inset-0 bg-hero-gradient"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-gradient-secondary rounded-2xl blur-sm animate-bounce-in opacity-20" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-16 h-16 bg-gradient-success rounded-full blur-sm animate-bounce-in opacity-30" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 container-custom section-padding">
        <div className="text-center">
          {/* Main Heading with Enhanced Typography */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="block">{text.title}</span>
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-white/90 mb-8 animate-pulse-soft">
              {text.subtitle}
            </h2>
          </div>

          {/* Enhanced Description */}
          <p className="text-2xl text-white/80 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {text.description}
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button className="btn-primary text-xl px-12 py-6 shadow-2xl animate-glow">
              {text.cta1}
              <ArrowLeft className="ml-3 rtl:ml-0 rtl:mr-3 w-6 h-6 rtl:rotate-180" />
            </Button>
            <Button className="btn-secondary text-xl px-12 py-6 hover:scale-110 transition-all duration-500">
              <Play className="ml-3 rtl:ml-0 rtl:mr-3 w-6 h-6" />
              {text.cta2}
            </Button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-2xl font-semibold text-white/90 mb-12">{text.stats.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {text.stats.items.map((stat, index) => (
                <div 
                  key={index} 
                  className="card-glass p-8 hover:scale-110 transition-all duration-500 animate-bounce-in"
                  style={{ animationDelay: `${0.8 + index * 0.2}s` }}
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-4 bg-gradient-primary rounded-2xl">
                      <stat.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-white mb-4">{stat.value}</div>
                  <div className="text-white/80 text-lg">{stat.label}</div>
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
