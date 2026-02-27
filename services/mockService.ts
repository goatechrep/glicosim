
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

type TestRecordInput = Omit<GlucoseRecord, 'id' | 'userId' | 'timestamp'>;

const PERIOD_ORDER: Periodo[] = [
  Periodo.CAFE_MANHA,
  Periodo.ALMOCO,
  Periodo.LANCHE,
  Periodo.JANTAR,
  Periodo.GLICEMIA_DEITAR
];

const PERIOD_HOUR: Record<Periodo, string> = {
  [Periodo.CAFE_MANHA]: '08:00:00',
  [Periodo.ALMOCO]: '12:00:00',
  [Periodo.LANCHE]: '16:00:00',
  [Periodo.JANTAR]: '19:00:00',
  [Periodo.GLICEMIA_DEITAR]: '22:00:00'
};

const periodRank = (periodo: Periodo): number => PERIOD_ORDER.indexOf(periodo);
const recordKey = (data: string, periodo: Periodo): string => `${data}::${periodo}`;

const buildTimestamp = (dateISO: string, periodo: Periodo, offset = 0): number =>
  new Date(`${dateISO}T${PERIOD_HOUR[periodo]}`).getTime() + offset;

const buildTestRecordInputs = (): TestRecordInput[] => {
  const inputs: TestRecordInput[] = [];
  const now = new Date();
  const variationCycle = [-18, -12, -8, -5, -2, 0, 4, 8, 12, 18, 24, 28];

  for (let dayIndex = 0; dayIndex < 30; dayIndex += 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30 + dayIndex);
    const base = 200;
    const variation = variationCycle[dayIndex % variationCycle.length];
    const dateISO = cursor.toISOString().split('T')[0];
    const dayIsHigh = base + variation >= 220;
    const dayNote = dayIsHigh
      ? 'comi demais hoje'
      : dayIndex % 5 === 0
        ? 'hidratacao baixa no periodo'
        : '';

    PERIOD_ORDER.forEach((periodo, periodIndex) => {
      const before = base + variation + periodIndex * 2;
      const after = before + (6 + (periodIndex % 3) * 2);
      inputs.push({
        periodo,
        medicamento: Medicamento.HUMALOG,
        antesRefeicao: before,
        aposRefeicao: after,
        dose: '6 UI',
        notes: dayNote,
        data: dateISO
      });
    });
  }

  return inputs.sort((a, b) => {
    const dateCmp = a.data.localeCompare(b.data);
    if (dateCmp !== 0) return dateCmp;
    return periodRank(a.periodo) - periodRank(b.periodo);
  });
};

const buildSeedRecords = (): GlucoseRecord[] => {
  const records: GlucoseRecord[] = [];
  const inputs = buildTestRecordInputs();
  inputs.forEach((input, index) => {
    const dateISO = input.data;
    records.push({
      id: `seed-${index + 1}`,
      userId: 'user-1',
      ...input,
      timestamp: buildTimestamp(dateISO, input.periodo, index)
    });
  });

  return records;
};

const SEED_DATA: StorageState = {
  user: null,
  records: buildSeedRecords(),
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
  addTestRecords: async (): Promise<number> => {
    await delay(300);
    const storage = getStorage();
    const inputs = buildTestRecordInputs();
    const existingByKey = new Map<string, GlucoseRecord>();
    storage.records.forEach(record => {
      existingByKey.set(recordKey(record.data, record.periodo), record);
    });

    let affected = 0;
    const userId = storage.user?.id || 'guest';
    inputs.forEach((record, index) => {
      const key = recordKey(record.data, record.periodo);
      const existing = existingByKey.get(key);
      if (existing) {
        const updated: GlucoseRecord = {
          ...existing,
          ...record,
          userId: existing.userId || userId,
          timestamp: buildTimestamp(record.data, record.periodo, index)
        };
        const storageIndex = storage.records.findIndex(r => r.id === existing.id);
        if (storageIndex >= 0) {
          storage.records[storageIndex] = updated;
          affected += 1;
        }
        return;
      }

      storage.records.push({
        ...record,
        id: `test-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        userId,
        timestamp: buildTimestamp(record.data, record.periodo, index)
      });
      affected += 1;
    });

    setStorage(storage);
    return affected;
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
      goalStatus: avg >= 55 && avg <= 100 ? 'Saudável' : 'Ajustar',
      totalRecords: records.length,
      alerts: storage.alerts,
      payments: storage.payments
    };
  },

  // RESET
  resetData: async (): Promise<void> => {
    await delay(1000);
    localStorage.removeItem(STORAGE_KEY);
  },

  // ALERTS
  deleteAlert: async (id: string): Promise<void> => {
    await delay(300);
    const storage = getStorage();
    storage.alerts = storage.alerts.filter(a => a.id !== id);
    setStorage(storage);
  },
  updateAlert: async (id: string, data: Partial<Alert>): Promise<Alert> => {
    await delay(300);
    const storage = getStorage();
    const index = storage.alerts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Alert not found');
    storage.alerts[index] = { ...storage.alerts[index], ...data };
    setStorage(storage);
    return storage.alerts[index];
  }
};
