
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure we're in frontend-only mode
console.log('🚀 OneMedi Admin Frontend - Development Mode');
console.log('📝 Note: API functionality is mocked for development');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
