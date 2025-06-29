
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
    <section id="features" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
            {text.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {text.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {text.features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 animate-fade-in-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-hero-gradient rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
