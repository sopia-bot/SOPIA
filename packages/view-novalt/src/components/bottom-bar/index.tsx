import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import './index.css';
import LiveSettingContent, { LiveSettingContentProps } from './live-setting-content';
import { getLiveSetting, setLiveSetting } from '@sopia-bot/bridge';
import { useQuery } from '@tanstack/react-query';


export default function BottomBar() {
  const toast = useRef<Toast>(null);
  const [isOpenSetting, setOpenState] = useState(false);
  const [setting, setSetting] = useState<LiveSettingContentProps['value']>({
    title: '',
    welcome_message: '',
    spoon_aim: [],
    tags: [],
    categories: [],
  });
  const { status, isLoading, data } = useQuery({
    queryKey: ['getLiveSetting'],
    queryFn: async () => (await getLiveSetting()) || null,
  });


  useEffect(() => {
    if ( status === 'success' && data ) {
      setSetting(data);
    }
  }, [status, data])
  
  if ( isLoading ) return <>Loading...</>;

  const toggleLiveSettingToast = () => {
    if ( isOpenSetting ) {
      setOpenState(false);
      toast.current?.clear();
      setLiveSetting(setting);
    } else {
      setOpenState(true);
      toast.current?.show({
        severity: 'info',
        sticky: true,
        content: <LiveSettingContent value={setting} onChange={(v) => setSetting(v)} />,
        closable: false,
        life: 0,
      });
    }
  }


  return (
    <>
      <Toast
        ref={toast}
        position='bottom-center'
        className={(isOpenSetting ? 'flex' : 'hidden') + ' align-items-end justify-content-center live-setting-content'}/>
      <div className="flex align-items-center" style={{
        height: '65px',
        maxWidth: '100vw',
      }}>
        <div className="flex-auto flex"></div>
        <div className="flex-auto flex justify-content-center ">
          <span className='p-buttonset'>
            <Button label="Live" onClick={() => toast.current?.clear()} />
            <Button
              className={(isOpenSetting ? 'p-button-success p-button-outlined' : 'p-button-primary')}
              icon={isOpenSetting ? "pi pi-arrow-down" : "pi pi-save"}
              onClick={toggleLiveSettingToast} />
          </span>
        </div>
        <div className="flex-auto flex justify-content-end"></div>
      </div>
    </>
  );
}