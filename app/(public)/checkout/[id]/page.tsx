'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data for the course being purchased
  const orderSummary = {
    courseName: 'Mastering Next.js & NestJS: The Full-Stack Guide',
    instructor: 'Mahmoud Mansouri',
    price: 149.99,
    discount: 60.00,
    tax: 0.00,
  };

  const total = orderSummary.price - orderSummary.discount + orderSummary.tax;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call to Stripe/Payment Gateway
    setTimeout(() => {
      setIsProcessing(false);
      // Here you would redirect to a success page
      alert('Payment successful! Redirecting to dashboard...');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      
      {/* Minimal Header for Checkout (Removes distractions) */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/products/1" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Course
          </Link>
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Secure Checkout</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Complete your enrollment</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Payment Form */}
          <div className="flex-1 space-y-8">
            
            {/* Payment Method Selector */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Credit Card Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    paymentMethod === 'card' 
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'card' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${paymentMethod === 'card' ? 'text-white' : 'text-slate-300'}`}>Credit Card</p>
                    <p className="text-xs text-slate-500">Stripe securely processes your card</p>
                  </div>
                </button>

                {/* PayPal Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    paymentMethod === 'paypal' 
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'paypal' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${paymentMethod === 'paypal' ? 'text-white' : 'text-slate-300'}`}>PayPal</p>
                    <p className="text-xs text-slate-500">Fast and secure checkout</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Credit Card Details Form */}
            {paymentMethod === 'card' && (
              <form id="payment-form" onSubmit={handlePayment} className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Name on Card</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm"
                    placeholder="Mahmoud Mansouri"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Card Information</label>
                  <div className="relative group rounded-xl overflow-hidden border border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-200 bg-slate-800/50">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    {/* Simulated Stripe Element Container */}
                    <input
                      type="text"
                      required
                      maxLength={19}
                      className="block w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-slate-500 outline-none sm:text-sm border-b border-slate-700/50"
                      placeholder="0000 0000 0000 0000"
                    />
                    <div className="flex">
                      <input
                        type="text"
                        required
                        maxLength={5}
                        className="block w-1/2 px-4 py-3 bg-transparent text-white placeholder-slate-500 outline-none sm:text-sm border-r border-slate-700/50"
                        placeholder="MM / YY"
                      />
                      <input
                        type="text"
                        required
                        maxLength={4}
                        className="block w-1/2 px-4 py-3 bg-transparent text-white placeholder-slate-500 outline-none sm:text-sm"
                        placeholder="CVC"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-slate-300">Country or Region</label>
                  <select className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm appearance-none">
                    <option value="tn">Tunisia</option>
                    <option value="fr">France</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                  </select>
                </div>

                <div className="pt-4 flex items-start gap-3 text-sm text-slate-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    Your transaction is secured with 256-bit SSL encryption. We never store your full credit card details on our servers.
                  </p>
                </div>

              </form>
            )}

            {paymentMethod === 'paypal' && (
              <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm text-center">
                <Wallet className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Proceed to PayPal</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                  You will be redirected to PayPal's secure checkout page to complete your purchase.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-28 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-700 shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              {/* Course Mini-Card */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-800">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0 flex items-center justify-center text-white font-bold shadow-lg">
                  N
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug mb-1">{orderSummary.courseName}</h3>
                  <p className="text-xs text-slate-400">By {orderSummary.instructor}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm text-slate-300 mb-6 pb-6 border-b border-slate-800">
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span>${orderSummary.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-${orderSummary.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${orderSummary.tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-end justify-between mb-8">
                <span className="text-base font-semibold text-white">Total</span>
                <span className="text-3xl font-extrabold text-white">${total.toFixed(2)}</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                form="payment-form" // Links this button to the form in the left column
                disabled={isProcessing}
                className="w-full relative group flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'card' ? 'Complete Purchase' : 'Continue to PayPal'}
                    </>
                  )}
                </span>
              </button>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Full Lifetime Access</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}