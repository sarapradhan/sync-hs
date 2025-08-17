import { format, isToday, isTomorrow, isThisWeek, isPast, addDays, startOfWeek, endOfWeek } from 'date-fns';

export function formatDueDate(date: Date): string {
  if (isToday(date)) {
    return `Due Today, ${format(date, 'h:mm a')}`;
  }
  
  if (isTomorrow(date)) {
    return `Due Tomorrow, ${format(date, 'h:mm a')}`;
  }
  
  if (isThisWeek(date)) {
    return `Due ${format(date, 'EEEE, MMM d')}`;
  }
  
  return `Due ${format(date, 'MMM d')}`;
}

export function formatDisplayDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function isOverdue(date: Date): boolean {
  return isPast(date) && !isToday(date);
}

export function getDueDateColor(date: Date): string {
  if (isOverdue(date)) return 'text-red-600';
  if (isToday(date)) return 'text-red-600';
  if (isTomorrow(date)) return 'text-orange-600';
  return 'text-gray-600';
}

export function getWeekDates(): Date[] {
  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());
  const dates: Date[] = [];
  
  for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
    dates.push(new Date(date));
  }
  
  return dates;
}

export function getCurrentMonthCalendar(): Date[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = startOfWeek(firstDay);
  const endDate = endOfWeek(lastDay);
  
  const dates: Date[] = [];
  for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
    dates.push(new Date(date));
  }
  
  return dates;
}
