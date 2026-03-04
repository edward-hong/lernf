import { api, APIError } from "encore.dev/api";
import { stripe } from "./client";
import { FRONTEND_URL } from "./config";

interface PortalRequest {
  customerID: string;
}

interface PortalResponse {
  url: string;
}

export const portal = api(
  { method: "POST", path: "/stripe/portal", auth: true, expose: true },
  async (req: PortalRequest): Promise<PortalResponse> => {
    const session = await stripe.billingPortal.sessions.create({
      customer: req.customerID,
      return_url: `${FRONTEND_URL}/dashboard`,
    });

    if (!session.url) {
      throw APIError.internal("failed to create portal session");
    }

    return { url: session.url };
  },
);
