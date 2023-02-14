import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import './index.css';
import LiveSettingContent, { LiveSettingContentProps } from './live-setting-content';
import { getLiveSetting, setLiveSetting, createLive as createSpoonLive } from '@sopia-bot/bridge';
import { useQuery } from '@tanstack/react-query';
import { useSpoon } from '../../plugins/spoon';
import { ApiLivesCreate } from '@sopia-bot/core';
import { useLiveContext } from '../../plugins/live-context';
import session from '../../plugins/session';


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
  const spoon = useSpoon();
  const [createLiveLoading, setCreateLiveLoading] = useState(false);
  const { status, isLoading, data } = useQuery({
    queryKey: ['getLiveSetting'],
    queryFn: async () => (await getLiveSetting()) || null,
  });
  const liveContext = useLiveContext();


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

  const createLive = async () => {
    setCreateLiveLoading(true);
    toast.current?.clear();
    const requestProp: ApiLivesCreate.Request = {
      'data': {
        is_adult: false,
        is_save: false,
        donation: 0,
        title: setting.title,
        type: 0,
        welcome_message: setting.welcome_message,
        invite_member_ids: [],
        tags: setting.tags,
        categories: setting.categories,
        engine: {name:'sori',host:''},
        is_live_call: false,
        device_unique_id: spoon.deviceUUID,
        spoon_aim: setting.spoon_aim,
      }
    }
    
    if ( setting.image) {
      requestProp.data.img_key = await spoon.api.castImgUpload(setting.image);
    }

    const live = await createSpoonLive(requestProp);

    liveContext.start();

    session.write('current_live', live);

    setCreateLiveLoading(false);
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
        borderTop: '2px solid var(--surface-d)'
      }}>
        <div className="flex-auto flex"></div>
        <div className="flex-auto flex justify-content-center ">
          <span className='p-buttonset'>
            <Button loading={createLiveLoading} label="Live" onClick={createLive} />
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