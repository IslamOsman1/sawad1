import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock3,
  Menu,
  ShieldCheck,
  ShoppingCart,
  Star,
  User,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import {
  controllerButtons,
  navLinks,
  socialBackdropBadges,
  socialPlatforms,
} from '../data/ui';

export function Splash({ show, label = 'SAWAD' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="loader-ring" />
          <motion.h2 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            {label}
          </motion.h2>
          <p>جاري تجهيز تجربة الشحن...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SocialBackdropIcon({ type }) {
  if (type === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.05 4.94A9.9 9.9 0 0 0 12.03 2C6.53 2 2.05 6.47 2.05 11.98c0 1.76.46 3.48 1.34 5L2 22l5.16-1.35a9.94 9.94 0 0 0 4.86 1.24h.01c5.5 0 9.97-4.47 9.97-9.98 0-2.66-1.03-5.16-2.95-6.97Zm-7.02 15.27h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.06.8.82-2.98-.2-.31a8.27 8.27 0 0 1-1.27-4.41c0-4.57 3.71-8.29 8.28-8.29 2.21 0 4.29.86 5.85 2.43a8.2 8.2 0 0 1 2.42 5.85c0 4.57-3.72 8.28-8.3 8.28Zm4.54-6.2c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.96-.14.17-.29.19-.54.07-.25-.12-1.05-.38-2-1.22-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.47-.41-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05 0 1.21.89 2.39 1.01 2.55.12.17 1.75 2.68 4.24 3.76.59.26 1.06.42 1.42.54.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    );
  }

  if (type === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.94 4.66c.17-.78-.6-1.42-1.34-1.1L3.16 10.34c-.78.3-.74 1.42.06 1.67l4.43 1.39 1.72 5.37c.22.7 1.1.86 1.55.28l2.46-3.1 4.83 3.56c.59.43 1.42.1 1.58-.63l2.15-14.22Zm-12.7 8.32 8.99-6.18-6.94 7.43-.27 2.95-1.78-4.2Z" />
      </svg>
    );
  }

  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.6" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17.4" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.64 21v-7.3h2.46l.37-2.84h-2.83V9.04c0-.82.23-1.38 1.4-1.38h1.49V5.12c-.72-.08-1.45-.12-2.17-.12-2.15 0-3.63 1.31-3.63 3.72v2.14H8.3v2.84h2.43V21h2.91Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.58 7.19a2.98 2.98 0 0 0-2.1-2.11C17.61 4.5 12 4.5 12 4.5s-5.6 0-7.47.58a2.98 2.98 0 0 0-2.1 2.11 31.2 31.2 0 0 0 0 9.62 2.98 2.98 0 0 0 2.1 2.11c1.87.58 7.47.58 7.47.58s5.61 0 7.48-.58a2.98 2.98 0 0 0 2.1-2.11 31.2 31.2 0 0 0 0-9.62ZM10.2 15.2V8.8l5.49 3.2-5.49 3.2Z" />
    </svg>
  );
}

export function ControllerBackdrop() {
  return (
    <div className="controller-backdrop" aria-hidden="true">
      <div className="controller-mesh controller-mesh-a" />
      <div className="controller-mesh controller-mesh-b" />

      {controllerButtons.map((button) => (
        <div
          key={`${button.label}-${button.className}`}
          className={`controller-chip ${button.className}`}
          style={button.style}
        >
          <span>{button.label}</span>
        </div>
      ))}

      {socialBackdropBadges.map((badge) => (
        <div
          key={`${badge.type}-${badge.className}`}
          className={`controller-chip social-chip ${badge.className}`}
          style={badge.style}
        >
          <span>
            <SocialBackdropIcon type={badge.type} />
          </span>
        </div>
      ))}

      <div className="controller-dpad" style={{ top: '48%', left: '6%' }}>
        <span className="up" />
        <span className="right" />
        <span className="down" />
        <span className="left" />
        <i />
      </div>

      <div className="controller-dpad is-alt" style={{ top: '22%', right: '7%' }}>
        <span className="up" />
        <span className="right" />
        <span className="down" />
        <span className="left" />
        <i />
      </div>

      <div className="controller-ring" style={{ top: '34%', left: '28%' }} />
      <div className="controller-ring is-small" style={{ top: '62%', right: '26%' }} />
      <div className="controller-glow" style={{ top: '76%', left: '42%' }} />
      <div className="controller-glow is-cool" style={{ top: '16%', right: '38%' }} />
    </div>
  );
}

export function SocialButtons({ settings, compact = false }) {
  const links = socialPlatforms
    .map((platform) => {
      const href = platform.buildHref(settings?.[platform.key]);
      return href ? { ...platform, href } : null;
    })
    .filter(Boolean);

  if (!links.length) return null;

  return (
    <div className={`social-buttons ${compact ? 'is-compact' : ''}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.key}
            className={`social-button ${link.className}`}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            title={link.label}
          >
            <Icon size={18} />
            <span>{link.label}</span>
          </a>
        );
      })}
    </div>
  );
}

export function Navbar({ go, route }) {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState(() =>
    JSON.parse(localStorage.getItem('sawad_customer') || 'null')
  );

  useEffect(() => {
    const sync = () =>
      setCustomer(JSON.parse(localStorage.getItem('sawad_customer') || 'null'));

    addEventListener('sawad-auth', sync);
    addEventListener('storage', sync);
    return () => {
      removeEventListener('sawad-auth', sync);
      removeEventListener('storage', sync);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('sawad_customer');
    localStorage.removeItem('sawad_customer_token');
    window.dispatchEvent(new Event('sawad-auth'));
    setOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="brand" onClick={() => go('/')}>
        <img src="/logo.png" />
        <span>SAWAD</span>
      </div>

      <button className="hamb" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>

      <div className={`navlinks ${open ? 'open' : ''}`}>
        {navLinks.map(([path, label]) => (
          <button
            key={path}
            className={route === path ? 'active' : ''}
            onClick={() => {
              go(path);
              setOpen(false);
            }}
          >
            {label}
          </button>
        ))}

        {customer ? (
          <button className="customer-pill" onClick={logout}>
            <User size={16} /> {customer.name} / خروج
          </button>
        ) : (
          <button
            className={route === '/login' ? 'active' : ''}
            onClick={() => {
              go('/login');
              setOpen(false);
            }}
          >
            <User size={16} /> تسجيل الدخول
          </button>
        )}
      </div>
    </nav>
  );
}

export function Hero({ settings, go }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <motion.span
          className="badge"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Zap size={16} /> شحن فوري وآمن
        </motion.span>

        <motion.h1
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          {settings.heroTitle || 'اشحن ألعابك وبطاقاتك الرقمية في دقائق'}
        </motion.h1>

        <motion.p
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.16 }}
        >
          {settings.heroText ||
            'سواد للشحن الرقمي يوفر شحن PUBG Mobile وFree Fire وMobile Legends وبطاقات PlayStation وSteam والتطبيقات الرقمية مع وسائل دفع محلية سريعة.'}
        </motion.p>

        <div className="hero-actions">
          <button className="primary" onClick={() => go('/products')}>
            <ShoppingCart /> ابدأ الشحن
          </button>
          <button className="ghost" onClick={() => go('/how')}>
            اعرف الطريقة
          </button>
        </div>

        <div className="trust">
          <span>
            <ShieldCheck /> دفع آمن
          </span>
          <span>
            <Clock3 /> تنفيذ سريع
          </span>
          <span>
            <Star /> عروض مميزة
          </span>
        </div>
      </div>

      <motion.div
        className="hero-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <img src="/logo.png" />
        <div className="glowline" />
      </motion.div>
    </section>
  );
}
