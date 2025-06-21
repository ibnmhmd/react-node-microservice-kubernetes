import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_KEY as string, {
    apiVersion: '2025-05-28.basil',
});
