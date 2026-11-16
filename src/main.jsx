import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted variable brand font (Project Bible R4) — no external requests.
// Weight-axis subset only: same `Inter Variable` family, without the optical-size
// and italic axes we never use — smaller payload, faster first paint.
import '@fontsource-variable/inter/wght.css';
import App from '@/App';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
