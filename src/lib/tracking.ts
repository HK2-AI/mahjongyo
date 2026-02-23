// Session and event tracking utilities
import { logEvent } from 'firebase/analytics'
import { initAnalytics } from './firebase'

const VISITOR_ID_KEY = 'mjparty_visitor_id'

// Generate a UUID v4
export function generateVisitorId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Get or create visitor ID from localStorage
export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem(VISITOR_ID_KEY)
  if (!visitorId) {
    visitorId = generateVisitorId()
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
  }
  return visitorId
}

// Initialize session on server
export async function initSession(): Promise<string | null> {
  const visitorId = getVisitorId()
  if (!visitorId) return null

  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        referrer: document.referrer || null,
        landingPage: window.location.pathname,
      }),
    })

    if (response.ok) {
      return visitorId
    }
  } catch (error) {
    console.error('Failed to init session:', error)
  }
  return null
}

// Track an event
export async function trackEvent(
  eventType: string,
  data?: {
    eventData?: Record<string, unknown>
    element?: string
  }
): Promise<void> {
  const visitorId = getVisitorId()
  if (!visitorId) return

  // Send to Firebase Analytics
  try {
    const analytics = await initAnalytics()
    if (analytics) {
      logEvent(analytics, eventType, {
        ...data?.eventData,
        page: window.location.pathname,
        element: data?.element || undefined,
      })
    }
  } catch (error) {
    console.error('Failed to log Firebase event:', error)
  }

  // Send to database
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        eventType,
        eventData: data?.eventData ? JSON.stringify(data.eventData) : null,
        page: window.location.pathname,
        element: data?.element || null,
      }),
    })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

// Common event types
export const EventTypes = {
  PAGE_VIEW: 'page_view',
  CLICK: 'click',
  BOOKING_START: 'booking_start',
  BOOKING_DATE_SELECT: 'booking_date_select',
  BOOKING_TIME_SELECT: 'booking_time_select',
  BOOKING_CONFIRM: 'booking_confirm',
  BOOKING_COMPLETE: 'booking_complete',
  BOOKING_CANCEL: 'booking_cancel',
  LOGIN: 'login',
  LOGIN_FAIL: 'login_fail',
  SIGNUP: 'signup',
  SIGNUP_FAIL: 'signup_fail',
  LOGOUT: 'logout',
  TOPUP_START: 'topup_start',
  TOPUP_COMPLETE: 'topup_complete',
  MEMBERSHIP_VIEW: 'membership_view',
} as const
