import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import Stripe from "stripe";
import { stripe } from "./client";

const StripeWebhookSigningSecret = secret("StripeWebhookSigningSecret");

export const webhook = api.raw(
  { method: "POST", path: "/stripe/webhook", expose: true },
  async (req, resp) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const body = Buffer.concat(chunks);

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      resp.writeHead(400);
      resp.end("missing stripe-signature header");
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        StripeWebhookSigningSecret(),
      );
    } catch (err) {
      console.error("webhook signature verification failed:", err);
      resp.writeHead(400);
      resp.end("webhook signature verification failed");
      return;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("checkout.session.completed:", {
          sessionId: session.id,
          clerkUserID: session.client_reference_id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("customer.subscription.updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("customer.subscription.deleted:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });
        break;
      }
      default:
        console.log("unhandled event type:", event.type);
    }

    resp.writeHead(200);
    resp.end(JSON.stringify({ received: true }));
  },
);
