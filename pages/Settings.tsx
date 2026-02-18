
import React, { useState, useRef } from 'react';
import { useAuth } from '../App';
import { mockService } from '../services/mockService';
import { supabaseService } from '../services/supabaseService';
import { dataSyncService } from '../services/dataSyncService';
import { PlanoType } from '../types';
import { applyCPFMask, applyWhatsAppMask, validateCPF } from '../utils/formatters';

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Estados para campos do perfil
  const [nome, setNome] = useState<string>(user?.nome || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [cpf, setCpf] = useState<string>(user?.cpf || '');
  const [whatsapp, setWhatsapp] = useState<string>(user?.whatsapp || '');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [peso, setPeso] = useState<string>(user?.peso?.toString() || '');
  const [altura, setAltura] = useState<string>(user?.altura?.toString() || '');
  const [biotipo, setBiotipo] = useState<string>(user?.biotipo || 'Mesomorfo');
  const [fotoPerfil, setFotoPerfil] = useState<string>(user?.foto || '');
  const [cpfError, setCpfError] = useState<string>('');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCPFMask(e.target.value);
    setCpf(masked);
    if (masked.length === 14) { // CPF formatado tem 14 caracteres
      if (!validateCPF(masked)) {
        setCpfError('CPF inválido');
      } else {
        setCpfError('');
      }
    } else {
      setCpfError('');
    }
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyWhatsAppMask(e.target.value);
    setWhatsapp(masked);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      alert('Erro: Arquivo ou usuário não identificado');
      return;
    }

    // Validar formato
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      alert('🚫 Formato inválido. Use JPG, PNG ou WebP');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('🚫 Arquivo muito grande. Máximo 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await supabaseService.uploadProfileImage(user.id, file);
      setFotoPerfil(imageUrl);
      alert('✅ Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Erro detalhado ao fazer upload:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`❌ Erro ao fazer upload: ${errorMsg}`);
    } finally {
      setUploadingImage(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdate = async () => {
    if (!user?.id) {
      alert('Erro: Usuário não identificado. Faça login novamente.');
      return;
    }

    if (!nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (cpf && cpf.length === 14 && !validateCPF(cpf)) {
      alert('CPF inválido');
      return;
    }

    setLoading(true);
    try {
      await supabaseService.updateUser(user.id, {
        nome: nome.trim(),
        cpf: cpf || undefined,
        whatsapp: whatsapp || undefined,
        bio: bio || undefined,
        peso: peso ? parseFloat(peso) : undefined,
        altura: altura ? parseFloat(altura) : undefined,
        biotipo: biotipo || undefined,
        foto: fotoPerfil || undefined,
      });
      await refreshUser();
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao atualizar perfil: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user?.id) {
      alert('Erro: Usuário não identificado');
      return;
    }

    setLoading(true);
    try {
      const isPro = user?.plano === 'PRO';
      await dataSyncService.downloadDataAsJSON(user.id, isPro);
      alert('✅ Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('❌ Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!user?.id) {
      alert('Erro: Usuário não identificado');
      return;
    }

    if (deleteConfirmText !== 'DELETAR') {
      alert('⚠️ Digite "DELETAR" para confirmar');
      return;
    }

    setLoading(true);
    try {
      const isPro = user?.plano === 'PRO';
      await dataSyncService.deleteAllData(user.id, isPro);
      setDeleteConfirmText('');
      setShowDeleteModal(false);
      alert('✅ Todos os dados foram deletados permanentemente');
      await refreshUser();
    } catch (error) {
      console.error('Erro ao deletar dados:', error);
      alert('❌ Erro ao deletar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setLoading(true);
    try {
      await supabaseService.updateUser(user?.id || '', { theme });
      await refreshUser();
    } catch (error) {
      console.error('Erro ao alterar tema:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Meu Perfil' },
    { id: 'assinatura', label: 'Assinatura' },
    { id: 'sistema', label: 'Sistema' },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Configurações</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seu perfil e dados pessoais.</p>
        </div>
      </header>

      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-white dark:bg-slate-700 text-orange-600' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-8xl pt-0">
        {activeTab === 'perfil' && (
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-8 rounded-lg space-y-8 animate-slide-up">
            {/* Foto de Perfil */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/10 rounded-lg flex items-center justify-center text-4xl font-black text-orange-600 border-2 border-orange-200 dark:border-orange-900/30 overflow-hidden">
                  {fotoPerfil ? (
                    <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    user?.nome?.[0] || 'U'
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute -bottom-1 -right-2 bg-orange-600 text-white p-1 rounded-full border-1 border-white dark:border-slate-900 hover:bg-orange-700 transition-all disabled:opacity-50"
                  title="Alterar foto de perfil"
                >
                  <span className="material-symbols-outlined text-[24px] p-1">camera_alt</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">{nome}</h5>
                <div className="flex gap-4 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">ID: {user?.id?.substring(0, 8)}</span>
                </div>
                {uploadingImage && <span className="text-[9px] text-orange-600 font-bold">Enviando imagem...</span>}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-6">Informações Pessoais</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Nome Completo" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <InputField 
                  label="E-mail" 
                  value={email}
                  disabled 
                />
                <InputField 
                  label="CPF"
                  value={cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  error={cpfError}
                />
                <InputField 
                  label="WhatsApp"
                  value={whatsapp}
                  onChange={handleWhatsAppChange}
                  placeholder="(11) 99999-9999"
                />

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    maxLength={160}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none dark:text-white focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                    rows={3}
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">{bio.length}/160</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-6">Dados Físicos</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Peso (kg)"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 75.5"
                  type="number"
                />
                <InputField 
                  label="Altura (cm)"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                  placeholder="Ex: 175"
                  type="number"
                />

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Biotipo Físico</label>
                  <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
                    {['Ectomorfo', 'Mesomorfo', 'Endomorfo'].map(type => (
                      <button
                        key={type}
                        onClick={() => setBiotipo(type)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                          biotipo === type 
                          ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-950/20' 
                          : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium mt-3 uppercase tracking-tighter">Essa informação será usada para sugestões personalizadas.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="flex-1 px-8 py-4 bg-orange-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'assinatura' && (
          <div className="bg-orange-600 p-12 rounded-[2.5rem] relative overflow-hidden text-white animate-slide-up">
            <h3 className="text-4xl font-black tracking-tighter uppercase relative z-10">{user?.plano} PRO</h3>
            <p className="text-orange-100 text-sm mt-4 opacity-90 max-w-sm leading-relaxed relative z-10">Sua assinatura está ativa. Aproveite o acesso completo à plataforma.</p>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        )}

        {activeTab === 'sistema' && (
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-10 rounded-lg animate-slide-up space-y-8">
            {/* Temas */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-6 tracking-widest">Temas da Interface</h4>
              <div className="grid grid-cols-3 gap-6">
                {['light', 'dark', 'system'].map(mode => (
                  <button 
                    key={mode} 
                    onClick={() => handleThemeChange(mode as any)}
                    className={`py-6 border-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-3 transition-all ${
                      user?.theme === mode 
                        ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/20 text-orange-600' 
                        : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">{mode === 'light' ? 'light_mode' : mode === 'dark' ? 'dark_mode' : 'settings_brightness'}</span>
                    {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Escuro' : 'Sistema'}
                  </button>
                ))}
              </div>
            </div>

            {/* Armazenamento */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4 tracking-widest">Armazenamento</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {user?.plano === 'PRO' 
                  ? '🔓 Dados sincronizados com o servidor (Supabase)' 
                  : '🔒 Dados salvos localmente (localStorage)'}
              </p>
              <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4 mb-6">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Tamanho:</strong> {dataSyncService.getDataSize(user?.id || '')}
                </p>
              </div>
            </div>

            {/* Exportar Dados */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4 tracking-widest">Exportar Dados</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Baixe uma cópia de todos os seus dados em formato JSON
              </p>
              <button
                onClick={handleExportData}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">download</span>
                {loading ? 'Exportando...' : 'Exportar Dados'}
              </button>
            </div>

            {/* Deletar Todos os Dados */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase mb-4 tracking-widest">⚠️ Zona de Perigo</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Esta ação é <strong>irreversível</strong> e deletará todos os seus dados permanentemente
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">delete_forever</span>
                Deletar Todos os Dados
              </button>
            </div>
          </div>
        )}

        {/* Modal de Confirmação Delete */}
        {showDeleteModal && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[9998] animate-fade-in"
              onClick={() => setShowDeleteModal(false)}
              aria-hidden="true"
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] animate-scale-fade-in bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">warning</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">CONFIRMAR DELETAR</h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Você está prestes a deletar <strong>TODOS</strong> os seus dados permanentemente, incluindo:
              </p>

              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-6 ml-4">
                <li>• Registros de glicemia</li>
                <li>• Alertas e notificações</li>
                <li>• Dados do perfil</li>
                <li>• Fotos de perfil</li>
              </ul>

              <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-6 uppercase tracking-widest">
                Esta ação não pode ser desfeita!
              </p>

              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Digite "DELETAR" para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder="DELETAR"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-bold uppercase dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAllData}
                  disabled={loading || deleteConfirmText !== 'DELETAR'}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold text-xs uppercase rounded-lg hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, error, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3 text-sm font-medium outline-none dark:text-white focus:ring-2 focus:ring-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        error 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-slate-200 dark:border-slate-800'
      }`}
      {...props}
    />
    {error && <span className="text-[9px] text-red-500 font-bold">{error}</span>}
  </div>
);

export default SettingsPage;
