import React from 'react';
import {
  CirclePlay,
  LayoutDashboard,
  MessageCircle,
  Package,
  Send,
  Settings,
  ShoppingCart,
  Users,
  WalletCards,
} from 'lucide-react';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://your-vercel-domain.vercel.app';

export const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'battle', label: 'باتل رويال' },
  { id: 'moba', label: 'موبا' },
  { id: 'fps', label: 'تصويب' },
  { id: 'cards', label: 'بطاقات رقمية' },
  { id: 'apps', label: 'تطبيقات' },
];

export const navLinks = [
  ['/', 'الرئيسية'],
  ['/products', 'الألعاب والتطبيقات'],
  ['/wallet', 'المحفظة'],
  ['/how', 'طريقة الشحن'],
  ['/admin', 'لوحة التحكم'],
];

export const adminTabs = [
  ['dashboard', 'الرئيسية', LayoutDashboard],
  ['products', 'المنتجات', Package],
  ['orders', 'الطلبات', ShoppingCart],
  ['users', 'المستخدمون', Users],
  ['wallet', 'طلبات المحفظة', WalletCards],
  ['settings', 'الإعدادات', Settings],
];

export const emptyProductForm = {
  title: '',
  game: '',
  category: 'battle',
  amount: '',
  price: '',
  image: '',
  status: 'active',
  featured: false,
};

export function InstagramIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="4.75" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.25" cy="6.75" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.64 21v-7.3h2.46l.37-2.84h-2.83V9.04c0-.82.23-1.38 1.4-1.38h1.49V5.12c-.72-.08-1.45-.12-2.17-.12-2.15 0-3.63 1.31-3.63 3.72v2.14H8.3v2.84h2.43V21h2.91Z" />
    </svg>
  );
}

export const socialPlatforms = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    className: 'is-whatsapp',
    buildHref: (value) => {
      const normalized = String(value || '').replace(/[^\d+]/g, '');
      if (!normalized) return '';
      const phone = normalized.startsWith('+') ? normalized.slice(1) : normalized;
      return `https://wa.me/${phone}`;
    },
  },
  {
    key: 'telegram',
    label: 'Telegram',
    icon: Send,
    className: 'is-telegram',
    buildHref: (value) => {
      const raw = String(value || '').trim();
      if (!raw) return '';
      if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
      return `https://t.me/${raw.replace(/^@/, '')}`;
    },
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    className: 'is-instagram',
    buildHref: (value) => String(value || '').trim(),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    className: 'is-facebook',
    buildHref: (value) => String(value || '').trim(),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: CirclePlay,
    className: 'is-youtube',
    buildHref: (value) => String(value || '').trim(),
  },
];

export const controllerButtons = [
  { label: 'A', className: 'is-green', style: { top: '18%', left: '10%' } },
  { label: 'B', className: 'is-red', style: { top: '68%', left: '16%' } },
  { label: 'X', className: 'is-blue', style: { top: '24%', right: '12%' } },
  { label: 'Y', className: 'is-gold', style: { top: '70%', right: '18%' } },
  { label: 'LB', className: 'is-ghost is-wide', style: { top: '12%', left: '34%' } },
  { label: 'RB', className: 'is-ghost is-wide', style: { top: '14%', right: '30%' } },
];

export const socialBackdropBadges = [
  { type: 'whatsapp', className: 'is-whatsapp', style: { top: '29%', left: '18%' } },
  { type: 'telegram', className: 'is-telegram', style: { top: '58%', left: '26%' } },
  { type: 'instagram', className: 'is-instagram', style: { top: '31%', right: '23%' } },
  { type: 'facebook', className: 'is-facebook', style: { top: '63%', right: '12%' } },
  { type: 'youtube', className: 'is-youtube', style: { top: '18%', right: '42%' } },
];
