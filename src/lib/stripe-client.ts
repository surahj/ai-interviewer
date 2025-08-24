import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export const redirectToCheckout = async (checkoutUrl: string) => {
  try {
    window.location.href = checkoutUrl;
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};
