import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  TruckIcon as Truck, 
  Calculator,
  Shield,
  Smartphone,
  Clock,
  Target,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturesSectionProps {
  language: 'ar' | 'en';
}

const FeaturesSection = ({ language }: FeaturesSectionProps) => {
  const content = {
    ar: {
      title: 'لماذا StockSense؟',
      subtitle: 'مميزات تجعل إدارة مخزونك أسهل وأكثر فعالية',
      features: [
        {
          icon: BarChart3,
          title: 'تقارير ذكية',
          description: 'تحليلات مفصلة ورسوم بيانية تفاعلية لمتابعة أداء عملك بدقة'
        },
        {
          icon: Package,
          title: 'إدارة المخزون',
          description: 'تتبع كامل للمنتجات مع تنبيهات نقص المخزون وإدارة المستودعات'
        },
        {
          icon: Users,
          title: 'إدارة الموظفين',
          description: 'نظام صلاحيات متقدم لإدارة الفرق والموظفين بكفاءة'
        },
        {
          icon: ShoppingCart,
          title: 'نظام نقاط البيع',
          description: 'واجهة بيع سهلة ومرنة مع دعم طرق الدفع المختلفة'
        },
        {
          icon: Truck,
          title: 'إدارة الموردين',
          description: 'متابعة شاملة للموردين والمشتريات مع إدارة المدفوعات'
        },
        {
          icon: Calculator,
          title: 'المحاسبة الذكية',
          description: 'حسابات تلقائية للأرباح والخسائر مع تقارير مالية شاملة'
        },
        {
          icon: Shield,
          title: 'أمان عالي',
          description: 'حماية متقدمة لبياناتك مع نسخ احتياطية آمنة'
        },
        {
          icon: Smartphone,
          title: 'متوافق مع الجوال',
          description: 'تصميم متجاوب يعمل بسلاسة على جميع الأجهزة'
        },
        {
          icon: Clock,
          title: 'توفير الوقت',
          description: 'أتمتة العمليات الروتينية لتوفير وقتك للتركيز على النمو'
        },
        {
          icon: Target,
          title: 'سهولة الاستخدام',
          description: 'واجهة بديهية وسهلة التعلم لجميع مستويات المستخدمين'
        },
        {
          icon: Zap,
          title: 'أداء سريع',
          description: 'استجابة فورية وأداء عالي حتى مع كميات البيانات الكبيرة'
        },
        {
          icon: Globe,
          title: 'دعم متعدد اللغات',
          description: 'واجهة باللغتين العربية والإنجليزية مع دعم العملات المختلفة'
        }
      ]
    },
    en: {
      title: 'Why StockSense?',
      subtitle: 'Features that make inventory management easier and more effective',
      features: [
        {
          icon: BarChart3,
          title: 'Smart Reports',
          description: 'Detailed analytics and interactive charts to track your business performance accurately'
        },
        {
          icon: Package,
          title: 'Inventory Management',
          description: 'Complete product tracking with low stock alerts and warehouse management'
        },
        {
          icon: Users,
          title: 'Staff Management',
          description: 'Advanced permissions system for efficient team and employee management'
        },
        {
          icon: ShoppingCart,
          title: 'Point of Sale',
          description: 'Easy and flexible sales interface with support for various payment methods'
        },
        {
          icon: Truck,
          title: 'Supplier Management',
          description: 'Comprehensive supplier and purchase tracking with payment management'
        },
        {
          icon: Calculator,
          title: 'Smart Accounting',
          description: 'Automatic profit and loss calculations with comprehensive financial reports'
        },
        {
          icon: Shield,
          title: 'High Security',
          description: 'Advanced data protection with secure backups'
        },
        {
          icon: Smartphone,
          title: 'Mobile Friendly',
          description: 'Responsive design that works seamlessly on all devices'
        },
        {
          icon: Clock,
          title: 'Time Saving',
          description: 'Automate routine processes to save time for focusing on growth'
        },
        {
          icon: Target,
          title: 'Easy to Use',
          description: 'Intuitive and easy-to-learn interface for all user levels'
        },
        {
          icon: Zap,
          title: 'Fast Performance',
          description: 'Instant response and high performance even with large amounts of data'
        },
        {
          icon: Globe,
          title: 'Multi-language Support',
          description: 'Interface in Arabic and English with support for different currencies'
        }
      ]
    }
  };

  const text = content[language];

  return (
    <section id="features" className="section-padding bg-gradient-to-b from-background to-secondary/20">
      <div className="container-custom">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-gradient mb-6 animate-fade-in-up">
            {text.title}
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            {text.subtitle}
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {text.features.map((feature, index) => (
            <div 
              key={index} 
              className="card-modern group hover:glow-effect animate-bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg group-hover:text-foreground/80 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center mt-20 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="inline-block p-8 bg-gradient-glass backdrop-blur-xl rounded-3xl border border-border/20">
            <h3 className="text-3xl font-bold text-gradient mb-4">
              {language === 'ar' ? 'جاهز للبدء؟' : 'Ready to Start?'}
            </h3>
            <p className="text-xl text-muted-foreground mb-6">
              {language === 'ar' ? 'انضم إلى آلاف المتاجر الناجحة' : 'Join thousands of successful stores'}
            </p>
            <Button className="btn-primary text-xl px-10 py-6 animate-glow">
              {language === 'ar' ? 'ابدأ الآن مجاناً' : 'Start Free Now'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;