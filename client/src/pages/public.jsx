import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Gamepad2,
  Lock,
  Search,
  ShieldCheck,
  Star,
  UploadCloud,
  WalletCards,
  Zap,
} from 'lucide-react';
import { api } from '../utils/api';
import { categories, GOOGLE_CLIENT_ID } from '../data/ui';
import { fileToDataUrl, getStoredCustomer, persistCustomerSession } from '../utils/session';
import { Hero } from '../components/layout';
import { OrderModal, ProductCard } from '../components/shop';

export function ProductsPage({ go }) {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api
      .get('/products', { params: { q, category: cat } })
      .then((response) => setProducts(response.data))
      .catch(() => setProducts([]));
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
            <button key={category.id} className={cat === category.id ? 'selected' : ''} onClick={() => setCat(category.id)}>
              {category.label}
            </button>
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

export function Home({ settings, go }) {
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

export function HowPage() {
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

export function WalletPage({ go }) {
  const [settings, setSettings] = useState({});
  const [wallet, setWallet] = useState(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ amount: '', method: 'Vodafone Cash', receipt: '' });
  const customer = getStoredCustomer();

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

  if (!GOOGLE_CLIENT_ID) {
    return <p className="muted small-note">تسجيل الدخول بجوجل متوقف حتى يتم ضبط معرف العميل الصحيح.</p>;
  }

  return (
    <div className="google-real">
      {ready ? null : <p className="muted small-note">جارٍ تحميل تسجيل الدخول بجوجل...</p>}
      <div id="google-login-button" />
    </div>
  );
}

export function AuthPage({ go }) {
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
      setErr(error.response?.data?.message || (mode === 'login'
        ? 'فشل تسجيل الدخول، يرجى مراجعة بياناتك.'
        : 'تعذر إنشاء الحساب.'));
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
