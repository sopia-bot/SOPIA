import { getRecordSetting, setRecordSetting } from "@sopia-bot/bridge";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import SelectFile from "../../components/select-file";
import { toastStates } from "../../store";

export function RecordSetting() {
  const [commandFile, setCommandFile] = useState('');
  const [commandArguments, setCommandArguments] = useState('');
  const [toast, setToast] = useRecoilState(toastStates);
  const { t } = useTranslation();
  const { status, isLoading, data } = useQuery({
    queryKey: ['getRecordSetting'],
    queryFn: async () => (await getRecordSetting()) || null,
  });

  useEffect(() => {
    if ( status === 'success' && data ) {
      setCommandFile(data.command);
      setCommandArguments(data.args);
    }
  }, [status, data]);

  if ( isLoading ) return <>Loading...</>;

  const saveSetting = async () => {
    await setRecordSetting({
      command: commandFile,
      args: commandArguments,
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
      text={t('setting.record.warn')}
      severity="warn"
      className="justify-content-start pl-3"
      style={{ borderLeft: '6px solid var(--yellow-600)', height: '50px' }} />
    <div className="flex flex-column">
      <h3>{t('setting.record.command')}</h3>
      <SelectFile fullPath value={commandFile} onSelect={(r) => setCommandFile(r.filePaths[0])} option={{}}/>
    </div>
    <div className="flex flex-column">
      <h3>{t('setting.record.args')}</h3>
      <InputTextarea style={{ width: '100%' }} autoResize value={commandArguments} onChange={(e) => setCommandArguments(e.target.value)} rows={7} />
    </div>
    <div className="flex justify-content-end mt-3">
      <Button label={t('save')||'save'} className='p-button-success' style={{ width: '100px'}} onClick={saveSetting} />
    </div>
  </div>
}