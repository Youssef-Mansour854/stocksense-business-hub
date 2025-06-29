import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Settings, Moon, Sun, Globe, DollarSign, 
  Building2, User, Bell, Shield, Download,
  Upload, Palette, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCompanyData, saveCompanyData, getCurrentUser, saveCurrentUser } from '@/utils/storage';
import { Company, User as UserType } from '@/types';

const companySchema = z.object({
  name: z.string().min(2, 'اسم الشركة مطلوب'),
  businessType: z.string().min(1, 'نوع النشاط مطلوب'),
  ownerName: z.string().min(2, 'اسم المالك مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف مطلوب'),
  address: z.string().optional(),
  currency: z.string().min(1, 'العملة مطلوبة'),
  language: z.enum(['ar', 'en']),
});

const SettingsPage = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      businessType: '',
      ownerName: '',
      email: '',
      phone: '',
      address: '',
      currency: 'SAR',
      language: 'ar',
    },
  });

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadData = () => {
    const companyData = getCompanyData();
    const userData = getCurrentUser();
    
    if (companyData) {
      setCompany(companyData);
      form.reset({
        name: companyData.name,
        businessType: companyData.businessType,
        ownerName: companyData.ownerName,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address || '',
        currency: companyData.currency,
        language: companyData.language,
      });
    }
    
    if (userData) {
      setUser(userData);
    }
  };

  const loadSettings = () => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');
    
    const savedNotifications = localStorage.getItem('notifications');
    setNotifications(savedNotifications !== 'false');
    
    const savedAutoBackup = localStorage.getItem('autoBackup');
    setAutoBackup(savedAutoBackup !== 'false');
  };

  const onSubmit = (values: z.infer<typeof companySchema>) => {
    if (!company || !user) return;

    try {
      const updatedCompany: Company = {
        ...company,
        ...values,
      };
      
      saveCompanyData(updatedCompany);
      setCompany(updatedCompany);
      
      // تحديث بيانات المستخدم أيضاً
      const updatedUser: UserType = {
        ...user,
        companyName: values.name,
        businessType: values.businessType,
        ownerName: values.ownerName,
        email: values.email,
        phone: values.phone,
        address: values.address,
      };
      
      saveCurrentUser(updatedUser);
      setUser(updatedUser);
      
      toast({
        title: 'تم حفظ الإعدادات',
        description: 'تم تحديث إعدادات الشركة بنجاح',
      });
      
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    toast({
      title: 'تم تغيير المظهر',
      description: newDarkMode ? 'تم تفعيل الوضع المظلم' : 'تم تفعيل الوضع المضيء',
    });
  };

  const toggleNotifications = () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    localStorage.setItem('notifications', newNotifications.toString());
    
    toast({
      title: 'إعدادات التنبيهات',
      description: newNotifications ? 'تم تفعيل التنبيهات' : 'تم إيقاف التنبيهات',
    });
  };

  const toggleAutoBackup = () => {
    const newAutoBackup = !autoBackup;
    setAutoBackup(newAutoBackup);
    localStorage.setItem('autoBackup', newAutoBackup.toString());
    
    toast({
      title: 'النسخ الاحتياطي',
      description: newAutoBackup ? 'تم تفعيل النسخ الاحتياطي التلقائي' : 'تم إيقاف النسخ الاحتياطي التلقائي',
    });
  };

  const exportData = () => {
    try {
      const data = {
        company: getCompanyData(),
        user: getCurrentUser(),
        timestamp: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stocksense-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'تم تصدير البيانات',
        description: 'تم تصدير نسخة احتياطية من البيانات',
      });
      
    } catch (error) {
      toast({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير البيانات',
        variant: 'destructive',
      });
    }
  };

  const currencies = [
    { value: 'SAR', label: 'ريال سعودي (ر.س)' },
    { value: 'USD', label: 'دولار أمريكي ($)' },
    { value: 'EUR', label: 'يورو (€)' },
    { value: 'AED', label: 'درهم إماراتي (د.إ)' },
    { value: 'KWD', label: 'دينار كويتي (د.ك)' },
    { value: 'QAR', label: 'ريال قطري (ر.ق)' },
    { value: 'BHD', label: 'دينار بحريني (د.ب)' },
    { value: 'OMR', label: 'ريال عماني (ر.ع)' },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إعدادات النظام</h2>
        <p className="text-gray-600 dark:text-gray-400">إعدادات عامة للنظام والشركة</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Building2 className="w-4 h-4" />
            <span>الشركة</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Palette className="w-4 h-4" />
            <span>المظهر</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Bell className="w-4 h-4" />
            <span>التنبيهات</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Shield className="w-4 h-4" />
            <span>النسخ الاحتياطي</span>
          </TabsTrigger>
        </TabsList>

        {/* إعدادات الشركة */}
        <TabsContent value="company">
          <Card className="p-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
              <Building2 className="w-5 h-5" />
              <h3 className="text-lg font-semibold">معلومات الشركة</h3>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الشركة</FormLabel>
                        <FormControl>
                          <Input placeholder="اسم الشركة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المالك</FormLabel>
                        <FormControl>
                          <Input placeholder="اسم المالك" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@domain.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="05xxxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العملة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر العملة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>لغة النظام</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="اختر اللغة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input placeholder="العنوان" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto">
                  حفظ الإعدادات
                </Button>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {/* إعدادات المظهر */}
        <TabsContent value="appearance">
          <Card className="p-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
              <Palette className="w-5 h-5" />
              <h3 className="text-lg font-semibold">إعدادات المظهر</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <Label className="text-base font-medium">الوضع المظلم</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      تفعيل الوضع المظلم لراحة العين
                    </p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Globe className="w-5 h-5" />
                  <div>
                    <Label className="text-base font-medium">اللغة</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      لغة واجهة النظام
                    </p>
                  </div>
                </div>
                <Select value={form.watch('language')} onValueChange={(value) => form.setValue('language', value as 'ar' | 'en')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <DollarSign className="w-5 h-5" />
                  <div>
                    <Label className="text-base font-medium">العملة</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      العملة المستخدمة في النظام
                    </p>
                  </div>
                </div>
                <Select value={form.watch('currency')} onValueChange={(value) => form.setValue('currency', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* إعدادات التنبيهات */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
              <Bell className="w-5 h-5" />
              <h3 className="text-lg font-semibold">إعدادات التنبيهات</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">تنبيهات النظام</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    تفعيل التنبيهات العامة للنظام
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={toggleNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">تنبيهات نقص المخزون</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    تنبيه عند انخفاض كمية المنتجات
                  </p>
                </div>
                <Switch checked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">تنبيهات المبيعات</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    تنبيه عند إتمام عمليات البيع
                  </p>
                </div>
                <Switch checked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">التقارير اليومية</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    إرسال تقرير يومي بالمبيعات والأرباح
                  </p>
                </div>
                <Switch checked={false} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* النسخ الاحتياطي */}
        <TabsContent value="backup">
          <Card className="p-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
              <Shield className="w-5 h-5" />
              <h3 className="text-lg font-semibold">النسخ الاحتياطي والأمان</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">النسخ الاحتياطي التلقائي</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    إنشاء نسخة احتياطية تلقائياً كل يوم
                  </p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={toggleAutoBackup} />
              </div>

              <div className="border-t pt-6">
                <h4 className="text-base font-medium mb-4">إدارة البيانات</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={exportData}
                    className="flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير البيانات</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <Upload className="w-4 h-4" />
                    <span>استيراد البيانات</span>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-base font-medium mb-4">معلومات النظام</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500 dark:text-gray-400">إصدار النظام</Label>
                    <p className="font-medium">StockSense v1.0.0</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 dark:text-gray-400">آخر نسخة احتياطية</Label>
                    <p className="font-medium">{new Date().toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 dark:text-gray-400">حجم البيانات</Label>
                    <p className="font-medium">2.5 MB</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 dark:text-gray-400">تاريخ التسجيل</Label>
                    <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;