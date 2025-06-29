
import { Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingSectionProps {
  language: 'ar' | 'en';
}

const PricingSection = ({ language }: PricingSectionProps) => {
  const content = {
    ar: {
      title: 'جميع المميزات مجانية',
      subtitle: 'استمتع بجميع مميزات StockSense مجاناً مدى الحياة',
      features: [
        'منتجات غير محدودة',
        'مستخدمين غير محدود',
        'تقارير تحليلية متقدمة',
        'دعم فني 24/7',
        'مخازن غير محدودة',
        'تطبيق جوال',
        'تكامل مع الأنظمة الأخرى',
        'نسخ احتياطية يومية',
        'نظام نقاط البيع المتقدم',
        'إدارة الموردين والعملاء',
        'تحليلات الأرباح والخسائر',
        'إشعارات ذكية'
      ],
      registerNow: 'سجل الآن مجاناً',
      freeForever: 'مجاني للأبد',
      noHiddenFees: 'بدون رسوم خفية'
    },
    en: {
      title: 'All Features Free',
      subtitle: 'Enjoy all StockSense features for free, forever',
      features: [
        'Unlimited products',
        'Unlimited users',
        'Advanced analytics',
        '24/7 support',
        'Unlimited warehouses',
        'Mobile app',
        'Third-party integrations',
        'Daily backups',
        'Advanced POS system',
        'Supplier & customer management',
        'Profit & loss analytics',
        'Smart notifications'
      ],
      registerNow: 'Register Now For Free',
      freeForever: 'Free Forever',
      noHiddenFees: 'No Hidden Fees'
    }
  };

  const text = content[language];

  return (
    <section id="pricing" className="section-padding bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center w-20 h-20 bg-hero-gradient rounded-full mx-auto mb-6 animate-pulse">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
            {text.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {text.subtitle}
          </p>
        </div>

        {/* Single Feature Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-stocksense-blue p-8 md:p-12 animate-fade-in-up">
            {/* Free Badge */}
            <div className="text-center mb-8">
              <div className="inline-block bg-hero-gradient text-white px-8 py-3 rounded-full text-lg font-bold mb-4">
                {text.freeForever}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {text.noHiddenFees}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {text.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-stocksense-green flex-shrink-0 mt-0.5 ml-2 rtl:ml-0 rtl:mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button 
                className="btn-primary text-lg px-12 py-4 font-bold transform hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {text.registerNow}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
