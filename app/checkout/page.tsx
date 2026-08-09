"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { useAppContext } from "../../context/AppContext";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import { formatPriceWithDecimal, type Currency } from "../../lib/currency";
import { trackBeginCheckout, trackPurchase, trackSubscribe } from "../../lib/gtag";
import LoadingSpinner from "../../components/ui/loading-spinner";
import { GlowingEffect } from "../../components/ui/glowing-effect";
import { CountryCodeSelect } from "../../components/ui/CountryCodeSelect";
import { cn, convertR2UrlToCdn } from "../../lib/utils";
import { Check, ShieldCheck, Lock, Download, Sparkles, ShoppingBag } from "lucide-react";

type BillingDetails = {
  name: string;
  email: string;
  mobile: string;
  company?: string;
};

// Component to handle search params (needs to be in Suspense)
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, cartItems, cartCount, resetCart, addToCart } = useAppContext();
  const [billing, setBilling] = useState<BillingDetails>({
    name: user?.email.split("@")[0] ?? "",
    email: user?.email ?? "",
    mobile: "",
    company: "",
  });
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const addedProductRef = useRef<string | null>(null); // Track if we've already added a product
  const checkoutDetailIdRef = useRef<string | null>(null); // Track checkout details ID

  const [subscriptionPlan, setSubscriptionPlan] = useState<'monthly' | 'yearly' | 'pongal_weekly' | null>(null);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number | null>(null);
  const [countryCode, setCountryCode] = useState("+91"); // Default to India
  const [currency, setCurrency] = useState<Currency>((searchParams?.get('currency') as Currency) || 'INR');

  // Handle subscription checkout (from Pricing page)
  useEffect(() => {
    const subscriptionType = searchParams?.get('subscription') as 'monthly' | 'yearly' | 'pongal_weekly' | null;
    if (subscriptionType && (subscriptionType === 'monthly' || subscriptionType === 'yearly' || subscriptionType === 'pongal_weekly')) {
      setSubscriptionPlan(subscriptionType);
      // Load subscription price from database
      const loadSubscriptionPrice = async () => {
        const { paiseToINR, centsToDollars } = await import('../../lib/priceUtils');
        const supabase = getSupabaseBrowserClient();
        const { data: settings } = await supabase.from('settings').select('key,value');
        const settingsMap: Record<string, string> = {};
        (settings || []).forEach((row: any) => { settingsMap[row.key] = row.value; });

        if (subscriptionType === 'pongal_weekly') {
          const pongalPaiseStr = settingsMap.PONGAL_WEEKLY_PRICE || '49900';
          setSubscriptionPrice(paiseToINR(Number(pongalPaiseStr)));
          return;
        }

        // For USD, use USD amounts if available
        if (currency === 'USD') {
          const usdKey = subscriptionType === 'monthly' ? 'RAZORPAY_MONTHLY_AMOUNT_USD' : 'RAZORPAY_YEARLY_AMOUNT_USD';
          const usdCents = settingsMap[usdKey];
          if (usdCents) {
            setSubscriptionPrice(centsToDollars(Number(usdCents)));
            return;
          }
        }

        // INR pricing (default)
        let amountPaise = 0;
        if (subscriptionType === 'monthly') {
          const monthlyAmount = settingsMap.RAZORPAY_MONTHLY_AMOUNT;
          if (!monthlyAmount) throw new Error('Monthly subscription price not found');
          amountPaise = Number(monthlyAmount);
        } else {
          const yearlyAmount = settingsMap.RAZORPAY_YEARLY_AMOUNT;
          if (!yearlyAmount) throw new Error('Yearly subscription price not found');
          amountPaise = Number(yearlyAmount);
        }

        setSubscriptionPrice(paiseToINR(amountPaise));
      };
      loadSubscriptionPrice();
    }
  }, [searchParams, currency]);

  // Handle direct product checkout (from Buy Now)
  useEffect(() => {
    const productSlug = searchParams?.get('slug') || searchParams?.get('product');
    if (productSlug && cartCount === 0 && !subscriptionPlan) {
      // Don't add if we've already processed this product
      if (addedProductRef.current === productSlug) return;

      // Check if item is already in cart to avoid duplicate adds
      const alreadyInCart = cartItems.some(item => item.slug === productSlug);
      if (alreadyInCart) {
        addedProductRef.current = productSlug;
        return;
      }

      // Fetch product and add to cart
      const fetchProduct = async () => {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase
          .from('templates')
          .select('slug, name, price, img')
          .eq('slug', productSlug)
          .maybeSingle();
        if (data) {
          // Double-check cartItems haven't changed during async operation
          const stillNotInCart = !cartItems.some(item => item.slug === data.slug);
          if (stillNotInCart && addedProductRef.current !== productSlug) {
            addedProductRef.current = productSlug;
            addToCart({
              slug: data.slug,
              name: data.name,
              price: Number(data.price),
              img: data.img,
            });
          }
        }
      };
      fetchProduct();
    }
  }, [searchParams, cartCount, addToCart, cartItems, subscriptionPlan]);

  const subtotal = subscriptionPlan && subscriptionPrice
    ? subscriptionPrice
    : cartItems.reduce((sum, item) => sum + item.price, 0);

  // Track begin_checkout event when checkout page loads with items
  useEffect(() => {
    // Only track if not subscription and has cart items
    if (!subscriptionPlan && cartItems.length > 0) {
      trackBeginCheckout(
        cartItems.map((item) => ({
          item_id: item.slug,
          item_name: item.name,
          price: item.price,
          quantity: 1 as const,
        })),
        subtotal,
        'INR'
      );
    }
  }, [subscriptionPlan, cartItems.length]); // Track when cart items change or subscription plan is set

  if (!user) {
    return (
      <main className="bg-[#0B0F17] min-h-screen flex items-center justify-center py-20 px-4 text-white">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#090D16] rounded-3xl border border-slate-800 p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-sky-950/60 border border-sky-800 flex items-center justify-center mx-auto mb-4 text-sky-400">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Sign in to checkout</h1>
            <p className="text-slate-400 text-sm mb-6 font-medium">Please log in to complete your pay-per-product purchase</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full rounded-2xl bg-sky-600 hover:bg-sky-500 text-white px-6 py-3.5 font-extrabold transition-all shadow-lg shadow-sky-600/30"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Show empty cart message only if not a subscription checkout
  if (cartCount === 0 && !subscriptionPlan) {
    return (
      <main className="bg-[#0B0F17] min-h-screen flex items-center justify-center py-20 px-4 text-white">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#090D16] rounded-3xl border border-slate-800 p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Your cart is empty</h1>
            <p className="text-slate-400 text-sm mb-6 font-medium">Select a creative template to begin purchase</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full rounded-2xl bg-sky-600 hover:bg-sky-500 text-white px-6 py-3.5 font-extrabold transition-all shadow-lg shadow-sky-600/30"
            >
              Browse Creative Assets
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const loadRazorpay = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate mobile number (digits only, 6-15 digits since country code is separate)
    const cleanMobile = billing.mobile.replace(/\s+/g, '').replace(/-/g, '');
    const mobileRegex = /^\d{6,15}$/;
    if (!mobileRegex.test(cleanMobile)) {
      setPaymentError('Please enter a valid mobile number (6-15 digits)');
      return;
    }
    // Combine country code with mobile number for Razorpay
    const fullMobile = `${countryCode}${cleanMobile}`;

    setProcessing(true);
    setPaymentError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPaymentError('Session expired. Please log in again.');
        setProcessing(false);
        return;
      }

      // Store checkout details in database
      checkoutDetailIdRef.current = null;
      try {
        const checkoutDetailsRes = await fetch('/api/checkout/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            checkout_type: subscriptionPlan ? 'subscription' : 'product',
            billing_name: billing.name,
            billing_email: billing.email,
            billing_mobile: fullMobile,
            billing_company: billing.company || null,
            subscription_plan: subscriptionPlan || null,
            cart_items: subscriptionPlan ? [] : cartItems.map(item => ({
              slug: item.slug,
              name: item.name,
              price: item.price,
              img: item.img,
            })),
            total_amount: subtotal,
          }),
        });

        const checkoutDetailsJson = await checkoutDetailsRes.json();
        if (checkoutDetailsRes.ok && checkoutDetailsJson.ok) {
          checkoutDetailIdRef.current = checkoutDetailsJson.checkout_detail_id;
        }
        // Don't fail the checkout if storing details fails, just log it
      } catch (e) {
        console.error('Failed to store checkout details:', e);
      }

      // Load Razorpay
      await loadRazorpay();

      // Handle subscription payment
      if (subscriptionPlan && subscriptionPrice) {
        // Handle all subscriptions (monthly, yearly, pongal_weekly) as recurring
        // Create subscription
        const subRes = await fetch('/api/payments/razorpay/subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              plan: subscriptionPlan,
              currency: currency,
              billing: {
                name: billing.name,
                email: billing.email,
                mobile: fullMobile,
                company: billing.company || null,
              },
            }),
          });

          const subJson = await subRes.json();
          if (!subRes.ok || !subJson.ok) {
            throw new Error(subJson.error || 'Subscription initialization failed');
          }

          const sub = subJson.subscription;
          
          // Build subscription plan display name
          const planDisplayName = subscriptionPlan === 'pongal_weekly' 
            ? 'Pongal Weekly Offer' 
            : subscriptionPlan === 'yearly' 
            ? 'Yearly Pro Plan' 
            : 'Monthly Pro Plan';

          // Open Razorpay checkout for subscription
          // @ts-ignore
          const rzp = new window.Razorpay({
            key: sub?.razorpay_key || '',
            subscription_id: sub.id,
            name: 'Celite',
            description: planDisplayName,
            image: '/PNG1.png',
            // Currency is important: PayPal only shows for USD/international currencies
            currency: currency,
            notes: {
              plan: subscriptionPlan,
              currency: currency,
            },
            prefill: {
              name: billing.name,
              email: billing.email,
              contact: fullMobile,
            },
            handler: async (resp: any) => {
              try {
                // Get Razorpay subscription ID from response or sub object
                const razorpaySubscriptionId = resp.razorpay_subscription_id || sub?.id || null;

                // Activate subscription in our DB with Razorpay subscription ID
                const activateRes = await fetch('/api/subscription/activate', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    plan: subscriptionPlan,
                    razorpay_subscription_id: razorpaySubscriptionId,
                    autopay_enabled: true, // Enable autopay for all subscriptions including pongal_weekly
                  }),
                });

                if (activateRes.ok) {
                  // Update checkout details status to completed
                  if (checkoutDetailIdRef.current) {
                    try {
                      await fetch('/api/checkout/details', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({
                          checkout_detail_id: checkoutDetailIdRef.current,
                          status: 'completed',
                          razorpay_subscription_id: razorpaySubscriptionId,
                        }),
                      });
                    } catch (e) {
                      console.error('Failed to update checkout details:', e);
                    }
                  }

                  // Track subscription event
                  const planName = subscriptionPlan === 'pongal_weekly' 
                    ? 'Pongal Weekly Offer' 
                    : subscriptionPlan === 'yearly' 
                    ? 'Yearly Pro Plan' 
                    : 'Monthly Pro Plan';
                  
                  trackSubscribe({
                    method: 'razorpay',
                    plan_id: subscriptionPlan,
                    plan_name: planName,
                    value: subscriptionPrice || 0,
                    currency: currency,
                  });

                  // Redirect to dashboard
                  setProcessing(false);
                  router.push("/dashboard?payment=success");
                } else {
                  // Update checkout details status to failed
                  if (checkoutDetailIdRef.current) {
                    try {
                      await fetch('/api/checkout/details', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({
                          checkout_detail_id: checkoutDetailIdRef.current,
                          status: 'failed',
                        }),
                      });
                    } catch (e) {
                      console.error('Failed to update checkout details:', e);
                    }
                  }
                  setPaymentError('Subscription activation failed');
                  setProcessing(false);
                }
              } catch (e: any) {
                // Update checkout details status to failed
                if (checkoutDetailIdRef.current) {
                  try {
                    await fetch('/api/checkout/details', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        checkout_detail_id: checkoutDetailIdRef.current,
                        status: 'failed',
                      }),
                    });
                  } catch (err) {
                    console.error('Failed to update checkout details:', err);
                  }
                }
                setPaymentError(e?.message || 'Subscription activation failed');
                setProcessing(false);
              }
            },
            theme: { color: '#ffffff' },
            modal: {
              ondismiss: () => {
                setProcessing(false);
              },
            },
          });

          rzp.open();
      } else {
        // Handle one-time product payment
        // Calculate total amount in paise/cents
        const amountInSmallestUnit = Math.round(subtotal * 100);

        // Create Razorpay order for all cart items
        // For multiple items, we'll create a combined order
        const productInfo = cartItems.length === 1
          ? cartItems[0]
          : { slug: 'multiple', name: `${cartItems.length} Templates`, price: subtotal, img: cartItems[0]?.img || '' };

        const res = await fetch('/api/payments/razorpay/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            amount: amountInSmallestUnit,
            currency: currency,
            product: productInfo,
            billing: {
              name: billing.name,
              email: billing.email,
              mobile: fullMobile,
              company: billing.company || null,
            },
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.ok) {
          // Update checkout details status to failed
          if (checkoutDetailIdRef.current) {
            try {
              await fetch('/api/checkout/details', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  checkout_detail_id: checkoutDetailIdRef.current,
                  status: 'failed',
                }),
              });
            } catch (e) {
              console.error('Failed to update checkout details:', e);
            }
          }
          throw new Error(json.error || 'Payment initialization failed');
        }

        // Update checkout details with Razorpay order ID
        if (checkoutDetailIdRef.current && json.order?.id) {
          try {
            await fetch('/api/checkout/details', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                checkout_detail_id: checkoutDetailIdRef.current,
                status: 'payment_pending',
                razorpay_order_id: json.order.id,
              }),
            });
          } catch (e) {
            console.error('Failed to update checkout details:', e);
          }
        }

        // Open Razorpay checkout
        // @ts-ignore
        const rzp = new window.Razorpay({
          key: json.key,
          amount: json.order.amount,
          currency: json.order.currency,
          name: 'Celite',
          description: cartItems.length === 1 ? cartItems[0].name : `${cartItems.length} Templates`,
          image: '/PNG1.png',
          order_id: json.order.id,
          notes: {
            currency: currency,
            items: cartItems.map((i: any) => i.slug).join(','),
          },
          prefill: {
            name: billing.name,
            email: billing.email,
            contact: fullMobile,
          },
          handler: async (resp: any) => {
            try {
              // Verify payment
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                  billing: {
                    name: billing.name,
                    email: billing.email,
                    mobile: fullMobile,
                    company: billing.company || null,
                  },
                  cartItems: cartItems,
                }),
              });

              const verifyJson = await verifyRes.json();
              if (verifyRes.ok && verifyJson.ok) {
                // Update checkout details status to completed
                if (checkoutDetailIdRef.current) {
                  try {
                    await fetch('/api/checkout/details', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        checkout_detail_id: checkoutDetailIdRef.current,
                        status: 'completed',
                        razorpay_payment_id: resp.razorpay_payment_id,
                        order_id: verifyJson.order_id,
                      }),
                    });
                  } catch (e) {
                    console.error('Failed to update checkout details:', e);
                  }
                }

                // Track purchase event
                trackPurchase({
                  transaction_id: verifyJson.order_id || resp.razorpay_order_id,
                  value: subtotal,
                  currency: currency,
                  items: cartItems.map((item) => ({
                    item_id: item.slug,
                    item_name: item.name,
                    price: item.price,
                    quantity: 1,
                  })),
                });

                // Clear cart
                await resetCart();
                // Redirect to dashboard
                setProcessing(false);
                router.push("/dashboard?payment=success");
              } else {
                // Update checkout details status to failed
                if (checkoutDetailIdRef.current) {
                  try {
                    await fetch('/api/checkout/details', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        checkout_detail_id: checkoutDetailIdRef.current,
                        status: 'failed',
                      }),
                    });
                  } catch (e) {
                    console.error('Failed to update checkout details:', e);
                  }
                }
                setPaymentError(verifyJson.error || 'Payment verification failed');
                setProcessing(false);
              }
            } catch (e: any) {
              // Update checkout details status to failed
              if (checkoutDetailIdRef.current) {
                try {
                  await fetch('/api/checkout/details', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                      checkout_detail_id: checkoutDetailIdRef.current,
                      status: 'failed',
                    }),
                  });
                } catch (err) {
                  console.error('Failed to update checkout details:', err);
                }
              }
              setPaymentError(e?.message || 'Payment verification failed');
              setProcessing(false);
            }
          },
          theme: { color: '#ffffff' },
          modal: {
            ondismiss: () => {
              // Update checkout details status to cancelled
              if (checkoutDetailIdRef.current) {
                const supabase = getSupabaseBrowserClient();
                supabase.auth.getSession().then(({ data: { session } }) => {
                  if (session) {
                    fetch('/api/checkout/details', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        checkout_detail_id: checkoutDetailIdRef.current,
                        status: 'cancelled',
                      }),
                    }).catch(e => console.error('Failed to update checkout details:', e));
                  }
                });
              }
              setProcessing(false);
            },
          },
        });

        rzp.open();
      }
    } catch (e: any) {
      console.error(e);
      // Update checkout details status to failed
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && checkoutDetailIdRef.current) {
          fetch('/api/checkout/details', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              checkout_detail_id: checkoutDetailIdRef.current,
              status: 'failed',
            }),
          }).catch(err => console.error('Failed to update checkout details:', err));
        }
      });
      setPaymentError(e?.message || 'Something went wrong processing your payment.');
      setProcessing(false);
    }
  };

  return (
    <main className="bg-[#0B0F17] min-h-screen pt-28 pb-24 px-4 sm:px-6 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            {subscriptionPlan ? 'Celite Subscription' : 'CELITE MARKET Checkout'}
          </h1>
          <p className="text-slate-400 font-medium text-sm sm:text-base">
            {subscriptionPlan
              ? `Secure payment for ${subscriptionPlan === 'pongal_weekly' ? 'Pongal Weekly Offer' : subscriptionPlan === 'monthly' ? 'monthly' : 'yearly'} Pro subscription.`
              : 'Pay-Per-Product Purchase • Instant Cloudflare R2 Source Asset Download & Lifetime Access'
            }
          </p>
        </div>

        <div className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-[1.7fr_1fr]">
          {/* Billing Form */}
          <section className="bg-[#090D16] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl text-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Billing Details */}
              <div>
                <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                  <span>Billing Details</span>
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      value={billing.name}
                      onChange={(evt) => setBilling((prev) => ({ ...prev, name: evt.target.value }))}
                      className="w-full px-4 py-3.5 bg-[#0F172A] border border-slate-800 rounded-xl text-white focus:border-sky-500 outline-none transition-all placeholder:text-slate-500 font-medium text-sm"
                      placeholder="Your Full Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Email Address (for download links & access)
                    </label>
                    <input
                      type="email"
                      value={billing.email}
                      onChange={(evt) => setBilling((prev) => ({ ...prev, email: evt.target.value }))}
                      className="w-full px-4 py-3.5 bg-[#0F172A] border border-slate-800 rounded-xl text-white focus:border-sky-500 outline-none transition-all placeholder:text-slate-500 font-medium text-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Mobile Number
                    </label>
                    <div className="flex">
                      <CountryCodeSelect
                        value={countryCode}
                        onChange={setCountryCode}
                      />
                      <input
                        type="tel"
                        value={billing.mobile}
                        onChange={(evt) => {
                          const value = evt.target.value.replace(/\D/g, '');
                          if (value.length <= 15) {
                            setBilling((prev) => ({ ...prev, mobile: value }));
                          }
                        }}
                        className="flex-1 min-w-0 px-4 py-3.5 bg-[#0F172A] border border-slate-800 border-l-0 rounded-r-xl text-white focus:border-sky-500 outline-none transition-all placeholder:text-slate-500 font-medium text-sm"
                        placeholder="9876543210"
                        maxLength={15}
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Direct SMS updates for order verification</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Company / Studio (optional)
                    </label>
                    <input
                      value={billing.company}
                      onChange={(evt) => setBilling((prev) => ({ ...prev, company: evt.target.value }))}
                      className="w-full px-4 py-3.5 bg-[#0F172A] border border-slate-800 rounded-xl text-white focus:border-sky-500 outline-none transition-all placeholder:text-slate-500 font-medium text-sm"
                      placeholder="Celite Studios / Production"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h2 className="text-xl font-extrabold text-white mb-4">Payment & Access</h2>
                <div className="bg-sky-950/40 border border-sky-800/80 rounded-2xl p-5 text-sky-200">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white font-bold mb-1">Razorpay Secured Gateway</p>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        Payment is processed securely via Razorpay (UPI, Credit/Debit Card, Netbanking). Once completed, download access is activated instantly on your product page and Celite Dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Currency Toggle */}
                <div className="mt-5">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Payment Currency</label>
                  <div className="bg-[#0F172A] p-1.5 rounded-2xl flex items-center border border-slate-800 w-fit">
                    <button
                      type="button"
                      onClick={() => setCurrency('INR')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all",
                        currency === 'INR'
                          ? "bg-sky-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      🇮🇳 INR (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all",
                        currency === 'USD'
                          ? "bg-sky-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      🌍 USD ($)
                    </button>
                  </div>
                  {currency === 'USD' && (
                    <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> International cards & PayPal supported in USD
                    </p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 shrink-0 w-4 h-4 rounded border-slate-800 bg-[#0F172A] text-sky-500 focus:ring-sky-500"
                    required
                  />
                  <span>I agree to Celite Market terms. Single commercial project usage included per purchase.</span>
                </label>
              </div>

              {/* Error Message */}
              {paymentError && (
                <div className="bg-rose-950/80 border border-rose-800 rounded-xl p-4 text-sm text-rose-300 font-medium">
                  {paymentError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white px-6 py-4 rounded-2xl font-extrabold shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payment…</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 fill-white" />
                    <span>Pay {formatPriceWithDecimal(subtotal, currency)} & Download Asset</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Order Summary Sidebar */}
          <aside className="bg-[#090D16] rounded-3xl border border-slate-800 p-6 sm:p-8 text-white shadow-2xl h-fit space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-extrabold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Pay-Per-Product Purchase
              </div>
              <h2 className="text-xl font-black text-white">
                {subscriptionPlan ? 'Subscription Summary' : 'Order Summary'}
              </h2>
            </div>

            {subscriptionPlan ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start py-3 border-b border-slate-800">
                  <div className="flex-1">
                    <p className="font-bold text-white text-base">
                      {subscriptionPlan === 'pongal_weekly' ? 'Pongal Weekly Offer' : subscriptionPlan === 'monthly' ? 'Monthly' : 'Yearly'} Pro
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {subscriptionPlan === 'pongal_weekly' ? '3 downloads per week for 3 weeks' : 'Unlimited access to all templates'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-sky-400 text-lg">
                      {formatPriceWithDecimal(subscriptionPrice || 0, currency)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const itemImgCdn = convertR2UrlToCdn(item.img) || item.img || '/PNG1.png';
                  return (
                    <div key={item.slug} className="flex gap-4 p-3 bg-[#0F172A] border border-slate-800/80 rounded-2xl">
                      {/* Rich Thumbnail Container */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-[#090D16] rounded-xl overflow-hidden border border-slate-800 relative">
                        <img
                          src={itemImgCdn}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/PNG1.png';
                          }}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold mb-1">
                            ✓ Lifetime Access
                          </span>
                          <p className="font-bold text-white text-sm sm:text-base line-clamp-2 leading-tight">
                            {item.name}
                          </p>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-xs text-slate-400 font-medium">Pay-Per-Product</span>
                          <span className="text-lg font-black text-sky-400">
                            {formatPriceWithDecimal(item.price, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Access Guarantees */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" /> Full High-Res Source File Included
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" /> Permanent Lifetime Re-Download Access
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" /> Instant Access Link Delivered via Email
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-base font-extrabold text-white">Total Amount</span>
                <span className="text-3xl font-black text-sky-400">
                  {formatPriceWithDecimal(subtotal, currency)}
                </span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secured by 256-bit SSL & Razorpay</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading checkout..." fullScreen />}>
      <CheckoutContent />
    </Suspense>
  );
}

