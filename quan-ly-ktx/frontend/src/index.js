import React from 'react';
import ReactDOM from 'react-dom/client';
// Bootstrap trước index.css để CSS riêng của app ghi đè được mặc định của Bootstrap.
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
