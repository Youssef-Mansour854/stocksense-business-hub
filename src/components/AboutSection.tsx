
import { Target, Eye, Heart, Users, Award, Rocket } from 'lucide-react';

interface AboutSectionProps {
  language: 'ar' | 'en';
}

const AboutSection = ({ language }: AboutSectionProps) => {
  const content = {
    ar: {
      title: 'من نحن',
      subtitle: 'نحن فريق شغوف بتطوير حلول تقنية تساعد الأعمال على النمو والازدهار',
      description: 'تأسست StockSense بهدف تقديم نظام إدارة مخزون ذكي ومتطور للمحلات الصغيرة والمتوسطة في المنطقة العربية. نؤمن بأن التكنولوجيا يجب أن تكون في متناول الجميع وأن تساعد في تبسيط العمليات التجارية المعقدة.',
      vision: {
        title: 'رؤيتنا',
        description: 'أن نكون الخيار الأول لأنظمة إدارة المخزون في المنطقة العربية، ونساهم في تحويل الأعمال التقليدية إلى أعمال رقمية متطورة.'
      },
      mission: {
        title: 'رسالتنا',
        description: 'تطوير حلول تقنية سهلة الاستخدام ومتاحة للجميع، تساعد أصحاب الأعمال على إدارة مخزونهم بكفاءة وتحقيق أهدافهم التجارية.'
      },
      values: {
        title: 'قيمنا',
        items: [
          {
            icon: Target,
            title: 'التميز',
            description: 'نسعى للتميز في كل ما نقدمه من منتجات وخدمات'
          },
          {
            icon: Heart,
            title: 'الشغف',
            description: 'نعمل بشغف لتطوير حلول تلبي احتياجات عملائنا'
          },
          {
            icon: Users,
            title: 'التعاون',
            description: 'نؤمن بقوة العمل الجماعي والشراكة مع عملائنا'
          },
          {
            icon: Award,
            title: 'الجودة',
            description: 'نلتزم بأعلى معايير الجودة في جميع منتجاتنا'
          }
        ]
      },
      stats: [
        { number: '500+', label: 'عميل راضٍ' },
        { number: '50+', label: 'مدينة' },
        { number: '99%', label: 'رضا العملاء' },
        { number: '24/7', label: 'دعم فني' }
      ]
    },
    en: {
      title: 'About Us',
      subtitle: 'We are a passionate team developing technology solutions to help businesses grow and thrive',
      description: 'StockSense was founded with the goal of providing a smart and advanced inventory management system for small and medium businesses in the Arab region. We believe that technology should be accessible to everyone and help simplify complex business operations.',
      vision: {
        title: 'Our Vision',
        description: 'To be the first choice for inventory management systems in the Arab region, and contribute to transforming traditional businesses into advanced digital businesses.'
      },
      mission: {
        title: 'Our Mission',
        description: 'Developing user-friendly and accessible technology solutions that help business owners manage their inventory efficiently and achieve their business goals.'
      },
      values: {
        title: 'Our Values',
        items: [
          {
            icon: Target,
            title: 'Excellence',
            description: 'We strive for excellence in everything we offer in products and services'
          },
          {
            icon: Heart,
            title: 'Passion',
            description: 'We work with passion to develop solutions that meet our customers\' needs'
          },
          {
            icon: Users,
            title: 'Collaboration',
            description: 'We believe in the power of teamwork and partnership with our customers'
          },
          {
            icon: Award,
            title: 'Quality',
            description: 'We are committed to the highest quality standards in all our products'
          }
        ]
      },
      stats: [
        { number: '500+', label: 'Happy Clients' },
        { number: '50+', label: 'Cities' },
        { number: '99%', label: 'Client Satisfaction' },
        { number: '24/7', label: 'Technical Support' }
      ]
    }
  };

  const text = content[language];

  return (
    <section id="about" className="section-padding bg-gray-50 dark:bg-gray-900">
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

        {/* Description */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {text.description}
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center ml-4 rtl:ml-0 rtl:mr-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {text.vision.title}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {text.vision.description}
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center ml-4 rtl:ml-0 rtl:mr-4">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {text.mission.title}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {text.mission.description}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12 animate-fade-in-up">
            {text.values.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {text.values.items.map((value, index) => (
              <div 
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${1 + index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {text.stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${1.8 + index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-stocksense-blue mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
