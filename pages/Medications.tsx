import React, { useState, useEffect } from 'react';
import { medicationService } from '../services/medicationService';
import { Medication } from '../types/medication';
import { getPlanById, getFormattedPrice } from '../data/plans';
import { getBannersForPage } from '../data/banners';
import { useAuth } from '../App';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

const MedicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const banners = getBannersForPage('medications');
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: 0,
    unidade: 'UI' as 'UI' | 'mg' | 'co' | 'ml',
    limiteEstoque: 10
  });

  useEffect(() => { loadMedications(); }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const loadMedications = () => {
    setMedications(medicationService.getMedications());
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      medicationService.updateMedication(editingId, formData);
      addToast('Medicamento atualizado!');
    } else {
      medicationService.saveMedication(formData);
      addToast('Medicamento cadastrado!');
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nome: '', quantidade: 0, unidade: 'UI', limiteEstoque: 10 });
    loadMedications();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este medicamento?')) {
      medicationService.deleteMedication(id);
      addToast('Medicamento removido!');
      loadMedications();
    }
  };

  const lowStockMeds = medicationService.getLowStockMedications();

  return (
    <div className="animate-fade-in relative min-h-full space-y-6">
      <button
        onClick={() => {
          setEditingId(null);
          setFormData({ nome: '', quantidade: 0, unidade: 'UI', limiteEstoque: 10 });
          setIsModalOpen(true);
        }}
        className="hidden md:flex fixed bottom-8 right-8 z-40 w-16 h-16 bg-orange-600 text-white rounded-full items-center justify-center border border-orange-500 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[10999] bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-none" />
      )}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[11000] pointer-events-none flex flex-col items-center justify-center gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 text-center min-w-[280px] animate-toast-in backdrop-blur-sm shadow-2xl ${
            t.type === 'success' ? 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-700 text-white' : 
            t.type === 'error' ? 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700 text-white' : 
            'bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-700 text-white'
          }`}>
            <span className="material-symbols-outlined text-5xl font-bold">{t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}</span>
            <span className="text-sm font-black uppercase tracking-wider">{t.message}</span>
          </div>
        ))}
      </div>

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-orange-600 dark:text-white uppercase leading-none">Medicamentos</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Controle de estoque e inventário</p>
        </div>
      </header>

      {lowStockMeds.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-600">warning</span>
            <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest">Estoque Baixo</h3>
          </div>
          <div className="space-y-1">
            {lowStockMeds.map(m => (
              <p key={m.id} className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {m.nome}: {m.quantidade} {m.unidade} (limite: {m.limiteEstoque})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Banner de Avisos / Propaganda em Slide */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl h-48 md:h-40">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-500 ${
                index === currentBannerIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            >
              <div className={`bg-gradient-to-br ${banner.gradient} rounded-2xl p-6 text-white h-full`}>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-2xl">{banner.icon}</span>
                    {banner.badge && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">
                        {banner.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black uppercase mb-2">{banner.title}</h3>
                  <p className={`${banner.textColor} text-sm mb-4`}>{banner.description}</p>
                  <button
                    onClick={() => window.location.hash = banner.buttonLink}
                    className="px-4 py-2 bg-white text-slate-900 font-black text-xs uppercase rounded-lg hover:bg-slate-50 transition-all"
                  >
                    {banner.buttonText}
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Propaganda</p>
            <div className="w-full h-20 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-slate-400 text-xs">Anúncio 300x100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-24">
        {medications.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">medication</span>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Nenhum medicamento cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.map(med => (
              <div key={med.id} className="bg-white dark:bg-[#111121] rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">{med.nome}</h3>
                    <p className={`text-3xl font-black mt-2 ${med.quantidade <= med.limiteEstoque ? 'text-amber-600' : 'text-orange-600'}`}>
                      {med.quantidade} <span className="text-sm text-slate-400">{med.unidade}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Limite: {med.limiteEstoque} {med.unidade}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setFormData({
                          nome: med.nome,
                          quantidade: med.quantidade,
                          unidade: med.unidade,
                          limiteEstoque: med.limiteEstoque
                        });
                        setEditingId(med.id);
                        setIsModalOpen(true);
                      }}
                      className="w-9 h-9 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/30 text-slate-400 hover:text-orange-600 rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#111121] rounded-t-lg md:rounded-lg overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">{editingId ? 'Editar' : 'Novo'} Medicamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl hover:text-red-500">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Medicamento</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white"
                  placeholder="Ex: Insulina NPH"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantidade</label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={e => setFormData({...formData, quantidade: Number(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</label>
                  <select
                    value={formData.unidade}
                    onChange={e => setFormData({...formData, unidade: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white appearance-none"
                  >
                    <option value="UI">UI (Unidades)</option>
                    <option value="mg">mg (Miligramas)</option>
                    <option value="co">co (Comprimidos)</option>
                    <option value="ml">ml (Mililitros)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limite de Estoque</label>
                <input
                  type="number"
                  value={formData.limiteEstoque}
                  onChange={e => setFormData({...formData, limiteEstoque: Number(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white"
                  min="0"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Você será alertado quando o estoque atingir este valor</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[12px] uppercase rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-orange-600 text-white font-black text-[12px] uppercase rounded-xl hover:bg-orange-700 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in { 0% { opacity: 0; transform: scale(0.6) translateY(50px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-toast-in { animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1.3) forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MedicationsPage;
