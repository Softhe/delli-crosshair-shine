import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx'
import { initializeObservability } from './lib/observability.ts'

initializeObservability()

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
