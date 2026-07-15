export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  plan_id: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Resource {
  id: string
  title: string
  slug: string
  description: string | null
  type: 'pdf' | 'audio' | 'video'
  file_url: string
  thumbnail_url: string | null
  calendly_url: string | null
  price: number | null
  duration_minutes: number | null
  file_size_bytes: number | null
  category_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  category?: Category
  tags?: Tag[]
}

export interface ResourceTag {
  resource_id: string
  tag_id: string
}

export interface Download {
  id: string
  user_id: string
  resource_id: string
  downloaded_at: string
  resource?: Resource
}

export type ResourceType = 'pdf' | 'audio' | 'video'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
