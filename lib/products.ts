export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  interval?: 'month' | 'year'
  features: string[]
  type: 'subscription' | 'one_time'
}

export const STRIPE_PRICES = {
  MONTHLY_MEMBERSHIP: 'price_1SyfmhReyyxGYZLxa7nSjsqF',
}

export const PRODUCTS: Product[] = [
  {
    id: 'monthly-membership',
    name: 'Monthly Membership',
    description: 'Download any 3 healings per month',
    priceInCents: 7700, // £77.00
    interval: 'month',
    type: 'subscription',
    features: [
      'Download any 3 healings per month',
      'PDF guides and worksheets',
      'Audio meditations and practices',
      'Video teachings and workshops',
      'Cancel anytime'
    ]
  },
]

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}
