// utils/formatters.ts
export const formatCurrency = (
  value?: number,
  locale = "en-IN",
  currency = "INR"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
};

export const formatDate = (
  date: string | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return "";

  return new Date(date).toLocaleDateString(
    "en-US",
    options
  );
};

export const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString();
};

export const getStatusColor = (status: string): string => {
  const colors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };
  return colors[status as keyof typeof colors] || colors.offline;
};

export const getStatusText = (status: string): string => {
  const texts = {
    online: 'Online',
    away: 'Away',
    offline: 'Offline',
  };
  return texts[status as keyof typeof texts] || texts.offline;
};