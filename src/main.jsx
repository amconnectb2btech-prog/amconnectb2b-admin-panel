import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              border: '1px solid #e7e7e9',
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '8px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
