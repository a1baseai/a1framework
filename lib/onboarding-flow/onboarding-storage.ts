import { OnboardingFlow, defaultOnboardingFlow } from './types';
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/storage/local-storage';
import { toast } from 'sonner';

const ONBOARDING_FLOW_KEY = 'onboarding_flow_settings';

/**
 * Helper function to get the base URL for API requests
 * Works in both client and server contexts
 */
const getBaseUrl = () => {
  // Browser context: use relative URLs (they resolve against the current origin)
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // Server context: we need absolute URLs
  // First check for NEXTAUTH_URL which is commonly set in Next.js apps
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) return nextAuthUrl;
  
  // Then check for VERCEL_URL which is set in Vercel deployments
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  
  // Finally, default to localhost if no environment variables are set
  return 'http://localhost:3000';
};

/**
 * Load onboarding flow settings from storage with improved filesystem access
 * 
 * @returns Promise that resolves with the flow settings
 */
export const loadOnboardingFlow = async (): Promise<OnboardingFlow> => {
  console.log('🔄 Attempting to load onboarding flow...');
  
  try {
    // Try API as the primary source of truth
    console.log('🔄 Attempting to load onboarding flow via API...');
    
    // Add a shorter timeout to the fetch operation to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('⚠️ API fetch operation timed out');
    }, 2000); // 2 second timeout
    
    try {
      const response = await fetch(`${getBaseUrl()}/api/onboarding-flow`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully loaded onboarding flow via API');
        return data.flow;
      } else {
        console.log('❌ Failed to load onboarding flow via API. Status:', response.status);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('❌ Fetch operation failed:', fetchError);
    }
    
    // Default to defaults if all methods fail
    console.log('ℹ️ No saved onboarding flow found, using defaults');
    return { ...defaultOnboardingFlow };
  } catch (error) {
    console.error('❌ Error loading onboarding flow settings:', error);
    
    // Skip toast entirely in server context
    if (typeof window !== 'undefined') {
      // In client context, we can safely show toast
      try {
        // Wrap in try/catch to prevent any toast errors from breaking the flow
        toast.error('Failed to load onboarding flow settings');
      } catch (toastError) {
        console.error('❌ Error showing toast:', toastError);
      }
    }
    
    // Always fall back to defaults if everything else fails
    console.log('ℹ️ All loading methods failed, using default onboarding flow');
    return { ...defaultOnboardingFlow };
  }
};

/**
 * Save onboarding flow settings to storage
 * 
 * @param settings OnboardingFlow object to save
 * @returns Promise that resolves to true if successfully saved
 */
export const saveOnboardingFlow = async (settings: OnboardingFlow): Promise<boolean> => {
  console.log('🔄 Saving onboarding flow settings...');
  
  try {
    // Skip localStorage saving
    // saveToLocalStorage(ONBOARDING_FLOW_KEY, settings);
    
    // Then save to the server via API
    const response = await fetch(`${getBaseUrl()}/api/onboarding-flow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flow: settings }),
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to save onboarding flow to API: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }
    
    console.log('✅ Successfully saved onboarding flow to API');
    return true;
  } catch (error) {
    console.error('❌ Error saving onboarding flow settings:', error);
    toast.error('Failed to save to server');
    
    // Return false since we failed to save
    return false;
  }
};
