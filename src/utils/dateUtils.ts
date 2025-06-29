// أدوات التاريخ الميلادي والهجري
export const formatGregorianDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatHijriDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA-u-ca-islamic', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

export const getDateRange = (period: 'today' | 'week' | 'month' | 'year'): { start: string; end: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        start: weekStart.toISOString(),
        end: now.toISOString(),
      };
    
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start: monthStart.toISOString(),
        end: now.toISOString(),
      };
    
    case 'year':
      const yearStart = new Date(today.getFullYear(), 0, 1);
      return {
        start: yearStart.toISOString(),
        end: now.toISOString(),
      };
    
    default:
      return {
        start: today.toISOString(),
        end: now.toISOString(),
      };
  }
};

export const isToday = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

export const isThisWeek = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  return d >= weekStart && d <= today;
};

export const isThisMonth = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
};