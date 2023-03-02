import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import './index.css';
import LiveSettingContent, { LiveSettingContentProps } from './live-setting-content';
import { getLiveSetting, setLiveSetting, createLive as createSpoonLive, settingLive, LiveCreated, closeLive } from '@sopia-bot/bridge';
import { useQuery } from '@tanstack/react-query';
import { useSpoon } from '../../plugins/spoon';
import { ApiLivesCreate, Live, LiveInfo } from '@sopia-bot/core';
import { useLiveContext } from '../../plugins/live-context';
import local from '../../plugins/local';
import { deserialize } from 'typescript-json-serializer';
import { useRecoilState } from 'recoil';
import { liveContextStates } from '../../store';
import { confirmDialog } from 'primereact/confirmdialog';
import { useTranslation } from 'react-i18next';


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
  const [liveContextStat, setLiveContextStat] = useRecoilState(liveContextStates);
  const liveContext = useLiveContext();
  const { t } = useTranslation();


  useEffect(() => {
    if ( status === 'success' && data ) {
      setSetting(data);
      const savedLive = local.read('current_live', JSON.parse) as LiveCreated;
      if ( savedLive ) {
        spoon.api.lives.info(savedLive)
          .then(async (req) => {
            const [live] = req.res.results;
            if ( !live.close_status ) {
              console.log(`There's a broadcast in progress.`);
              await settingLive(savedLive.publishUrl);
              liveContext.start();
              setLiveContextStat('processing');
            } else {
              local.delete('current_live');
            }
          });
      }
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
    setLiveContextStat('processing');

    local.write('current_live', live);

    setCreateLiveLoading(false);
  }

  const stopLive = () => {
    confirmDialog({
      message: t('home.stop_live'),
      header: t('confirm'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: t('yes') || 'yes',
      rejectLabel: t('no') || 'no',
      accept: async () => {
        await closeLive();
        await liveContext.stop();
        setLiveContextStat('ready');
      },
      reject: () => {},
    })
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
            {
              liveContextStat === 'ready'
                ? <Button loading={createLiveLoading} label="Live" onClick={createLive} />
                : <Button label="Stop" className='p-button-danger p-button-outlined' onClick={stopLive} />
            }
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