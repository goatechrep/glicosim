import { HEALTH_TIPS_DATA, HealthTipArticle } from '../data/healthTips';

// Camada de acesso para facilitar troca futura para API/Supabase sem alterar UI.
export const healthTipsService = {
  getAll: async (): Promise<HealthTipArticle[]> => {
    return [...HEALTH_TIPS_DATA].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  getFeatured: async (): Promise<HealthTipArticle | null> => {
    const featured = HEALTH_TIPS_DATA.find(item => item.featured);
    if (featured) return featured;
    return HEALTH_TIPS_DATA.length > 0 ? HEALTH_TIPS_DATA[0] : null;
  },

  getBySlug: async (slug: string): Promise<HealthTipArticle | null> => {
    return HEALTH_TIPS_DATA.find(item => item.slug === slug) || null;
  }
};
