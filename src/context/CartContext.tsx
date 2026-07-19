'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// تعريف شكل المنتج داخل السلة
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// تعريف البيانات والدوال التي ستوفرها السلة للموقع
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { id: string; name: string; price: number }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // تحميل السلة المحفوظة من الـ localStorage أول ما الموقع يفتح
  useEffect(() => {
    const savedCart = localStorage.getItem('anjaz_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart data", e);
      }
    }
  }, []);

  // حفظ السلة تلقائياً في الـ localStorage كل ما تتعدل
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('anjaz_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // إضافة منتج للسلة أو زيادة كميته لو موجود فعلاً
  const addToCart = (product: { id: string; name: string; price: number }) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        const updated = prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        localStorage.setItem('anjaz_cart', JSON.stringify(updated));
        return updated;
      }
      const updated = [...prevItems, { ...product, quantity: 1 }];
      localStorage.setItem('anjaz_cart', JSON.stringify(updated));
      return updated;
    });
  };

  // حذف منتج تماماً من السلة
  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => item.id !== id);
      localStorage.setItem('anjaz_cart', JSON.stringify(updated));
      return updated;
    });
  };

  // تفريغ السلة بالكامل بعد إتمام الطلب
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('anjaz_cart');
  };

  // حساب إجمالي عدد القطع في السلة
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // حساب إجمالي السعر المطلوب (ج.م)
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// كاستم هوك للاستخدام السريع في الصفحات
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}