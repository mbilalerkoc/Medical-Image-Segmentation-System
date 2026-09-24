import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // YENİ EKLENEN IMPORT
import App from './App';
import './index.css'; // veya senin ana css dosyanın adı neyse

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* APP BİLEŞENİNİ BROWSERROUTER İLE SARMALIYORUZ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);