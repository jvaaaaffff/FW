import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

const isProduction = import.meta.env.PROD;
const isLocalDev =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// Register the service worker only in production.
// In local development, unregister any previously installed worker so Vite assets are never intercepted.
if ('serviceWorker' in navigator) {
  if (!isProduction || isLocalDev) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      return Promise.all(registrations.map((registration) => registration.unregister()));
    }).then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('fashionweb-'))
            .map((cacheName) => caches.delete(cacheName))
        );
      });
    }).catch(() => {
      /* Ignore cleanup failures in development. */
    });
  }

  if (isProduction && !isLocalDev) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* Service worker registration is optional and should not print to console. */
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
