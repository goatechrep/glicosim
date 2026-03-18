export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  accent: 'orange' | 'blue' | 'emerald' | 'red' | 'violet';
  category: 'record' | 'medication' | 'notification' | 'system';
  metadata?: Record<string, string | number | boolean | null>;
}

const ACTIVITY_KEY = 'glicosim_recent_activities';
const MAX_ACTIVITIES = 40;

const getStorage = (): ActivityItem[] => {
  const stored = localStorage.getItem(ACTIVITY_KEY);
  if (!stored) {
    return [];
  }

  return JSON.parse(stored) as ActivityItem[];
};

const setStorage = (items: ActivityItem[]) => {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(items.slice(0, MAX_ACTIVITIES)));
};

export const activityService = {
  getActivities(): ActivityItem[] {
    return getStorage();
  },

  getRecentActivities(limit = 5): ActivityItem[] {
    return getStorage().slice(0, limit);
  },

  logActivity(activity: Omit<ActivityItem, 'id' | 'date'>) {
    const item: ActivityItem = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
    };

    setStorage([item, ...getStorage()]);
    return item;
  },

  clearActivities() {
    setStorage([]);
  },
};

