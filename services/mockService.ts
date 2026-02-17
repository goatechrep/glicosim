
import { 
  UserProfile, 
  GlucoseRecord, 
  PlanoType, 
  Periodo, 
  Medicamento, 
  Subscription, 
  PaymentHistory, 
  Alert 
} from '../types';

const STORAGE_KEY = 'glicosim_data';

interface StorageState {
  user: UserProfile | null;
  records: GlucoseRecord[];
  payments: PaymentHistory[];
  alerts: Alert[];
}

const SEED_DATA: StorageState = {
  user: null,
  records: [
    {
      id: '1',
      userId: 'user-1',
      periodo: Periodo.CAFE_MANHA,
      medicamento: Medicamento.NENHUM,
      antesRefeicao: 95,
      aposRefeicao: 120,
      dose: 'N/A',
      notes: 'Registro inicial de teste',
      data: new Date().toISOString().split('T')[0],
      timestamp: Date.now() - 86400000
    }
  ],
  payments: [
    { id: 'p1', date: '2023-10-01', amount: 0, status: 'PAGO', plan: 'Free' },
    { id: 'p2', date: '2023-11-01', amount: 0, status: 'PAGO', plan: 'Free' }
  ],
  alerts: [
    { id: 'a1', title: 'Vencimento de Receita', description: 'Sua receita de Humalog vence em 3 dias.', date: '2023-12-01', severity: 'medium' },
    { id: 'a2', title: 'Checkup Trimestral', description: 'Agende seu exame de Hemoglobina Glicada.', date: '2023-12-15', severity: 'low' },
    { id: 'a3', title: 'Meta Não Atingida', description: 'Seu índice médio subiu 15% esta semana.', date: '2023-11-28', severity: 'high' }
  ]
};

const getStorage = (): StorageState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(data);
};

const setStorage = (data: StorageState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockService = {
  // USER
  getUser: async (): Promise<UserProfile | null> => {
    await delay(300);
    return getStorage().user;
  },
  createUser: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(500);
    const storage = getStorage();
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      nome: userData.nome || '',
      email: userData.email || '',
      plano: PlanoType.FREE,
      isOnboarded: false,
      theme: 'dark',
      notifications: true,
      ...userData
    };
    storage.user = newUser;
    setStorage(storage);
    return newUser;
  },
  updateUser: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(400);
    const storage = getStorage();
    if (!storage.user) throw new Error('User not found');
    storage.user = { ...storage.user, ...userData };
    setStorage(storage);
    return storage.user;
  },
  deleteUser: async (): Promise<void> => {
    await delay(500);
    const storage = getStorage();
    storage.user = null;
    setStorage(storage);
  },

  // GLUCOSE RECORDS
  getRecords: async (): Promise<GlucoseRecord[]> => {
    await delay(300);
    return getStorage().records.sort((a, b) => b.timestamp - a.timestamp);
  },
  createRecord: async (record: Omit<GlucoseRecord, 'id' | 'userId' | 'timestamp'>): Promise<GlucoseRecord> => {
    await delay(400);
    const storage = getStorage();
    const newRecord: GlucoseRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      userId: storage.user?.id || 'guest',
      timestamp: new Date(`${record.data}T00:00:00`).getTime() || Date.now()
    };
    storage.records.push(newRecord);
    setStorage(storage);
    return newRecord;
  },
  updateRecord: async (id: string, record: Partial<GlucoseRecord>): Promise<GlucoseRecord> => {
    await delay(400);
    const storage = getStorage();
    const index = storage.records.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Record not found');
    storage.records[index] = { ...storage.records[index], ...record };
    setStorage(storage);
    return storage.records[index];
  },
  deleteRecord: async (id: string): Promise<void> => {
    await delay(500);
    const storage = getStorage();
    storage.records = storage.records.filter(r => r.id !== id);
    setStorage(storage);
  },

  // DASHBOARD DATA
  getDashboardStats: async () => {
    await delay(400);
    const storage = getStorage();
    const records = storage.records;
    const lastRecord = records.length > 0 ? records.sort((a, b) => b.timestamp - a.timestamp)[0] : null;
    const avg = records.length > 0 ? records.reduce((acc, r) => acc + r.antesRefeicao, 0) / records.length : 0;
    
    return {
      lastGlicemy: lastRecord?.antesRefeicao || 0,
      average: Math.round(avg),
      goalStatus: avg >= 55 && avg <= 100 ? 'No Alvo' : 'Ajustar',
      totalRecords: records.length,
      alerts: storage.alerts,
      payments: storage.payments
    };
  },

  // RESET
  resetData: async (): Promise<void> => {
    await delay(1000);
    localStorage.removeItem(STORAGE_KEY);
  }
};
