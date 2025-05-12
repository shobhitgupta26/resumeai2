
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Get Clerk publishable key from environment variable or use fallback for development
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_b3JnYW5pYy1mbHktODkuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Only throw error if we're in production and key is missing
if (!CLERK_PUBLISHABLE_KEY && import.meta.env.PROD) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
