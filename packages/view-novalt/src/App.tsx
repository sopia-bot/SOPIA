import { useEffect, useRef } from 'react'
import SystemBar from './components/system-bar'
import BottomBar from './components/bottom-bar'
import RouterWrapper from './components/router-wrapper'
import './App.css'
import { HashRouter } from 'react-router-dom'
import { useRecoilState } from 'recoil';
import { toastStates } from './store/index';
import { Toast } from 'primereact/toast';
import TopMenu from './components/top-menu'
import { ConfirmDialog } from 'primereact/confirmdialog'

function App() {
  const [toast, setToast] = useRecoilState(toastStates);
  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    if ( toast.life && toast.life > 1 ) {
      toastRef.current?.show(toast);
      setTimeout(() => {
        setToast({
          summary: '',
          detail: '',
          life: 1,
        });
      }, toast.life);
    }
  }, [toast]);

  return (
    <div className="main-wrapper">
      <SystemBar></SystemBar>
      <TopMenu></TopMenu>
      <div className='main-space-wrapper'>
        <div className='main-space'>
          <Toast ref={toastRef} />
          <ConfirmDialog />
          <HashRouter>
            <RouterWrapper />
          </HashRouter>
        </div>
      </div>
      <BottomBar></BottomBar>
    </div>
  )
}

export default App
