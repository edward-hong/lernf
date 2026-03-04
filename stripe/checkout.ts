import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { stripe } from "./client";
import { INDIVIDUAL_PRICE_ID, TEAM_PRICE_ID, FRONTEND_URL } from "./config";

interface CheckoutResponse {
  url: string;
}

export const checkoutIndividual = api(
  { method: "POST", path: "/stripe/checkout/individual", auth: true, expose: true },
  async (): Promise<CheckoutResponse> => {
    const authData = getAuthData()!;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: authData.email,
      client_reference_id: authData.userID,
      line_items: [
        {
          price: INDIVIDUAL_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          clerkUserID: authData.userID,
        },
      },
      success_url: `${FRONTEND_URL}/checkout/success`,
      cancel_url: `${FRONTEND_URL}/checkout/cancel`,
    });

    if (!session.url) {
      throw APIError.internal("failed to create checkout session");
    }

    return { url: session.url };
  },
);

interface TeamCheckoutRequest {
  seats: number;
}

export const checkoutTeam = api(
  { method: "POST", path: "/stripe/checkout/team", auth: true, expose: true },
  async (req: TeamCheckoutRequest): Promise<CheckoutResponse> => {
    if (req.seats < 5) {
      throw APIError.invalidArgument("team plan requires a minimum of 5 seats");
    }

    const authData = getAuthData()!;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: authData.email,
      client_reference_id: authData.userID,
      line_items: [
        {
          price: TEAM_PRICE_ID,
          quantity: req.seats,
        },
      ],
      subscription_data: {
        metadata: {
          clerkUserID: authData.userID,
        },
      },
      success_url: `${FRONTEND_URL}/checkout/success`,
      cancel_url: `${FRONTEND_URL}/checkout/cancel`,
    });

    if (!session.url) {
      throw APIError.internal("failed to create checkout session");
    }

    return { url: session.url };
  },
);
