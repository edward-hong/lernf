import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import Stripe from "stripe";
import { stripe } from "./client";
import { INDIVIDUAL_PRICE_ID, TEAM_PRICE_ID } from "./config";
import { updatePlanType } from "../usage/usage";
import type { PlanType } from "../usage/usage";

const StripeWebhookSigningSecret = secret("StripeWebhookSigningSecret");

/**
 * Determine plan type from a Stripe subscription's price IDs.
 */
function planTypeFromSubscription(subscription: Stripe.Subscription): PlanType {
  const priceIds = subscription.items.data.map((item) => item.price.id);

  if (priceIds.includes(TEAM_PRICE_ID)) return "team";
  if (priceIds.includes(INDIVIDUAL_PRICE_ID)) return "individual";

  // Fallback: if the subscription has a trial period, mark as trial
  if (subscription.status === "trialing") return "trial";

  return "individual"; // default for unknown paid subscriptions
}

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
        const clerkUserID = session.client_reference_id;
        console.log("checkout.session.completed:", {
          sessionId: session.id,
          clerkUserID,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });

        // Update plan type when checkout completes
        if (clerkUserID && session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string,
            );
            const planType = planTypeFromSubscription(subscription);
            // Reset usage counter on new subscription
            await updatePlanType(clerkUserID, planType, true);
            console.log(`[webhook] Updated plan to '${planType}' for user ${clerkUserID}`);
          } catch (err) {
            console.error("[webhook] Failed to update plan type:", err);
          }
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserID =
          subscription.metadata?.clerkUserID ?? null;
        console.log("customer.subscription.updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer,
          clerkUserID,
        });

        // Update plan type on subscription changes
        if (clerkUserID) {
          try {
            if (subscription.status === "active" || subscription.status === "trialing") {
              const planType = planTypeFromSubscription(subscription);
              await updatePlanType(clerkUserID, planType);
              console.log(`[webhook] Updated plan to '${planType}' for user ${clerkUserID}`);
            } else if (
              subscription.status === "canceled" ||
              subscription.status === "unpaid" ||
              subscription.status === "past_due"
            ) {
              await updatePlanType(clerkUserID, "free");
              console.log(`[webhook] Downgraded to 'free' for user ${clerkUserID}`);
            }
          } catch (err) {
            console.error("[webhook] Failed to update plan type:", err);
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserID =
          subscription.metadata?.clerkUserID ?? null;
        console.log("customer.subscription.deleted:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          clerkUserID,
        });

        // Downgrade to free on subscription deletion
        if (clerkUserID) {
          try {
            await updatePlanType(clerkUserID, "free");
            console.log(`[webhook] Downgraded to 'free' for user ${clerkUserID}`);
          } catch (err) {
            console.error("[webhook] Failed to update plan type:", err);
          }
        }
        break;
      }
      default:
        console.log("unhandled event type:", event.type);
    }

    resp.writeHead(200);
    resp.end(JSON.stringify({ received: true }));
  },
);
