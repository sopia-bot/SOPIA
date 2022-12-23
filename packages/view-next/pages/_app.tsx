import type { AppProps } from 'next/app'
import 'normalize.css/normalize.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/nova-alt/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeflex/primeflex.min.css'
import SystemBar from '../components/system-bar';

import PrimeReact from 'primereact/api';

PrimeReact.ripple = true;


export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="main-wrapper">
      <SystemBar></SystemBar>
      <div className='main-space-wrapper'>
        <div className='main-space'>
          <Component {...pageProps}/>
        </div>
      </div>
      <style jsx global>{`
        .main-wrapper {
          overflow: hidden;
          max-height: 100vh;
        }
        .main-space-wrapper {
          background: #333333;
          max-height: 100vh;
          overflow: hidden;
        }
        .main-space {
          background: white;
          max-height: calc(100vh - 33px);
          overflow: auto;
        }
      `}</style>
    </div>
  )
}
