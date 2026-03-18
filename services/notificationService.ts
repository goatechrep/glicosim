import { Alert } from '../types';
import { activityService } from './activityService';

const NOTIFICATIONS_KEY = 'glicosim_notifications';

const seedNotifications: Alert[] = [
  {
    id: 'n1',
    title: 'Vencimento de Receita',
    description: 'Sua receita ficticia de Humalog vence em 3 dias. Agende a renovacao com antecedencia.',
    date: '2026-03-18',
    severity: 'medium',
    channel: 'push',
    deliveryStatus: 'scheduled',
    source: 'automation',
    createdAt: '2026-03-14T09:00:00.000Z',
    scheduledFor: '2026-03-18T08:30:00.000Z',
    read: false,
    ctaLabel: 'Ver detalhes',
    ctaUrl: '#/medicamentos',
  },
  {
    id: 'n2',
    title: 'Check-up Trimestral',
    description: 'Notificacao mockada para lembrar o exame de hemoglobina glicada e revisao clinica.',
    date: '2026-03-20',
    severity: 'low',
    channel: 'email',
    deliveryStatus: 'draft',
    source: 'manual',
    createdAt: '2026-03-13T14:20:00.000Z',
    scheduledFor: '2026-03-20T10:00:00.000Z',
    read: false,
    ctaLabel: 'Abrir agenda',
    ctaUrl: '#/alertas',
  },
  {
    id: 'n3',
    title: 'Meta Fora da Faixa',
    description: 'Sua media semanal de glicemia subiu no ambiente de teste. Revise registros e rotina alimentar.',
    date: '2026-03-16',
    severity: 'high',
    channel: 'whatsapp',
    deliveryStatus: 'sent',
    source: 'system',
    createdAt: '2026-03-16T07:10:00.000Z',
    scheduledFor: '2026-03-16T07:30:00.000Z',
    sentAt: '2026-03-16T07:30:00.000Z',
    read: true,
    ctaLabel: 'Ver historico',
    ctaUrl: '#/registros',
  },
];

const templatePool: Array<Omit<Alert, 'id' | 'date' | 'createdAt' | 'scheduledFor' | 'sentAt'>> = [
  {
    title: 'Glicemia Alta Detectada',
    description: 'Notificacao de teste simulando envio imediato quando a medicao ultrapassa a faixa configurada.',
    severity: 'high',
    channel: 'push',
    deliveryStatus: 'sent',
    source: 'system',
    read: false,
    ctaLabel: 'Abrir registros',
    ctaUrl: '#/registros',
  },
  {
    title: 'Hora da Medicacao',
    description: 'Modelo mockado para lembrar a aplicacao da medicacao dentro do horario cadastrado.',
    severity: 'medium',
    channel: 'whatsapp',
    deliveryStatus: 'sent',
    source: 'automation',
    read: false,
    ctaLabel: 'Ver estoque',
    ctaUrl: '#/medicamentos',
  },
  {
    title: 'Estoque Abaixo do Limite',
    description: 'Mensagem ficticia de reposicao para quando o estoque entra na faixa critica configurada.',
    severity: 'low',
    channel: 'email',
    deliveryStatus: 'sent',
    source: 'automation',
    read: false,
    ctaLabel: 'Repor agora',
    ctaUrl: '#/medicamentos',
  },
];

const sortNotifications = (notifications: Alert[]) =>
  [...notifications].sort((a, b) => {
    const dateA = new Date(a.sentAt || a.scheduledFor || a.createdAt || a.date).getTime();
    const dateB = new Date(b.sentAt || b.scheduledFor || b.createdAt || b.date).getTime();
    return dateB - dateA;
  });

const getStorage = (): Alert[] => {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!stored) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(seedNotifications));
    return seedNotifications;
  }

  return sortNotifications(JSON.parse(stored) as Alert[]);
};

const setStorage = (notifications: Alert[]) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(sortNotifications(notifications)));
};

export const notificationService = {
  getNotifications(): Alert[] {
    return getStorage();
  },

  updateNotification(id: string, data: Partial<Alert>): Alert {
    const notifications = getStorage();
    const index = notifications.findIndex(notification => notification.id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }

    notifications[index] = { ...notifications[index], ...data };
    setStorage(notifications);
    activityService.logActivity({
      title: 'Notificação atualizada',
      description: `${notifications[index].title} teve o fluxo de entrega ajustado.`,
      icon: 'notifications',
      accent: 'orange',
      category: 'notification',
      metadata: { notificationId: id },
    });
    return notifications[index];
  },

  deleteNotification(id: string): void {
    const current = getStorage();
    const removed = current.find(notification => notification.id === id);
    const notifications = current.filter(notification => notification.id !== id);
    setStorage(notifications);
    if (removed) {
      activityService.logActivity({
        title: 'Notificação removida',
        description: `${removed.title} saiu do painel de notificações.`,
        icon: 'notifications_off',
        accent: 'red',
        category: 'notification',
        metadata: { notificationId: id },
      });
    }
  },

  clearNotifications(): void {
    setStorage([]);
  },

  dispatchMockNotification(): Alert {
    const template = templatePool[Math.floor(Math.random() * templatePool.length)];
    const now = new Date();
    const notification: Alert = {
      ...template,
      id: `notif-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      scheduledFor: now.toISOString(),
      sentAt: now.toISOString(),
    };

    const notifications = [notification, ...getStorage()];
    setStorage(notifications);
    activityService.logActivity({
      title: 'Notificação disparada',
      description: `${notification.title} foi enviada pelo canal ${notification.channel}.`,
      icon: 'campaign',
      accent: 'orange',
      category: 'notification',
      metadata: { notificationId: notification.id },
    });
    return notification;
  },
};
