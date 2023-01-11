import React from 'react'
import ReactDOM from 'react-dom/client'
import './languages/i18n';
import App from './App'
import { RecoilRoot } from 'recoil';
import { Buffer } from 'buffer';
import './store/index';
import './index.css'
//import 'normalize.css/normalize.css'
import 'primeicons/primeicons.css'
//import 'primereact/resources/themes/nova-alt/theme.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeflex/primeflex.min.css'

import PrimeReact from 'primereact/api';
import { useSpoon } from './plugins/spoon';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const spoon = useSpoon();
spoon.init()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <App />
        </RecoilRoot>
      </QueryClientProvider>
    )
  })

window.Buffer = Buffer;

PrimeReact.ripple = true;


