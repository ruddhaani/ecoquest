import React, { useEffect } from 'react'
import { AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AnonKey, supabaseUrl } from '../constants'

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, AnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

const App = () => {
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
      }
    })

    // Listen for AppState changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App is in foreground')
      }
    }

    const appStateListener = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.data.subscription.unsubscribe() // Cleanup Supabase listener
      appStateListener.remove() // Cleanup AppState listener
    }
  }, [])

  return null // Modify as needed for your UI
}

export default App
