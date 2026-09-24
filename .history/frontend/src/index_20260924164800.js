import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // DİKKAT: İçinde @tailwind komutlarının olduğu dosya bu olmalı ve import edilmeli!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* APP BİLEŞENİNİ BROWSERROUTER İLE SARMALIYORUZ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);