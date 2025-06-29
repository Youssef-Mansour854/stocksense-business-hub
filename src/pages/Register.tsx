import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Building2, Mail, Phone, Lock, MapPin, ArrowRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { register } from '@/utils/auth';

const formSchema = z.object({
  companyName: z.string().min(2, 'اسم الشركة يجب أن يكون على الأقل حرفين'),
  businessType: z.string().min(1, 'يرجى اختيار نوع النشاط'),
  ownerName: z.string().min(2, 'اسم المالك يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
  confirmPassword: z.string(),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const businessTypes = [
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
  ];

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
          title: 'تم إنشاء الحساب بنجاح!',
          description: 'مرحباً بك في StockSense، يمكنك الآن الوصول لجميع مميزات النظام',
        });
        
        // الانتقال إلى لوحة التحكم
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast({
          title: 'خطأ في إنشاء الحساب',
          description: result.message,
          variant: 'destructive',
        });
      }
      
    } catch (error) {
      toast({
        title: 'حدث خطأ غير متوقع',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* زر العودة للرئيسية */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <Home className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
            العودة للرئيسية
          </Link>
        </div>

        {/* الشعار والعنوان */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">StockSense</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            سجل مجاناً واحصل على جميع المميزات فوراً
          </p>
        </div>

        {/* نموذج التسجيل */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-0 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* اسم الشركة */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      اسم الشركة / المحل
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الشركة / المحل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* نوع النشاط */}
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع النشاط</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع النشاط" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((type) => (
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

              {/* اسم المالك */}
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      اسم المالك
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="اسم المالك" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* البريد الإلكتروني والهاتف */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@domain.com" {...field} />
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
                        رقم الهاتف
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="05xxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* كلمة المرور وتأكيدها */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        كلمة المرور
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="كلمة المرور" {...field} />
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
                        تأكيد كلمة المرور
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="تأكيد كلمة المرور" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* العنوان */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      العنوان (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="العنوان" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* زر إنشاء الحساب */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    إنشاء الحساب
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              {/* رابط تسجيل الدخول */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  لديك حساب بالفعل؟{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;