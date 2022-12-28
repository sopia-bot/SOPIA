import React from 'react'
import ReactDOM from 'react-dom/client'
import './languages/i18n';
import App from './App'
//import './index.css'
import 'normalize.css/normalize.css'
import 'primeicons/primeicons.css'
//import 'primereact/resources/themes/nova-alt/theme.css'
import 'primereact/resources/themes/saga-orange/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeflex/primeflex.min.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)
