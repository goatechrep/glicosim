
import { createClient } from '@supabase/supabase-js';
import { UserProfile, GlucoseRecord, Periodo, Medicamento, PlanoType, PaymentHistory, Alert } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found in .env');
}

const supabaseClient = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

interface SupabaseUser {
  id: string;
  email: string;
  nome: string;
  cpf?: string;
  whatsapp?: string;
  bio?: string;
  foto_url?: string;
  peso?: number;
  altura?: number;
  biotipo?: string;
  data_nascimento?: string;
  localizacao?: string;
  plano: string;
  is_onboarded: boolean;
  theme: string;
  notifications: boolean;
}

export const supabaseService = {
  // ===== AUTH =====
  signUp: async (email: string, password: string, nome: string) => {
    if (!supabaseClient) throw new Error('Supabase not configured');
    
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    
    if (data.user) {
      // Criar perfil do usuário
      await supabaseClient
        .from('users')
        .insert({
          id: data.user.id,
          email,
          nome,
          plano: PlanoType.FREE,
          is_onboarded: false,
          theme: 'dark',
          notifications: true,
        });
    }

    return data;
  },

  signIn: async (email: string, password: string) => {
    if (!supabaseClient) throw new Error('Supabase not configured');
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Atualizar último login
    if (data.user) {
      await supabaseClient
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return data;
  },

  signOut: async () => {
    if (!supabaseClient) throw new Error('Supabase not configured');
    return supabaseClient.auth.signOut();
  },

  getCurrentUser: async () => {
    if (!supabaseClient) throw new Error('Supabase not configured');
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
  },

  // ===== USERS =====
  getUser: async (userId?: string): Promise<UserProfile | null> => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    try {
      let query = supabaseClient.from('users').select('*');
      
      if (userId) {
        query = query.eq('id', userId);
      } else {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return null;
        query = query.eq('id', user.id);
      }

      const { data, error } = await query.single();
      
      if (error) return null;
      
      return supabaseToUserProfile(data);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  createUser: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    const { data: { user: authUser } } = await supabaseClient.auth.getUser();
    
    if (!authUser) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        nome: userData.nome || 'Usuário',
        plano: userData.plano || PlanoType.FREE,
        is_onboarded: userData.isOnboarded || false,
        theme: userData.theme || 'dark',
        notifications: userData.notifications ?? true,
        peso: userData.peso,
        altura: userData.altura,
        biotipo: userData.biotipo,
        localizacao: userData.localizacao,
      })
      .select()
      .single();

    if (error) throw error;
    
    return supabaseToUserProfile(data);
  },

  updateUser: async (userId: string, userData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!supabaseClient) throw new Error('Supabase not configured');
    
    if (!userId) throw new Error('User ID is required');

    const updateData: any = {};
    
    if (userData.nome) updateData.nome = userData.nome;
    if (userData.email) updateData.email = userData.email;
    if (userData.cpf) updateData.cpf = userData.cpf;
    if (userData.whatsapp) updateData.whatsapp = userData.whatsapp;
    if (userData.bio) updateData.bio = userData.bio;
    if (userData.foto) updateData.foto_url = userData.foto;
    if (userData.peso) updateData.peso = userData.peso;
    if (userData.altura) updateData.altura = userData.altura;
    if (userData.biotipo) updateData.biotipo = userData.biotipo;
    if (userData.localizacao) updateData.localizacao = userData.localizacao;
    if (userData.isOnboarded !== undefined) updateData.is_onboarded = userData.isOnboarded;
    if (userData.theme) updateData.theme = userData.theme;
    if (userData.notifications !== undefined) updateData.notifications = userData.notifications;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(error.message || 'Erro ao atualizar usuário');
    }
    
    return supabaseToUserProfile(data);
  },

  deleteUser: async (userId: string) => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    const { error } = await supabaseClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },

  uploadProfileImage: async (userId: string, file: File) => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    try {
      console.log('Starting upload for user:', userId, 'File:', file.name, file.type);
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const fileName = `${userId}/profile-${timestamp}.${fileExt}`;

      // Fazer upload com retry logic
      let uploadError = null;
      let uploadData = null;
      
      for (let attempt = 1; attempt <= 2; attempt++) {
        console.log(`Upload attempt ${attempt}...`);
        
        const result = await supabaseClient.storage
          .from('profile-images')
          .upload(fileName, file, { 
            upsert: true,
            contentType: file.type,
          });

        uploadError = result.error;
        uploadData = result.data;

        if (!uploadError) {
          console.log('Upload successful on attempt', attempt);
          break;
        }
        
        console.error(`Upload attempt ${attempt} failed:`, uploadError);
        
        if (attempt === 1) {
          // Try removing old file first
          await supabaseClient.storage
            .from('profile-images')
            .remove([`${userId}/profile.${fileExt}`])
            .catch(() => {});
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (uploadError) {
        console.error('Final upload error:', uploadError);
        const errorDetails = uploadError instanceof Error 
          ? uploadError.message 
          : typeof uploadError === 'object' 
            ? JSON.stringify(uploadError)
            : String(uploadError);
        throw new Error(`Erro ao fazer upload: ${errorDetails}`);
      }

      if (!uploadData) {
        throw new Error('Nenhum dado retornado do upload');
      }

      console.log('Getting public URL for file:', fileName);

      // Obter URL pública
      const { data: urlData } = supabaseClient.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Não foi possível obter URL da imagem');
      }

      console.log('Public URL obtained:', urlData.publicUrl);

      // Atualizar banco de dados
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({ foto_url: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error(`Erro ao salvar URL: ${updateError.message}`);
      }

      console.log('Upload completed successfully');
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload profile image error:', error);
      throw error;
    }
  },

  // ===== GLUCOSE RECORDS =====
  getRecords: async (userId?: string): Promise<GlucoseRecord[]> => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    try {
      let query = supabaseClient
        .from('glucose_records')
        .select('*')
        .order('data', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return [];
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(supabaseToRecord);
    } catch (error) {
      console.error('Error getting records:', error);
      return [];
    }
  },

  createRecord: async (record: Partial<GlucoseRecord>): Promise<GlucoseRecord> => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('glucose_records')
      .insert({
        user_id: user.id,
        periodo: record.periodo,
        medicamento: record.medicamento,
        antes_refeicao: record.antesRefeicao,
        apos_refeicao: record.aposRefeicao,
        dose: record.dose,
        notes: record.notes,
        data: record.data,
        timestamp: record.timestamp || Date.now(),
      })
      .select()
      .single();

    if (error) throw error;
    
    return supabaseToRecord(data);
  },

  updateRecord: async (recordId: string, record: Partial<GlucoseRecord>): Promise<GlucoseRecord> => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    const updateData: any = {};
    
    if (record.periodo) updateData.periodo = record.periodo;
    if (record.medicamento) updateData.medicamento = record.medicamento;
    if (record.antesRefeicao) updateData.antes_refeicao = record.antesRefeicao;
    if (record.aposRefeicao) updateData.apos_refeicao = record.aposRefeicao;
    if (record.dose) updateData.dose = record.dose;
    if (record.notes) updateData.notes = record.notes;
    if (record.data) updateData.data = record.data;

    const { data, error } = await supabaseClient
      .from('glucose_records')
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;
    
    return supabaseToRecord(data);
  },

  deleteRecord: async (recordId: string) => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    const { error } = await supabaseClient
      .from('glucose_records')
      .delete()
      .eq('id', recordId);

    if (error) throw error;
  },

  // ===== DASHBOARD STATS =====
  getDashboardStats: async (userId?: string) => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    try {
      let query = supabaseClient
        .from('glucose_records')
        .select('antes_refeicao');

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return null;
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const values = (data || []).map(r => r.antes_refeicao);
      const average = values.length > 0 
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;

      // Buscar alertas
      const { data: alerts } = await supabaseClient
        .from('alerts')
        .select('*')
        .eq('read', false);

      return {
        average,
        lastGlicemy: values[0] || 0,
        alerts: alerts || [],
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return null;
    }
  },

  // ===== ALERTS =====
  getAlerts: async (userId?: string): Promise<Alert[]> => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    try {
      let query = supabaseClient
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return [];
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(supabaseToAlert);
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  },

  createAlert: async (alert: Partial<Alert>): Promise<Alert> => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('alerts')
      .insert({
        user_id: user.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        date: alert.date,
      })
      .select()
      .single();

    if (error) throw error;
    
    return supabaseToAlert(data);
  },

  // ===== PAYMENTS =====
  getPaymentHistory: async (userId?: string): Promise<PaymentHistory[]> => {
    if (!supabaseClient) throw new Error('Supabase not configured');

    try {
      let query = supabaseClient
        .from('payment_history')
        .select('*')
        .order('date', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return [];
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(supabaseToPayment);
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  },
};

// ===== CONVERTERS =====
function supabaseToUserProfile(data: SupabaseUser): UserProfile {
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    cpf: data.cpf,
    whatsapp: data.whatsapp,
    bio: data.bio,
    foto: data.foto_url,
    peso: data.peso,
    altura: data.altura,
    biotipo: data.biotipo,
    dataNascimento: data.data_nascimento,
    localizacao: data.localizacao,
    plano: (data.plano as PlanoType) || PlanoType.FREE,
    isOnboarded: data.is_onboarded,
    theme: (data.theme as 'light' | 'dark' | 'system') || 'dark',
    notifications: data.notifications,
  };
}

function supabaseToRecord(data: any): GlucoseRecord {
  return {
    id: data.id,
    userId: data.user_id,
    periodo: data.periodo as Periodo,
    medicamento: data.medicamento as Medicamento,
    antesRefeicao: data.antes_refeicao,
    aposRefeicao: data.apos_refeicao,
    dose: data.dose || '0',
    notes: data.notes || '',
    data: data.data,
    timestamp: data.timestamp,
  };
}

function supabaseToAlert(data: any): Alert {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    severity: data.severity,
    date: data.date,
  };
}

function supabaseToPayment(data: any): PaymentHistory {
  return {
    id: data.id,
    date: data.date,
    amount: data.amount,
    status: data.status,
    plan: data.plan,
  };
}
