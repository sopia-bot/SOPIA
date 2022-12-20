import type { AppProps } from 'next/app'
import 'normalize.css/normalize.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeflex/primeflex.min.css'

import PrimeReact from 'primereact/api';

PrimeReact.ripple = true;


export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
