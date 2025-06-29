import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Building2, Mail, Phone, Lock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { register } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

interface RegistrationSectionProps {
  language: 'ar' | 'en';
}

const formSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  businessType: z.string().min(1, 'Please select business type'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegistrationSection = ({ language }: RegistrationSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const content = {
    ar: {
      title: 'انشئ حسابك الآن',
      subtitle: 'سجل مجاناً واحصل على جميع المميزات فوراً',
      companyName: 'اسم الشركة / المحل',
      businessType: 'نوع النشاط',
      ownerName: 'اسم المالك',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      address: 'العنوان (اختياري)',
      register: 'إنشاء الحساب',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      login: 'تسجيل الدخول',
      businessTypes: [
        { value: 'clothing', label: 'ملابس' },
        { value: 'grocery', label: 'بقالة' },
        { value: 'electronics', label: 'إلكترونيات' },
        { value: 'pharmacy', label: 'صيدلية' },
        { value: 'restaurant', label: 'مطعم' },
        { value: 'automotive', label: 'قطع غيار سيارات' },
        { value: 'books', label: 'مكتبة' },
        { value: 'jewelry', label: 'مجوهرات' },
        { value: 'cosmetics', label: 'مستحضرات تجميل' },
        { value: 'other', label: 'أخرى' }
      ],
      successMessage: 'تم إنشاء الحساب بنجاح! مرحباً بك في StockSense',
      errorMessage: 'حدث خطأ في إنشاء الحساب، يرجى المحاولة مرة أخرى'
    },
    en: {
      title: 'Create Your Account Now',
      subtitle: 'Register for free and get all features instantly',
      companyName: 'Company / Store Name',
      businessType: 'Business Type',
      ownerName: 'Owner Name',
      email: 'Email Address',
      phone: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      address: 'Address (Optional)',
      register: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      login: 'Sign In',
      businessTypes: [
        { value: 'clothing', label: 'Clothing' },
        { value: 'grocery', label: 'Grocery' },
        { value: 'electronics', label: 'Electronics' },
        { value: 'pharmacy', label: 'Pharmacy' },
        { value: 'restaurant', label: 'Restaurant' },
        { value: 'automotive', label: 'Automotive Parts' },
        { value: 'books', label: 'Bookstore' },
        { value: 'jewelry', label: 'Jewelry' },
        { value: 'cosmetics', label: 'Cosmetics' },
        { value: 'other', label: 'Other' }
      ],
      successMessage: 'Account created successfully! Welcome to StockSense',
      errorMessage: 'Error creating account, please try again'
    }
  };

  const text = content[language];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      businessType: '',
      ownerName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      address: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // تسجيل المستخدم الجديد
      const result = register({
        companyName: values.companyName,
        businessType: values.businessType,
        ownerName: values.ownerName,
        email: values.email,
        phone: values.phone,
        address: values.address
      });
      
      if (result.success) {
        toast({
          title: text.successMessage,
          description: language === 'ar' ? 'يمكنك الآن الوصول لجميع مميزات النظام' : 'You now have access to all system features',
        });
        
        // الانتقال إلى لوحة التحكم
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast({
          title: result.message,
          variant: 'destructive',
        });
      }
      
    } catch (error) {
      toast({
        title: text.errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="register" className="section-padding bg-white dark:bg-gray-800">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
              {text.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {text.subtitle}
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Name */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {text.companyName}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={text.companyName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Business Type */}
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{text.businessType}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={text.businessType} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {text.businessTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Owner Name */}
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {text.ownerName}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={text.ownerName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {text.email}
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={text.email} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {text.phone}
                        </FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={text.phone} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          {text.password}
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={text.password} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          {text.confirmPassword}
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={text.confirmPassword} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {text.address}
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder={text.address} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full btn-primary py-3 text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : text.register}
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    {text.alreadyHaveAccount}{' '}
                    <button type="button" className="text-stocksense-blue hover:underline font-medium">
                      {text.login}
                    </button>
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;