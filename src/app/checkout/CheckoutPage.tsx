'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ShieldCheck, Truck, CreditCard, MapPin, AlertTriangle, Tag, X, ChevronDown, CheckCircle2, Plus } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+61', label: '🇦🇺 +61' },
];
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/formatCurrency';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface SavedAddress {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

export default function CheckoutPage() {
  const [step, setStep] = useState<'address' | 'payment'>('address');
  
  // Address Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  // New address mode toggle
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Payment State
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [codRequested, setCodRequested] = useState(false);
  const [isRequestingCod, setIsRequestingCod] = useState(false);

  // Global state
  const [mounted, setMounted] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: string; discountValue: number; discountAmount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Stock validation state
  const [outOfStockItems, setOutOfStockItems] = useState<string[]>([]);
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  // Address lookup state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);

  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuParams, setPayuParams] = useState<Record<string, string> | null>(null);

  const { items, removeItem, clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Validate stock once on mount only
  const validateStock = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) return;
    setIsValidatingStock(true);
    try {
      const productIds = [...new Set(currentItems.map(i => i.productId))];
      const res = await fetch(`/api/products?ids=${productIds.join(',')}`);
      if (!res.ok) return;
      const products = await res.json();

      const oosIds: string[] = [];
      for (const item of currentItems) {
        const product = products.find((p: any) => p.id === item.productId);
        if (!product) {
          oosIds.push(item.id);
          continue;
        }
        const sizes = product.sizes || {};
        const sizeVal = sizes[item.size];
        const stock = typeof sizeVal === 'object' ? sizeVal.stock : (sizeVal ?? 0);
        if (stock <= 0) {
          oosIds.push(item.id);
        }
      }

      if (oosIds.length > 0) {
        setOutOfStockItems(oosIds);
        toast.error(`${oosIds.length} item(s) in your bag are out of stock.`);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsValidatingStock(false);
    }
  }, []);

  const fetchUserAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data);
        if (data.length === 0) {
          setIsAddingNewAddress(true);
        } else {
          // Pre-select first address
          applySavedAddress(data[0]);
        }
      }
    } catch {
      setIsAddingNewAddress(true);
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('payment_failed') === 'true') {
      toast.error('Payment failed or was cancelled. Please try again.');
    }

    // Auth gate
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        toast.error('Please log in to continue checkout.');
        router.push('/login?redirect=/checkout');
        return;
      }
      setIsLoggedIn(true);
      setIsAuthChecking(false);

      const meta = session.user.user_metadata;
      if (meta?.full_name && !fullName) setFullName(meta.full_name);
      else if (meta?.name && !fullName) setFullName(meta.name);
      const sessionEmail = session.user.email || '';
      if (sessionEmail && !email) setEmail(sessionEmail);
      
      const rawPhone = session.user.phone || meta?.phone || meta?.phone_number || '';
      if (rawPhone) {
        const digits = rawPhone.replace(/\\D/g, '');
        const tenDigits = digits.length > 10 ? digits.slice(-10) : digits;
        if (tenDigits.length === 10) setPhone(tenDigits);
      }

      fetchUserAddresses();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (mounted) validateStock();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (payuParams && payuFormRef.current) payuFormRef.current.submit();
  }, [payuParams]);

  const validItems = items.filter(i => !outOfStockItems.includes(i.id));
  const subtotal = validItems.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const validatePhone = (val: string): string => {
    if (val.length === 0) return '';
    if (val.length !== 10) return 'Phone number must be 10 digits.';
    if (!/^[6-9]/.test(val)) return 'Invalid Indian mobile number (must start with 6-9).';
    return '';
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Please enter a coupon code.'); return; }
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), cartTotal: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.code, discountType: data.discountType, discountValue: data.discountValue, discountAmount: data.discountAmount });
        toast.success(`Coupon applied! You save ${formatCurrency(data.discountAmount)}.`);
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon.');
        setAppliedCoupon(null);
      }
    } catch { setCouponError('Failed to validate coupon.'); }
    finally { setIsApplyingCoupon(false); }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    toast('Coupon removed.', { icon: '🗑️' });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\\D/g, '').slice(0, 10);
    setPhone(val);
    setPhoneError(validatePhone(val));
  };

  const applySavedAddress = (addr: SavedAddress) => {
    if (addr.name) setFullName(addr.name);
    if (addr.address1) setAddress1(addr.address1);
    if (addr.address2) setAddress2(addr.address2);
    if (addr.pincode) {
      setPincode(addr.pincode);
      fetchPincodeData(addr.pincode);
    }
    if (addr.city) setCity(addr.city);
    if (addr.state) setStateName(addr.state);
    if (addr.phone) setPhone(addr.phone);
    if (addr.email) setEmail(addr.email);
    setIsAddingNewAddress(false);
  };

  const fetchPincodeData = async (pin: string) => {
    setIsFetchingPin(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        setCity(data[0].PostOffice[0].District);
        setStateName(data[0].PostOffice[0].State);
      }
    } catch (err) { console.error(err); } finally { setIsFetchingPin(false); }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\\D/g, '');
    setPincode(val);
    if (val.length === 6) fetchPincodeData(val);
    else { setCity(''); setStateName(''); }
  };

  const handleContinueToPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName || !phone || !email || !address1 || !pincode || !city || !stateName) {
      toast.error('Please fill in all required fields.'); return;
    }
    const pErr = validatePhone(phone);
    if (pErr) { setPhoneError(pErr); toast.error(pErr); return; }

    // If adding a new address, save it to the DB profile
    if (isAddingNewAddress) {
      const newAddr: SavedAddress = { name: fullName, phone, email, address1, address2, city, state: stateName, pincode };
      const updatedAddresses = [newAddr, ...savedAddresses];
      try {
        await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: updatedAddresses }),
        });
        setSavedAddresses(updatedAddresses);
        setIsAddingNewAddress(false);
      } catch (err) {
        console.error('Failed to save address to profile', err);
      }
    }

    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayNow = async () => {
    if (validItems.length === 0) { toast.error('Your bag is empty or items are out of stock.'); return; }
    if (outOfStockItems.length > 0) { toast.error('Please remove out-of-stock items.'); return; }

    const fullPhone = `${countryCode}${phone.replace(/\\D/g, '')}`;
    const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${stateName} - ${pincode}`;

    setIsInitiatingPayment(true);
    try {
      const productinfo = validItems.map(i => `${i.name} (${i.size})`).join(', ').substring(0, 100);
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total.toFixed(2),
          productinfo,
          firstname: fullName.split(' ')[0],
          email,
          phone: fullPhone,
          address: fullAddress,
          items: validItems.map(i => ({ productId: i.productId, name: i.name, size: i.size, price: i.price, qty: 1 })),
          couponCode: appliedCoupon?.code || null,
          discount: discountAmount.toString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');
      setPayuParams(data);
    } catch (err: any) {
      toast.error(err.message || 'Payment initiation failed.');
      setIsInitiatingPayment(false);
    }
  };

  const handleRequestCod = async () => {
    if (validItems.length === 0) return;
    setIsRequestingCod(true);
    try {
      const fullPhone = `${countryCode}${phone.replace(/\\D/g, '')}`;
      const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${stateName} - ${pincode}`;
      await fetch('/api/orders/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, email, phone: fullPhone, address: fullAddress, amount: total,
          items: validItems.map(i => ({ productId: i.productId, name: i.name, size: i.size, price: i.price, qty: 1 })),
          couponCode: appliedCoupon?.code || null,
          discount: discountAmount.toString(),
          codRequest: true,
        }),
      });
      setCodRequested(true);
      toast.success('COD request submitted! We will contact you to confirm.');
      clearCart();
      router.push('/orders/confirmation?cod=true'); // redirect to confirmation page immediately
    } catch { toast.error('Failed to submit request.'); }
    finally { setIsRequestingCod(false); }
  };

  if (!mounted || isAuthChecking) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-neutral-400" />
    </div>
  );
  if (!isLoggedIn) return null;

  const isActiveAddress = (addr: SavedAddress) => {
    return address1 === addr.address1 && pincode === addr.pincode && fullName === addr.name;
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">Checkout</h1>
          <p className="text-sm text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-green-500" /> Secured by PayU
          </p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
          <button 
            onClick={() => setStep('address')}
            className={`flex items-center gap-2 pb-1 border-b-2 ${step === 'address' ? 'border-[#E63946] text-black dark:text-white' : 'border-transparent text-neutral-400 hover:text-black dark:hover:text-white transition-colors'}`}
          >
            <span className={`flex items-center justify-center w-5 h-5 rounded-full ${step === 'address' ? 'bg-[#E63946] text-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}>1</span>
            Address
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">—</span>
          <button 
            disabled={!fullName || !address1 || !pincode}
            onClick={() => handleContinueToPayment()}
            className={`flex items-center gap-2 pb-1 border-b-2 disabled:opacity-50 disabled:cursor-not-allowed ${step === 'payment' ? 'border-[#E63946] text-black dark:text-white' : 'border-transparent text-neutral-400 hover:text-black dark:hover:text-white transition-colors'}`}
          >
            <span className={`flex items-center justify-center w-5 h-5 rounded-full ${step === 'payment' ? 'bg-[#E63946] text-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}>2</span>
            Payment
          </button>
        </div>
      </div>

      {payuParams && (
        <form ref={payuFormRef} method="POST" action={payuParams.payuBase} className="hidden">
          {Object.entries(payuParams).map(([k, v]) => k !== 'payuBase' ? <input key={k} type="hidden" name={k} value={v} /> : null)}
          <input type="hidden" name="service_provider" value="payu_paisa" />
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 mb-6">Your bag is empty.</p>
          <Link href="/products" className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors">Shop Now</Link>
        </div>
      ) : (
        <div className="flex flex-col-reverse lg:flex-row gap-12">
          
          {/* Main Content Area */}
          <div className="lg:w-2/3 flex flex-col gap-8">
            
            {/* STEP 1: ADDRESS */}
            {step === 'address' && (
              <section className="animate-fade-in">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-2"><Truck size={18} /> Delivery Details</h2>

                {isFetchingAddresses ? (
                  <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 size={14} className="animate-spin" /> Loading saved addresses…
                  </div>
                ) : (
                  <>
                    {/* Saved Addresses List */}
                    {!isAddingNewAddress && savedAddresses.length > 0 && (
                      <div className="mb-8 grid gap-4">
                        {savedAddresses.map((addr, idx) => {
                          const active = isActiveAddress(addr);
                          return (
                            <div 
                              key={idx}
                              onClick={() => applySavedAddress(addr)}
                              className={`cursor-pointer p-4 border rounded-sm transition-all relative ${active ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 shadow-sm' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'}`}
                            >
                              {active && <CheckCircle2 size={18} className="absolute top-4 right-4 text-green-500" />}
                              <p className="font-bold text-sm mb-1">{addr.name}</p>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed max-w-[80%]">
                                {[addr.address1, addr.address2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}<br />
                                {addr.phone}
                              </p>
                            </div>
                          );
                        })}
                        
                        <button 
                          onClick={() => {
                            setIsAddingNewAddress(true);
                            setAddress1(''); setAddress2(''); setPincode(''); setCity(''); setStateName('');
                          }}
                          className="flex items-center justify-center gap-2 p-4 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white"
                        >
                          <Plus size={16} /> Add New Address
                        </button>
                      </div>
                    )}

                    {/* Add/Edit Address Form */}
                    {(isAddingNewAddress || savedAddresses.length === 0) && (
                      <form id="address-form" onSubmit={handleContinueToPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-900/30 p-6 border border-neutral-200 dark:border-neutral-800">
                        {savedAddresses.length > 0 && (
                          <div className="md:col-span-2 flex justify-between items-center mb-2">
                            <h3 className="font-bold uppercase tracking-wider text-sm">Add New Address</h3>
                            <button type="button" onClick={() => { setIsAddingNewAddress(false); applySavedAddress(savedAddresses[0]); }} className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline">Cancel</button>
                          </div>
                        )}
                        <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Full Name *</label><input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white p-3 focus:outline-none focus:border-black dark:focus:border-white" placeholder="Aadi Golecha" /></div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Phone *</label>
                          <div className="flex">
                            <div className="relative">
                              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="appearance-none h-full bg-neutral-100 dark:bg-neutral-800 border border-r-0 border-neutral-300 dark:border-neutral-700 pl-3 pr-7 text-sm font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-black dark:focus:border-white cursor-pointer">
                                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                              </select>
                              <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            </div>
                            <input required type="tel" maxLength={10} value={phone} onChange={handlePhoneChange} className={`w-full border p-3 focus:outline-none bg-white dark:bg-neutral-900 dark:text-white ${phoneError ? 'border-red-400 focus:border-red-500' : 'border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white'}`} placeholder="9876543210" />
                          </div>
                          {phoneError && <p className="text-xs text-[#E63946] mt-1 font-medium">{phoneError}</p>}
                        </div>
                        <div><label className="block text-sm font-semibold mb-2">Email *</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white p-3 focus:outline-none focus:border-black dark:focus:border-white" placeholder="you@email.com" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Address Line 1 *</label><input required type="text" value={address1} onChange={e => setAddress1(e.target.value)} className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white p-3 focus:outline-none focus:border-black dark:focus:border-white" placeholder="Flat / House No. / Building" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Address Line 2</label><input type="text" value={address2} onChange={e => setAddress2(e.target.value)} className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white p-3 focus:outline-none focus:border-black dark:focus:border-white" placeholder="Street, Sector, Area" /></div>
                        <div className="relative">
                          <label className="block text-sm font-semibold mb-2">Pincode *</label>
                          <input required type="text" maxLength={6} value={pincode} onChange={handlePincodeChange} className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white p-3 focus:outline-none focus:border-black dark:focus:border-white" placeholder="400001" />
                          {isFetchingPin && <div className="absolute right-3 top-10 text-neutral-400"><Loader2 size={18} className="animate-spin" /></div>}
                        </div>
                        <div><label className="block text-sm font-semibold mb-2">City / Town *</label><input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white p-3 focus:outline-none focus:border-black dark:focus:border-white" placeholder="Auto-filled, edit if needed" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">State *</label><input required type="text" value={stateName} onChange={e => setStateName(e.target.value)} className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white p-3 focus:outline-none focus:border-black dark:focus:border-white" placeholder="Auto-filled, edit if needed" /></div>
                      </form>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button 
                        form={isAddingNewAddress || savedAddresses.length === 0 ? "address-form" : undefined}
                        onClick={!isAddingNewAddress && savedAddresses.length > 0 ? handleContinueToPayment : undefined}
                        className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-[#E63946] dark:hover:bg-[#E63946] dark:hover:text-white transition-colors flex items-center gap-2"
                      >
                        Continue to Payment →
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* STEP 2: PAYMENT */}
            {step === 'payment' && (
              <section className="animate-fade-in">
                {/* Selected Address Summary */}
                <div className="mb-8 p-4 border border-neutral-200 dark:border-neutral-800 flex justify-between items-start bg-neutral-50 dark:bg-neutral-900/30">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Delivering To:</h3>
                    <p className="font-bold text-sm mb-0.5">{fullName}</p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs">
                      {[address1, address2, city, stateName, pincode].filter(Boolean).join(', ')}<br />
                      {countryCode} {phone}
                    </p>
                  </div>
                  <button onClick={() => setStep('address')} className="text-xs font-bold uppercase underline text-neutral-500 hover:text-black dark:hover:text-white">Change</button>
                </div>

                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-2"><CreditCard size={18} /> Payment Options</h2>
                
                <div className="flex flex-col gap-4">
                  {/* Option 1: Prepaid */}
                  <label className="cursor-pointer border border-black dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 p-5 rounded-sm relative block">
                    <input type="radio" name="payment_method" value="prepaid" defaultChecked className="absolute top-5 right-5 accent-[#E63946] w-4 h-4" />
                    <p className="font-bold mb-1">Online Payment (Prepaid)</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Pay securely via UPI, Credit/Debit Cards, Netbanking, or Wallets.</p>
                    <div className="flex gap-2 flex-wrap">{['UPI', 'Visa', 'Mastercard', 'RuPay', 'Netbanking'].map(m => <span key={m} className="text-[10px] font-bold uppercase tracking-wide bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-sm">{m}</span>)}</div>
                  </label>

                  {/* Option 2: COD Request */}
                  {!codRequested ? (
                    <div className="border border-neutral-300 dark:border-neutral-700 p-5 text-left rounded-sm">
                      <p className="font-bold text-sm">Request Cash on Delivery</p>
                      <p className="text-xs text-neutral-500 mt-1">Subject to approval · We'll confirm via SMS/WhatsApp</p>
                      <p className="text-[11px] text-amber-600 mt-2 font-medium">⚠ Stock is not reserved for COD requests. Items may go out of stock before approval.</p>
                      <button 
                        disabled={isRequestingCod}
                        onClick={handleRequestCod}
                        className="mt-4 border border-black dark:border-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isRequestingCod ? <Loader2 size={14} className="animate-spin" /> : null} Submit COD Request
                      </button>
                    </div>
                  ) : (
                    <div className="border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 text-sm text-green-800 dark:text-green-400 font-semibold rounded-sm">
                      ✓ COD request submitted — you'll receive a confirmation shortly. Or pay now to confirm instantly.
                    </div>
                  )}

                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-2">
                    <ShieldCheck size={12} className="text-green-500" /> Powered by <strong>PayU</strong> · 256-bit SSL Secured
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Right Rail: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-neutral-50 dark:bg-neutral-900 p-6 sticky top-8 border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h2>
              {isValidatingStock && (
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                  <Loader2 size={14} className="animate-spin" /> Checking stock availability…
                </div>
              )}
              <div className="flex flex-col gap-4 mb-6 border-b border-neutral-200 dark:border-neutral-700 pb-6 max-h-[40vh] overflow-y-auto pr-1">
                {items.map(item => {
                  const isOOS = outOfStockItems.includes(item.id);
                  const rawImg = item.imageUrl || '';
                  const imgSrc = rawImg.includes(',') ? rawImg.split(',')[0].trim() : rawImg.trim();
                  return (
                    <div key={item.id} className={`flex gap-4 ${isOOS ? 'opacity-50' : ''}`}>
                      <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 relative overflow-hidden">
                        {imgSrc ? (
                          <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" crossOrigin="anonymous" onError={(e) => { const el = e.target as HTMLImageElement; el.style.display = 'none'; el.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] font-bold">IMG</div>'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] font-bold">IMG</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                        <p className="text-xs text-neutral-500 my-1">Size: {item.size}</p>
                        {isOOS ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#E63946] flex items-center gap-1"><AlertTriangle size={12} /> Out of Stock</span>
                            <button type="button" onClick={() => removeItem(item.id)} className="text-xs underline text-neutral-500 hover:text-black dark:hover:text-white ml-2">Remove</button>
                          </div>
                        ) : (
                          <span className="font-bold text-sm">{formatCurrency(item.price)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Coupon Code Input */}
              <div className="mb-6 border-b border-neutral-200 dark:border-neutral-700 pb-6">
                <p className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5"><Tag size={14} /> Coupon Code</p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
                    <div>
                      <span className="font-bold text-green-800 dark:text-green-400 text-sm">{appliedCoupon.code}</span>
                      <span className="text-xs text-green-600 dark:text-green-500 ml-2">−{formatCurrency(appliedCoupon.discountAmount)} off</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-neutral-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }} placeholder="Enter code" className="flex-1 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white p-2.5 text-sm uppercase tracking-wider focus:outline-none focus:border-black dark:focus:border-white" />
                      <button type="button" onClick={handleApplyCoupon} disabled={isApplyingCoupon} className="bg-black dark:bg-white text-white dark:text-black px-4 text-xs font-bold uppercase tracking-wider hover:bg-[#E63946] dark:hover:bg-[#E63946] dark:hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1">
                        {isApplyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-[#E63946] mt-1.5 font-medium">{couponError}</p>}
                  </>
                )}
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between"><span className="text-neutral-600 dark:text-neutral-400">Subtotal</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600"><span>Discount ({appliedCoupon.code})</span><span className="font-semibold">−{formatCurrency(discountAmount)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-neutral-600 dark:text-neutral-400">Shipping</span><span className="font-semibold text-green-600">Free</span></div>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 flex justify-between items-center mb-6">
                <span className="font-bold uppercase tracking-wide">Total</span>
                <span className="text-xl font-bold">{formatCurrency(total)}</span>
              </div>
              
              {/* THE SINGLE CHECKOUT BUTTON */}
              {step === 'payment' ? (
                <button 
                  onClick={handlePayNow}
                  disabled={isInitiatingPayment} 
                  className="w-full bg-[#E63946] text-white py-4 font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#E63946]/30"
                >
                  {isInitiatingPayment ? <><Loader2 size={18} className="animate-spin" /> Redirecting…</> : `Pay ${formatCurrency(total)} →`}
                </button>
              ) : (
                <p className="text-xs text-neutral-400 text-center italic">Complete the address step to proceed to payment.</p>
              )}
              
              <p className="text-[10px] text-neutral-400 text-center mt-3">
                By placing your order you agree to our <Link href="/terms" className="underline hover:text-black dark:hover:text-white transition-colors">Terms</Link> &amp; <Link href="/privacy" className="underline hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
