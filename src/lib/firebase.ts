import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics'

// TODO: Replace with MJ Party Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDG5WyCnKBZaVW8WeQ2AHOXdlbxJe_u5IA",
  authDomain: "pickleyo-4d52c.firebaseapp.com",
  projectId: "pickleyo-4d52c",
  storageBucket: "pickleyo-4d52c.firebasestorage.app",
  messagingSenderId: "29592653314",
  appId: "1:29592653314:web:1b83f9792505805534211b",
  measurementId: "G-5WDNJT6S3R"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Analytics (client-side only)
let analytics: Analytics | null = null

export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== 'undefined' && !analytics) {
    const supported = await isSupported()
    if (supported) {
      analytics = getAnalytics(app)
    }
  }
  return analytics
}

export { app, analytics }
