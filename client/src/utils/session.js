export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function persistCustomerSession(data) {
  localStorage.setItem('sawad_customer_token', data.token);
  localStorage.setItem('sawad_customer', JSON.stringify(data.customer));
  window.dispatchEvent(new Event('sawad-auth'));
}

export function getStoredCustomer() {
  return JSON.parse(localStorage.getItem('sawad_customer') || 'null');
}
