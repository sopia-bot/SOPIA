import './track.css';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { TrackInputOption } from '../../plugins/live-context';
import { useQuery } from '@tanstack/react-query';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import { TrackProps } from './track';


export default function TrackInput(prop: TrackProps) {
  const option = prop.option as TrackInputOption;
  const { t } = useTranslation();
	const [trackName, setTrackName] = useState(option.trackName);
  const [mute, setMute] = useState(option.mute);
  const [deviceList, setDeviceList] = useState<ReturnType<MediaDeviceInfo['toJSON']>[]>([]);
  const [selectDevice, setSelectDevice] = useState<ReturnType<MediaDeviceInfo['toJSON']>>();

  const { status, isLoading, data } = useQuery({
    queryKey: ['getInputMediaDeviceList'],
    queryFn: async () => (await navigator.mediaDevices.enumerateDevices())
      .filter(device => device.kind === 'audioinput')
      .map(device => device.toJSON()) || [],
  });

  useEffect(() => {
    if ( status === 'success' && data && data.length > 0 ) {
      setSelectDevice(data.find((device) => device.deviceId === option.deviceId) || data[0]);
      setDeviceList(data);
    }
  }, [status, data]);
  
  useEffect(() => {
		prop.onChange({
      type: 'input',
      trackName,
      mute,
      ...(selectDevice && {deviceId: selectDevice.deviceId}),
		});
	}, [trackName, mute, selectDevice]);

  useEffect(() => {
    console.log('selected device', selectDevice);
  }, [selectDevice])
	
  if ( isLoading || deviceList.length === 0 ) return <>Loading...</>;

	return <Card className='track'>
	<div className={`flex transition-colors transition-duration-500 ${mute ? 'bg-gray-200' : 'bg-blue-50'}`} style={{ height: '100px' }}>
		<div className="flex-initial flex-column flex justify-content-around p-2" style={{
			flexBasis: '300px',
      width: '300px',
		}}>
			<div className='flex tooltip-element'>
				<div className='flex justify-content-between w-full'>
					<InputText
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            type="text"
            data-pr-tooltip={t('home.help.name')}
            style={{width: '150px'}}
            className='p-inputtext-sm tooltip-element' />
          <ToggleButton
            checked={mute}
            onLabel=""
            offLabel=""
            onIcon="pi pi-volume-off"
            offIcon="pi pi-volume-up"
            onChange={(e) => setMute(e.target.value)}
            className='border-none p-button-text p-button-rounded track-tool-button'/>
				</div>
			</div>
			<div className='flex tooltip-element' style={{ height: '35px' }} data-pr-tooltip={t('home.help.select_device')}>
        <Dropdown
          className='w-full'
          value={selectDevice}
          onChange={(e) => {
            setSelectDevice(e.value);
          }}
          options={deviceList}
        />
			</div>
		</div>
		<div className={`flex-initial transition-colors transition-duration-500 flex w-full p-2 ${mute ? 'bg-gray-300' : 'bg-blue-100'}`} style={{
      boxShadow: 'inset -15px 0px 10px -15px var(--gray-600), inset 15px 0px 10px -15px var(--gray-600)',
    }}>test</div>
    <div className="flex-initial flex align-items-center">
      <Button onClick={() => prop.onDelete()} icon="pi pi-trash" className='p-button-danger p-button-text h-full'/>
    </div>
	</div>
	</Card>
}