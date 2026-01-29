/**
 * Утилиты для работы с часами работы
 */

export interface WorkingHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

const STORAGE_KEY = 'app_working_hours';

const DEFAULT_HOURS: WorkingHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
};

export function getWorkingHours(): WorkingHours {
  if (typeof window === 'undefined') {
    return DEFAULT_HOURS;
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_HOURS, ...parsed };
    } catch (e) {
      console.error('Failed to parse saved working hours:', e);
    }
  }

  return DEFAULT_HOURS;
}

export interface VacationPeriod {
  id: string;
  startDate: string;
  endDate: string;
  note?: string;
}

const VACATION_STORAGE_KEY = 'app_vacation_periods';

export function getAllVacations(): VacationPeriod[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const saved = localStorage.getItem(VACATION_STORAGE_KEY);
  if (!saved || saved === 'null' || saved === 'undefined') {
    return [];
  }

  try {
    const vacations: VacationPeriod[] = JSON.parse(saved);
    if (!Array.isArray(vacations)) {
      return [];
    }
    return vacations;
  } catch (e) {
    console.error('[Vacation] Failed to parse saved vacations:', e);
    return [];
  }
}

export function getActiveVacations(): VacationPeriod[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const vacations = getAllVacations();
  
  if (vacations.length === 0) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const active = vacations.filter((v) => {
    if (!v.startDate || !v.endDate) {
      return false;
    }
    
    try {
      // Парсим даты в формате YYYY-MM-DD
      // Важно: new Date('YYYY-MM-DD') интерпретирует дату как UTC, поэтому нужно использовать локальное время
      const startParts = v.startDate.split('-');
      const endParts = v.endDate.split('-');
      
      if (startParts.length !== 3 || endParts.length !== 3) {
        return false;
      }
      
      const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
      end.setHours(23, 59, 59, 999);
      
      const isActive = today >= start && today <= end;
      
      return isActive;
    } catch (e) {
      console.error('[Vacation] Error checking vacation dates:', e);
      return false;
    }
  });
  
  return active;
}

// Проверяет, попадает ли дата в период отпуска и возвращает этот период
export function getVacationForDate(date: string): VacationPeriod | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const vacations = getAllVacations();
  if (vacations.length === 0) {
    return null;
  }

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  for (const v of vacations) {
    if (!v.startDate || !v.endDate) {
      continue;
    }

    try {
      const startParts = v.startDate.split('-');
      const endParts = v.endDate.split('-');

      if (startParts.length !== 3 || endParts.length !== 3) {
        continue;
      }

      const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
      start.setHours(0, 0, 0, 0);

      const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
      end.setHours(23, 59, 59, 999);

      if (checkDate >= start && checkDate <= end) {
        return v;
      }
    } catch (e) {
      console.error('[Vacation] Error checking date:', e);
    }
  }

  return null;
}

// Проверяет, попадает ли дата в период отпуска
export function isDateInVacation(date: string): boolean {
  return getVacationForDate(date) !== null;
}

/**
 * Получить доступные часы для записи на конкретную дату
 * @param dateStr - дата в формате YYYY-MM-DD
 * @returns массив доступных часов (например, [9, 10, 11, ..., 18])
 */
export function getAvailableHoursForDate(dateStr: string): number[] {
  if (!dateStr) return [];
  
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Маппинг дня недели на ключ в WorkingHours
  const dayMap: { [key: number]: keyof WorkingHours } = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  
  const dayKey = dayMap[dayOfWeek];
  const hours = getWorkingHours();
  const dayHours = hours[dayKey];
  
  // Если день закрыт, возвращаем пустой массив
  if (dayHours.closed) {
    return [];
  }
  
  // Парсим часы открытия и закрытия
  const openHour = parseInt(dayHours.open.split(':')[0], 10);
  const closeHour = parseInt(dayHours.close.split(':')[0], 10);
  
  // Создаем массив доступных часов (включая час закрытия)
  const availableHours: number[] = [];
  for (let hour = openHour; hour <= closeHour; hour++) {
    availableHours.push(hour);
  }
  
  return availableHours;
}

export function formatWorkingHours(hours: WorkingHours, language: 'lv' | 'ru'): string {
  const days = [
    { key: 'monday' as const, labelRu: 'Пн', labelLv: 'Pr' },
    { key: 'tuesday' as const, labelRu: 'Вт', labelLv: 'Ot' },
    { key: 'wednesday' as const, labelRu: 'Ср', labelLv: 'Tr' },
    { key: 'thursday' as const, labelRu: 'Чт', labelLv: 'Ct' },
    { key: 'friday' as const, labelRu: 'Пт', labelLv: 'Pt' },
    { key: 'saturday' as const, labelRu: 'Сб', labelLv: 'Se' },
    { key: 'sunday' as const, labelRu: 'Вс', labelLv: 'Sv' },
  ];

  const closedLabel = language === 'ru' ? 'Выходной' : 'Brīvdiena';
  const lines: string[] = [];

  days.forEach((day) => {
    const dayHours = hours[day.key];
    const label = language === 'ru' ? day.labelRu : day.labelLv;
    
    if (dayHours.closed) {
      lines.push(`${label}: ${closedLabel}`);
    } else {
      lines.push(`${label}: ${dayHours.open} - ${dayHours.close}`);
    }
  });

  return lines.join('\n');
}
