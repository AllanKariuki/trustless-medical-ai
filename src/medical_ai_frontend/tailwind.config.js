/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical-grade color palette
        medical: {
          primary: '#1e40af',      // Deep blue - trust and reliability
          secondary: '#0f766e',    // Clinical teal - healthcare
          accent: '#059669',       // Success green - positive outcomes
          warning: '#d97706',      // Amber - caution
          danger: '#dc2626',       // Red - critical alerts
          light: '#f1f5f9',        // Light blue-gray - clean background
          dark: '#1e293b',         // Dark slate - professional text
        },
        compliance: {
          fda: '#10b981',          // Green - FDA compliant
          hipaa: '#3b82f6',        // Blue - HIPAA compliant
          audit: '#8b5cf6',        // Purple - audit trail
        }
      },
      fontFamily: {
        'medical': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
