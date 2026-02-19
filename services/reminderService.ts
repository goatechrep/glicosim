const REMINDERS_KEY = 'glicosim_reminders';

export interface Reminder {
  id: string;
  recordId: string;
  recordData: any;
  triggerTime: number;
  created: string;
}

export const reminderService = {
  createReminder: (recordId: string, recordData: any): void => {
    const reminder: Reminder = {
      id: Date.now().toString(),
      recordId,
      recordData,
      triggerTime: Date.now() + (120 * 60 * 1000), // 120 minutos
      created: new Date().toISOString()
    };
    
    const reminders = reminderService.getReminders();
    reminders.push(reminder);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  },

  getReminders: (): Reminder[] => {
    const data = localStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getDueReminders: (): Reminder[] => {
    const now = Date.now();
    return reminderService.getReminders().filter(r => r.triggerTime <= now);
  },

  deleteReminder: (id: string): void => {
    const reminders = reminderService.getReminders().filter(r => r.id !== id);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  },

  clearAll: (): void => {
    localStorage.removeItem(REMINDERS_KEY);
  }
};
