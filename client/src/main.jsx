import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  CirclePlay,
  Clock3,
  CreditCard,
  Eye,
  Gamepad2,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Trash2,
  UploadCloud,
  User,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import { api } from './utils/api';
import './styles.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'battle', label: 'باتل رويال' },
  { id: 'moba', label: 'موبا' },
  { id: 'fps', label: 'تصويب' },
  { id: 'cards', label: 'بطاقات رقمية' },
  { id: 'apps', label: 'تطبيقات' },
];

const navLinks = [
  ['/', 'الرئيسية'],
  ['/products', 'الألعاب والتطبيقات'],
  ['/wallet', 'المحفظة'],
  ['/how', 'طريقة الشحن'],
  ['/admin', 'لوحة التحكم'],
];

const adminTabs = [
  ['dashboard', 'الرئيسية', LayoutDashboard],
  ['products', 'المنتجات', Package],
  ['orders', 'الطلبات', ShoppingCart],
  ['users', 'المستخدمون', Users],
  ['wallet', 'طلبات المحفظة', WalletCards],
  ['settings', 'الإعدادات', Settings],
];
const emptyProductForm = {
  title: '',
  game: '',
  category: 'battle',
  amount: '',
  price: '',
  image: '',
  status: 'active',
  featured: false,
};

function InstagramIcon({ size = 18 }) {
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

function FacebookIcon({ size = 18 }) {
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

const socialPlatforms = [
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
const controllerButtons = [
  { label: 'A', className: 'is-green', style: { top: '18%', left: '10%' } },
  { label: 'B', className: 'is-red', style: { top: '68%', left: '16%' } },
  { label: 'X', className: 'is-blue', style: { top: '24%', right: '12%' } },
  { label: 'Y', className: 'is-gold', style: { top: '70%', right: '18%' } },
  { label: 'LB', className: 'is-ghost is-wide', style: { top: '12%', left: '34%' } },
  { label: 'RB', className: 'is-ghost is-wide', style: { top: '14%', right: '30%' } },
];

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

const socialBackdropBadges = [
  { type: 'whatsapp', className: 'is-whatsapp', style: { top: '29%', left: '18%' } },
  { type: 'telegram', className: 'is-telegram', style: { top: '58%', left: '26%' } },
  { type: 'instagram', className: 'is-instagram', style: { top: '31%', right: '23%' } },
  { type: 'facebook', className: 'is-facebook', style: { top: '63%', right: '12%' } },
  { type: 'youtube', className: 'is-youtube', style: { top: '18%', right: '42%' } },
];

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://your-vercel-domain.vercel.app';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function persistCustomerSession(data) {
  localStorage.setItem('sawad_customer_token', data.token);
  localStorage.setItem('sawad_customer', JSON.stringify(data.customer));
  window.dispatchEvent(new Event('sawad-auth'));
}

function useSeo(route, settings) {
  useEffect(() => {
    const storeName = settings?.storeName || 'سواد للشحن الرقمي';
    const pages = {
      '/': {
        title: `${storeName} | شحن ألعاب وبطاقات رقمية`,
        description:
          settings?.heroText ||
          'شحن سريع وآمن للألعاب والتطبيقات والبطاقات الرقمية مع محفظة داخلية ووسائل دفع مصرية.',
      },
      '/products': {
        title: `المنتجات | ${storeName}`,
        description:
          'تصفح منتجات شحن PUBG Mobile وFree Fire وMobile Legends وPlayStation وSteam والتطبيقات.',
      },
      '/wallet': {
        title: `المحفظة | ${storeName}`,
        description:
          'اشحن محفظتك وارفع إيصال التحويل وادفع قيمة الطلبات مباشرة من رصيدك.',
      },
      '/how': {
        title: `طريقة الشحن | ${storeName}`,
        description:
          'تعرّف على خطوات الطلب وشحن المحفظة وإتمام الشراء خطوة بخطوة.',
      },
      '/login': {
        title: `تسجيل الدخول | ${storeName}`,
        description:
          'سجّل الدخول أو أنشئ حسابًا جديدًا لإتمام الطلبات واستخدام المحفظة.',
      },
      '/admin': {
        title: `لوحة التحكم | ${storeName}`,
        description:
          'إدارة المنتجات والطلبات والمستخدمين وطلبات المحفظة وإعدادات المتجر.',
      },
    };

    const activePage = route.startsWith('/admin') ? pages['/admin'] : (pages[route] || pages['/']);
    document.title = activePage.title;

    const ensureMeta = (selector, attribute, value) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      return element;
    };

    ensureMeta('meta[name="description"]', 'name', 'description').setAttribute('content', activePage.description);
    ensureMeta('meta[property="og:title"]', 'property', 'og:title').setAttribute('content', activePage.title);
    ensureMeta('meta[property="og:description"]', 'property', 'og:description').setAttribute('content', activePage.description);
    ensureMeta('meta[name="twitter:title"]', 'name', 'twitter:title').setAttribute('content', activePage.title);
    ensureMeta('meta[name="twitter:description"]', 'name', 'twitter:description').setAttribute('content', activePage.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}/${route === '/' ? '' : `#${route}`}`);
  }, [route, settings]);
}
function useNavigateSplash() {
  const [route, setRoute] = useState(location.hash.replace('#', '') || '/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(location.hash.replace('#', '') || '/');
    };

    addEventListener('hashchange', handleHashChange);
    return () => removeEventListener('hashchange', handleHashChange);
  }, []);

  const go = (path) => {
    setLoading(true);
    setTimeout(() => {
      location.hash = path;
      setRoute(path);
      setTimeout(() => setLoading(false), 500);
    }, 250);
  };

  return { route, go, loading };
}

function Splash({ show, label = 'SAWAD' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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

function ControllerBackdrop() {
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

function SocialButtons({ settings, compact = false }) {
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

function Navbar({ go, route }) {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState(() => JSON.parse(localStorage.getItem('sawad_customer') || 'null'));

  useEffect(() => {
    const sync = () => setCustomer(JSON.parse(localStorage.getItem('sawad_customer') || 'null'));
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

      <button className="hamb" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>

      <div className={`navlinks ${open ? 'open' : ''}`}>
        {navLinks.map(([path, label]) => (
          <button key={path} className={route === path ? 'active' : ''} onClick={() => { go(path); setOpen(false); }}>
            {label}
          </button>
        ))}

        {customer ? (
          <button className="customer-pill" onClick={logout}><User size={16} /> {customer.name} / خروج</button>
        ) : (
          <button className={route === '/login' ? 'active' : ''} onClick={() => { go('/login'); setOpen(false); }}>
            <User size={16} /> تسجيل الدخول
          </button>
        )}
      </div>
    </nav>
  );
}

function Hero({ settings, go }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <motion.span className="badge" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Zap size={16} /> شحن فوري وآمن
        </motion.span>

        <motion.h1 initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}>
          {settings.heroTitle || 'اشحن ألعابك وبطاقاتك الرقمية في دقائق'}
        </motion.h1>

        <motion.p initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.16 }}>
          {settings.heroText || 'سواد للشحن الرقمي يوفر شحن PUBG Mobile وFree Fire وMobile Legends وبطاقات PlayStation وSteam والتطبيقات الرقمية مع وسائل دفع محلية سريعة.'}
        </motion.p>

        <div className="hero-actions">
          <button className="primary" onClick={() => go('/products')}><ShoppingCart /> ابدأ الشحن</button>
          <button className="ghost" onClick={() => go('/how')}>اعرف الطريقة</button>
        </div>

        <div className="trust">
          <span><ShieldCheck /> دفع آمن</span>
          <span><Clock3 /> تنفيذ سريع</span>
          <span><Star /> عروض مميزة</span>
        </div>
      </div>

      <motion.div className="hero-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <img src="/logo.png" />
        <div className="glowline" />
      </motion.div>
    </section>
  );
}

function ProductCard({ product, onOrder }) {
  return (
    <motion.div className="product-card" layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="product-img">
        <img src={product.image} />
        <span>{product.game}</span>
      </div>

      <div className="product-body">
        <h3>{product.title}</h3>
        <p>{product.amount}</p>
        <div className="price-row">
          <strong>{product.price} جنيه</strong>
          <button onClick={() => onOrder(product)}>اطلب الآن</button>
        </div>
      </div>
    </motion.div>
  );
}

function OrderModal({ product, onClose, go }) {
  const customer = JSON.parse(localStorage.getItem('sawad_customer') || 'null');
  const [form, setForm] = useState({ playerId: '', payment: 'Wallet' });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [needsWalletTopup, setNeedsWalletTopup] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setErr('');
    setNeedsWalletTopup(false);
    try {
      await api.post('/orders', { ...form, productId: product.id });
      setDone(true);
    } catch (error) {
      if (error.response?.data?.code === 'INSUFFICIENT_WALLET_BALANCE') {
        setNeedsWalletTopup(true);
      }
      setErr(error.response?.data?.message || 'يرجى تسجيل الدخول قبل تنفيذ الطلب');
    }
  };

  if (!customer) {
    return (
      <div className="modal-back">
        <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <button className="close" onClick={onClose}><X /></button>
          <div className="success">
            <Lock size={54} />
            <h2>سجّل الدخول أولًا</h2>
            <p>يجب تسجيل الدخول قبل تنفيذ الطلب أو استخدام المحفظة.</p>
            <button className="primary" onClick={() => { onClose(); go('/login'); }}>تسجيل الدخول</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="modal-back">
      <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <button className="close" onClick={onClose}><X /></button>
        {done ? (
          <div className="success">
            <CheckCircle2 size={60} />
            <h2>تم إرسال الطلب</h2>
            <p>تم استلام طلبك وسيتم تنفيذه في أسرع وقت ممكن.</p>
            <button className="primary" onClick={onClose}>تم</button>
          </div>
        ) : (
          <>
            <h2>طلب {product.title}</h2>
            <p className="muted">العميل: {customer.name} - القيمة: {product.amount} - السعر: {product.price} جنيه</p>
            {err && <p className="error">{err}</p>}
            {needsWalletTopup && (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  onClose();
                  go('/wallet');
                }}
              >
                الذهاب إلى المحفظة لإضافة رصيد
              </button>
            )}
            <form onSubmit={submit} className="form">
              <input placeholder="ID اللاعب أو اسم الحساب" required value={form.playerId} onChange={(event) => setForm({ ...form, playerId: event.target.value })} />
              <select value={form.payment} onChange={(event) => setForm({ ...form, payment: event.target.value })}>
                <option value="Wallet">الدفع من المحفظة</option>
                <option>Vodafone Cash</option>
                <option>InstaPay</option>
                <option>تحويل بنكي</option>
              </select>
              <button className="primary">تأكيد الطلب</button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

function ProductsPage({ go }) {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get('/products', { params: { q, category: cat } }).then((response) => setProducts(response.data)).catch(() => setProducts([]));
  }, [q, cat]);

  return (
    <main className="page">
      <div className="section-head">
        <span className="badge"><Gamepad2 size={16} /> قائمة الشحن</span>
        <h2>اختر اللعبة أو التطبيق أو البطاقة التي تريد شحنها</h2>
      </div>

      <div className="filters">
        <div className="search">
          <Search />
          <input placeholder="ابحث عن PUBG أو Free Fire أو TikTok أو Steam..." value={q} onChange={(event) => setQ(event.target.value)} />
        </div>

        <div className="chips">
          {categories.map((category) => (
            <button key={category.id} className={cat === category.id ? 'selected' : ''} onClick={() => setCat(category.id)}>{category.label}</button>
          ))}
        </div>
      </div>

      <div className="grid">
        {products.map((product) => <ProductCard key={product.id} product={product} onOrder={setOrder} />)}
      </div>

      {order && <OrderModal product={order} onClose={() => setOrder(null)} go={go} />}
    </main>
  );
}

function Home({ settings, go }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products').then((response) => setProducts(response.data.filter((product) => product.featured).slice(0, 3))).catch(() => {});
  }, []);

  return (
    <>
      <Hero settings={settings} go={go} />
      <section className="page">
        <div className="section-head">
          <span className="badge"><Star size={16} /> الأكثر طلبًا</span>
          <h2>عروض الشحن المميزة للألعاب والتطبيقات والبطاقات</h2>
        </div>
        <div className="grid">
          {products.map((product) => <ProductCard key={product.id} product={product} onOrder={() => go('/products')} />)}
        </div>
        <div className="features">
          <div><Zap /><h3>سرعة التنفيذ</h3><p>منصة جاهزة لاستقبال الطلبات وعرض المنتجات وتنفيذ الشحن بسرعة.</p></div>
          <div><ShieldCheck /><h3>ثقة وأمان</h3><p>إدارة الطلبات والمنتجات والعملاء من لوحة تحكم واضحة ومنظمة.</p></div>
          <div><WalletCards /><h3>محفظة داخلية</h3><p>يمكن للعميل شحن رصيد المحفظة أولًا ثم الدفع منه مباشرة في الطلبات التالية.</p></div>
        </div>
      </section>
    </>
  );
}

function HowPage() {
  return (
    <main className="page">
      <div className="section-head">
        <span className="badge"><ShieldCheck size={16} /> طريقة الشحن</span>
        <h2>4 خطوات بسيطة</h2>
      </div>

      <div className="steps">
        <div><b>01</b><h3>اختر المنتج</h3><p>حدد اللعبة أو التطبيق أو البطاقة ثم اختر قيمة الشحن المناسبة.</p></div>
        <div><b>02</b><h3>أدخل بياناتك</h3><p>أضف ID اللاعب أو بيانات الحساب بشكل صحيح قبل تأكيد الطلب.</p></div>
        <div><b>03</b><h3>اشحن المحفظة</h3><p>حوّل المبلغ عبر المحافظ المصرية ثم ارفع صورة الإيصال من جهازك.</p></div>
        <div><b>04</b><h3>انتظر الاعتماد</h3><p>تقوم الإدارة بمراجعة الإيصال ثم إضافة الرصيد إلى محفظتك.</p></div>
      </div>
    </main>
  );
}

function WalletPage({ go }) {
  const [settings, setSettings] = useState({});
  const [wallet, setWallet] = useState(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ amount: '', method: 'Vodafone Cash', receipt: '' });
  const customer = JSON.parse(localStorage.getItem('sawad_customer') || 'null');

  useEffect(() => {
    api.get('/settings').then((response) => setSettings(response.data)).catch(() => {});
    if (customer) api.get('/wallet/me').then((response) => setWallet(response.data)).catch(() => {});
  }, []);

  const refresh = () => api.get('/wallet/me').then((response) => setWallet(response.data));

  const submit = async (event) => {
    event.preventDefault();
    setErr('');
    try {
      await api.post('/wallet-topups', { ...form, amount: Number(form.amount) });
      setDone(true);
      setForm({ ...form, amount: '', receipt: '' });
      refresh();
    } catch (error) {
      setErr(error.response?.data?.message || 'يرجى تسجيل الدخول أولًا');
    }
  };

  if (!customer) {
    return (
      <main className="page">
        <section className="wallet-card login-required">
          <Lock size={58} />
          <h2>سجّل الدخول لاستخدام المحفظة</h2>
          <p className="muted">رصيد المحفظة مرتبط بحساب العميل، لذلك يجب تسجيل الدخول أولًا.</p>
          <button className="primary" onClick={() => go('/login')}>الذهاب لتسجيل الدخول</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="section-head">
        <span className="badge"><WalletCards size={16} /> محفظة العميل</span>
        <h2>اشحن محفظتك بوسائل الدفع المصرية المحلية</h2>
        <p className="muted">الحساب: <b>{customer.name}</b> - {customer.email}</p>
      </div>

      <div className="wallet-layout">
        <section className="wallet-card">
          <h3><CreditCard /> أرقام التحويل</h3>
          <div className="wallet-numbers">
            <p><b>Vodafone Cash:</b> {settings.vodafoneCash || '01000000000'}</p>
            <p><b>Etisalat Cash:</b> {settings.etisalatCash || '01111111111'}</p>
            <p><b>Orange Cash:</b> {settings.orangeCash || '01222222222'}</p>
            <p><b>WE Pay:</b> {settings.wePay || '01555555555'}</p>
            <p><b>InstaPay:</b> {settings.instapay || 'sawad@instapay'}</p>
          </div>
          <div className="balance-box">
            <strong>رصيد المحفظة الحالي: {wallet?.balance ?? 0} جنيه</strong>
            <button className="ghost" onClick={refresh} type="button">تحديث الرصيد</button>
          </div>
        </section>

        <section className="wallet-card">
          {done ? (
            <div className="success">
              <CheckCircle2 size={54} />
              <h2>تم إرسال طلب شحن المحفظة</h2>
              <p>تم رفع الإيصال بنجاح، وستقوم الإدارة بمراجعته ثم إضافة الرصيد إلى محفظتك.</p>
              <button className="primary" onClick={() => setDone(false)}>إرسال طلب آخر</button>
            </div>
          ) : (
            <form onSubmit={submit} className="form">
              <h3><UploadCloud /> إرسال طلب شحن للمحفظة</h3>
              {err && <p className="error">{err}</p>}
              <input type="number" min="1" placeholder="مبلغ التحويل" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
              <select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
                <option>Vodafone Cash</option><option>Etisalat Cash</option><option>Orange Cash</option><option>WE Pay</option><option>InstaPay</option><option>تحويل بنكي</option>
              </select>
              <label className="upload-box">
                <UploadCloud />
                <span>{form.receipt ? 'الإيصال جاهز للرفع' : 'ارفع إيصال التحويل من جهازك'}</span>
                <input type="file" accept="image/*" required onChange={async (event) => { const file = event.target.files?.[0]; if (file) setForm({ ...form, receipt: await fileToDataUrl(file) }); }} />
              </label>
              <button className="primary">إرسال طلب الشحن</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function GoogleLoginButton({ go, setErr }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initialize = () => {
      if (!window.google?.accounts?.id) return false;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setErr('');
          try {
            const response = await api.post('/customers/google', { credential });
            persistCustomerSession(response.data);
            go('/');
          } catch (error) {
            setErr(error.response?.data?.message || 'فشل تسجيل الدخول بجوجل');
          }
        },
      });

      const target = document.getElementById('google-login-button');
      if (target) {
        target.innerHTML = '';
        window.google.accounts.id.renderButton(target, { theme: 'outline', size: 'large', width: '320', text: 'continue_with' });
      }

      setReady(true);
      return true;
    };

    if (initialize()) return;

    const existingScript = document.querySelector('script[data-google-identity="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', initialize, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = initialize;
    script.onerror = () => setErr('تعذر تحميل تسجيل الدخول بجوجل');
    document.head.appendChild(script);
  }, [go, setErr]);

  if (!GOOGLE_CLIENT_ID) return <p className="muted small-note">تسجيل الدخول بجوجل متوقف حتى يتم ضبط معرف العميل الصحيح.</p>;

  return <div className="google-real">{ready ? null : <p className="muted small-note">جارٍ تحميل تسجيل الدخول بجوجل...</p>}<div id="google-login-button" /></div>;
}

function AuthPage({ go }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setErr('');
    try {
      if (mode === 'login') {
        const response = await api.post('/customers/login', loginForm);
        persistCustomerSession(response.data);
      } else {
        const response = await api.post('/customers/register', registerForm);
        persistCustomerSession(response.data);
      }
      go('/');
    } catch (error) {
      setErr(error.response?.data?.message || (mode === 'login' ? 'فشل تسجيل الدخول، يرجى مراجعة بياناتك.' : 'تعذر إنشاء الحساب.'));
    }
  };

  return (
    <main className="page auth-page">
      <form onSubmit={submit} className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" />
          <div>
            <span>سواد</span>
            <p>{mode === 'login' ? 'سجّل الدخول لإتمام الطلبات وشحن محفظتك' : 'أنشئ حساب عميل جديد خلال ثوانٍ'}</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setErr(''); }}>تسجيل الدخول</button>
          <button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setErr(''); }}>إنشاء حساب</button>
        </div>

        {err && <p className="error">{err}</p>}

        {mode === 'login' ? (
          <div className="form auth-form">
            <label><input type="email" placeholder="البريد الإلكتروني" required value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} /></label>
            <label><input type="password" placeholder="كلمة المرور" required value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} /></label>
            <button className="primary">تسجيل الدخول</button>
          </div>
        ) : (
          <div className="form auth-form">
            <label><input type="text" placeholder="الاسم الكامل" required value={registerForm.name} onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })} /></label>
            <label><input type="email" placeholder="البريد الإلكتروني" required value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} /></label>
            <label><input type="tel" placeholder="رقم الهاتف - اختياري" value={registerForm.phone} onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })} /></label>
            <label><input type="password" placeholder="كلمة المرور" required value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} /></label>
            <button className="primary">إنشاء حساب</button>
          </div>
        )}

        <div className="or"><span /><p>أو</p><span /></div>
        <GoogleLoginButton go={go} setErr={setErr} />
      </form>
    </main>
  );
}

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: 'admin@sawad.com', password: '123456' });
  const [err, setErr] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', form);
      localStorage.setItem('sawad_token', response.data.token);
      onLogin();
    } catch {
      setErr('فشل تسجيل دخول الإدارة، يرجى مراجعة البريد وكلمة المرور.');
    }
  };

  return (
    <main className="admin-login">
      <form onSubmit={submit} className="login-card">
        <img src="/logo.png" />
        <h2>تسجيل دخول لوحة التحكم</h2>
        {err && <p className="error">{err}</p>}
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="بريد الإدارة" />
        <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="كلمة المرور" />
        <button className="primary">تسجيل الدخول</button>
      </form>
    </main>
  );
}

function AdminSearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search admin-search">
      <Search size={18} />
      <input placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function AdminPage() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('sawad_token'));
  const [tab, setTab] = useState('dashboard');
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <main className="admin-shell">
      <aside>
        <div className="admin-brand"><img src="/logo.png" /><b>لوحة تحكم سواد</b></div>
        {adminTabs.map(([id, label, Icon]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={18} /> {label}</button>
        ))}
        <button onClick={() => { localStorage.removeItem('sawad_token'); setAuthed(false); }}><LogOut size={18} /> تسجيل الخروج</button>
      </aside>
      <section className="admin-content">
        {tab === 'dashboard' && <DashboardStats />}
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'users' && <UsersAdmin />}
        {tab === 'wallet' && <WalletAdmin />}
        {tab === 'settings' && <SettingsAdmin />}
      </section>
    </main>
  );
}

function DashboardStats() {
  const [stats, setStats] = useState({});
  useEffect(() => { api.get('/stats').then((response) => setStats(response.data)); }, []);
  return (
    <>
      <h1>الرئيسية</h1>
      <div className="stats">
        <div><Package /><span>المنتجات</span><b>{stats.products || 0}</b></div>
        <div><Users /><span>العملاء</span><b>{stats.customers || 0}</b></div>
        <div><ShoppingCart /><span>الطلبات</span><b>{stats.orders || 0}</b></div>
        <div><Clock3 /><span>المعلّقة</span><b>{stats.pending || 0}</b></div>
        <div><WalletCards /><span>الإيرادات</span><b>{stats.revenue || 0} جنيه</b></div>
        <div><UploadCloud /><span>طلبات المحفظة</span><b>{stats.walletPending || 0}</b></div>
      </div>
    </>
  );
}

function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyProductForm);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const load = () => api.get('/products?admin=true').then((response) => setItems(response.data));
  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    if (edit) await api.put(`/products/${edit}`, payload); else await api.post('/products', payload);
    setForm(emptyProductForm); setEdit(null); setUploadErr(''); load();
  };

  const del = async (id) => { await api.delete(`/products/${id}`); load(); };

  const pickImage = async (file) => {
    if (!file) return;
    setUploading(true); setUploadErr('');
    try {
      const image = await fileToDataUrl(file);
      const response = await api.post('/uploads/product-image', { image });
      setForm((current) => ({ ...current, image: response.data.url }));
    } catch (error) {
      setUploadErr(error.response?.data?.message || 'تعذر رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const filtered = items.filter((item) => `${item.title} ${item.game} ${item.amount} ${item.category} ${item.price}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <h1>المنتجات</h1>
      <div className="admin-toolbar">
        <AdminSearchBar value={search} onChange={setSearch} placeholder="ابحث باسم المنتج أو اللعبة أو الفئة أو السعر" />
        <span className="muted">النتائج: {filtered.length}</span>
      </div>

      <form className="admin-form" onSubmit={save}>
        <input placeholder="اسم المنتج" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input placeholder="اسم اللعبة أو التطبيق" value={form.game} onChange={(event) => setForm({ ...form, game: event.target.value })} required />
        <input placeholder="الكمية أو الباقة" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
        <input placeholder="السعر" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
        <input placeholder="رابط الصورة أو ارفعها بالأسفل" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
        <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {categories.filter((category) => category.id !== 'all').map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
        </select>
        <label className="upload-box admin-upload-box"><UploadCloud /><span>{uploading ? 'جارٍ رفع الصورة...' : form.image ? 'صورة المنتج جاهزة' : 'ارفع صورة المنتج إلى Cloudinary'}</span><input type="file" accept="image/*" onChange={async (event) => pickImage(event.target.files?.[0])} /></label>
        <label className="feature-toggle"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /><span>إظهار المنتج في الواجهة الرئيسية</span></label>
        <button className="primary" disabled={uploading}><Plus /> {edit ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
      </form>

      {uploadErr && <p className="error">{uploadErr}</p>}
      <div className="table">
        {filtered.map((product) => (
          <div className="row product-row" key={product.id}>
            <img src={product.image} />
            <b>{product.title}</b>
            <span>{product.amount}</span>
            <span>{product.price} جنيه</span>
            <span className={`product-visibility-badge ${product.featured ? 'is-featured' : 'is-hidden'}`}>{product.featured ? 'ظاهر في الواجهة' : 'مخفي من الواجهة'}</span>
            <button onClick={() => { setEdit(product.id); setForm(product); setUploadErr(''); }}><Pencil size={16} /></button>
            <button onClick={() => del(product.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const load = () => api.get('/orders').then((response) => setOrders(response.data));
  useEffect(() => { load(); }, []);
  const update = async (id, status) => { await api.put(`/orders/${id}`, { status }); load(); };
  const filtered = orders.filter((order) => `${order.customer} ${order.phone} ${order.email} ${order.product?.title || ''} ${order.productId} ${order.playerId} ${order.status}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <h1>الطلبات</h1>
      <div className="admin-toolbar">
        <AdminSearchBar value={search} onChange={setSearch} placeholder="ابحث باسم العميل أو الهاتف أو المنتج أو رقم اللاعب" />
        <span className="muted">النتائج: {filtered.length}</span>
      </div>
      <div className="table">
        {filtered.map((order) => (
          <div className="row order" key={order.id}>
            <b>{order.customer}</b><span>{order.phone}</span><span>{order.product?.title || order.productId}</span><span>المعرف: {order.playerId}</span>
            <select value={order.status} onChange={(event) => update(order.id, event.target.value)}>
              <option value="pending">قيد المراجعة</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option>
            </select>
          </div>
        ))}
      </div>
    </>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [amounts, setAmounts] = useState({});
  const load = () => api.get('/customers').then((response) => setUsers(response.data));
  useEffect(() => { load(); }, []);
  const setWallet = async (id, mode = 'set') => {
    const amount = Number(amounts[id] || 0);
    await api.put(`/customers/${id}/wallet`, { amount, mode });
    setAmounts({ ...amounts, [id]: '' });
    load();
  };
  return (
    <>
      <h1>العملاء</h1>
      <p className="muted">كل رصيد محفظة مرتبط بحساب العميل نفسه وليس برقم الهاتف فقط.</p>
      <div className="table users-table">
        {users.map((user) => (
          <div className="row user-row" key={user.id}>
            <div><b>{user.name}</b><small>{user.email}</small></div>
            <span>{user.phone || 'لا يوجد رقم هاتف'}</span>
            <span>{user.provider === 'google' ? 'جوجل' : 'بريد إلكتروني'}</span>
            <span>الرصيد: <b>{user.balance || 0} جنيه</b></span>
            <span>الطلبات: {user.ordersCount || 0}</span>
            <input type="number" placeholder="الرصيد" value={amounts[user.id] || ''} onChange={(event) => setAmounts({ ...amounts, [user.id]: event.target.value })} />
            <button onClick={() => setWallet(user.id, 'set')}>تعيين</button>
            <button onClick={() => setWallet(user.id, 'add')}>إضافة</button>
          </div>
        ))}
      </div>
    </>
  );
}

function WalletAdmin() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');
  const load = () => { api.get('/wallet-topups').then((response) => setItems(response.data)); api.get('/customers').then((response) => setUsers(response.data)); };
  useEffect(() => { load(); }, []);
  const update = async (id, status, creditAmount) => { await api.put(`/wallet-topups/${id}`, { status, creditAmount: Number(creditAmount || 0) }); load(); };
  const filtered = items.filter((item) => `${item.customer} ${item.email} ${item.phone} ${item.method} ${item.amount} ${item.status}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <h1>طلبات شحن المحفظة</h1>
      <div className="wallet-admin-summary">
        <h3>أرصدة العملاء</h3>
        <div>{users.length ? users.map((user) => <span key={user.id}>{user.name}: <b>{user.balance || 0} جنيه</b></span>) : <p className="muted">لا توجد أرصدة بعد</p>}</div>
      </div>
      <div className="admin-toolbar">
        <AdminSearchBar value={search} onChange={setSearch} placeholder="ابحث باسم العميل أو البريد أو وسيلة الدفع أو الحالة" />
        <span className="muted">النتائج: {filtered.length}</span>
      </div>
      <div className="table">
        {filtered.map((item) => (
          <div className="row wallet-row" key={item.id}>
            <b>{item.customer}</b><span>{item.email}</span><span>{item.method}</span><span>{item.amount} جنيه</span>
            <span className={`status ${item.status}`}>{item.status === 'approved' ? 'تمت الموافقة' : item.status === 'rejected' ? 'مرفوض' : 'معلّق'}</span>
            <button onClick={() => setPreview(item.receipt)}><Eye size={16} /> الإيصال</button>
            <button onClick={() => update(item.id, 'approved', item.amount)} disabled={item.status === 'approved'}>إضافة للمحفظة</button>
            <button onClick={() => update(item.id, 'rejected', 0)} disabled={item.status === 'approved'}>رفض</button>
          </div>
        ))}
      </div>
      {preview && <div className="modal-back"><div className="modal"><button className="close" onClick={() => setPreview(null)}><X /></button><h2>إيصال التحويل</h2><img className="receipt-preview" src={preview} /></div></div>}
    </>
  );
}

function SettingsAdmin() {
  const [settings, setSettings] = useState({});
  useEffect(() => { api.get('/settings').then((response) => setSettings(response.data)); }, []);
  const save = async (event) => {
    event.preventDefault();
    const response = await api.put('/settings', settings);
    setSettings(response.data);
    alert('تم حفظ الإعدادات');
  };

  return (
    <>
      <h1>إعدادات المتجر</h1>
      <form className="settings-form" onSubmit={save}>
        <input placeholder="اسم المتجر" value={settings.storeName || ''} onChange={(event) => setSettings({ ...settings, storeName: event.target.value })} />
        <input placeholder="WhatsApp" value={settings.whatsapp || ''} onChange={(event) => setSettings({ ...settings, whatsapp: event.target.value })} />
        <input placeholder="يوزر أو رابط تيليجرام" value={settings.telegram || ''} onChange={(event) => setSettings({ ...settings, telegram: event.target.value })} />
        <input placeholder="رابط إنستجرام" value={settings.instagram || ''} onChange={(event) => setSettings({ ...settings, instagram: event.target.value })} />
        <input placeholder="رابط فيسبوك" value={settings.facebook || ''} onChange={(event) => setSettings({ ...settings, facebook: event.target.value })} />
        <input placeholder="رابط يوتيوب" value={settings.youtube || ''} onChange={(event) => setSettings({ ...settings, youtube: event.target.value })} />
        <input placeholder="رقم فودافون كاش" value={settings.vodafoneCash || ''} onChange={(event) => setSettings({ ...settings, vodafoneCash: event.target.value })} />
        <input placeholder="رقم اتصالات كاش" value={settings.etisalatCash || ''} onChange={(event) => setSettings({ ...settings, etisalatCash: event.target.value })} />
        <input placeholder="رقم أورنج كاش" value={settings.orangeCash || ''} onChange={(event) => setSettings({ ...settings, orangeCash: event.target.value })} />
        <input placeholder="رقم WE Pay" value={settings.wePay || ''} onChange={(event) => setSettings({ ...settings, wePay: event.target.value })} />
        <input placeholder="معرّف InstaPay" value={settings.instapay || ''} onChange={(event) => setSettings({ ...settings, instapay: event.target.value })} />
        <input placeholder="عنوان الهيرو" value={settings.heroTitle || ''} onChange={(event) => setSettings({ ...settings, heroTitle: event.target.value })} />
        <textarea placeholder="وصف الهيرو" value={settings.heroText || ''} onChange={(event) => setSettings({ ...settings, heroText: event.target.value })} />
        <button className="primary"><Save /> حفظ</button>
      </form>
    </>
  );
}

function App() {
  const { route, go, loading } = useNavigateSplash();
  const [settings, setSettings] = useState({});

  useSeo(route, settings);

  useEffect(() => {
    api.get('/settings').then((response) => setSettings(response.data)).catch(() => {});
  }, []);

  const page = useMemo(() => {
    if (route.startsWith('/admin')) return <AdminPage />;
    if (route === '/login') return <AuthPage go={go} />;
    if (route === '/products') return <ProductsPage go={go} />;
    if (route === '/wallet') return <WalletPage go={go} />;
    if (route === '/how') return <HowPage />;
    return <Home settings={settings} go={go} />;
  }, [route, settings]);

  return (
    <>
      <ControllerBackdrop />
      <Splash show={loading} />
      <Navbar go={go} route={route} />
      {page}
      <footer>
        <img src="/logo.png" />
        <SocialButtons settings={settings} compact />
        <p>&#169; 2026 سواد للشحن الرقمي - شحن سريع وآمن للألعاب والبطاقات الرقمية</p>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
