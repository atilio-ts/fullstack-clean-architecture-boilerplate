import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD') => {
  return dayjs(date).format(format);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};