import { api, APIError } from 'encore.dev/api'
import { getAuthData } from '~encore/auth'
import { stripe } from './client'
import { FRONTEND_URL } from './config'

interface PortalResponse {
  url: string
}

export const portal = api(
  { method: 'POST', path: '/stripe/portal', auth: true, expose: true },
  async (): Promise<PortalResponse> => {
    const authData = getAuthData()!

    // Look up Stripe customer by email
    const customers = await stripe.customers.list({
      email: authData.email,
      limit: 1,
    })

    if (!customers.data.length) {
      throw APIError.notFound('No subscription found')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${FRONTEND_URL}/`,
    })

    if (!session.url) {
      throw APIError.internal('failed to create portal session')
    }

    return { url: session.url }
  }
)
