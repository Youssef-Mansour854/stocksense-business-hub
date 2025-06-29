
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ContactSectionProps {
  language: 'ar' | 'en';
}

const ContactSection = ({ language }: ContactSectionProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const content = {
    ar: {
      title: 'تواصل معنا',
      subtitle: 'نحن هنا لمساعدتك، تواصل معنا وسنرد عليك في أقرب وقت',
      form: {
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        subject: 'الموضوع',
        message: 'الرسالة',
        send: 'إرسال الرسالة'
      },
      contact: {
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        address: 'العنوان'
      },
      social: {
        title: 'تابعنا على وسائل التواصل الاجتماعي',
        facebook: 'فيسبوك',
        instagram: 'إنستغرام',
        whatsapp: 'واتساب'
      },
      info: {
        email: 'info@stocksense.com',
        phone: '+966 50 123 4567',
        address: 'الرياض، المملكة العربية السعودية'
      }
    },
    en: {
      title: 'Contact Us',
      subtitle: 'We are here to help you, contact us and we will respond as soon as possible',
      form: {
        name: 'Full Name',
        email: 'Email Address',
        subject: 'Subject',
        message: 'Message',
        send: 'Send Message'
      },
      contact: {
        email: 'Email',
        phone: 'Phone',
        address: 'Address'
      },
      social: {
        title: 'Follow us on social media',
        facebook: 'Facebook',
        instagram: 'Instagram',
        whatsapp: 'WhatsApp'
      },
      info: {
        email: 'info@stocksense.com',
        phone: '+966 50 123 4567',
        address: 'Riyadh, Saudi Arabia'
      }
    }
  };

  const text = content[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the form data to your backend
    alert(language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="section-padding bg-white dark:bg-gray-800">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {text.form.name}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {text.form.email}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {text.form.subject}
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {text.form.message}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              
              <Button type="submit" className="btn-primary w-full">
                <Send className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                {text.form.send}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center ml-4 rtl:ml-0 rtl:mr-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {text.contact.email}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {text.info.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center ml-4 rtl:ml-0 rtl:mr-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {text.contact.phone}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {text.info.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center ml-4 rtl:ml-0 rtl:mr-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {text.contact.address}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {text.info.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {text.social.title}
                </h3>
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <a
                    href="#"
                    className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors duration-300"
                    aria-label={text.social.facebook}
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center text-white hover:bg-pink-700 transition-colors duration-300"
                    aria-label={text.social.instagram}
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white hover:bg-green-700 transition-colors duration-300"
                    aria-label={text.social.whatsapp}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
