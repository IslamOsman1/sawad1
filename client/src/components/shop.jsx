import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, X } from 'lucide-react';
import { api } from '../utils/api';
import { getStoredCustomer } from '../utils/session';

export function ProductCard({ product, onOrder }) {
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

export function OrderModal({ product, onClose, go }) {
  const customer = getStoredCustomer();
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
              <input
                placeholder="ID اللاعب أو اسم الحساب"
                required
                value={form.playerId}
                onChange={(event) => setForm({ ...form, playerId: event.target.value })}
              />
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
