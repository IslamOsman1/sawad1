import React, { useEffect, useState } from 'react';
import {
  Clock3,
  Eye,
  LogOut,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  UploadCloud,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { api } from '../utils/api';
import { adminTabs, categories, emptyProductForm } from '../data/ui';
import { fileToDataUrl } from '../utils/session';

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
    if (edit) await api.put(`/products/${edit}`, payload);
    else await api.post('/products', payload);
    setForm(emptyProductForm);
    setEdit(null);
    setUploadErr('');
    load();
  };

  const del = async (id) => {
    await api.delete(`/products/${id}`);
    load();
  };

  const pickImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadErr('');

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

  const filtered = items.filter((item) =>
    `${item.title} ${item.game} ${item.amount} ${item.category} ${item.price}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
  const load = () => {
    api.get('/wallet-topups').then((response) => setItems(response.data));
    api.get('/customers').then((response) => setUsers(response.data));
  };
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

export function AdminPage() {
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
