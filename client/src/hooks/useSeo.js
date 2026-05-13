import { useEffect } from 'react';
import { SITE_URL } from '../data/ui';

export function useSeo(route, settings) {
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

    const activePage = route.startsWith('/admin')
      ? pages['/admin']
      : (pages[route] || pages['/']);

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

    ensureMeta('meta[name="description"]', 'name', 'description').setAttribute(
      'content',
      activePage.description
    );
    ensureMeta('meta[property="og:title"]', 'property', 'og:title').setAttribute(
      'content',
      activePage.title
    );
    ensureMeta(
      'meta[property="og:description"]',
      'property',
      'og:description'
    ).setAttribute('content', activePage.description);
    ensureMeta('meta[name="twitter:title"]', 'name', 'twitter:title').setAttribute(
      'content',
      activePage.title
    );
    ensureMeta(
      'meta[name="twitter:description"]',
      'name',
      'twitter:description'
    ).setAttribute('content', activePage.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', `${SITE_URL}/${route === '/' ? '' : `#${route}`}`);
  }, [route, settings]);
}
