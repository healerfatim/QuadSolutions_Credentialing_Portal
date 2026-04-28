import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// We do NOT import index.css here because you are using 
// the Tailwind CDN link in your index.html instead.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);