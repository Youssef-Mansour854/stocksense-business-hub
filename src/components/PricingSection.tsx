
import { Check, Star, Zap, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingSectionProps {
  language: 'ar' | 'en';
}

const PricingSection = ({ language }: PricingSectionProps) => {
  const content = {
    ar: {
      title: 'خطط الاشتراك',
      subtitle: 'اختر الخطة المناسبة لحجم عملك',
      monthly: 'شهري',
      yearly: 'سنوي',
      save: 'وفر 20%',
      mostPopular: 'الأكثر شيوعاً',
      getStarted: 'ابدأ الآن',
      contactUs: 'تواصل معنا',
      plans: [
        {
          name: 'تجريبي',
          icon: Star,
          price: 'مجاني',
          period: '14 يوم',
          description: 'للتجربة والاستكشاف',
          popular: false,
          features: [
            'إدارة 50 منتج',
            'مستخدم واحد',
            'تقارير أساسية',
            'دعم بالبريد الإلكتروني',
            'مخزن واحد'
          ]
        },
        {
          name: 'أساسي',
          icon: Zap,
          price: '99',
          period: 'شهرياً',
          description: 'للمحلات الصغيرة',
          popular: true,
          features: [
            'إدارة 1000 منتج',
            '3 مستخدمين',
            'تقارير متقدمة',
            'دعم هاتفي',
            '2 مخزن',
            'نظام نقاط البيع',
            'إدارة الموردين'
          ]
        },
        {
          name: 'احترافي',
          icon: Crown,
          price: '199',
          period: 'شهرياً',
          description: 'للأعمال المتوسطة',
          popular: false,
          features: [
            'منتجات غير محدودة',
            '10 مستخدمين',
            'تقارير تحليلية متقدمة',
            'دعم أولوية',
            '5 مخازن',
            'تطبيق جوال',
            'تكامل مع الأنظمة الأخرى',
            'نسخ احتياطية يومية'
          ]
        },
        {
          name: 'مؤسسي',
          icon: Building2,
          price: 'مخصص',
          period: '',
          description: 'للشركات الكبيرة',
          popular: false,
          features: [
            'حلول مخصصة',
            'مستخدمين غير محدود',
            'تقارير مخصصة',
            'دعم مخصص 24/7',
            'مخازن غير محدودة',
            'خوادم مخصصة',
            'تدريب مخصص',
            'تكامل API كامل'
          ]
        }
      ]
    },
    en: {
      title: 'Pricing Plans',
      subtitle: 'Choose the perfect plan for your business size',
      monthly: 'Monthly',
      yearly: 'Yearly',
      save: 'Save 20%',
      mostPopular: 'Most Popular',
      getStarted: 'Get Started',
      contactUs: 'Contact Us',
      plans: [
        {
          name: 'Trial',
          icon: Star,
          price: 'Free',
          period: '14 days',
          description: 'For testing and exploration',
          popular: false,
          features: [
            'Manage 50 products',
            '1 user',
            'Basic reports',
            'Email support',
            '1 warehouse'
          ]
        },
        {
          name: 'Basic',
          icon: Zap,
          price: '$99',
          period: 'per month',
          description: 'For small stores',
          popular: true,
          features: [
            'Manage 1000 products',
            '3 users',
            'Advanced reports',
            'Phone support',
            '2 warehouses',
            'Point of sale system',
            'Supplier management'
          ]
        },
        {
          name: 'Professional',
          icon: Crown,
          price: '$199',
          period: 'per month',
          description: 'For medium businesses',
          popular: false,
          features: [
            'Unlimited products',
            '10 users',
            'Advanced analytics',
            'Priority support',
            '5 warehouses',
            'Mobile app',
            'Third-party integrations',
            'Daily backups'
          ]
        },
        {
          name: 'Enterprise',
          icon: Building2,
          price: 'Custom',
          period: '',
          description: 'For large companies',
          popular: false,
          features: [
            'Custom solutions',
            'Unlimited users',
            'Custom reports',
            'Dedicated 24/7 support',
            'Unlimited warehouses',
            'Dedicated servers',
            'Custom training',
            'Full API integration'
          ]
        }
      ]
    }
  };

  const text = content[language];

  return (
    <section id="pricing" className="section-padding bg-white dark:bg-gray-800">
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {text.plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl border-2 transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                plan.popular 
                  ? 'border-stocksense-blue shadow-2xl transform scale-105' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-stocksense-blue/50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-hero-gradient text-white px-6 py-2 rounded-full text-sm font-semibold">
                    {text.mostPopular}
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-hero-gradient rounded-2xl mx-auto mb-4">
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600 dark:text-gray-300 text-lg">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-stocksense-green flex-shrink-0 mt-0.5 ml-2 rtl:ml-0 rtl:mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  className={`w-full py-3 font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'btn-primary' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-hero-gradient hover:text-white'
                  }`}
                >
                  {plan.price === 'مخصص' || plan.price === 'Custom' ? text.contactUs : text.getStarted}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
