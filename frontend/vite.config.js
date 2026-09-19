import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Development CSP (Allows unsafe-inline for Vite HMR CSS injection)
const devCsp = "default-src 'self'; script-src 'self' 'sha256-Z2/iFzh9VMlVkE0ar1f/oSHWwQk3ve1qk/C2WdsC4Xk='; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://api.dicebear.com; connect-src 'self' http://localhost:3000 ws://localhost:5174; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";

// Production CSP (Strict, no unsafe-inline for styles)
const prodCsp = "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: https://api.dicebear.com; connect-src 'self' http://localhost:3000; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5174,
    headers: {
      'Content-Security-Policy': devCsp
    }
  },
  preview: {
    port: 5174,
    headers: {
      'Content-Security-Policy': prodCsp
    }
  }
})
