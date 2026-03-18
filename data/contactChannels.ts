import { socialLinks } from './socialLinks';

export const contactChannels = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'photo_camera',
    href: socialLinks.instagram,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'chat',
    href: socialLinks.whatsapp,
  },
  {
    id: 'email',
    label: 'E-mail',
    icon: 'mail',
    href: socialLinks.email,
  },
  {
    id: 'website',
    label: 'Site',
    icon: 'language',
    href: socialLinks.website,
  },
] as const;

