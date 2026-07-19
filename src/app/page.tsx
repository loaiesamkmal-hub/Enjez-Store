'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from "../context/CartContext";
import { 
  ShoppingCart, Trash2, X, Star, Settings, Lock, 
  Percent, HelpCircle, Phone, Sun, Moon, Image as ImageIcon, Ticket
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  tag: string;
  description: string;
  image: string; // رابط صورة المنتج
}

interface Offer {
  id: string;
  title: string;
  code: string; // كود الخصم (مثال: ANJAZ10)
  discountPercent: number; // نسبة الخصم (مثال: 10)
  description: string;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: string;
  discountApplied: string;
  total: number;
  date: string;
}

const initialProducts: Product[] = [
  { id: 'p1', name: 'مادة حشو ضوئي نانو كومبوزيت', price: 1450, category: 'الحشوات والمواد', tag: 'الأكثر مبيعاً', description: 'تركيبة متطورة توفر صلابة ممتازة ومطابقة لونية دقيقة للأسنان الأمامية والخلفية.', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80' },
  { id: 'p2', name: 'جهاز ليد لايت كيور لاسلكي', price: 3800, category: 'أجهزة العيادات', tag: 'ضمان سنة', description: 'جهاز خفيف الوزن مع بطارية قوية تدوم طويلاً، وسرعة تصلب عالية في ثوانٍ.', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80' },
];

const initialOffers: Offer[] = [
  { id: 'o1', title: 'عرض الافتتاح الطبي', code: 'ANJAZ15', discountPercent: 15, description: 'خصم 15% على إجمالي السلة عند استخدام الكود المرفق.' }
];

export default function HomePage() {
  const { cartItems, addToCart, removeFromCart, cartCount, cartTotal, clearCart } = useCart();
  
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<{id: string, name: string, text: string}[]>([
    { id: 'r1', name: 'د. محمد خالد', text: 'أفضل تجربة شراء لمستلزمات الأسنان، سرعة، أمانة، ومنتجات أصلية.' }
  ]);

  // إدخال كود الخصم في السلة
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percent: number} | null>(null);

  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'products' | 'offers' | 'orders' | 'reviews'>('products');

  // فوروم الأدمن المحدثة بالكامل
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'الحشوات والمواد', tag: 'جديد', description: '', image: '' });
  const [newOffer, setNewOffer] = useState({ title: '', code: '', discountPercent: '', description: '' });
  const [newReview, setNewReview] = useState({ name: '', text: '' });

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem('anjaz_products') || JSON.stringify(initialProducts)));
    setOffers(JSON.parse(localStorage.getItem('anjaz_offers') || JSON.stringify(initialOffers)));
    setOrders(JSON.parse(localStorage.getItem('anjaz_orders') || '[]'));
    if (localStorage.getItem('anjaz_theme') === 'dark') setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('anjaz_theme', !darkMode ? 'dark' : 'light');
  };

  const applyPromoCode = () => {
    const found = offers.find(o => o.code.trim().toUpperCase() === promoCodeInput.trim().toUpperCase());
    if (found) {
      setAppliedDiscount({ code: found.code, percent: found.discountPercent });
      alert(`تم تطبيق الكود بنجاح! حصلت على خصم ${found.discountPercent}%`);
    } else {
      alert('كود الخصم غير صحيح أو منتهي الصلاحية!');
    }
  };

  const finalTotal = appliedDiscount 
    ? Math.round(cartTotal * (1 - appliedDiscount.percent / 100)) 
    : cartTotal;
    const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultImg = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80';
    const updated = [...products, { id: 'p_' + Date.now(), ...newProduct, price: Number(newProduct.price), image: newProduct.image.trim() || defaultImg }];
    setProducts(updated);
    localStorage.setItem('anjaz_products', JSON.stringify(updated));
    setNewProduct({ name: '', price: '', category: 'الحشوات والمواد', tag: 'جديد', description: '', image: '' });
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...offers, { id: 'o_' + Date.now(), ...newOffer, discountPercent: Number(newOffer.discountPercent) }];
    setOffers(updated);
    localStorage.setItem('anjaz_offers', JSON.stringify(updated));
    setNewOffer({ title: '', code: '', discountPercent: '', description: '' });
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsText = cartItems.map(item => `• ${item.name} (الكمية: ${item.quantity})`).join('\n');
    
    const newOrd: Order = {
      id: 'ORD_' + Date.now().toString().slice(-4),
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      items: itemsText,
      discountApplied: appliedDiscount ? `${appliedDiscount.code} (${appliedDiscount.percent}%)` : 'بدون خصم',
      total: finalTotal,
      date: new Date().toLocaleDateString('ar-EG')
    };

    const updatedOrders = [...orders, newOrd];
    setOrders(updatedOrders);
    localStorage.setItem('anjaz_orders', JSON.stringify(updatedOrders));

    alert('تم تسجيل طلبك بنجاح! سيتم تجهيز الشحنة فوراً لعيادتكم.');
    clearCart();
    setAppliedDiscount(null);
    setPromoCodeInput('');
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  return (
    <main className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
      
      {/* هيدر متجاوب ومثالي لشاشات الموبايل */}
      <header className={`sticky top-0 z-40 px-4 md:px-6 py-3 flex justify-between items-center shadow-xs border-b transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="أنجز للأسنان" width={95} height={40} priority className="object-contain" />
          <span className="hidden sm:inline text-[11px] font-bold text-slate-400">صفحة واحدة متكاملة ⚡</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`p-2 rounded-xl border transition active:scale-95 ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button onClick={() => setIsAdminOpen(true)} className="p-2 text-slate-400 hover:text-slate-600">
            <Settings className="w-4 h-4" />
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="bg-blue-950 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs flex gap-1.5 items-center active:scale-95 transition">
            <ShoppingCart className="w-3.5 h-3.5" /> <span>السلة ({cartCount})</span>
          </button>
        </div>
      </header>

      {/* الـ Hero متجاوب */}
      <section className="bg-gradient-to-br from-blue-950 to-slate-900 text-white py-12 px-4 text-center">
        <h2 className="text-2xl md:text-4xl font-black mb-2">مَـتْجَر أَنْجَـزْ الـطِّبِّي</h2>
        <p className="text-slate-300 max-w-xl mx-auto text-xs md:text-sm leading-relaxed">بوابتك الاحترافية المعتمدة لتجهيز عيادات ومستلزمات طب الأسنان بأعلى جودة وأفضل سعر في مصر.</p>
      </section>

      {/* محتوى الصفحة المتتالي الذكي */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-12">
        
        {/* 1. قسم المنتجات بالصور */}
        <div className="border-b pb-10">
          <h2 className="text-lg md:text-xl font-black text-blue-900 dark:text-teal-400 mb-6 border-r-4 border-teal-500 pr-2">معرض المواد والأجهزة المتاحة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((p) => (
              <div key={p.id} className={`rounded-2xl border shadow-xs flex flex-col overflow-hidden transition-all duration-200 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/70'}`}>
                {/* حاوية الصورة المتجاوبة */}
                <div className="relative w-full h-44 bg-slate-100">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${darkMode ? 'bg-slate-900/90 text-teal-400' : 'bg-white/90 text-teal-700'}`}>{p.tag}</span>
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-3 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>
                  <div className={`flex justify-between items-center border-t pt-3 mt-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span className={`font-black text-sm md:text-base ${darkMode ? 'text-white' : 'text-blue-950'}`}>{p.price} <span className="text-xs font-normal">ج.م</span></span>
                    <button onClick={() => { addToCart({id: p.id, name: p.name, price: p.price}); setIsCartOpen(true); }} className="bg-blue-950 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold hover:bg-teal-600 transition">طلب شراء</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 2. قسم أكواد الخصم المنشورة */}
        <div className="border-b pb-10">
          <h2 className="text-lg md:text-xl font-black text-blue-900 dark:text-teal-400 mb-6 border-r-4 border-teal-500 pr-2 flex items-center gap-2"><Ticket className="w-4 h-4 text-teal-500" /> أكواد الخصم الحالية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((o) => (
              <div key={o.id} className={`p-5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-emerald-50/40 border-emerald-100'}`}>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">{o.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{o.description}</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border px-3 py-1.5 rounded-lg select-all cursor-pointer shadow-2xs" title="انسخ الكود">
                  <span className="text-xs font-mono font-black text-teal-600">{o.code}</span>
                  <span className="text-[10px] bg-teal-500 text-white px-1.5 py-0.5 rounded font-bold">{o.discountPercent}% خصم</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. الأسئلة الشائعة */}
        <div className="border-b pb-10">
          <h2 className="text-lg md:text-xl font-black text-blue-900 dark:text-teal-400 mb-6 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-teal-500" /> الأسئلة الشائعة للأطباء والطلاب</h2>
          <div className="space-y-3 max-w-3xl">
            <div className={`p-4 rounded-xl border text-xs ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}><h4 className="font-bold text-blue-950 dark:text-teal-400 mb-1">هل المنتجات أصلية؟</h4><p className="text-slate-500">نعم، جميع موادنا وأجهزتنا تأتي مباشرة من الوكلاء المعتمدين في مصر مع شهادات الضمان.</p></div>
            <div className={`p-4 rounded-xl border text-xs ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}><h4 className="font-bold text-blue-950 dark:text-teal-400 mb-1">ما هي مدة التوصيل؟</h4><p className="text-slate-500">يتم شحن الطلب فوراً ويصل لباب العيادة خلال 24 إلى 48 ساعة كحد أقصى.</p></div>
          </div>
        </div>

        {/* 4. التواصل الفوري */}
        <div>
          <div className={`max-w-md mx-auto p-5 rounded-2xl border shadow-xs ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <h2 className="text-base font-black mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Phone className="w-4 h-4 text-teal-500" /> اتصل بنا / اترك رسالة</h2>
            <div className="space-y-3">
              <input type="text" className={`w-full border rounded-xl p-2.5 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}`} placeholder="الاسم الكريم" />
              <input type="tel" className={`w-full border rounded-xl p-2.5 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}`} placeholder="رقم التليفون" />
              <textarea className={`w-full border rounded-xl p-2.5 text-xs h-20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}`} placeholder="اكتب استفسارك هنا..."></textarea>
              <button onClick={() => alert('تم استلام رسالتك، وسيتواصل معك الدعم الفني فوراً!')} className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-bold text-xs">إرسال الرسالة</button>
            </div>
          </div>
        </div>
      </section>
{/* الفوتر المحدث */}
      <footer className={`text-white mt-12 border-t ${darkMode ? 'bg-slate-950 border-slate-900' : 'bg-blue-950 border-white/10'}`}>
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs text-center sm:text-right">
          <div>
            <h4 className="font-black mb-2">متجر أنجز الطبي</h4>
            <p className="text-slate-400">المورد الأول والشركة الأسرع لتوفير مستلزمات ومواد طب الأسنان في مصر.</p>
          </div>
          <div>
            <h4 className="font-black mb-2">مناطق التغطية</h4>
            <p className="text-slate-400">نحن متميزون في سرعة التوصيل لعياداتنا في: <br/> 
            <span className="text-teal-400 font-bold">أكتوبر، الشروق، وبدر.</span></p>
          </div>
          <div>
            <h4 className="font-black mb-2">التوثيق والأمان</h4>
            <p className="text-slate-400">الموقع مؤمن ومحمي بالكامل ومتوافق مع جميع الهواتف الذكية ©️ 2026</p>
          </div>
        </div>
      </footer>
      

      {/* نافذة السلة الجانبية للموبايل */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)}></div>
          <div className={`relative w-full max-w-xs h-full p-4 flex flex-col justify-between z-10 ${darkMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div>
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h2 className="text-xs font-black flex items-center gap-1.5"><ShoppingCart className="w-4 h-4 text-teal-600" /> سلة طلبات العيادة</h2>
                <button onClick={() => setIsCartOpen(false)} className={`p-1 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[55vh]">
                {cartItems.length === 0 ? <p className="text-center text-slate-400 text-xs py-8">السلة فارغة.</p> : cartItems.map((item) => (
                  <div key={item.id} className={`flex justify-between items-center p-2 rounded-lg border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50'}`}>
                    <div><h4 className="font-bold text-[11px]">{item.name}</h4><p className="text-teal-600 font-bold text-[10px]">{item.price} ج.م × {item.quantity}</p></div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
            {cartItems.length > 0 && (
              <div className="border-t pt-2 space-y-2">
                {/* حقل إدخال كود الخصم داخل السلة */}
                <div className="flex gap-1.5">
                  <input type="text" placeholder="كود الخصم" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} className={`border text-xs rounded-lg p-1.5 flex-1 text-center font-mono ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}`} />
                  <button onClick={applyPromoCode} className="bg-teal-600 text-white text-[11px] px-2.5 rounded-lg font-bold">تطبيق</button>
                </div>
                {appliedDiscount && <div className="text-[11px] text-emerald-500 font-bold text-center">تم تطبيق كود الخصم: {appliedDiscount.code} (-{appliedDiscount.percent}%)</div>}
                <div className="flex justify-between font-bold text-xs"><span>إجمالي الحساب:</span><span className="text-teal-600 font-black">{finalTotal} ج.م</span></div>
                <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-blue-950 text-white py-2.5 rounded-xl font-bold text-xs">تأكيد البيانات وإرسال الطلب</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* مودال استمارة الشحن */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCheckoutOpen(false)}></div>
          <form onSubmit={handleOrderSubmit} className={`relative w-full max-w-xs rounded-2xl p-4 space-y-3 z-10 shadow-xl ${darkMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <h3 className="font-black text-xs border-b pb-1.5">استمارة شحن الطلب</h3>
            <div><label className="text-[10px] text-slate-400 block mb-0.5">اسم الطبيب بالكامل</label>
            <input type="text" required className={`w-full border rounded-lg p-2 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}`} placeholder="د. الاسم الكريم" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="text-[10px] text-slate-400 block mb-0.5">رقم الهاتف / التليفون</label>
            <input type="tel" required className={`w-full border rounded-lg p-2 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}`} placeholder="01xxxxxxxxx" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            <div><label className="text-[10px] text-slate-400 block mb-0.5">عنوان العيادة بالتفصيل</label>
            <textarea required className={`w-full border rounded-lg p-2 text-xs h-12 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}`} placeholder="المحافظة، اسم الشارع" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /></div>
            <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-xl font-bold text-xs mt-1">تأكيد الحجز والشحن</button>
          </form>
        </div>
      )}

      {/* لوحة التحكم للأدمن */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className={`rounded-2xl w-full max-w-2xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto ${darkMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="font-black text-xs flex items-center gap-1"><Settings className="w-3.5 h-3.5 text-teal-600" /> لوحة إدارة متجر أنجز</h3>
              <button onClick={() => setIsAdminOpen(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            {!isAdminAuthenticated ? (
              <form onSubmit={(e) => { e.preventDefault(); setIsAdminAuthenticated(true); }} className="space-y-3 py-4 text-center max-w-xs mx-auto">
                <Lock className="w-6 h-6 mx-auto text-slate-300" />
                <input type="password" placeholder="اكتب كلمة مرور الأدمن" className={`w-full border p-2 rounded-xl text-center text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}`} required />
                <button type="submit" className="w-full bg-blue-950 text-white py-2 rounded-xl text-xs font-bold">دخول</button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex border-b text-[10px] font-bold gap-1 overflow-x-auto pb-1">
                  <button onClick={() => setAdminSubTab('products')} className={`px-2.5 py-1.5 rounded-lg ${adminSubTab === 'products' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>المنتجات بالصور</button>
                  <button onClick={() => setAdminSubTab('offers')} className={`px-2.5 py-1.5 rounded-lg ${adminSubTab === 'offers' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>إنشاء الأكواد</button>
                  <button onClick={() => setAdminSubTab('orders')} className={`px-2.5 py-1.5 rounded-lg ${adminSubTab === 'orders' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>الطلبات المستلمة ({orders.length})</button>
                </div>

                {/* أدمن المنتجات المحدث بطلب الصورة */}
                {adminSubTab === 'products' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <form onSubmit={handleAddProduct} className={`p-3 rounded-xl border space-y-1.5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50'}`}>
                      <input type="text" className={`w-full border p-2 text-xs rounded ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="اسم المادة أو الجهاز" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                      <input type="text" className={`w-full border p-2 text-xs rounded ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="الوصف التفصيلي" required value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                      <input type="url" className={`w-full border p-2 text-xs rounded ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="رابط صورة المنتج أونلاين (URL)" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input type="number" className={`w-full border p-2 text-xs rounded ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="السعر ج.م" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                        <input type="text" className={`w-full border p-2 text-xs rounded ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="شارة (مثال: الأكثر مبيعاً)" value={newProduct.tag} onChange={(e) => setNewProduct({...newProduct, tag: e.target.value})} />
                      </div>
                      <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded text-xs font-bold">حفظ ونشر فوراً</button>
                    </form>
                    <div className="border p-2 rounded-xl max-h-[25vh] overflow-y-auto space-y-1.5">
                      {products.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded border text-xs">
                          <span className="truncate max-w-[140px]">{p.name}</span>
                          <button onClick={() => { const u = products.filter(item => item.id !== p.id); setProducts(u); localStorage.setItem('anjaz_products', JSON.stringify(u)); }} className="text-red-500 font-bold">حذف</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* أدمن إنشاء الأكواد المحدث */}
                {adminSubTab === 'offers' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <form onSubmit={handleAddOffer} className={`p-3 rounded-xl border space-y-1.5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50'}`}>
                      <input type="text" className={`w-full border p-2 text-xs rounded ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="عنوان العرض الكبير" required value={newOffer.title} onChange={(e) => setNewOffer({...newOffer, title: e.target.value})} />
                      <input type="text" className={`w-full border p-2 text-xs rounded font-mono ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="كود الخصم (مثال: ANJAZ20)" required value={newOffer.code} onChange={(e) => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})} />
                      <input type="number" className={`w-full border p-2 text-xs rounded ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="نسبة الخصم % (رقم فقط)" required value={newOffer.discountPercent} onChange={(e) => setNewOffer({...newOffer, discountPercent: e.target.value})} />
                      <textarea className={`w-full border p-2 text-xs rounded h-12 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`} placeholder="وصف الكود" required value={newOffer.description} onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}></textarea>
                      <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded text-xs font-bold">تفعيل ونشر الكود</button>
                    </form>
                    <div className="border p-2 rounded-xl max-h-[25vh] overflow-y-auto space-y-1.5">
                      {offers.map(o => (
                        <div key={o.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded border text-xs">
                          <span className="font-bold">{o.code} ({o.discountPercent}%)</span>
                          <button onClick={() => { const u = offers.filter(item => item.id !== o.id); setOffers(u); localStorage.setItem('anjaz_offers', JSON.stringify(u)); }} className="text-red-500">حذف</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* أدمن الطلبات المستلمة مع كود الخصم المطبق */}
                {adminSubTab === 'orders' && (
                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {orders.length === 0 ? <p className="text-slate-400 text-center text-xs py-6">لا توجد طلبات بعد.</p> : orders.map(o => (
                      <div key={o.id} className={`p-3 rounded-xl border text-xs space-y-0.5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50'}`}>
                        <div className="flex justify-between font-bold text-teal-600"><span>كود: {o.id}</span><span>{o.date}</span></div>
                        <div><span className="font-bold">الطبيب:</span> د. {o.customerName} | {o.phone}</div>
                        <div><span className="font-bold">الكود المستخدم:</span> <span className="text-amber-500 font-bold">{o.discountApplied}</span></div>
                        <div className={`p-2 rounded border text-[11px] whitespace-pre-line ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white text-slate-600'}`}>{o.items}</div>
                        <div className="font-black text-right text-teal-500">الحساب بعد الخصم: {o.total} ج.م</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}