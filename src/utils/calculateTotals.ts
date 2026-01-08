import { CartItem } from '../types';

export function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum: number, item: CartItem) => sum + item.item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  return { subtotal, tax, total };
}
