import Stripe from "stripe";
import { secret } from "encore.dev/config";

const StripeSecretKey = secret("StripeSecretKey");

export const stripe = new Stripe(StripeSecretKey(), {
  apiVersion: "2025-02-24.acacia",
});
