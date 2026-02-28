// Serviço para sincronizar dados entre LocalStorage e Supabase
import { supabaseService } from './supabaseService';

export interface DataSnapshot {
  user: any[];
  records: any[];
  alerts: any[];
  exportedAt: string;
  version: string;
}

const STORAGE_KEY = 'glicosim_data_backup';
const LAST_SYNC_KEY = 'glicosim_last_sync';
const PRIMARY_STORAGE_KEY = 'glicosim_data';

const readJSON = (key: string): any | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const normalizeRecord = (record: any): any => {
  if (!record) return null;
  const timestamp =
    typeof record.timestamp === 'number'
      ? record.timestamp
      : new Date(`${record.data || new Date().toISOString().split('T')[0]}T00:00:00`).getTime();

  return { ...record, timestamp };
};

const getUnifiedStorage = () => {
  // Fonte principal do app (usada por mockService e telas de CRUD)
  const primary = readJSON(PRIMARY_STORAGE_KEY);
  if (primary && Array.isArray(primary.records)) {
    const records = primary.records.map(normalizeRecord).filter(Boolean);
    const alerts = Array.isArray(primary.alerts) ? primary.alerts : [];
    const payments = Array.isArray(primary.payments) ? primary.payments : [];
    return { records, alerts, payments };
  }

  // Fallback legado
  const backup = readJSON(STORAGE_KEY);
  if (backup && Array.isArray(backup.records)) {
    const records = backup.records.map(normalizeRecord).filter(Boolean);
    const alerts = Array.isArray(backup.alerts) ? backup.alerts : [];
    const payments = Array.isArray(backup.payments) ? backup.payments : [];
    return { records, alerts, payments };
  }

  return { records: [], alerts: [], payments: [] };
};

export const dataSyncService = {
  // ===== Dashboard Stats =====
  getDashboardStats: async (): Promise<any> => {
    try {
      const storage = getUnifiedStorage();
      const records = [...storage.records].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      const lastRecord = records.length > 0 ? records[0] : null;
      const avg = records.length > 0 ? records.reduce((sum: number, r: any) => sum + (r.antesRefeicao || 0), 0) / records.length : 0;
      
      
      return {
        lastGlicemy: lastRecord?.antesRefeicao || 0,
        average: Math.round(avg),
        goalStatus: avg >= 55 && avg <= 100 ? 'Saudável' : 'Ajustar',
        totalRecords: records.length,
        alerts: storage.alerts || [],
        payments: storage.payments || []
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas do dashboard:', error);
      return {
        lastGlicemy: 0,
        average: 0,
        goalStatus: 'Desconecido',
        totalRecords: 0,
        alerts: [],
        payments: []
      };
    }
  },
  // ===== Registros de glicemia =====
  getRecords: async (): Promise<any[]> => {
    try {
      const storage = getUnifiedStorage();
      return [...storage.records].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (error) {
      console.error('❌ Erro ao obter registros:', error);
      return [];
    }
  },

  saveRecord: async (record: any): Promise<void> => {
    try {
      // Salva na base principal usada pelo app
      const primary = readJSON(PRIMARY_STORAGE_KEY) || { user: null, records: [], payments: [], alerts: [] };
      primary.records = Array.isArray(primary.records) ? primary.records : [];
      primary.records.push(normalizeRecord(record));
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(primary));

      // Mantém compatibilidade com backup legado
      const backup = readJSON(STORAGE_KEY) || { records: [], alerts: [], payments: [] };
      backup.records = Array.isArray(backup.records) ? backup.records : [];
      backup.records.push(normalizeRecord(record));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('❌ Erro ao salvar registro:', error);
    }
  },
  // ===== EXPORTAR DADOS =====
  exportUserData: async (userId: string, isPro: boolean = false): Promise<DataSnapshot> => {
    try {

      // Obter dados do localStorage ou Supabase
      let userData: any [] = [];
      let records: any[] = [];
      let alerts: any[] = [];

      if (isPro) {
        // Se é PRO, pega do Supabase
        try {
          const user = await supabaseService.getUser(userId);
          const userRecords = await supabaseService.getRecords(userId);
          const userAlerts = await supabaseService.getAlerts(userId);

          userData = user[0];
          records = userRecords;
          alerts = userAlerts;
        } catch (error) {
          console.warn('⚠️ Erro ao buscar dados do Supabase, usando localStorage:', error);
          // Fallback para localStorage
          const backup = dataSyncService.getLocalBackup();
          userData = backup?.user || [];
          records = backup?.records || [];
          alerts = backup?.alerts || [];
        }
      } else {
        // Se não é PRO, pega do localStorage
        const backup = dataSyncService.getLocalBackup();
        userData = backup?.user || [];
        records = backup?.records || [];
        alerts = backup?.alerts || [];
      }

      const snapshot: DataSnapshot = {
        user: userData,
        records,
        alerts,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      return snapshot;
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      throw error;
    }
  },

  // ===== BAIXAR DADOS COMO JSON =====
  downloadDataAsJSON: async (userId: string, isPro: boolean = false): Promise<void> => {
    try {
      const data = await dataSyncService.exportUserData(userId, isPro);

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `glicosim-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('❌ Erro ao baixar arquivo:', error);
      throw error;
    }
  },

  // ===== SALVAR NO LOCALSTORAGE =====
  saveToLocalStorage: (userId: string, data: DataSnapshot): void => {
    try {
      const key = `${STORAGE_KEY}_${userId}`;
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${LAST_SYNC_KEY}_${userId}`, new Date().toISOString());
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
      throw error;
    }
  },

  // ===== CARREGAR DO LOCALSTORAGE =====
  getLocalBackup: (userId?: string): DataSnapshot | null => {
    try {
      const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Erro ao ler localStorage:', error);
      return null;
    }
  },

  // ===== SINCRONIZAR COM SUPABASE (PRO) =====
  syncToSupabase: async (userId: string, data: DataSnapshot): Promise<void> => {
    try {

      // Sincronizar usuário
      if (data.user) {
        await supabaseService.updateUser(userId, data.user[0].id);
      }

      // Sincronizar records
      for (const record of data.records) {
        if (record.id) {
          await supabaseService.updateRecord(record.id, record);
        } else {
          await supabaseService.createRecord(record);
        }
      }

      // Sincronizar alertas
      for (const alert of data.alerts) {
        if (!alert.id) {
          await supabaseService.createAlert(alert);
        }
      }

      localStorage.setItem(`${LAST_SYNC_KEY}_${userId}`, new Date().toISOString());
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
      throw error;
    }
  },

  // ===== DELETAR TODOS OS DADOS =====
  deleteAllData: async (userId: string, isPro: boolean = false): Promise<void> => {
    try {

      if (isPro) {
        // Deletar do Supabase
        try {
          const records = await supabaseService.getRecords(userId);
          for (const record of records) {
            await supabaseService.deleteRecord(record.id);
          }

          const alerts = await supabaseService.getAlerts(userId);
          for (const alert of alerts) {
            await supabaseService.deleteAlert(alert.id);
          }

        } catch (error) {
          console.warn('⚠️ Erro ao deletar do Supabase:', error);
        }
      }

      // Deletar do localStorage
      const keys = Object.keys(localStorage).filter(k => k.includes(userId));
      keys.forEach(key => localStorage.removeItem(key));

    } catch (error) {
      console.error('❌ Erro ao deletar dados:', error);
      throw error;
    }
  },

  // ===== OBTER ÚLTIMO SYNC =====
  getLastSyncTime: (userId: string): string | null => {
    return localStorage.getItem(`${LAST_SYNC_KEY}_${userId}`);
  },

  // ===== CALCULAR TAMANHO DOS DADOS =====
  getDataSize: (userId: string): string => {
    try {
      const backup = dataSyncService.getLocalBackup(userId);
      const sizeInBytes = new Blob([JSON.stringify(backup)]).size;
      
      if (sizeInBytes < 1024) return `${sizeInBytes} B`;
      if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } catch {
      return '0 B';
    }
  },
};
