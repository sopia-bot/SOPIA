import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import './index.css';
import LiveSettingContent from './live-setting-content';



export default function BottomBar() {
  const toast = useRef<Toast>(null);

  const showLiveSettingToast = () => {
    toast.current?.show({
      severity: 'info',
      sticky: true,
      content: <LiveSettingContent />,
      closable: false,
    })
  }

  return (
    <>
      <Toast ref={toast} position='bottom-center' className='flex align-items-end justify-content-center live-setting-content'/>
      <div className="flex align-items-center" style={{
        height: '65px',
        maxWidth: '100vw',
      }}>
        <div className="flex-auto flex"></div>
        <div className="flex-auto flex justify-content-center ">
          <span className='p-buttonset'>
            <Button label="Live" />
            <Button icon="pi pi-cog" onClick={showLiveSettingToast} />
          </span>
        </div>
        <div className="flex-auto flex justify-content-end"></div>
      </div>
    </>
  );
}