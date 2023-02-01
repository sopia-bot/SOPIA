import { useEffect, useState } from "react";
import SelectFile from "../../components/select-file";
import { Message } from 'primereact/message';
import { useTranslation } from "react-i18next";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { useQuery } from "@tanstack/react-query";
import { getStreamSetting, setStreamSetting } from "@sopia-bot/bridge";
import { useRecoilState } from "recoil";
import { toastStates } from "../../store";

export default function LiveSetting() {
  const [streamingFile, setStreamingFile] = useState('');
  const [streamingArgs, setStreamingArgs] = useState('');
  const [toast, setToast] = useRecoilState(toastStates);
  const { t } = useTranslation();
  const { status, isLoading, data } = useQuery({
    queryKey: ['getStreamSetting'],
    queryFn: async () => (await getStreamSetting()) || null,
  });

  useEffect(() => {
    console.log(status, data);
    if ( status === 'success' && data ) {
      setStreamingFile(data.command);
      setStreamingArgs(data.args);
    }
  }, [status, data]);

  if ( isLoading ) return <>Loading...</>;

  const saveSetting = async () => {
    await setStreamSetting({
      command: streamingFile,
      args: streamingArgs,
    });
    setToast({
      severity: 'success',
      summary: t('success'),
      detail: t('setting.success'),
      life: 3000,
    });
  };

  return <div className="p-4 flex flex-wrap flex-column">
    <Message
      text={t('setting.live.warn')}
      severity="warn"
      className="justify-content-start pl-3"
      style={{ borderLeft: '6px solid var(--yellow-600)', height: '50px' }} />
    <div className="flex flex-column">
      <h3>{t('setting.live.command')}</h3>
      <SelectFile fullPath value={streamingFile} onSelect={(r) => setStreamingFile(r.filePaths[0])} option={{}}/>
    </div>
    <div className="flex flex-column">
      <h3>{t('setting.live.args')}</h3>
      <InputTextarea style={{ width: '100%' }} autoResize value={streamingArgs} onChange={(e) => setStreamingArgs(e.target.value)} rows={7} />
    </div>
    <div className="flex justify-content-end mt-3">
      <Button label={t('save')||'save'} className='p-button-success' style={{ width: '100px'}} onClick={saveSetting} />
    </div>
  </div>
}