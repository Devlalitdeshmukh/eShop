import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ShieldCheck, Smartphone, CreditCard, Truck, Download, FileText, Printer } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const { cartTotal, placeOrder, cart } = useStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    paymentMethod: 'UPI'
  });
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);

  const tax = Math.round(cartTotal * 0.05);
  const total = cartTotal + tax;

  if (cart.length === 0 && step === 1) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    setLoading(true);
    // Capture cart data before it's cleared
    setOrderItems([...cart]);
    setOrderTotal(cartTotal);

    // Simulate Payment Gateway delay
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulate Order Placement
    try {
      await placeOrder(formData);
      const newOrderId = `ORD-${Date.now()}`; // In real app, get from response
      setOrderId(newOrderId);
      addToast('Payment successful! Order placed.', 'success');
      setStep(4); // Success
    } catch (error) {
      addToast('Payment failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto px-4 print:max-w-full print:px-0">
        
        {/* Step Indicator (Hidden on Print) */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">1</div>
            <span className="hidden sm:inline">Address</span>
          </div>
          <div className="h-0.5 flex-1 bg-gray-300 mx-4"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">2</div>
            <span className="hidden sm:inline">Review</span>
          </div>
           <div className="h-0.5 flex-1 bg-gray-300 mx-4"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-brand-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">3</div>
            <span className="hidden sm:inline">Payment</span>
          </div>
          <div className="h-0.5 flex-1 bg-gray-300 mx-4"></div>
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">4</div>
            <span className="hidden sm:inline">Success</span>
          </div>
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Aditi Sharma" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Flat 101, Galaxy Apts" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input required name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="400001" />
                </div>
                <div className="col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                   <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+91 9876543210" />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 mt-6">Continue to Review</button>
            </form>
          </div>
        )}

        {/* Step 2: Review (Bill Preview) */}
        {step === 2 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold mb-6">Review Order (Bill Preview)</h2>
             
             {/* Product List */}
             <div className="mb-6 border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-gray-50 text-sm text-gray-500">
                      <tr>
                         <th className="p-3 font-medium">Product</th>
                         <th className="p-3 font-medium text-center">Qty</th>
                         <th className="p-3 font-medium text-right">Price</th>
                         <th className="p-3 font-medium text-right">Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 text-sm">
                      {cart.map((item) => (
                         <tr key={item.id}>
                            <td className="p-3 text-gray-900">{item.name}</td>
                            <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                            <td className="p-3 text-right text-gray-600">₹{item.discountPrice || item.price}</td>
                            <td className="p-3 text-right font-medium text-gray-900">₹{(item.discountPrice || item.price) * item.quantity}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Bill Breakdown */}
             <div className="bg-brand-50 p-4 rounded-lg space-y-2 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                   <span>Subtotal</span>
                   <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                   <span>Tax (5% GST)</span>
                   <span>₹{tax}</span>
                </div>
                <div className="border-t border-brand-200 pt-2 flex justify-between font-bold text-lg text-brand-900">
                   <span>Grand Total</span>
                   <span>₹{total}</span>
                </div>
             </div>

             {/* Shipping Info Preview */}
             <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Shipping To:</h3>
                <p className="text-gray-600 text-sm">
                   {formData.name}<br/>
                   {formData.address}, {formData.city} - {formData.pincode}<br/>
                   Phone: {formData.phone}
                </p>
             </div>

             <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50">Edit Address</button>
                <button type="button" onClick={() => setStep(3)} className="w-2/3 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700">Proceed to Payment</button>
             </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold mb-6">Select Payment Method</h2>
             <div className="mb-6 bg-brand-50 p-4 rounded-lg flex justify-between items-center text-brand-800">
               <span className="font-semibold">Total Payable</span>
               <span className="text-xl font-bold">₹{total}</span>
             </div>

             <div className="space-y-4 mb-8">
               <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'UPI' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                 <input type="radio" name="paymentMethod" value="UPI" checked={formData.paymentMethod === 'UPI'} onChange={handleInputChange} className="w-4 h-4 text-brand-600 focus:ring-brand-500" />
                 <div className="ml-4 flex items-center gap-3">
                   <Smartphone className="w-6 h-6 text-gray-600" />
                   <div className="flex flex-col">
                     <span className="font-semibold text-gray-900">UPI (GPay, PhonePe, Paytm)</span>
                     <span className="text-sm text-gray-500">Fast & Secure</span>
                   </div>
                 </div>
               </label>

               <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'Card' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                 <input type="radio" name="paymentMethod" value="Card" checked={formData.paymentMethod === 'Card'} onChange={handleInputChange} className="w-4 h-4 text-brand-600 focus:ring-brand-500" />
                 <div className="ml-4 flex items-center gap-3">
                   <CreditCard className="w-6 h-6 text-gray-600" />
                   <div className="flex flex-col">
                     <span className="font-semibold text-gray-900">Credit / Debit Card</span>
                     <span className="text-sm text-gray-500">Visa, Mastercard, RuPay</span>
                   </div>
                 </div>
               </label>
               
               <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                 <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} className="w-4 h-4 text-brand-600 focus:ring-brand-500" />
                 <div className="ml-4 flex items-center gap-3">
                   <Truck className="w-6 h-6 text-gray-600" />
                   <div className="flex flex-col">
                     <span className="font-semibold text-gray-900">Cash on Delivery</span>
                     <span className="text-sm text-gray-500">Pay at your doorstep</span>
                   </div>
                 </div>
               </label>
             </div>

             <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                Payments are 100% secure.
             </div>

             <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50">Back</button>
                <button 
                  onClick={handlePayment} 
                  disabled={loading}
                  className="w-2/3 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  {loading ? 'Processing...' : `Pay ₹${total}`}
                </button>
             </div>
          </div>
        )}

        {/* Step 4: Success & Invoice */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-0 print:shadow-none">
            {/* Screen View */}
            <div className="p-12 text-center print:hidden">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-500 mb-8">Thank you for ordering, {formData.name}.</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <button onClick={handlePrintInvoice} className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
                   <Download className="w-5 h-5" /> Download Invoice
                 </button>
                 <button onClick={() => navigate('/')} className="bg-brand-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-700">
                   Continue Shopping
                 </button>
              </div>
            </div>

            {/* Printable Invoice Section */}
            <div className="hidden print:block p-12 bg-white min-h-screen font-sans text-gray-900">
               {/* Invoice Header */}
               <div className="flex justify-between items-start mb-12 border-b-2 border-brand-600 pb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold font-serif text-xl">D</div>
                      <h1 className="text-4xl font-serif font-bold text-gray-900">Desi Delights</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Homemade Authenticity & Pure Flavors</p>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>123 Gourmet Lane, Foodie City</p>
                      <p>Maharashtra, India - 400001</p>
                      <p>GSTIN: 27AAACD1234A1Z5</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <h2 className="text-5xl font-black text-gray-100 uppercase tracking-tighter mb-2">Invoice</h2>
                     <div className="space-y-1 text-sm">
                       <p className="font-bold text-gray-900">Order ID: <span className="font-normal text-gray-600">{orderId || 'PENDING'}</span></p>
                       <p className="font-bold text-gray-900">Date: <span className="font-normal text-gray-600">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
                       <p className="font-bold text-gray-900">Status: <span className="font-normal text-green-600 uppercase">Paid</span></p>
                     </div>
                  </div>
               </div>

               {/* Billing & Shipping Info */}
               <div className="grid grid-cols-2 gap-12 mb-12">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                     <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Bill To</h3>
                     <p className="text-lg font-bold text-gray-900 mb-1">{formData.name}</p>
                     <div className="text-gray-600 space-y-1">
                        <p>{formData.address}</p>
                        <p>{formData.city} - {formData.pincode}</p>
                        <p className="pt-2 font-medium text-gray-900 flex items-center gap-2">
                          <span className="text-gray-400 text-xs uppercase">Phone:</span> {formData.phone}
                        </p>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                     <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Payment Details</h3>
                     <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold">Method</p>
                          <p className="font-bold text-gray-900">{formData.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold">Transaction ID</p>
                          <p className="font-mono text-sm text-gray-600">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Items Table */}
               <div className="mb-12">
                 <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b-2 border-gray-900">
                           <th className="py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                           <th className="py-4 px-2 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                           <th className="py-4 px-2 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Unit Price</th>
                           <th className="py-4 px-2 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {orderItems.map((item) => (
                           <tr key={item.id} className="group">
                              <td className="py-6 px-2">
                                <p className="font-bold text-gray-900">{item.name}</p>
                                {item.selectedVariantName && <p className="text-xs text-gray-500 mt-1">Variant: {item.selectedVariantName}</p>}
                              </td>
                              <td className="py-6 px-2 text-center text-gray-600 font-medium">{item.quantity}</td>
                              <td className="py-6 px-2 text-right text-gray-600 font-medium">₹{(item.discountPrice || item.price).toLocaleString('en-IN')}</td>
                              <td className="py-6 px-2 text-right font-bold text-gray-900">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString('en-IN')}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Totals Section */}
               <div className="flex justify-end mb-16">
                  <div className="w-80 space-y-3">
                     <div className="flex justify-between text-gray-600 py-1">
                        <span className="font-medium">Subtotal</span>
                                                 <span className="font-bold">₹{orderTotal.toLocaleString('en-IN')}</span>
                     </div>
                     <div className="flex justify-between text-gray-600 py-1">
                        <span className="font-medium">Tax (5% GST)</span>
                                                 <span className="font-bold">₹{Math.round(orderTotal * 0.05).toLocaleString('en-IN')}</span>
                     </div>
                     <div className="flex justify-between text-gray-600 py-1">
                        <span className="font-medium">Shipping</span>
                        <span className="font-bold text-green-600">FREE</span>
                     </div>
                     <div className="flex justify-between text-gray-900 border-t-2 border-gray-900 pt-4 mt-4">
                        <span className="text-xl font-black uppercase tracking-tighter">Total Amount</span>
                                                 <span className="text-3xl font-black text-brand-600">₹{(orderTotal + Math.round(orderTotal * 0.05)).toLocaleString('en-IN')}</span>
                     </div>
                  </div>
               </div>

               {/* Footer Note */}
               <div className="mt-auto border-t border-gray-100 pt-12">
                 <div className="grid grid-cols-2 gap-8 items-end">
                   <div>
                     <h4 className="text-sm font-bold text-gray-900 mb-2">Terms & Conditions</h4>
                     <ul className="text-[10px] text-gray-400 space-y-1 list-disc pl-4">
                       <li>This is a computer generated invoice and does not require a physical signature.</li>
                       <li>Goods once sold will not be taken back or exchanged.</li>
                       <li>All disputes are subject to Mumbai jurisdiction only.</li>
                     </ul>
                   </div>
                   <div className="text-right">
                     <p className="text-lg font-serif font-bold text-brand-600 mb-1">Desi Delights</p>
                     <p className="text-xs text-gray-400 italic">Thank you for choosing homemade authenticity!</p>
                     <div className="mt-4 flex justify-end gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                       <span>www.desidelights.com</span>
                       <span>|</span>
                       <span>support@desidelights.com</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;