// أدوات استيراد وتصدير Excel
import { Product, Sale, Purchase, Expense } from '@/types';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  // تحويل البيانات إلى CSV
  const csvContent = convertToCSV(data);
  
  // إنشاء ملف وتحميله
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // تنظيف القيم وإضافة علامات اقتباس إذا لزم الأمر
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

export const exportProductsToExcel = (products: Product[]) => {
  const exportData = products.map(product => ({
    'اسم المنتج': product.name,
    'كود المنتج': product.sku,
    'الباركود': product.barcode || '',
    'وحدة القياس': product.unit,
    'سعر الشراء': product.buyPrice,
    'سعر البيع': product.sellPrice,
    'الحد الأدنى': product.minQuantity,
    'نسبة الضريبة': product.taxRate || 0,
    'الوصف': product.description || '',
    'تاريخ الإنشاء': new Date(product.createdAt).toLocaleDateString('ar-SA'),
  }));
  
  exportToExcel(exportData, 'products', 'المنتجات');
};

export const exportSalesToExcel = (sales: Sale[]) => {
  const exportData = sales.map(sale => ({
    'رقم الفاتورة': sale.invoiceNumber,
    'اسم العميل': sale.customerName || 'عميل عادي',
    'رقم العميل': sale.customerPhone || '',
    'المبلغ الإجمالي': sale.totalAmount,
    'مبلغ الخصم': sale.discountAmount,
    'المبلغ النهائي': sale.finalAmount,
    'طريقة الدفع': sale.paymentMethod === 'cash' ? 'نقداً' : sale.paymentMethod === 'card' ? 'بطاقة' : 'تحويل',
    'الحالة': sale.status === 'completed' ? 'مكتمل' : 'مسترد',
    'التاريخ': new Date(sale.createdAt).toLocaleDateString('ar-SA'),
    'الوقت': new Date(sale.createdAt).toLocaleTimeString('ar-SA'),
  }));
  
  exportToExcel(exportData, 'sales', 'المبيعات');
};

export const exportPurchasesToExcel = (purchases: Purchase[]) => {
  const exportData = purchases.map(purchase => ({
    'رقم الفاتورة': purchase.invoiceNumber,
    'المبلغ الإجمالي': purchase.totalAmount,
    'المبلغ المدفوع': purchase.paidAmount,
    'المبلغ المتبقي': purchase.totalAmount - purchase.paidAmount,
    'الحالة': purchase.status === 'completed' ? 'مكتمل' : purchase.status === 'pending' ? 'معلق' : 'ملغي',
    'التاريخ': new Date(purchase.createdAt).toLocaleDateString('ar-SA'),
  }));
  
  exportToExcel(exportData, 'purchases', 'المشتريات');
};

export const exportExpensesToExcel = (expenses: Expense[]) => {
  const exportData = expenses.map(expense => ({
    'المبلغ': expense.amount,
    'الوصف': expense.description,
    'التاريخ': new Date(expense.date).toLocaleDateString('ar-SA'),
    'تاريخ الإنشاء': new Date(expense.createdAt).toLocaleDateString('ar-SA'),
  }));
  
  exportToExcel(exportData, 'expenses', 'المصروفات');
};

// استيراد البيانات من Excel/CSV
export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('خطأ في قراءة الملف'));
    reader.readAsText(file, 'UTF-8');
  });
};

const parseCSV = (text: string): any[] => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }
  
  return data;
};

const parseCSVLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // تخطي علامة الاقتباس التالية
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// تحويل البيانات المستوردة إلى منتجات
export const convertImportedDataToProducts = (data: any[], companyId: string): Product[] => {
  return data.map((row, index) => ({
    id: `imported_product_${Date.now()}_${index}`,
    companyId,
    name: row['اسم المنتج'] || row['name'] || '',
    sku: row['كود المنتج'] || row['sku'] || `SKU-${Date.now()}-${index}`,
    barcode: row['الباركود'] || row['barcode'] || '',
    categoryId: 'default_category', // سيحتاج إلى تحديد الفئة
    supplierId: 'default_supplier', // سيحتاج إلى تحديد المورد
    unit: row['وحدة القياس'] || row['unit'] || 'قطعة',
    buyPrice: parseFloat(row['سعر الشراء'] || row['buyPrice'] || '0'),
    sellPrice: parseFloat(row['سعر البيع'] || row['sellPrice'] || '0'),
    minQuantity: parseInt(row['الحد الأدنى'] || row['minQuantity'] || '0'),
    taxRate: parseFloat(row['نسبة الضريبة'] || row['taxRate'] || '0'),
    description: row['الوصف'] || row['description'] || '',
    isActive: true,
    createdAt: new Date().toISOString(),
  }));
};