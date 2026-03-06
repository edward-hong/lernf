export const INDIVIDUAL_PRICE_ID =
  process.env.NODE_ENV === 'production'
    ? 'price_1T7oXhEJ6e4BvOgGhIgmqTTk'
    : 'price_1T7D7dCzEecbSOM78BtLSgsL'
export const TEAM_PRICE_ID =
  process.env.NODE_ENV === 'production'
    ? 'price_1T7oXXEJ6e4BvOgGk9L41CBK'
    : 'price_1T7D87CzEecbSOM74zzYzzhg'

export const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://lernf.com'
    : 'http://localhost:5173'
