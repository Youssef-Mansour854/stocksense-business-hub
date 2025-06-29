
import PricingHeader from './pricing/PricingHeader';
import PricingCard from './pricing/PricingCard';

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
        <PricingHeader title={text.title} subtitle={text.subtitle} />
        <PricingCard 
          freeForever={text.freeForever}
          noHiddenFees={text.noHiddenFees}
          features={text.features}
          registerNow={text.registerNow}
        />
      </div>
    </section>
  );
};

export default PricingSection;
