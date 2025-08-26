import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Plus, Minus, Trash2, Calculator, 
  Receipt, User, Phone, CreditCard, Banknote, 
  Smartphone, Percent, DollarSign, Package,
  Search, Scan, Grid, List, Filter, Clock,
  CheckCircle, XCircle, RefreshCw, Printer,
  Send, Save, Archive, Star, Tag, Gift
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getProducts, getCustomers, getSales, saveSales, 
  getStock, saveStock, getCategories, saveCustomers
} from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Product, Customer, Sale, SaleItem, Stock, Category } from '@/types';

interface CartItem extends SaleItem {
  product: Product;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  finalPrice: number;
}

const ComprehensivePOSPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    if (!user) return;
    
    const allProducts = getProducts();
    const companyProducts = allProducts.filter(p => p.companyId === user.id && p.isActive);
    setProducts(companyProducts);
    
    const allCustomers = getCustomers();
    const companyCustomers = allCustomers.filter(c => c.companyId === user.id && c.isActive);
    setCustomers(companyCustomers);
    
    const allCategories = getCategories();
    const companyCategories = allCategories.filter(c => c.companyId === user.id && c.isActive);
    setCategories(companyCategories);
    
    const allStock = getStock();
    setStock(allStock);
  };

  const getProductStock = (productId: string): number => {
    const productStock = stock.find(s => s.productId === productId);
    return productStock ? productStock.quantity : 0;
  };

  const addToCart = (product: Product) => {
    const availableStock = getProductStock(product.id);
    const cartQuantity = cart.find(item => item.productId === product.id)?.quantity || 0;
    
    if (cartQuantity >= availableStock) {
      toast({
        title: 'نفد المخزون',
        description: `الكمية المتاحة: ${availableStock} ${product.unit}`,
        variant: 'destructive',
      });
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex] = calculateItemTotals(updatedCart[existingItemIndex]);
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        quantity: 1,
        unitPrice: product.sellPrice,
        totalPrice: product.sellPrice,
        product,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: product.taxRate || 0,
        taxAmount: (product.sellPrice * (product.taxRate || 0)) / 100,
        finalPrice: product.sellPrice + ((product.sellPrice * (product.taxRate || 0)) / 100),
      };
      setCart([...cart, calculateItemTotals(newItem)]);
    }
  };

  const calculateItemTotals = (item: CartItem): CartItem => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * item.taxPercent) / 100;
    const finalPrice = taxableAmount + taxAmount;
    
    return {
      ...item,
      discountAmount,
      taxAmount,
      totalPrice: subtotal,
      finalPrice,
    };
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const availableStock = getProductStock(productId);
    if (newQuantity > availableStock) {
      toast({
        title: 'كمية غير متاحة',
        description: `الكمية المتاحة: ${availableStock}`,
        variant: 'destructive',
      });
      return;
    }

    const updatedCart = cart.map(item => 
      item.productId === productId 
        ? calculateItemTotals({ ...item, quantity: newQuantity })
        : item
    );
    setCart(updatedCart);
  };

  const updateCartItemDiscount = (productId: string, discountPercent: number) => {
    const updatedCart = cart.map(item => 
      item.productId === productId 
        ? calculateItemTotals({ ...item, discountPercent })
        : item
    );
    setCart(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscountValue(0);
    setReceivedAmount(0);
    setNotes('');
  };

  const calculateSubtotal = (): number => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTotalDiscount = (): number => {
    const itemsDiscount = cart.reduce((sum, item) => sum + item.discountAmount, 0);
    const cartDiscount = discountType === 'percent' 
      ? (calculateSubtotal() * discountValue) / 100 
      : discountValue;
    return itemsDiscount + cartDiscount;
  };

  const calculateTotalTax = (): number => {
    return cart.reduce((sum, item) => sum + item.taxAmount, 0);
  };

  const calculateFinalTotal = (): number => {
    const subtotal = calculateSubtotal();
    const totalDiscount = calculateTotalDiscount();
    const totalTax = calculateTotalTax();
    return subtotal - totalDiscount + totalTax;
  };

  const calculateChange = (): number => {
    return Math.max(0, receivedAmount - calculateFinalTotal());
  };

  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: 'السلة فارغة',
        description: 'يرجى إضافة منتجات للسلة أولاً',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'cash' && receivedAmount < calculateFinalTotal()) {
      toast({
        title: 'المبلغ المستلم غير كافي',
        description: 'يرجى إدخال المبلغ المستلم الصحيح',
        variant: 'destructive',
      });
      return;
    }

    try {
      const finalTotal = calculateFinalTotal();
      const totalDiscount = calculateTotalDiscount();
      
      const newSale: Sale = {
        id: `sale_${Date.now()}`,
        companyId: user!.id,
        branchId: 'main_branch',
        invoiceNumber: `POS-${Date.now()}`,
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        totalAmount: calculateSubtotal(),
        discountAmount: totalDiscount,
        finalAmount: finalTotal,
        paymentMethod,
        status: 'completed',
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.finalPrice,
        })),
        userId: user!.id,
        createdAt: new Date().toISOString(),
      };
      
      // حفظ البيع
      const allSales = getSales();
      allSales.push(newSale);
      saveSales(allSales);
      
      // تحديث المخزون
      const allStock = getStock();
      cart.forEach(item => {
        const stockIndex = allStock.findIndex(s => s.productId === item.productId);
        if (stockIndex !== -1) {
          allStock[stockIndex].quantity -= item.quantity;
          allStock[stockIndex].lastUpdated = new Date().toISOString();
        }
      });
      saveStock(allStock);
      
      toast({
        title: 'تم إنجاز البيع بنجاح',
        description: `فاتورة رقم: ${newSale.invoiceNumber}`,
      });
      
      // طباعة الفاتورة (محاكاة)
      printReceipt(newSale);
      
      // إعادة تعيين النظام
      clearCart();
      setIsPaymentDialogOpen(false);
      loadData();
      
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء معالجة البيع',
        variant: 'destructive',
      });
    }
  };

  const printReceipt = (sale: Sale) => {
    // محاكاة طباعة الفاتورة
    console.log('طباعة الفاتورة:', sale);
    toast({
      title: 'تم إرسال الفاتورة للطباعة',
      description: 'يمكنك الآن طباعة الفاتورة',
    });
  };

  const addQuickCustomer = () => {
    if (!newCustomerName || !newCustomerPhone) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى إدخال اسم العميل ورقم الهاتف',
        variant: 'destructive',
      });
      return;
    }

    const newCustomer: Customer = {
      id: `customer_${Date.now()}`,
      companyId: user!.id,
      name: newCustomerName,
      phone: newCustomerPhone,
      balance: 0,
      totalPurchases: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const allCustomers = getCustomers();
    allCustomers.push(newCustomer);
    saveCustomers(allCustomers);
    
    setSelectedCustomer(newCustomer);
    setCustomers([...customers, newCustomer]);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setIsCustomerDialogOpen(false);
    
    toast({
      title: 'تم إضافة العميل',
      description: `تم إضافة ${newCustomer.name} وتحديده للفاتورة`,
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.includes(searchTerm) ||
                         product.sku.includes(searchTerm) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    const matchesCategory = !selectedCategory || selectedCategory === "all" || product.categoryId === selectedCategory;
    const hasStock = getProductStock(product.id) > 0;
    
    return matchesSearch && matchesCategory && hasStock;
  });

  const cartTotal = calculateFinalTotal();
  const cartSubtotal = calculateSubtotal();
  const cartDiscount = calculateTotalDiscount();
  const cartTax = calculateTotalTax();

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* قسم المنتجات */}
      <div className="flex-1 space-y-4">
        {/* شريط البحث والفلاتر */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
            <div className="relative flex-1">
              <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في المنتجات (الاسم، الكود، الباركود)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 rtl:pl-10 rtl:pr-3"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* عرض المنتجات */}
        <Card className="flex-1 p-4">
          <div className="h-96 overflow-y-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const availableStock = getProductStock(product.id);
                  const isLowStock = availableStock <= product.minQuantity;
                  
                  return (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-sm mb-1 truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-green-600">{product.sellPrice} ر.س</span>
                          <Badge variant={isLowStock ? 'destructive' : 'secondary'} className="text-xs">
                            {availableStock} {product.unit}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => {
                  const availableStock = getProductStock(product.id);
                  const isLowStock = availableStock <= product.minQuantity;
                  
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                      <div className="text-left rtl:text-right">
                        <div className="font-bold text-green-600">{product.sellPrice} ر.س</div>
                        <Badge variant={isLowStock ? 'destructive' : 'secondary'} className="text-xs">
                          {availableStock} {product.unit}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* قسم السلة والدفع */}
      <div className="w-full lg:w-96 space-y-4">
        {/* معلومات العميل */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">العميل</h3>
            <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة عميل سريع</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>اسم العميل</Label>
                    <Input
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="اسم العميل"
                    />
                  </div>
                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                    <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={addQuickCustomer}>
                      إضافة
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Select value={selectedCustomer?.id || ''} onValueChange={(value) => {
            const customer = customers.find(c => c.id === value);
            setSelectedCustomer(customer || null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العميل (اختياري)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">عميل عادي</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedCustomer && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
              <div className="flex items-center justify-between">
                <span>الرصيد المستحق:</span>
                <span className={`font-bold ${selectedCustomer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedCustomer.balance.toLocaleString()} ر.س
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* السلة */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">السلة ({cart.length})</h3>
            {cart.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.productId} className="border rounded p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{item.product.name}</h5>
                    <p className="text-xs text-gray-500">{item.unitPrice} ر.س × {item.quantity}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-left rtl:text-right">
                    <div className="font-bold text-sm">{item.finalPrice.toFixed(2)} ر.س</div>
                    {item.discountAmount > 0 && (
                      <div className="text-xs text-green-600">خصم: {item.discountAmount.toFixed(2)} ر.س</div>
                    )}
                  </div>
                </div>
                
                {/* خصم المنتج */}
                <div className="mt-2 flex items-center space-x-2 rtl:space-x-reverse">
                  <Label className="text-xs">خصم %:</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discountPercent}
                    onChange={(e) => updateCartItemDiscount(item.productId, parseFloat(e.target.value) || 0)}
                    className="w-16 h-6 text-xs"
                  />
                </div>
              </div>
            ))}
            
            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>السلة فارغة</p>
                <p className="text-xs">اضغط على المنتجات لإضافتها</p>
              </div>
            )}
          </div>
        </Card>

        {/* ملخص الحساب */}
        {cart.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">ملخص الحساب</h3>
            
            {/* خصم على الفاتورة */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Label className="text-sm">خصم الفاتورة:</Label>
                <Select value={discountType} onValueChange={(value: 'amount' | 'percent') => setDiscountType(value)}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">مبلغ</SelectItem>
                    <SelectItem value="percent">نسبة</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-24 h-8"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{cartSubtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>إجمالي الخصومات:</span>
                <span>-{cartDiscount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>إجمالي الضرائب:</span>
                <span>+{cartTax.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>المجموع النهائي:</span>
                <span className="text-green-600">{cartTotal.toFixed(2)} ر.س</span>
              </div>
            </div>

            {/* ملاحظات */}
            <div className="mt-4">
              <Label className="text-sm">ملاحظات:</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات الفاتورة"
                className="mt-1 h-16 text-sm"
              />
            </div>

            {/* أزرار الدفع */}
            <div className="mt-4 space-y-2">
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-12 text-lg font-bold">
                    <Receipt className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                    إنجاز البيع - {cartTotal.toFixed(2)} ر.س
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنجاز عملية البيع</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* طريقة الدفع */}
                    <div>
                      <Label>طريقة الدفع</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button
                          variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('cash')}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <Banknote className="w-6 h-6 mb-1" />
                          <span className="text-xs">نقداً</span>
                        </Button>
                        <Button
                          variant={paymentMethod === 'card' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('card')}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <CreditCard className="w-6 h-6 mb-1" />
                          <span className="text-xs">بطاقة</span>
                        </Button>
                        <Button
                          variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('transfer')}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <Smartphone className="w-6 h-6 mb-1" />
                          <span className="text-xs">تحويل</span>
                        </Button>
                      </div>
                    </div>

                    {/* المبلغ المستلم للدفع النقدي */}
                    {paymentMethod === 'cash' && (
                      <div>
                        <Label>المبلغ المستلم</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={receivedAmount}
                          onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                          placeholder="المبلغ المستلم"
                          className="text-lg font-bold"
                        />
                        {receivedAmount > cartTotal && (
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="flex justify-between text-sm">
                              <span>الباقي للعميل:</span>
                              <span className="font-bold text-green-600">
                                {calculateChange().toFixed(2)} ر.س
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ملخص الدفع */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>المجموع:</span>
                          <span>{cartSubtotal.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>الخصومات:</span>
                          <span>-{cartDiscount.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>الضرائب:</span>
                          <span>+{cartTax.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>المطلوب دفعه:</span>
                          <span className="text-green-600">{cartTotal.toFixed(2)} ر.س</span>
                        </div>
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="flex-1">
                        إلغاء
                      </Button>
                      <Button onClick={processSale} className="flex-1">
                        <CheckCircle className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                        تأكيد البيع
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
                  <XCircle className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  مسح الكل
                </Button>
                <Button variant="outline" disabled={cart.length === 0}>
                  <Save className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  حفظ مؤقت
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* اختصارات سريعة */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">اختصارات سريعة</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Scan className="w-4 h-4" />
              <span>مسح باركود</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Calculator className="w-4 h-4" />
              <span>حاسبة</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Gift className="w-4 h-4" />
              <span>هدية</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Star className="w-4 h-4" />
              <span>نقاط ولاء</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensivePOSPage;