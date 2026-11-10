import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { BrowserRouter, HashRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'

const Router = import.meta.env.BASE_URL === '/' ? BrowserRouter : HashRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <CartProvider>
      <App />
    </CartProvider>
  </Router>
)
