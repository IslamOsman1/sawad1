import React, { useEffect, useMemo, useState } from 'react';
import { api } from './utils/api';
import { useSeo } from './hooks/useSeo';
import { useNavigateSplash } from './hooks/useNavigateSplash';
import { ControllerBackdrop, Navbar, SocialButtons, Splash } from './components/layout';
import { AdminPage } from './pages/admin';
import { AuthPage, Home, HowPage, ProductsPage, WalletPage } from './pages/public';

export default function App() {
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
