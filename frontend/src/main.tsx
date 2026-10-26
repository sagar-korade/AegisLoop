import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import './index.css';

// AegisLoop is strictly dark-mode-only.
// Ensure root element attributes and purge any legacy light theme preferences.
try {
  document.documentElement.classList.add('dark');
  document.documentElement.classList.remove('light');
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.style.colorScheme = 'dark';
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('aegisloop_theme');
  }
} catch {
  // Ignore storage access errors
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
