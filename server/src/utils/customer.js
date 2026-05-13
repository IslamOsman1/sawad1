export function safeCustomer(customer, balance = 0) {
  const { password, ...safe } = customer;
  return { ...safe, balance };
}
